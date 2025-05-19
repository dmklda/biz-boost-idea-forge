
// Import necessary modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to generate the system prompt based on user preferences
const generateSystemPrompt = (language: string = "pt") => {
  switch (language) {
    case "en":
      return `You are an expert business analyst specialized in detailed business plan creation, market analysis, and strategic planning. Your task is to create a comprehensive analysis of a business idea.`;
    case "es":
      return `Eres un analista de negocios experto especializado en crear planes de negocios detallados, análisis de mercado y planificación estratégica. Tu tarea es crear un análisis completo de una idea de negocio.`;
    case "ja":
      return `あなたは、詳細なビジネスプラン作成、市場分析、戦略的計画を専門とするエキスパートビジネスアナリストです。あなたの任務は、ビジネスアイデアの総合的な分析を作成することです。`;
    case "pt":
    default:
      return `Você é um analista de negócios especializado na criação de planos de negócios detalhados, análise de mercado e planejamento estratégico. Sua tarefa é criar uma análise abrangente de uma ideia de negócio.`;
  }
};

// Function to generate the user prompt based on the idea data
const generateUserPrompt = (ideaData: any, language: string = "pt") => {
  // Determine language-specific strings
  const strings = {
    ideaTitle: language === "pt" ? "Título da Ideia" : language === "es" ? "Título de la Idea" : language === "ja" ? "アイデアのタイトル" : "Idea Title",
    ideaDesc: language === "pt" ? "Descrição da Ideia" : language === "es" ? "Descripción de la Idea" : language === "ja" ? "アイデアの説明" : "Idea Description",
    targetAudience: language === "pt" ? "Público-Alvo" : language === "es" ? "Público Objetivo" : language === "ja" ? "ターゲットオーディエンス" : "Target Audience",
    problem: language === "pt" ? "Problema a Resolver" : language === "es" ? "Problema a Resolver" : language === "ja" ? "解決すべき問題" : "Problem to Solve",
    competitors: language === "pt" ? "Concorrentes" : language === "es" ? "Competidores" : language === "ja" ? "競合他社" : "Competitors",
    monetization: language === "pt" ? "Monetização" : language === "es" ? "Monetización" : language === "ja" ? "収益化" : "Monetization",
    budget: language === "pt" ? "Orçamento" : language === "es" ? "Presupuesto" : language === "ja" ? "予算" : "Budget",
    location: language === "pt" ? "Localização" : language === "es" ? "Ubicación" : language === "ja" ? "場所" : "Location",
    response: language === "pt" ? "Por favor, crie uma análise de negócios detalhada. Responda no formato JSON com os seguintes elementos" : 
              language === "es" ? "Por favor, crea un análisis de negocio detallado. Responde en formato JSON con los siguientes elementos" : 
              language === "ja" ? "詳細なビジネス分析を作成してください。次の要素を含むJSON形式で回答してください" : 
              "Please create a detailed business analysis. Respond in JSON format with the following elements"
  };
  
  return `
${strings.ideaTitle}: ${ideaData.title}
${strings.ideaDesc}: ${ideaData.description}
${strings.targetAudience}: ${ideaData.audience || "Not specified"}
${strings.problem}: ${ideaData.problem || "Not specified"}
${strings.competitors}: ${ideaData.has_competitors || "Not specified"}
${strings.monetization}: ${ideaData.monetization || "Not specified"}
${strings.budget}: ${ideaData.budget || "Not specified"}
${strings.location}: ${ideaData.location || "Not specified"}

${strings.response}:

{
  "businessName": {
    "name": "Suggested business name",
    "explanation": "Why this name fits"
  },
  "summary": {
    "description": "Executive summary of the business idea",
    "score": "A score from 1-100 representing viability",
    "status": "One of: 'Highly Viable', 'Viable', 'Moderate', 'Challenging', 'Not Recommended'"
  },
  "differentials": {
    "unique_value_proposition": "What makes this idea unique",
    "competitive_advantages": "List of competitive advantages",
    "innovation_factors": "What's innovative about this idea"
  },
  "marketAnalysis": {
    "market_size": "Estimated market size",
    "target_audience_detailed": "Detailed description of target audience",
    "market_trends": "Current trends in this market",
    "growth_potential": "Growth potential analysis"
  },
  "monetization": {
    "revenue_streams": ["List of potential revenue streams"],
    "pricing_strategy": "Recommended pricing strategy",
    "sales_channels": ["Recommended sales channels"],
    "break_even_analysis": "Break-even point estimation"
  },
  "personas": [
    {
      "name": "Persona name",
      "age": "Age range",
      "profession": "Profession",
      "income": "Income level",
      "pain_points": ["List of pain points"],
      "goals": ["List of goals"],
      "description": "Brief description"
    }
  ],
  "swot": {
    "strengths": ["List of strengths"],
    "weaknesses": ["List of weaknesses"],
    "opportunities": ["List of opportunities"],
    "threats": ["List of threats"]
  },
  "risks": [
    {
      "name": "Risk name",
      "description": "Risk description",
      "level": "One of: 'High', 'Medium', 'Low'",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "implementation": {
    "timeline": {
      "short_term": ["Short term actions"],
      "medium_term": ["Medium term actions"],
      "long_term": ["Long term actions"]
    },
    "key_resources": ["List of key resources needed"],
    "key_partners": ["List of potential key partners"],
    "success_metrics": ["List of metrics to measure success"]
  }
}
`;
};

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { ideaId, userId, language = "pt" } = requestData;
    
    // Validate input
    if (!ideaId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if user has enough credits or is on Pro plan
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user credits", details: userError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Define credit cost
    const ADVANCED_ANALYSIS_COST = 2;
    
    // Check if user has enough credits or is on Pro plan
    const isPro = userData.plan === "pro";
    const hasEnoughCredits = userData.credits >= ADVANCED_ANALYSIS_COST;
    
    if (!isPro && !hasEnoughCredits) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", required: ADVANCED_ANALYSIS_COST, available: userData.credits }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
      );
    }

    // Fetch idea data
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

    // Set up the OpenAI API client
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not set" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const configuration = new Configuration({ apiKey: openAIKey });
    const openai = new OpenAIApi(configuration);

    // Generate the analysis with OpenAI
    console.log("Generating advanced analysis with OpenAI...");
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: generateSystemPrompt(language) },
        { role: "user", content: generateUserPrompt(ideaData, language) }
      ],
      temperature: 0.7,
    });

    // Process the OpenAI response
    if (!completion.data.choices || !completion.data.choices[0].message) {
      console.error("Invalid response from OpenAI");
      return new Response(
        JSON.stringify({ error: "Invalid response from OpenAI" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const responseContent = completion.data.choices[0].message.content;
    let analysisData;
    
    try {
      // Extract JSON from the response
      const jsonMatch = responseContent.match(/({[\s\S]*})/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (error) {
      console.error("Error parsing JSON from OpenAI response:", error);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis data", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Insert or update the analysis in the database
    const { data: existingAnalysis } = await supabase
      .from("advanced_analyses")
      .select("id")
      .eq("idea_id", ideaId)
      .maybeSingle();

    const analysisOperation = existingAnalysis
      ? supabase
          .from("advanced_analyses")
          .update({ analysis_data: analysisData })
          .eq("id", existingAnalysis.id)
      : supabase
          .from("advanced_analyses")
          .insert({
            idea_id: ideaId,
            user_id: userId,
            analysis_data: analysisData
          });

    const { error: analysisError } = await analysisOperation;

    if (analysisError) {
      console.error("Error saving analysis:", analysisError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis", details: analysisError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Deduct credits if not on Pro plan
    if (!isPro) {
      const { error: updateError } = await supabase.rpc("update_user_credits", { 
        user_id: userId, 
        amount: -ADVANCED_ANALYSIS_COST
      });
      
      if (updateError) {
        console.error("Error deducting credits:", updateError);
        // We'll still return success as the analysis was generated successfully
      }
      
      // Log the transaction
      await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: -ADVANCED_ANALYSIS_COST,
          description: "Advanced Analysis",
          feature: "advanced_analysis",
          item_id: ideaId
        });
    } else {
      // Log free usage for Pro users
      await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: 0,
          description: "Advanced Analysis (Pro plan)",
          feature: "advanced_analysis",
          item_id: ideaId
        });
    }

    // Return success with the analysis data
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisData,
        isPro,
        creditsDeducted: isPro ? 0 : ADVANCED_ANALYSIS_COST
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in advanced-analysis function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
