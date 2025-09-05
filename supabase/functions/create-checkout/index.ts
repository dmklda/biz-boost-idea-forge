import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create a Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planType, paymentType } = await req.json();
    logStep("Request data", { planType, paymentType });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create new one");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    let session;

    if (paymentType === "subscription") {
      // Subscription checkout
      const priceMap = {
        entrepreneur: { monthly: 499, annual: 399 }, // $4.99 / $3.99
        business: { monthly: 999, annual: 799 }      // $9.99 / $7.99
      };

      const isAnnual = planType.includes('annual');
      const basePlan = isAnnual ? planType.replace('-annual', '') : planType;
      const price = priceMap[basePlan as keyof typeof priceMap];
      if (!price) throw new Error(`Invalid plan type: ${planType}`);

      const amount = isAnnual ? price.annual : price.monthly;
      const interval = isAnnual ? "year" : "month";

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: `${basePlan.charAt(0).toUpperCase() + basePlan.slice(1)} Plan`,
                description: `Monthly access to ${basePlan} features`
              },
              unit_amount: amount,
              recurring: { interval },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/planos?payment=cancelled`,
        metadata: {
          user_id: user.id,
          plan_type: basePlan,
          billing_cycle: interval
        }
      });
      logStep("Subscription session created", { sessionId: session.id, planType: basePlan, interval });

    } else if (paymentType === "credits") {
      // One-time credit purchase
      const creditPackages = {
        "5": { amount: 5, price: 299 },    // $2.99
        "10": { amount: 10, price: 499 },  // $4.99
        "25": { amount: 25, price: 999 },  // $9.99
        "50": { amount: 50, price: 1799 }, // $17.99
        "100": { amount: 100, price: 2999 } // $29.99
      };

      const packageData = creditPackages[planType as keyof typeof creditPackages];
      if (!packageData) throw new Error(`Invalid credit package: ${planType}`);

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: `${packageData.amount} Credits`,
                description: `One-time purchase of ${packageData.amount} credits`
              },
              unit_amount: packageData.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/dashboard?payment=success&type=credits`,
        cancel_url: `${origin}/dashboard/creditos?payment=cancelled`,
        metadata: {
          user_id: user.id,
          credit_amount: packageData.amount.toString(),
          payment_type: "credits"
        }
      });
      logStep("Credit purchase session created", { sessionId: session.id, credits: packageData.amount });
    } else {
      throw new Error(`Invalid payment type: ${paymentType}`);
    }

    logStep("Checkout session created successfully", { sessionUrl: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});