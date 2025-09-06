import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // For production, you should set STRIPE_WEBHOOK_SECRET
    // For now, we'll skip signature verification in development
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err });
        return new Response(`Webhook Error: ${err}`, { status: 400 });
      }
    } else {
      // In development, parse the event without verification
      try {
        event = JSON.parse(body);
      } catch (err) {
        logStep("Failed to parse webhook body", { error: err });
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    logStep("Processing webhook event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        const userId = session.metadata?.user_id;
        if (!userId) {
          logStep("No user_id found in session metadata");
          break;
        }

        // Handle credit purchases
        if (session.metadata?.payment_type === "credits") {
          const creditAmount = parseInt(session.metadata.credit_amount || "0");
          
          if (creditAmount > 0) {
            // Add credits to user
            const { error: updateError } = await supabaseClient
              .from("profiles")
              .update({ credits: supabaseClient.raw(`credits + ${creditAmount}`) })
              .eq("id", userId);

            if (updateError) {
              logStep("Error updating user credits", { error: updateError });
            } else {
              // Log transaction
              await supabaseClient.from("credit_transactions").insert({
                user_id: userId,
                amount: creditAmount,
                description: `Credit purchase via Stripe - ${creditAmount} credits`,
                feature: "credit_purchase"
              });

              logStep("Successfully added credits", { userId, creditAmount });
            }
          }
        }
        // Handle subscription payments
        else if (session.metadata?.plan_type) {
          const planType = session.metadata.plan_type;
          
          // Update user plan
          const { error: planError } = await supabaseClient
            .from("profiles")
            .update({ plan: planType })
            .eq("id", userId);

          if (planError) {
            logStep("Error updating user plan", { error: planError });
          } else {
            // Add monthly credits based on plan
            let monthlyCredits = 0;
            if (planType === "entrepreneur") {
              monthlyCredits = 50;
            } else if (planType === "business") {
              monthlyCredits = 200;
            }

            if (monthlyCredits > 0) {
              await supabaseClient
                .from("profiles")
                .update({ credits: supabaseClient.raw(`credits + ${monthlyCredits}`) })
                .eq("id", userId);

              // Log transaction
              await supabaseClient.from("credit_transactions").insert({
                user_id: userId,
                amount: monthlyCredits,
                description: `Monthly credits for ${planType} plan`,
                feature: "monthly_credits"
              });
            }

            logStep("Successfully updated plan and added credits", { userId, planType, monthlyCredits });
          }
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        logStep("Processing subscription event", { subscriptionId: subscription.id, status: subscription.status });

        // Find user by customer ID
        const { data: customerData } = await supabaseClient
          .from("subscribers")
          .select("user_id")
          .eq("stripe_customer_id", subscription.customer)
          .single();

        if (customerData?.user_id) {
          // Update subscription status
          await supabaseClient.from("subscribers").upsert({
            user_id: customerData.user_id,
            stripe_customer_id: subscription.customer,
            subscribed: subscription.status === "active",
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });

          logStep("Updated subscription status", { userId: customerData.user_id, status: subscription.status });
        }
        break;

      case "customer.subscription.deleted":
        const deletedSub = event.data.object;
        logStep("Processing subscription cancellation", { subscriptionId: deletedSub.id });

        // Find user and revert to free plan
        const { data: deletedCustomerData } = await supabaseClient
          .from("subscribers")
          .select("user_id")
          .eq("stripe_customer_id", deletedSub.customer)
          .single();

        if (deletedCustomerData?.user_id) {
          // Update to free plan
          await supabaseClient.from("profiles")
            .update({ plan: "free" })
            .eq("id", deletedCustomerData.user_id);

          // Update subscription status
          await supabaseClient.from("subscribers").upsert({
            user_id: deletedCustomerData.user_id,
            stripe_customer_id: deletedSub.customer,
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });

          logStep("Reverted user to free plan", { userId: deletedCustomerData.user_id });
        }
        break;

      default:
        logStep("Unhandled webhook event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});