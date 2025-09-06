import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, rounds, valuation, equityOffered } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an investment and equity modeling expert. You create detailed simulations showing dilution, ownership percentages, and funding scenarios for startups. Return your response in valid JSON format with precise calculations.`
          },
          {
            role: 'user',
            content: `Create an investment simulation for: "${idea.title}" - ${idea.description}
            
Expected Rounds: ${rounds || 'Seed, Series A, Series B'}
Initial Valuation: ${valuation || '$1M pre-money'}
Equity Offered: ${equityOffered || '20% per round'}
Industry: ${idea.category || 'Technology'}

Generate detailed investment scenarios including:
1. Round-by-round equity dilution
2. Ownership percentages after each round
3. Valuation progression
4. Founder dilution calculations
5. Employee stock option pool impact
6. Different scenarios (conservative, aggressive)
7. Exit scenarios and returns
8. Investment terms and conditions

Return as JSON: {
  "rounds": [],
  "dilutionTable": {},
  "ownershipProgression": {},
  "valuationProgression": {},
  "founderDilution": {},
  "esopImpact": {},
  "scenarios": {
    "conservative": {},
    "aggressive": {}
  },
  "exitScenarios": [],
  "investmentTerms": {}
}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    
    // Clean up the response and parse JSON
    let cleanContent = content.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const parsedContent = JSON.parse(cleanContent);
      return new Response(JSON.stringify({ simulation: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ simulation: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-investment-simulator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});