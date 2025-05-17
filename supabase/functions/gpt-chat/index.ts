
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody = await req.json();
    const { ideaId, message, history } = requestBody;

    // Validate input
    if (!ideaId || !message) {
      console.error("Missing required parameters:", { ideaId, message });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Processing chat for idea:", ideaId);
    console.log("User message:", message);
    console.log("Chat history length:", history ? history.length : 0);

    // Initialize Supabase client to fetch idea and analysis data
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the idea details
    const { data: ideaData, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .single();

    if (ideaError || !ideaData) {
      console.error("Error fetching idea data:", ideaError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch idea data", details: ideaError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch the advanced analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from("advanced_analyses")
      .select("*")
      .eq("idea_id", ideaId)
      .maybeSingle();

    // Fetch basic analysis as fallback or additional context
    const { data: basicAnalysisData } = await supabase
      .from("idea_analyses")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Prepare context for the AI with available data
    const ideaContext = {
      title: ideaData.title,
      description: ideaData.description,
      problem: ideaData.problem || "Not specified",
      audience: ideaData.audience || "Not specified",
      monetization: ideaData.monetization || "Not specified",
      has_competitors: ideaData.has_competitors || "Not specified",
      budget: ideaData.budget || "Not specified",
      location: ideaData.location || "Not specified"
    };

    // Add analysis data to context if available
    let analysisContext = {};
    if (analysisData && analysisData.analysis_data) {
      const analysis = analysisData.analysis_data;
      analysisContext = {
        businessName: analysis.businessName?.name,
        summary: analysis.summary?.description,
        score: analysis.summary?.score,
        status: analysis.summary?.status,
        differentials: analysis.differentials,
        marketAnalysis: analysis.marketAnalysis,
        monetization: analysis.monetization,
        personas: analysis.personas?.map(p => `${p.name}: ${p.description}`).join("; "),
        swot: analysis.swot,
        risks: analysis.risks?.map(r => `${r.name} (${r.level}): ${r.description}`).join("; ")
      };
    } else if (basicAnalysisData) {
      // Use basic analysis as fallback
      analysisContext = {
        score: basicAnalysisData.score,
        status: basicAnalysisData.status,
        marketAnalysis: basicAnalysisData.market_analysis,
        swotAnalysis: basicAnalysisData.swot_analysis,
        competitorAnalysis: basicAnalysisData.competitor_analysis,
        financialAnalysis: basicAnalysisData.financial_analysis,
        recommendations: basicAnalysisData.recommendations
      };
    }

    // Get OpenAI API key
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      console.error("Missing OpenAI API key");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Format chat history for OpenAI context
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Create a system message with context about the idea and analysis
    const systemPrompt = `
    You are a business consultant AI assistant specialized in analyzing business ideas and providing strategic advice.
    
    You are currently consulting on the following business idea:
    Title: ${ideaContext.title}
    Description: ${ideaContext.description}
    Problem Solved: ${ideaContext.problem}
    Target Audience: ${ideaContext.audience}
    Monetization Strategy: ${ideaContext.monetization}
    Has Competitors: ${ideaContext.has_competitors}
    Budget: ${ideaContext.budget}
    Location: ${ideaContext.location}
    
    Analysis insights:
    ${JSON.stringify(analysisContext, null, 2)}
    
    Your job is to provide helpful, specific insights about this business idea based on the user's questions.
    Keep your answers focused on this specific business idea and the analysis provided. Do not make up details that aren't provided.
    Always provide actionable advice and reference specific elements of the idea or analysis when relevant.
    Be concise but thorough in your responses. Use a conversational, professional tone.
    Respond in the same language the user uses (Portuguese, English, Spanish, or Japanese).
    `;

    // Call OpenAI API with context and user message
    const openAiMessages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    console.log("Calling OpenAI API with context");
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a cost-effective but capable model
        messages: openAiMessages,
        temperature: 0.7,
      })
    });

    // Handle OpenAI API response
    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Error calling AI service", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const aiData = await openAiResponse.json();
    if (!aiData.choices || aiData.choices.length === 0) {
      console.error("Invalid response from OpenAI:", aiData);
      return new Response(
        JSON.stringify({ error: "Invalid response from AI" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const response = aiData.choices[0].message.content;
    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in gpt-chat function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
