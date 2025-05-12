
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

// Request handler for the analyze-idea function
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
    const { ideaData, userId, ideaId, isReanalyzing = false } = requestData;
    
    // Validate required data
    if (!ideaData || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required data", received: { hasIdeaData: !!ideaData, hasUserId: !!userId } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is crucial for the function to insert data into tables with RLS enabled
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
    
    // Create a regular client with user auth context for checking credits
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Check if the user has enough credits if not reanalyzing
    if (!isReanalyzing) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error("Error fetching user credits:", userError);
        throw userError;
      }
      
      if (!userData || userData.credits <= 0) {
        return new Response(
          JSON.stringify({ error: "INSUFFICIENT_CREDITS" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Generate analysis with OpenAI
    const analysis = await generateAnalysis(ideaData);
    
    // Create or update the idea in the database using the admin client
    let finalIdeaId = ideaId;
    
    if (!finalIdeaId) {
      // Create a new idea if no ID was provided
      const { data: newIdea, error: ideaError } = await supabaseAdmin
        .from('ideas')
        .insert({
          user_id: userId,
          title: ideaData.idea,
          description: ideaData.idea,
          audience: ideaData.audience,
          problem: ideaData.problem,
          has_competitors: ideaData.hasCompetitors,
          monetization: ideaData.monetization,
          budget: ideaData.budget,
          location: ideaData.location,
          is_draft: false,
          status: 'analyzed'
        })
        .select('id')
        .single();
        
      if (ideaError) {
        console.error("Error creating new idea:", ideaError);
        throw ideaError;
      }
      
      finalIdeaId = newIdea.id;
      console.log(`Created new idea with ID: ${finalIdeaId}`);
    } else {
      // Update the existing idea and explicitly set is_draft to false
      const { error: updateError } = await supabaseAdmin
        .from('ideas')
        .update({
          title: ideaData.idea,
          description: ideaData.idea,
          audience: ideaData.audience,
          problem: ideaData.problem,
          has_competitors: ideaData.hasCompetitors,
          monetization: ideaData.monetization,
          budget: ideaData.budget,
          location: ideaData.location,
          is_draft: false, // Ensure draft is set to false when analyzed
          status: 'analyzed'
        })
        .eq('id', ideaId)
        .eq('user_id', userId);
        
      if (updateError) {
        console.error("Error updating idea:", updateError);
        throw updateError;
      }
      
      console.log(`Updated existing idea with ID: ${finalIdeaId}`);
    }
    
    // Store the analysis results using the admin client
    try {
      console.log(`Storing analysis for idea: ${finalIdeaId}`);
      console.log(`User ID: ${userId}`);
      
      const { error: analysisError } = await supabaseAdmin
        .from('idea_analyses')
        .upsert({
          idea_id: finalIdeaId,
          user_id: userId,
          score: analysis.score,
          status: analysis.status,
          swot_analysis: analysis.swotAnalysis,
          market_analysis: analysis.marketAnalysis,
          recommendations: analysis.recommendations,
          competitor_analysis: analysis.competitorAnalysis,
          financial_analysis: analysis.financialAnalysis,
        });
        
      if (analysisError) {
        console.error("Error storing analysis:", analysisError);
        throw analysisError;
      }
      
      console.log(`Analysis stored successfully for idea ID: ${finalIdeaId}`);
      
    } catch (error) {
      console.error("Error storing analysis:", error);
      throw error;
    }
    
    // Update user credits only if not reanalyzing, using the admin client
    if (!isReanalyzing) {
      // Update user's credit balance with parameters in correct order (user_id, amount)
      const { error: updateError } = await supabaseAdmin
        .rpc("update_user_credits", { 
          user_id: userId, 
          amount: -1 
        });
        
      if (updateError) {
        console.error("Error updating user credits:", updateError);
        throw updateError;
      }
      
      console.log("User credits updated successfully");
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        ideaId: finalIdeaId
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in analyze-idea function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to generate analysis using OpenAI with better error handling
async function generateAnalysis(ideaData) {
  try {
    const prompt = generateAnalysisPrompt(ideaData);
    
    console.log("Sending request to OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a more modern model
      messages: [
        {
          role: "system",
          content: "You are a business analyst expert that evaluates business ideas and provides detailed analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI returned an empty response");
    }
    
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }
    
    console.log("Received OpenAI response, parsing JSON...");
    
    try {
      const analysisResult = JSON.parse(content);
      return analysisResult;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw OpenAI response content:", content);
      throw new Error("Failed to parse OpenAI JSON response");
    }
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
}

// Function to generate the analysis prompt
function generateAnalysisPrompt(ideaData) {
  // Try to extract language from request headers or fall back to English
  const preferredLanguage = ideaData.language || 'pt'; // Default to Portuguese if not specified
  
  // Determine the language for the prompt
  let systemPrompt = "You are a business analyst expert that evaluates business ideas and provides detailed analysis.";
  
  // Adjust language based on preference
  if (preferredLanguage === 'pt') {
    systemPrompt = "Você é um especialista em análise de negócios que avalia ideias de negócios e fornece análises detalhadas. IMPORTANTE: Responda sempre em português brasileiro.";
  } else if (preferredLanguage === 'es') {
    systemPrompt = "Eres un experto en análisis de negocios que evalúa ideas de negocios y proporciona análisis detallados. IMPORTANTE: Responde siempre en español.";
  } else if (preferredLanguage === 'ja') {
    systemPrompt = "あなたはビジネスのアイデアを評価し、詳細な分析を提供するビジネスアナリストの専門家です。重要：常に日本語で回答してください。";
  }
  
  return {
    systemPrompt,
    userPrompt: `
    ${preferredLanguage === 'pt' ? 'Por favor, analise a seguinte ideia de negócio e forneça uma avaliação completa:' : 
      preferredLanguage === 'es' ? 'Por favor, analiza la siguiente idea de negocio y proporciona una evaluación completa:' :
      preferredLanguage === 'ja' ? '次のビジネスアイデアを分析し、包括的な評価を提供してください:' :
      'Please analyze the following business idea and provide a comprehensive evaluation:'}
    
    ${preferredLanguage === 'pt' ? 'Ideia de Negócio:' : 
      preferredLanguage === 'es' ? 'Idea de Negocio:' :
      preferredLanguage === 'ja' ? 'ビジネスアイデア:' :
      'Business Idea:'} ${ideaData.idea}
    
    ${preferredLanguage === 'pt' ? 'Público-Alvo:' : 
      preferredLanguage === 'es' ? 'Público Objetivo:' :
      preferredLanguage === 'ja' ? 'ターゲットオーディエンス:' :
      'Target Audience:'} ${ideaData.audience || (preferredLanguage === 'pt' ? 'Não especificado' : 
                             preferredLanguage === 'es' ? 'No especificado' :
                             preferredLanguage === 'ja' ? '指定なし' :
                             'Not specified')}
    
    ${preferredLanguage === 'pt' ? 'Problema Resolvido:' : 
      preferredLanguage === 'es' ? 'Problema Resuelto:' :
      preferredLanguage === 'ja' ? '解決する問題:' :
      'Problem Solved:'} ${ideaData.problem || (preferredLanguage === 'pt' ? 'Não especificado' : 
                           preferredLanguage === 'es' ? 'No especificado' :
                           preferredLanguage === 'ja' ? '指定なし' :
                           'Not specified')}
    
    ${preferredLanguage === 'pt' ? 'Concorrentes:' : 
      preferredLanguage === 'es' ? 'Competidores:' :
      preferredLanguage === 'ja' ? '競合他社:' :
      'Competitors:'} ${ideaData.hasCompetitors || (preferredLanguage === 'pt' ? 'Não especificado' : 
                        preferredLanguage === 'es' ? 'No especificado' :
                        preferredLanguage === 'ja' ? '指定なし' :
                        'Not specified')}
    
    ${preferredLanguage === 'pt' ? 'Estratégia de Monetização:' : 
      preferredLanguage === 'es' ? 'Estrategia de Monetización:' :
      preferredLanguage === 'ja' ? '収益化戦略:' :
      'Monetization Strategy:'} ${ideaData.monetization || (preferredLanguage === 'pt' ? 'Não especificado' : 
                                  preferredLanguage === 'es' ? 'No especificado' :
                                  preferredLanguage === 'ja' ? '指定なし' :
                                  'Not specified')}
    
    ${preferredLanguage === 'pt' ? 'Orçamento:' : 
      preferredLanguage === 'es' ? 'Presupuesto:' :
      preferredLanguage === 'ja' ? '予算:' :
      'Budget:'} ${ideaData.budget || (preferredLanguage === 'pt' ? 'Não especificado' : 
                   preferredLanguage === 'es' ? 'No especificado' :
                   preferredLanguage === 'ja' ? '指定なし' :
                   'Not specified')}
    
    ${preferredLanguage === 'pt' ? 'Localização:' : 
      preferredLanguage === 'es' ? 'Ubicación:' :
      preferredLanguage === 'ja' ? '場所:' :
      'Location:'} ${ideaData.location || (preferredLanguage === 'pt' ? 'Não especificado' : 
                     preferredLanguage === 'es' ? 'No especificado' :
                     preferredLanguage === 'ja' ? '指定なし' :
                     'Not specified')}
    
    ${preferredLanguage === 'pt' ? 'Forneça sua análise em formato JSON com a seguinte estrutura:' : 
      preferredLanguage === 'es' ? 'Proporciona tu análisis en formato JSON con la siguiente estructura:' :
      preferredLanguage === 'ja' ? '次の構造でJSONフォーマットで分析を提供してください:' :
      'Provide your analysis in JSON format with the following structure:'}
    {
      "score": [${preferredLanguage === 'pt' ? 'Um número de 0-100 representando a pontuação geral de viabilidade' : 
                 preferredLanguage === 'es' ? 'Un número de 0-100 que representa la puntuación general de viabilidad' :
                 preferredLanguage === 'ja' ? '実現可能性の全体スコアを表す0-100の数値' :
                 'A number from 0-100 representing the overall viability score'}],
      "status": [${preferredLanguage === 'pt' ? 'Uma string: "Viável", "Moderado", ou "Desafiador"' : 
                  preferredLanguage === 'es' ? 'Una string: "Viable", "Moderado", o "Desafiante"' :
                  preferredLanguage === 'ja' ? '文字列: "実行可能", "適度", または "困難"' :
                  'A string: "Viable", "Moderate", or "Challenging"'}],
      "swotAnalysis": {
        "strengths": [${preferredLanguage === 'pt' ? 'Array de pontos fortes' : 
                       preferredLanguage === 'es' ? 'Array de fortalezas' :
                       preferredLanguage === 'ja' ? '強みの配列' :
                       'Array of strengths'}],
        "weaknesses": [${preferredLanguage === 'pt' ? 'Array de pontos fracos' : 
                        preferredLanguage === 'es' ? 'Array de debilidades' :
                        preferredLanguage === 'ja' ? '弱みの配列' :
                        'Array of weaknesses'}],
        "opportunities": [${preferredLanguage === 'pt' ? 'Array de oportunidades' : 
                           preferredLanguage === 'es' ? 'Array de oportunidades' :
                           preferredLanguage === 'ja' ? '機会の配列' :
                           'Array of opportunities'}],
        "threats": [${preferredLanguage === 'pt' ? 'Array de ameaças' : 
                     preferredLanguage === 'es' ? 'Array de amenazas' :
                     preferredLanguage === 'ja' ? '脅威の配列' :
                     'Array of threats'}]
      },
      "marketAnalysis": {
        "market_size": [${preferredLanguage === 'pt' ? 'String descrevendo o tamanho do mercado' : 
                         preferredLanguage === 'es' ? 'String describiendo el tamaño del mercado' :
                         preferredLanguage === 'ja' ? '市場規模を説明する文字列' :
                         'String describing market size'}],
        "target_audience": [${preferredLanguage === 'pt' ? 'String descrevendo o público-alvo' : 
                             preferredLanguage === 'es' ? 'String describiendo el público objetivo' :
                             preferredLanguage === 'ja' ? 'ターゲットオーディエンスを説明する文字列' :
                             'String describing target audience'}],
        "growth_potential": [${preferredLanguage === 'pt' ? 'String descrevendo o potencial de crescimento' : 
                              preferredLanguage === 'es' ? 'String describiendo el potencial de crecimiento' :
                              preferredLanguage === 'ja' ? '成長可能性を説明する文字列' :
                              'String describing growth potential'}],
        "barriers_to_entry": [${preferredLanguage === 'pt' ? 'Array de barreiras' : 
                               preferredLanguage === 'es' ? 'Array de barreras' :
                               preferredLanguage === 'ja' ? '参入障壁の配列' :
                               'Array of barriers'}]
      },
      "competitorAnalysis": {
        "key_competitors": [${preferredLanguage === 'pt' ? 'Array de concorrentes potenciais' : 
                             preferredLanguage === 'es' ? 'Array de competidores potenciales' :
                             preferredLanguage === 'ja' ? '主要競合他社の配列' :
                             'Array of potential competitors'}],
        "competitive_advantage": [${preferredLanguage === 'pt' ? 'String descrevendo vantagem potencial' : 
                                   preferredLanguage === 'es' ? 'String describiendo ventaja potencial' :
                                   preferredLanguage === 'ja' ? '潜在的な優位性を説明する文字列' :
                                   'String describing potential advantage'}],
        "market_gaps": [${preferredLanguage === 'pt' ? 'Array de lacunas de mercado' : 
                         preferredLanguage === 'es' ? 'Array de brechas del mercado' :
                         preferredLanguage === 'ja' ? '市場ギャップの配列' :
                         'Array of market gaps'}]
      },
      "financialAnalysis": {
        "revenue_potential": [${preferredLanguage === 'pt' ? 'String descrevendo potencial de receita' : 
                               preferredLanguage === 'es' ? 'String describiendo potencial de ingresos' :
                               preferredLanguage === 'ja' ? '収益可能性を説明する文字列' :
                               'String describing revenue potential'}],
        "initial_investment": [${preferredLanguage === 'pt' ? 'String descrevendo investimento necessário' : 
                                preferredLanguage === 'es' ? 'String describiendo inversión necesaria' :
                                preferredLanguage === 'ja' ? '初期投資を説明する文字列' :
                                'String describing investment needed'}],
        "break_even_estimate": [${preferredLanguage === 'pt' ? 'String com estimativa do ponto de equilíbrio' : 
                                 preferredLanguage === 'es' ? 'String con estimación del punto de equilibrio' :
                                 preferredLanguage === 'ja' ? '収支均衡点の見積もりを含む文字列' :
                                 'String with break-even estimate'}],
        "funding_suggestions": [${preferredLanguage === 'pt' ? 'Array de opções de financiamento' : 
                                 preferredLanguage === 'es' ? 'Array de opciones de financiación' :
                                 preferredLanguage === 'ja' ? '資金調達オプションの配列' :
                                 'Array of funding options'}]
      },
      "recommendations": {
        "action_items": [${preferredLanguage === 'pt' ? 'Array de itens de ação' : 
                          preferredLanguage === 'es' ? 'Array de elementos de acción' :
                          preferredLanguage === 'ja' ? 'アクションアイテムの配列' :
                          'Array of action items'}],
        "next_steps": [${preferredLanguage === 'pt' ? 'Array de próximos passos' : 
                        preferredLanguage === 'es' ? 'Array de próximos pasos' :
                        preferredLanguage === 'ja' ? '次のステップの配列' :
                        'Array of next steps'}],
        "potential_challenges": [${preferredLanguage === 'pt' ? 'Array de desafios' : 
                                 preferredLanguage === 'es' ? 'Array de desafíos' :
                                 preferredLanguage === 'ja' ? '潜在的な課題の配列' :
                                 'Array of challenges'}],
        "suggested_resources": [${preferredLanguage === 'pt' ? 'Array de recursos' : 
                                preferredLanguage === 'es' ? 'Array de recursos' :
                                preferredLanguage === 'ja' ? '提案されるリソースの配列' :
                                'Array of resources'}]
      }
    }
  `
  };
}

// Function to generate analysis using OpenAI with better error handling and language support
async function generateAnalysis(ideaData) {
  try {
    const { systemPrompt, userPrompt } = generateAnalysisPrompt(ideaData);
    
    console.log("Sending request to OpenAI with language setting...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a more modern model
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI returned an empty response");
    }
    
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }
    
    console.log("Received OpenAI response, parsing JSON...");
    
    try {
      const analysisResult = JSON.parse(content);
      return analysisResult;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw OpenAI response content:", content);
      throw new Error("Failed to parse OpenAI JSON response");
    }
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
}

// Function to generate the analysis prompt
function generateAnalysisPrompt(ideaData) {
  return `
    Please analyze the following business idea and provide a comprehensive evaluation:
    
    Business Idea: ${ideaData.idea}
    Target Audience: ${ideaData.audience || "Not specified"}
    Problem Solved: ${ideaData.problem || "Not specified"}
    Competitors: ${ideaData.hasCompetitors || "Not specified"}
    Monetization Strategy: ${ideaData.monetization || "Not specified"}
    Budget: ${ideaData.budget || "Not specified"}
    Location: ${ideaData.location || "Not specified"}
    
    Provide your analysis in JSON format with the following structure:
    {
      "score": [A number from 0-100 representing the overall viability score],
      "status": [A string: "Viable", "Moderate", or "Challenging"],
      "swotAnalysis": {
        "strengths": [Array of strengths],
        "weaknesses": [Array of weaknesses],
        "opportunities": [Array of opportunities],
        "threats": [Array of threats]
      },
      "marketAnalysis": {
        "market_size": [String describing market size],
        "target_audience": [String describing target audience],
        "growth_potential": [String describing growth potential],
        "barriers_to_entry": [Array of barriers]
      },
      "competitorAnalysis": {
        "key_competitors": [Array of potential competitors],
        "competitive_advantage": [String describing potential advantage],
        "market_gaps": [Array of market gaps]
      },
      "financialAnalysis": {
        "revenue_potential": [String describing revenue potential],
        "initial_investment": [String describing investment needed],
        "break_even_estimate": [String with break-even estimate],
        "funding_suggestions": [Array of funding options]
      },
      "recommendations": {
        "action_items": [Array of action items],
        "next_steps": [Array of next steps],
        "potential_challenges": [Array of challenges],
        "suggested_resources": [Array of resources]
      }
    }
  `;
}
