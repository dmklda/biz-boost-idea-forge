
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdvancedAnalysisRequest {
  ideaId: string;
  userId: string;
}

interface OpenAIImageResponse {
  data: Array<{
    url: string;
  }>;
}

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

async function generateLogoImage(brandName: string, description: string): Promise<string> {
  try {
    const prompt = `Create a modern, professional logo for a brand called "${brandName}". The business is about: ${description}. The logo should be simple, memorable, and work well across different sizes. Use a clean design with minimal colors. The logo should be centered on a transparent background.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    const imageData = await response.json() as OpenAIImageResponse;
    return imageData.data[0].url;
  } catch (error) {
    console.error("Error generating logo:", error);
    throw new Error("Failed to generate logo image");
  }
}

async function performAdvancedAnalysis(idea, basicAnalysis) {
  try {
    // Prepare the context from the idea and basic analysis
    const context = {
      idea: {
        title: idea.title,
        description: idea.description,
        audience: idea.audience,
        problem: idea.problem,
        monetization: idea.monetization,
        hasCompetitors: idea.has_competitors,
        budget: idea.budget,
        location: idea.location,
      },
      basicAnalysis: {
        score: basicAnalysis.score,
        status: basicAnalysis.status,
        swotAnalysis: basicAnalysis.swot_analysis,
        marketAnalysis: basicAnalysis.market_analysis,
        competitorAnalysis: basicAnalysis.competitor_analysis,
        financialAnalysis: basicAnalysis.financial_analysis,
        recommendations: basicAnalysis.recommendations,
      }
    };

    // Call to GPT-4o for advanced analysis
    const advancedAnalysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an elite business and innovation analyst with expertise in market research, branding, business strategy, and product development. Your task is to provide an in-depth advanced analysis for a business idea based on an initial basic analysis. Structure your response in JSON format with the following sections:
            
            1. strategicSummary: A comprehensive strategic summary with key insights (250-350 words)
            2. brandSuggestion: { name: "Suggested brand name", justification: "Why this name works well" }
            3. marketAnalysis: { marketSize: "Estimated market size with numbers", growthRate: "Annual growth rate", keyTrends: ["List of current market trends"], targetSegments: ["List of key market segments"] }
            4. personas: [{ name: "Name", age: Number, occupation: "Job", goals: ["Goals"], painPoints: ["Pain points"], behaviors: ["Behaviors"] }, {...}] (provide 2-3 detailed personas)
            5. competitiveMatrix: { competitors: ["List of 3-5 competitors"], advantages: ["Your advantages"], disadvantages: ["Your disadvantages"], positioning: "Unique positioning statement" }
            6. businessModels: [{ name: "Model name", description: "Short description", pros: ["Pros"], cons: ["Cons"] }, {...}] (2-3 models)
            7. acquisitionChannels: ["Channel 1", "Channel 2", ...] (with brief explanation for each)
            8. financials: { initialInvestment: "Estimated range", breakEven: "Estimated timeframe", revenueStreams: ["Stream 1", "Stream 2", ...], costStructure: ["Cost 1", "Cost 2", ...] }
            9. detailedSwot: { strengths: ["S1", "S2", ...], weaknesses: ["W1", "W2", ...], opportunities: ["O1", "O2", ...], threats: ["T1", "T2", ...] } (more comprehensive than basic analysis)
            10. riskMatrix: [{ risk: "Risk description", impact: "High/Medium/Low", probability: "High/Medium/Low", mitigation: "Strategy" }, {...}]
            11. pitchScript: "A concise, compelling 1-minute pitch"
            12. actionPlan: { first30Days: ["Action 1", "Action 2", ...], days31to60: ["Action 1", "Action 2", ...], days61to90: ["Action 1", "Action 2", ...] }
            13. firstStepsChecklist: ["Step 1", "Step 2", ...] (10 practical first steps)
            14. techTrends: ["Trend 1", "Trend 2", ...] (relevant to this business)
            15. recommendedTools: [{ category: "Category", tools: ["Tool 1", "Tool 2", ...] }, {...}] (across various business needs)
            
            Make your analysis data-driven, actionable, and insightful. Consider market realities, consumer behavior, and business fundamentals. Be specific rather than generic.`
          },
          {
            role: "user",
            content: `Analyze this business idea and initial analysis and provide an advanced analysis report: ${JSON.stringify(context)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
      }),
    });

    const advancedAnalysisData = await advancedAnalysisResponse.json();
    if (!advancedAnalysisData.choices || !advancedAnalysisData.choices[0]) {
      throw new Error("Failed to get a valid response from GPT-4o");
    }

    // Parse JSON response from GPT-4o
    const advancedAnalysisContent = advancedAnalysisData.choices[0].message.content;
    const jsonStartIndex = advancedAnalysisContent.indexOf('{');
    const jsonEndIndex = advancedAnalysisContent.lastIndexOf('}') + 1;
    const jsonContent = advancedAnalysisContent.substring(jsonStartIndex, jsonEndIndex);
    
    // Parse the JSON content
    const advancedAnalysis = JSON.parse(jsonContent);

    // Generate logo if we have a brand suggestion
    let logoUrl = null;
    if (advancedAnalysis.brandSuggestion && advancedAnalysis.brandSuggestion.name) {
      try {
        logoUrl = await generateLogoImage(
          advancedAnalysis.brandSuggestion.name, 
          idea.description
        );
        advancedAnalysis.brandSuggestion.logoUrl = logoUrl;
      } catch (logoError) {
        console.error("Error generating logo:", logoError);
        // Continue even if logo generation fails
      }
    }

    // Create mind map visualization
    const mindMapResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate a JSON representation of a mind map for the business idea. The structure should be:
            {
              "root": {
                "name": "Main idea name",
                "children": [
                  {
                    "name": "Major category 1",
                    "children": [
                      {"name": "Subcategory 1-1"},
                      {"name": "Subcategory 1-2"}
                    ]
                  },
                  {
                    "name": "Major category 2",
                    "children": [
                      {"name": "Subcategory 2-1"},
                      {"name": "Subcategory 2-2"}
                    ]
                  }
                ]
              }
            }
            
            Include 5-7 major categories that represent key aspects of the business idea (e.g., Target Market, Value Proposition, Revenue Streams, Key Resources, Marketing Channels). Each major category should have 2-4 subcategories with specific details.`
          },
          {
            role: "user",
            content: `Create a mind map for this business idea: ${idea.title} - ${idea.description}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const mindMapData = await mindMapResponse.json();
    if (mindMapData.choices && mindMapData.choices[0]) {
      const mindMapContent = mindMapData.choices[0].message.content;
      const jsonStartIndex = mindMapContent.indexOf('{');
      const jsonEndIndex = mindMapContent.lastIndexOf('}') + 1;
      const jsonContent = mindMapContent.substring(jsonStartIndex, jsonEndIndex);
      
      try {
        const mindMap = JSON.parse(jsonContent);
        advancedAnalysis.mindMap = mindMap;
      } catch (e) {
        console.error("Error parsing mind map JSON:", e);
        // Continue even if mind map parsing fails
      }
    }

    return advancedAnalysis;
  } catch (error) {
    console.error("Error in advanced analysis:", error);
    throw new Error("Failed to perform advanced analysis");
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get the request body
    const body = await req.json() as AdvancedAnalysisRequest;
    const { ideaId, userId } = body;

    if (!ideaId || !userId) {
      return new Response(
        JSON.stringify({ error: "ideaId and userId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Retrieve the idea and its basic analysis
    const { data: idea, error: ideaError } = await supabaseClient
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .eq("user_id", userId)
      .single();

    if (ideaError || !idea) {
      console.error("Error fetching idea:", ideaError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve idea details" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Retrieve basic analysis
    const { data: basicAnalysis, error: analysisError } = await supabaseClient
      .from("idea_analyses")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("user_id", userId)
      .single();

    if (analysisError || !basicAnalysis) {
      console.error("Error fetching basic analysis:", analysisError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve basic analysis" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if advanced analysis already exists
    const { data: existingAdvancedAnalysis } = await supabaseClient
      .from("advanced_analyses")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("user_id", userId)
      .single();

    if (existingAdvancedAnalysis) {
      // Return the existing advanced analysis
      return new Response(
        JSON.stringify({ analysis: existingAdvancedAnalysis }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Perform advanced analysis
    const advancedAnalysis = await performAdvancedAnalysis(idea, basicAnalysis);

    // Save the advanced analysis to the database
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from("advanced_analyses")
      .insert({
        idea_id: ideaId,
        user_id: userId,
        analysis_data: advancedAnalysis
      })
      .select("*")
      .single();

    if (saveError) {
      console.error("Error saving advanced analysis:", saveError);
      return new Response(
        JSON.stringify({ error: "Failed to save advanced analysis" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update user credits (for non-Pro users)
    const { data: userData } = await supabaseClient
      .from("profiles")
      .select("plan, credits")
      .eq("id", userId)
      .single();

    if (userData && userData.plan !== "pro" && userData.credits >= 3) {
      // Deduct 3 credits for advanced analysis
      await supabaseClient.rpc("update_user_credits", {
        user_id: userId,
        amount: -3
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: savedAnalysis 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
