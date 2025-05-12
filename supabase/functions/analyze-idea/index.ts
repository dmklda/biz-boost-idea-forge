
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client with service role to bypass RLS
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to generate analysis using OpenAI
async function generateAnalysis(ideaData: any) {
  const systemPrompt = `You are an expert business consultant specializing in analyzing business ideas. 
  Your task is to analyze the provided business idea and generate comprehensive insights. 
  Please provide your analysis in a structured JSON format that includes the following sections:
  
  1. SWOT Analysis (strengths, weaknesses, opportunities, threats - each as arrays of string points)
  2. Market Analysis (market_size, target_audience, growth_potential, barriers_to_entry)
  3. Competitor Analysis (key_competitors as array, competitive_advantage, market_gaps as array)
  4. Financial Analysis (revenue_potential, initial_investment, break_even_estimate, funding_suggestions as array)
  5. Recommendations (action_items as array, next_steps as array, potential_challenges as array, suggested_resources as array)
  6. Overall viability score between 0-100
  
  Your response must be valid JSON that can be parsed directly. Be comprehensive but concise.`;

  const userPrompt = `
  Business Idea: "${ideaData.idea}"
  Target Audience: "${ideaData.audience || 'Not specified'}"
  Problem Addressed: "${ideaData.problem || 'Not specified'}"
  Competitors: "${ideaData.hasCompetitors || 'Not specified'}"
  Monetization: "${ideaData.monetization || 'Not specified'}"
  Budget: ${ideaData.budget || 'Not specified'}
  Location: "${ideaData.location || 'Not specified'}"
  
  Analyze this business idea and provide the requested JSON structure with detailed insights.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");
    
    // Parse the content to extract the JSON
    let analysisJson;
    try {
      // Parse the response from OpenAI
      analysisJson = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw content:", data.choices[0].message.content);
      
      // Attempt to extract JSON using regex as fallback
      try {
        const jsonMatch = data.choices[0].message.content.match(/({[\s\S]*})/);
        if (jsonMatch && jsonMatch[0]) {
          analysisJson = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      } catch (fallbackError) {
        throw new Error("Failed to parse analysis JSON");
      }
    }
    
    return {
      swot_analysis: {
        strengths: analysisJson.swot_analysis?.strengths || [],
        weaknesses: analysisJson.swot_analysis?.weaknesses || [],
        opportunities: analysisJson.swot_analysis?.opportunities || [],
        threats: analysisJson.swot_analysis?.threats || [],
      },
      market_analysis: {
        market_size: analysisJson.market_analysis?.market_size || "Unknown",
        target_audience: analysisJson.market_analysis?.target_audience || "Unknown",
        growth_potential: analysisJson.market_analysis?.growth_potential || "Unknown",
        barriers_to_entry: analysisJson.market_analysis?.barriers_to_entry || [],
      },
      competitor_analysis: {
        key_competitors: analysisJson.competitor_analysis?.key_competitors || [],
        competitive_advantage: analysisJson.competitor_analysis?.competitive_advantage || "Unknown",
        market_gaps: analysisJson.competitor_analysis?.market_gaps || [],
      },
      financial_analysis: {
        revenue_potential: analysisJson.financial_analysis?.revenue_potential || "Unknown",
        initial_investment: analysisJson.financial_analysis?.initial_investment || "Unknown",
        break_even_estimate: analysisJson.financial_analysis?.break_even_estimate || "Unknown",
        funding_suggestions: analysisJson.financial_analysis?.funding_suggestions || [],
      },
      recommendations: {
        action_items: analysisJson.recommendations?.action_items || [],
        next_steps: analysisJson.recommendations?.next_steps || [],
        potential_challenges: analysisJson.recommendations?.potential_challenges || [],
        suggested_resources: analysisJson.recommendations?.suggested_resources || [],
      },
      score: analysisJson.score || analysisJson.overall_viability_score || 0,
      status: getStatusFromScore(analysisJson.score || analysisJson.overall_viability_score || 0),
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

// Determine status based on score
function getStatusFromScore(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Moderado";
  return "Baixo Potencial";
}

// Check if user has enough credits
async function checkUserCredits(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return (data && data.credits > 0);
  } catch (error) {
    console.error("Error checking user credits:", error);
    return false;
  }
}

// Store analysis in the database
async function storeAnalysis(ideaId: string, userId: string, analysis: any) {
  try {
    // Insert analysis data
    const { data, error } = await supabase
      .from("idea_analyses")
      .insert({
        idea_id: ideaId,
        user_id: userId,
        score: analysis.score,
        status: analysis.status,
        swot_analysis: analysis.swot_analysis,
        market_analysis: analysis.market_analysis,
        competitor_analysis: analysis.competitor_analysis,
        financial_analysis: analysis.financial_analysis,
        recommendations: analysis.recommendations,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Deduct a credit from the user
    const { error: creditError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount: -1,
        description: "Análise de Ideia de Negócio"
      });
      
    if (creditError) throw creditError;
    
    // Update user's credit balance - Note: parameter order is (user_id, amount)
    const { error: updateError } = await supabase
      .rpc("update_user_credits", { 
        user_id: userId, 
        amount: -1 
      });
      
    if (updateError) throw updateError;
    
    return data;
  } catch (error) {
    console.error("Error storing analysis:", error);
    throw error;
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // First parse the request to get the data, fixing the "Cannot access ideaData before initialization" error
    const requestData = await req.json();
    const { ideaData, userId, ideaId, isReanalyzing } = requestData;
    
    console.log("Request received for idea analysis:", { ideaId, isReanalyzing });
    
    // Validate required data
    if (!ideaData || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if user has credits
    const hasCredits = await checkUserCredits(userId);
    if (!hasCredits) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", errorCode: "INSUFFICIENT_CREDITS" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Generating analysis for idea:", ideaData.idea.substring(0, 50) + "...");
    
    // Generate analysis using OpenAI
    const analysis = await generateAnalysis(ideaData);
    console.log("Analysis generated successfully, score:", analysis.score);
    
    // Store the idea first if it's a new idea
    let finalIdeaId = ideaId;
    if (!finalIdeaId) {
      const { data: ideaData, error: ideaError } = await supabase
        .from("ideas")
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
          status: "complete"
        })
        .select("id")
        .single();
        
      if (ideaError) throw ideaError;
      finalIdeaId = ideaData.id;
      console.log("New idea created with ID:", finalIdeaId);
    }
    
    // If reanalyzing, delete the old analysis first
    if (isReanalyzing) {
      await supabase
        .from("idea_analyses")
        .delete()
        .eq("idea_id", finalIdeaId);
      console.log("Previous analysis deleted for reanalysis");
    }
    
    // Store analysis in database
    const storedAnalysis = await storeAnalysis(finalIdeaId, userId, analysis);
    console.log("Analysis stored successfully for idea ID:", finalIdeaId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        ideaId: finalIdeaId, 
        analysisId: storedAnalysis.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in analyze-idea function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during analysis", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
