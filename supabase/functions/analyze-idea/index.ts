
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// Fix the OpenAI import to use a URL import instead of a bare import
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

    // Create Supabase client with auth context from the request
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
    
    // Create or update the idea in the database
    let finalIdeaId = ideaId;
    
    if (!finalIdeaId) {
      // Create a new idea if no ID was provided
      const { data: newIdea, error: ideaError } = await supabase
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
    } else {
      // Update the existing idea and explicitly set is_draft to false
      const { error: updateError } = await supabase
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
    }
    
    // Store the analysis results
    try {
      const { error: analysisError } = await supabase
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
    
    // Update user credits only if not reanalyzing
    if (!isReanalyzing) {
      const { data: creditData, error: creditError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();
        
      if (creditError) {
        console.error("Error fetching user credits:", creditError);
        throw creditError;
      }
      
      // Update user's credit balance with parameters in correct order (user_id, amount)
      const { error: updateError } = await supabase
        .rpc("update_user_credits", { 
          user_id: userId, 
          amount: -1 
        });
        
      if (updateError) {
        console.error("Error updating user credits:", updateError);
        throw updateError;
      }
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
