import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Get request body
    const { ideaId, userLanguage = 'pt' } = await req.json();
    // Validate input
    if (!ideaId) {
      return new Response(JSON.stringify({
        error: "Missing ideaId parameter"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    console.log(`Processing advanced analysis for idea: ${ideaId} in language: ${userLanguage}`);
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Remove any existing analysis for this idea to ensure we generate a fresh one
    // This ensures we're not using cached/old data after a re-analysis
    const { error: deleteError } = await supabase.from("advanced_analyses").delete().eq("idea_id", ideaId);
    if (deleteError) {
      console.log("No previous analysis to delete or error deleting:", deleteError);
    } else {
      console.log("Successfully deleted previous analysis for idea:", ideaId);
    }
    // Fetch the idea details - always get the latest data
    console.log("Fetching latest idea details");
    const { data: ideaData, error: ideaError } = await supabase.from("ideas").select("*").eq("id", ideaId).single();
    if (ideaError || !ideaData) {
      console.error("Error fetching idea data:", ideaError);
      return new Response(JSON.stringify({
        error: "Failed to fetch idea data",
        details: ideaError
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 404
      });
    }
    // Fetch existing analysis for enrichment - get the latest analysis
    console.log("Fetching latest basic analysis");
    const { data: basicAnalysisData, error: analysisError } = await supabase.from("idea_analyses").select("*").eq("idea_id", ideaId).order("created_at", {
      ascending: false
    }).limit(1).single();
    console.log("Latest basic analysis data:", basicAnalysisData);
    console.log("Latest idea data:", ideaData);
    // Prepare a prompt for OpenAI to generate a complete analysis
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("Missing OpenAI API key in environment variables");
    }
    // Ensure we use the latest idea and analysis data for generating the prompt
    const inputData = {
      idea: {
        title: ideaData.title || "Undisclosed business idea",
        description: ideaData.description || "No description provided",
        problem: ideaData.problem || "Not specified",
        audience: ideaData.audience || "Not specified",
        monetization: ideaData.monetization || "Not specified",
        has_competitors: ideaData.has_competitors || "Not specified",
        budget: ideaData.budget || null,
        location: ideaData.location || "Not specified"
      },
      basicAnalysis: basicAnalysisData ? {
        score: basicAnalysisData.score,
        status: basicAnalysisData.status,
        market_analysis: basicAnalysisData.market_analysis,
        swot_analysis: basicAnalysisData.swot_analysis,
        competitor_analysis: basicAnalysisData.competitor_analysis,
        financial_analysis: basicAnalysisData.financial_analysis,
        recommendations: basicAnalysisData.recommendations
      } : null
    };
    // Create a specific custom instruction based on the idea's domain/industry
    let domainSpecificInstructions = "";
    const lowerCaseDesc = ideaData.description.toLowerCase() + " " + (ideaData.problem || "").toLowerCase() + " " + (ideaData.audience || "").toLowerCase();
    // Add industry-specific analysis guidance based on the idea content
    if (lowerCaseDesc.includes("tech") || lowerCaseDesc.includes("software") || lowerCaseDesc.includes("app") || lowerCaseDesc.includes("aplicativo") || lowerCaseDesc.includes("tecnologia")) {
      domainSpecificInstructions = "This appears to be a technology/software idea. Focus on tech adoption curves, software development costs, technical scalability challenges, and digital marketing strategies.";
    } else if (lowerCaseDesc.includes("food") || lowerCaseDesc.includes("restaurant") || lowerCaseDesc.includes("comida") || lowerCaseDesc.includes("restaurante") || lowerCaseDesc.includes("café")) {
      domainSpecificInstructions = "This appears to be a food/restaurant business. Focus on location analysis, food costs, staffing requirements, health regulations, and local competition.";
    } else if (lowerCaseDesc.includes("retail") || lowerCaseDesc.includes("shop") || lowerCaseDesc.includes("store") || lowerCaseDesc.includes("loja") || lowerCaseDesc.includes("ecommerce") || lowerCaseDesc.includes("e-commerce")) {
      domainSpecificInstructions = "This appears to be a retail/e-commerce business. Focus on inventory management, supply chain logistics, online vs physical presence, and customer acquisition costs.";
    } else if (lowerCaseDesc.includes("health") || lowerCaseDesc.includes("wellness") || lowerCaseDesc.includes("fitness") || lowerCaseDesc.includes("saúde") || lowerCaseDesc.includes("bem-estar")) {
      domainSpecificInstructions = "This appears to be a health/wellness business. Focus on regulations, certifications needed, insurance considerations, and specialized marketing for health-conscious consumers.";
    } else if (lowerCaseDesc.includes("education") || lowerCaseDesc.includes("learning") || lowerCaseDesc.includes("teaching") || lowerCaseDesc.includes("course") || lowerCaseDesc.includes("educação") || lowerCaseDesc.includes("curso")) {
      domainSpecificInstructions = "This appears to be an education business. Focus on curriculum development costs, accreditation requirements, instructor recruitment, and education technology integration.";
    }
    // Get the language-specific system prompt
    let systemPrompt;
    let languageInstructions;
    // Set language-specific instructions
    if (userLanguage === 'en') {
      systemPrompt = "You are an expert business consultant specializing in startup analysis and market intelligence. You create thorough, specific analyses based on the exact details provided for each unique business idea.";
      languageInstructions = "Generate the analysis in English";
    } else if (userLanguage === 'es') {
      systemPrompt = "Eres un consultor de negocios experto especializado en análisis de startups e inteligencia de mercado. Creas análisis detallados y específicos basados en los detalles exactos proporcionados para cada idea de negocio única.";
      languageInstructions = "Genera el análisis en español";
    } else if (userLanguage === 'ja') {
      systemPrompt = "あなたはスタートアップ分析と市場インテリジェンスを専門とするビジネスコンサルタントのエキスパートです。各ビジネスアイデアに対して提供された正確な詳細に基づいて、詳細かつ具体的な分析を作成します。";
      languageInstructions = "分析を日本語で生成してください";
    } else {
      // Default to Portuguese
      systemPrompt = "Você é um consultor de negócios especializado em análise de startups e inteligência de mercado. Você cria análises completas e específicas com base nos detalhes exatos fornecidos para cada ideia de negócio única.";
      languageInstructions = "Gere a análise em português";
    }
    // Structure the AI prompt with enhanced customization for the specific idea
    const aiPrompt = `
    ${languageInstructions}. Generate a comprehensive, UNIQUE business analysis for the following specific idea. This analysis MUST be completely tailored to this particular idea and should NOT contain generic content that could apply to any business:
    
    ${JSON.stringify(inputData, null, 2)}
    
    ${domainSpecificInstructions}
    
    Make your analysis HIGHLY SPECIFIC to this exact business idea. Reference the exact business concept, problem being solved, target audience, and other specifics from the data provided.
    
    Your response must be a JSON object with the following exact structure - EVERY FIELD IS REQUIRED with no exceptions:
    
    {
      "businessName": {
        "name": "Recommended business name based specifically on this idea",
        "slogan": "Compelling slogan for the business",
        "justification": "Explanation for the name and slogan recommendations"
      },
      "logoUrl": "https://placehold.co/400x400/3b82f6/FFFFFF/png?text=Logo",
      "summary": {
        "description": "Concise description of this specific idea's value proposition",
        "score": number between 0-100 indicating viability,
        "status": "One of: 'Viable', 'Moderate', 'Challenging'"
      },
      "differentials": [Exactly 5 key differentiators for this specific business],
      "pitch": "One-paragraph elevator pitch for the business that mentions specific elements from the provided idea",
      "marketAnalysis": {
        "size": "Detailed market size analysis with specific estimates in dollars",
        "targetAudience": "Detailed profile of ideal customers based on the provided audience information",
        "trends": [Exactly 5 relevant market trends],
        "barriers": [Exactly 4 barriers to entry]
      },
      "personas": [
        {
          "name": "First persona name with age",
          "description": "Detailed description of this persona",
          "occupation": "Their job title",
          "behavior": "Their key behavior patterns"
        },
        {
          "name": "Second persona name with age",
          "description": "Detailed description of this persona",
          "occupation": "Their job title",
          "behavior": "Their key behavior patterns"
        },
        {
          "name": "Third persona name with age",
          "description": "Detailed description of this persona",
          "occupation": "Their job title",
          "behavior": "Their key behavior patterns"
        }
      ],
      "monetization": {
        "models": [
          {
            "name": "First monetization model",
            "description": "Description of this model",
            "revenue": "Specific revenue projection for this model"
          },
          {
            "name": "Second monetization model",
            "description": "Description of this model",
            "revenue": "Specific revenue projection for this model"
          },
          {
            "name": "Third monetization model",
            "description": "Description of this model",
            "revenue": "Specific revenue projection for this model"
          },
          {
            "name": "Fourth monetization model",
            "description": "Description of this model",
            "revenue": "Specific revenue projection for this model"
          }
        ],
        "projections": {
          "firstYear": "Specific first-year revenue projection (include dollar amounts)",
          "thirdYear": "Specific third-year revenue projection (include dollar amounts)",
          "breakEven": "Specific timeframe to break even (months/years)",
          "roi": "Expected ROI percentage after 3 years (include %)"
        }
      },
      "channels": [
        {
          "name": "First acquisition channel",
          "description": "Description of how this channel works"
        },
        {
          "name": "Second acquisition channel",
          "description": "Description of how this channel works"
        },
        {
          "name": "Third acquisition channel",
          "description": "Description of how this channel works"
        },
        {
          "name": "Fourth acquisition channel",
          "description": "Description of how this channel works"
        },
        {
          "name": "Fifth acquisition channel",
          "description": "Description of how this channel works"
        }
      ],
      "competitors": [
        {
          "name": "First competitor name",
          "strengths": ["Strength 1", "Strength 2", "Strength 3"],
          "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
        },
        {
          "name": "Second competitor name",
          "strengths": ["Strength 1", "Strength 2", "Strength 3"],
          "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
        },
        {
          "name": "Third competitor name",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
        }
      ],
      "swot": {
        "strengths": [Exactly 5 specific strengths],
        "weaknesses": [Exactly 5 specific weaknesses],
        "opportunities": [Exactly 5 specific opportunities],
        "threats": [Exactly 5 specific threats]
      },
      "risks": [
        {
          "name": "First risk name",
          "level": "Low/Medium/High",
          "description": "Description of this risk",
          "mitigation": "Strategy to mitigate this risk"
        },
        {
          "name": "Second risk name",
          "level": "Low/Medium/High",
          "description": "Description of this risk",
          "mitigation": "Strategy to mitigate this risk"
        },
        {
          "name": "Third risk name",
          "level": "Low/Medium/High",
          "description": "Description of this risk",
          "mitigation": "Strategy to mitigate this risk"
        },
        {
          "name": "Fourth risk name",
          "level": "Low/Medium/High",
          "description": "Description of this risk",
          "mitigation": "Strategy to mitigate this risk"
        },
        {
          "name": "Fifth risk name",
          "level": "Low/Medium/High",
          "description": "Description of this risk",
          "mitigation": "Strategy to mitigate this risk"
        }
      ],
      "tools": [
        {
           "name": "First tool name",
           "category": "Tool category",
          "description": "Description of this tool's purpose"
        },
        {
           "name": "Second tool name",
           "category": "Tool category",
          "description": "Description of this tool's purpose"
        },
        {
           "name": "Third tool name",
           "category": "Tool category",
          "description": "Description of this tool's purpose"
        },
        {
           "name": "Fourth tool name",
           "category": "Tool category",
          "description": "Description of this tool's purpose"
        },
        {
           "name": "Fifth tool name",
           "category": "Tool category",
          "description": "Description of this tool's purpose"
        },
        {
           "name": "Sixth tool name",
           "category": "Tool category",
          "description": "Description of this tool's purpose"
        }
      ],
      "firstSteps": [
        { "name": "First step", "icon": "📊" },
        { "name": "Second step", "icon": "💻" },
        { "name": "Third step", "icon": "🧪" },
        { "name": "Fourth step", "icon": "🎨" },
        { "name": "Fifth step", "icon": "🚀" }
      ],
      "plan": {
        "thirtyDays": [
          { "name": "First 30-day action", "description": "Description of this action" },
          { "name": "Second 30-day action", "description": "Description of this action" },
          { "name": "Third 30-day action", "description": "Description of this action" },
          { "name": "Fourth 30-day action", "description": "Description of this action" }
        ],
        "sixtyDays": [
          { "name": "First 60-day action", "description": "Description of this action" },
          { "name": "Second 60-day action", "description": "Description of this action" },
          { "name": "Third 60-day action", "description": "Description of this action" },
          { "name": "Fourth 60-day action", "description": "Description of this action" }
        ],
        "ninetyDays": [
          { "name": "First 90-day action", "description": "Description of this action" },
          { "name": "Second 90-day action", "description": "Description of this action" },
          { "name": "Third 90-day action", "description": "Description of this action" },
          { "name": "Fourth 90-day action", "description": "Description of this action" }
        ]
      },
      "mindmap": {
        "id": "root",
        "label": "Business name here",
        "children": [
          {
            "id": "market",
            "label": "Mercado",
            "children": [
              {
                 "id": "audience",
                 "label": "Público-Alvo",
                 "children": [
                  { "id": "audDemo", "label": "Demographic segment" },
                  { "id": "audBeh", "label": "Behavioral segment" }
                ]
               },
              {
                 "id": "trends",
                 "label": "Tendências",
                "children": [
                  { "id": "trend1", "label": "First trend" },
                  { "id": "trend2", "label": "Second trend" }
                ]
              },
              {
                 "id": "competitors",
                 "label": "Concorrência",
                "children": [
                  { "id": "comp1", "label": "Direct competitors" },
                  { "id": "comp2", "label": "Indirect competitors" }
                ]
              }
            ]
          },
          {
            "id": "product",
            "label": "Produto",
            "children": [
              {
                 "id": "features",
                 "label": "Funcionalidades",
                "children": [
                  { "id": "feat1", "label": "Core features" },
                  { "id": "feat2", "label": "Differentiators" }
                ]
              },
              {
                 "id": "roadmap",
                 "label": "Planejamento",
                "children": [
                  { "id": "rm1", "label": "Short term" },
                  { "id": "rm2", "label": "Long term" }
                ]
              },
              {
                 "id": "tech",
                 "label": "Tecnologia",
                "children": [
                  { "id": "tech1", "label": "Tech stack" },
                  { "id": "tech2", "label": "Infrastructure" }
                ]
              }
            ]
          },
          {
            "id": "business",
            "label": "Negócio",
            "children": [
              {
                 "id": "model",
                 "label": "Modelo de Receita",
                "children": [
                  { "id": "model1", "label": "Primary revenue source" },
                  { "id": "model2", "label": "Pricing strategy" }
                ]
              },
              {
                 "id": "growth",
                 "label": "Estratégia de Crescimento",
                "children": [
                  { "id": "growth1", "label": "Acquisition strategy" },
                  { "id": "growth2", "label": "Retention strategy" }
                ]
              },
              {
                 "id": "finance",
                 "label": "Finanças",
                "children": [
                  { "id": "finance1", "label": "Investment needs" },
                  { "id": "finance2", "label": "Break-even point" }
                ]
              }
            ]
          }
        ]
      }
    }
    
    IMPORTANT: Every single field and structure above is REQUIRED. You MUST fill in all fields with specific, detailed content based on the business idea. Do not leave any fields generic or use placeholders. Use SPECIFIC NUMERIC VALUES for all financial projections, market sizes, timeframes, etc. Be creative but realistic in your analysis - use industry benchmarks where appropriate.
    
    Make sure the entire response is focused specifically on the business idea provided and not generic business advice. Include actual data from the idea in your analysis wherever possible.
    `;
    console.log("Making API request to OpenAI");
    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: aiPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }
    const aiData = await apiResponse.json();
    console.log("Received response from OpenAI");
    // Parse the response content which should be JSON
    let advancedAnalysis;
    try {
      // The content should be a JSON string in the response
      const rawContent = aiData.choices[0].message.content.trim();
      // Find JSON content if wrapped in ```json or ``` blocks
      let jsonContent = rawContent;
      if (rawContent.includes("```")) {
        const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }
      advancedAnalysis = JSON.parse(jsonContent);
      // Add logoUrl which is expected by the frontend
      if (!advancedAnalysis.logoUrl) {
        advancedAnalysis.logoUrl = "https://placehold.co/400x400/3b82f6/FFFFFF/png?text=Logo";
      }
      console.log("Successfully parsed AI response");
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", aiData.choices[0].message.content);
      throw new Error("Failed to parse AI-generated analysis");
    }
    // Save the AI-generated advanced analysis to the database
    console.log("Saving new advanced analysis to database");
    const { data: savedAnalysis, error: saveError } = await supabase.from("advanced_analyses").upsert({
      idea_id: ideaId,
      user_id: ideaData.user_id,
      analysis_data: advancedAnalysis
    }).select().single();
    if (saveError) {
      console.error("Error saving advanced analysis:", saveError);
      return new Response(JSON.stringify({
        error: "Failed to save analysis",
        details: saveError
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    console.log("Advanced analysis created successfully");
    return new Response(JSON.stringify({
      message: "Advanced analysis created successfully",
      analysis: savedAnalysis
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in advanced-analysis function:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
