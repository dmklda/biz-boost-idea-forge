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
    const { idea, timeHorizon, revenueModel } = await req.json();
    
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
            content: `You are a financial forecasting expert specializing in startup revenue modeling. You create detailed, realistic financial projections based on market analysis and business models. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Create a detailed revenue forecast for: "${idea.title}" - ${idea.description}
            
Time Horizon: ${timeHorizon || '3 years'}
Revenue Model: ${revenueModel || idea.monetization || 'Subscription'}
Target Market: ${idea.audience || 'General market'}
Budget: ${idea.budget || 'Not specified'}

Generate comprehensive revenue projections including:
1. Monthly/quarterly projections for each year
2. Three scenarios: conservative, realistic, optimistic
3. Key metrics (CAC, LTV, churn rate, etc.)
4. Revenue streams breakdown
5. Growth assumptions and drivers
6. Unit economics
7. Seasonal factors
8. Market penetration rates

Return as JSON: {
  "projections": {
    "conservative": {},
    "realistic": {},
    "optimistic": {}
  },
  "keyMetrics": {},
  "revenueStreams": [],
  "growthDrivers": [],
  "unitEconomics": {},
  "seasonalFactors": [],
  "assumptions": []
}`
          }
        ],
        temperature: 0.3,
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
      return new Response(JSON.stringify({ forecast: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ forecast: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-revenue-forecast function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});