
// Import necessary modules and types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { OpenAI } from 'https://esm.sh/openai@4.28.4';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request handler for the advanced-analysis function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body more carefully
    let requestData;
    try {
      const text = await req.text();
      
      // Log the received data for debugging
      console.log("Received request body:", text);
      
      // Check if the text is empty
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ error: "Empty request body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      requestData = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract data from the parsed request
    const { ideaId, userId, prompt, language = 'pt' } = requestData;
    
    if (!ideaId || !userId || !prompt) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required data", 
          received: { 
            hasIdeaId: !!ideaId, 
            hasUserId: !!userId, 
            hasPrompt: !!prompt 
          }
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with SERVICE ROLE key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );
    
    // Create a regular client with user auth context for checking permissions
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Check user has permission to access this idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('title')
      .eq('id', ideaId)
      .eq('user_id', userId)
      .single();
      
    if (ideaError || !idea) {
      return new Response(
        JSON.stringify({ error: "Unauthorized or idea not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the user has enough credits - Advanced analysis costs 2 credits
    const { data: creditSuccess, error: creditError } = await supabaseAdmin
      .rpc("use_credits_for_feature", { 
        user_id_param: userId, 
        amount_param: 2, // Advanced analysis costs 2 credits
        description_param: `Análise avançada: ${idea.title.substring(0, 50)}${idea.title.length > 50 ? '...' : ''}`,
        feature_param: "advanced",
        item_id_param: ideaId
      });
      
    if (creditError || !creditSuccess) {
      return new Response(
        JSON.stringify({ error: "INSUFFICIENT_CREDITS", message: "Not enough credits for advanced analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the idea analysis to provide as context
    const { data: analysis, error: analysisError } = await supabase
      .from('idea_analyses')
      .select('*')
      .eq('idea_id', ideaId)
      .single();
      
    if (analysisError) {
      console.error("Error fetching idea analysis:", analysisError);
      // Continue anyway
    }
    
    // Get the idea details to provide as context
    const { data: ideaDetails, error: ideaDetailsError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
      
    if (ideaDetailsError) {
      console.error("Error fetching idea details:", ideaDetailsError);
      // Continue anyway
    }

    // Generate the analysis with OpenAI
    const analysisResult = await generateAdvancedAnalysis(prompt, language, ideaDetails, analysis);
    
    // Check if we already have a saved analysis for this idea
    const { data: existingAnalysis } = await supabase
      .from('saved_analyses')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Save the analysis to the database
    const analysisData = {
      user_id: userId,
      idea_id: ideaId,
      idea_title: idea.title,
      original_analysis_id: analysis?.id || null,
      analysis_data: {
        prompt: prompt,
        result: analysisResult,
        timestamp: new Date().toISOString()
      }
    };
    
    let savedAnalysisId;
    
    if (existingAnalysis) {
      // Update existing saved analysis
      const { data: updatedAnalysis, error: updateError } = await supabaseAdmin
        .from('saved_analyses')
        .update({
          analysis_data: {
            ...existingAnalysis.analysis_data,
            conversations: [
              ...(existingAnalysis.analysis_data?.conversations || []),
              {
                prompt: prompt,
                result: analysisResult,
                timestamp: new Date().toISOString()
              }
            ]
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAnalysis.id)
        .select('id')
        .single();
        
      if (updateError) {
        console.error("Error updating saved analysis:", updateError);
        throw updateError;
      }
      
      savedAnalysisId = existingAnalysis.id;
      
    } else {
      // Create new saved analysis
      const { data: newAnalysis, error: insertError } = await supabaseAdmin
        .from('saved_analyses')
        .insert(analysisData)
        .select('id')
        .single();
        
      if (insertError) {
        console.error("Error inserting saved analysis:", insertError);
        throw insertError;
      }
      
      savedAnalysisId = newAnalysis.id;
    }
    
    // Return the response
    return new Response(
      JSON.stringify({
        success: true,
        result: analysisResult,
        savedAnalysisId: savedAnalysisId
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in advanced-analysis function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

// Function to generate advanced analysis using OpenAI
async function generateAdvancedAnalysis(prompt: string, language = 'pt', ideaDetails: any, analysis: any) {
  const systemPrompt = 
    language === 'pt' ? 
      `Você é um consultor de negócios experiente especializado em analisar ideias de negócios em detalhes. 
      Forneça análises avançadas, específicas e acionáveis, não genéricas. 
      Foque nos detalhes específicos do negócio e do mercado. 
      Se o usuário pedir informações específicas sobre a ideia, concentre-se nesses aspectos.
      Responda SEMPRE em português brasileiro.` :
    language === 'es' ?
      `Eres un consultor de negocios experimentado especializado en analizar ideas de negocio en detalle.
      Proporciona análisis avanzados, específicos y accionables, no genéricos.
      Concéntrate en los detalles específicos del negocio y el mercado.
      Si el usuario solicita información específica sobre la idea, concéntrate en esos aspectos.
      Responde SIEMPRE en español.` :
    language === 'ja' ?
      `あなたはビジネスアイデアを詳細に分析することを専門とする経験豊かなビジネスコンサルタントです。
      一般的ではなく、高度で具体的で実行可能な分析を提供してください。
      ビジネスと市場の具体的な詳細に焦点を当ててください。
      ユーザーがアイデアに関する特定の情報を求めた場合は、それらの側面に集中してください。
      常に日本語で回答してください。` :
      `You are an experienced business consultant specialized in analyzing business ideas in detail.
      Provide advanced, specific, and actionable analysis, not generic.
      Focus on the specific details of the business and market.
      If the user asks for specific information about the idea, focus on those aspects.
      Always answer in English.`;

  try {
    // Create context from idea details and analysis
    let contextStr = "";
    if (ideaDetails) {
      contextStr += `Ideia: ${ideaDetails.title}\n`;
      contextStr += `Descrição: ${ideaDetails.description}\n`;
      if (ideaDetails.audience) contextStr += `Público-alvo: ${ideaDetails.audience}\n`;
      if (ideaDetails.problem) contextStr += `Problema resolvido: ${ideaDetails.problem}\n`;
      if (ideaDetails.monetization) contextStr += `Monetização: ${ideaDetails.monetization}\n`;
      if (ideaDetails.budget) contextStr += `Orçamento: ${ideaDetails.budget}\n`;
      if (ideaDetails.location) contextStr += `Localização: ${ideaDetails.location}\n`;
    }
    
    if (analysis) {
      contextStr += `\nAvaliação geral: ${analysis.score}/100 - Status: ${analysis.status}\n`;
      
      if (analysis.swot_analysis) {
        const swot = analysis.swot_analysis;
        contextStr += "\nAnálise SWOT:\n";
        if (swot.strengths) contextStr += `Forças: ${JSON.stringify(swot.strengths)}\n`;
        if (swot.weaknesses) contextStr += `Fraquezas: ${JSON.stringify(swot.weaknesses)}\n`;
        if (swot.opportunities) contextStr += `Oportunidades: ${JSON.stringify(swot.opportunities)}\n`;
        if (swot.threats) contextStr += `Ameaças: ${JSON.stringify(swot.threats)}\n`;
      }
      
      if (analysis.market_analysis) {
        const market = analysis.market_analysis;
        contextStr += "\nAnálise de Mercado:\n";
        if (market.market_size) contextStr += `Tamanho do mercado: ${market.market_size}\n`;
        if (market.target_audience) contextStr += `Público-alvo: ${market.target_audience}\n`;
        if (market.growth_potential) contextStr += `Potencial de crescimento: ${market.growth_potential}\n`;
      }
    }

    console.log("Sending request to OpenAI");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `
            Contexto sobre a ideia de negócio:
            ${contextStr}
            
            Pergunta do usuário:
            ${prompt}
          `
        }
      ],
      temperature: 0.7
    });
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI returned an empty response");
    }
    
    return response.choices[0].message.content || "Não foi possível gerar uma análise avançada.";
    
  } catch (error) {
    console.error("Error generating advanced analysis:", error);
    throw new Error(`Failed to generate advanced analysis: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
