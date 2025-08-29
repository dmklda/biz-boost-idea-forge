import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    const { request, criteria } = await req.json();
    if (!request || !criteria) {
      throw new Error('Request and criteria are required');
    }
    console.log('Matching adopters for request:', request.title);
    // Get all available early adopters
    const { data: adopters, error: adoptersError } = await supabaseClient.from('early_adopters').select('*').eq('availability', 'available');
    if (adoptersError) {
      throw new Error(`Error fetching adopters: ${adoptersError.message}`);
    }
    if (!adopters || adopters.length === 0) {
      return new Response(JSON.stringify({
        matches: [],
        message: 'No available adopters found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Use OpenAI to analyze and score matches
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    const matchingPrompt = `
    You are an expert matching algorithm for a validation marketplace. 
    Your job is to score how well each early adopter matches a validation request.
    
    Validation Request:
    - Title: ${request.title}
    - Description: ${request.description}
    - Category: ${request.category}
    - Target Audience: ${request.target_audience}
    - Validation Type: ${request.validation_type}
    - Requirements: ${request.requirements || 'None specified'}
    
    For each early adopter, provide a match score from 0-100 and a brief explanation.
    Consider:
    1. Expertise alignment with the category
    2. Interest in the target audience
    3. Experience with the validation type
    4. Overall profile fit
    5. Past performance (rating and completed validations)
    
    Early Adopters to evaluate:
    ${adopters.map((adopter, index)=>`
    ${index + 1}. ${adopter.name}
       Bio: ${adopter.bio}
       Interests: ${adopter.interests?.join(', ') || 'None'}
       Expertise: ${adopter.expertise_areas?.join(', ') || 'None'}
       Rating: ${adopter.rating}/5
       Completed Validations: ${adopter.completed_validations}
    `).join('')}
    
    Respond with a JSON array of objects with this structure:
    [
      {
        "adopter_id": "adopter_id_here",
        "match_score": 85,
        "explanation": "Strong match because...",
        "strengths": ["expertise in fintech", "target audience alignment"],
        "considerations": ["limited experience with surveys"]
      }
    ]
    
    Only include adopters with a match score of 60 or higher.
    Sort by match score in descending order.
    `;
    console.log('Calling OpenAI for matching analysis...');
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are an expert matching algorithm. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: matchingPrompt
          }
        ],
        max_completion_tokens: 2000
      })
    });
    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      throw new Error(`OpenAI API error: ${openAiResponse.status} - ${errorText}`);
    }
    const openAiResult = await openAiResponse.json();
    const aiAnalysis = openAiResult.choices[0]?.message?.content;
    if (!aiAnalysis) {
      throw new Error('No analysis received from OpenAI');
    }
    console.log('AI Analysis received:', aiAnalysis);
    let matchScores;
    try {
      matchScores = JSON.parse(aiAnalysis);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to simple matching
      matchScores = adopters.map((adopter)=>({
          adopter_id: adopter.id,
          match_score: calculateSimpleMatch(adopter, criteria),
          explanation: 'Basic compatibility match',
          strengths: [
            'Available for validation'
          ],
          considerations: [
            'Manual review recommended'
          ]
        })).filter((match)=>match.match_score >= 60);
    }
    // Combine AI scores with adopter data
    const matches = matchScores.map((score)=>{
      const adopter = adopters.find((a)=>a.id === score.adopter_id);
      return {
        ...adopter,
        match_score: score.match_score,
        match_explanation: score.explanation,
        match_strengths: score.strengths,
        match_considerations: score.considerations
      };
    }).filter(Boolean);
    // Sort by match score
    matches.sort((a, b)=>b.match_score - a.match_score);
    console.log(`Found ${matches.length} matching adopters`);
    return new Response(JSON.stringify({
      matches: matches.slice(0, 10),
      total_evaluated: adopters.length,
      criteria_used: criteria
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in match-adopters function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      matches: []
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
// Fallback simple matching algorithm
function calculateSimpleMatch(adopter, criteria) {
  let score = 50; // Base score
  // Category match
  if (adopter.interests?.includes(criteria.category)) {
    score += 20;
  }
  // Expertise match
  if (adopter.expertise_areas?.some((area)=>area.toLowerCase().includes(criteria.category.toLowerCase()))) {
    score += 15;
  }
  // Rating bonus
  score += (adopter.rating - 3) * 5; // 0-10 bonus based on rating
  // Experience bonus
  if (adopter.completed_validations > 10) {
    score += 10;
  } else if (adopter.completed_validations > 5) {
    score += 5;
  }
  return Math.min(100, Math.max(0, score));
}
