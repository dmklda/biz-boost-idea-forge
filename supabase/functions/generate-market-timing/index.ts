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
    const { idea, launchTimeline, marketConditions, seasonality } = await req.json();
    
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
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a market timing expert. Analyze market conditions and recommend optimal launch timing strategies. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Analyze market timing for: "${idea.title}" - ${idea.description}
            
Launch Timeline: ${launchTimeline || '6 months'}
Market Conditions: ${marketConditions || 'Current market analysis needed'}
Seasonality: ${seasonality || 'Year-round business'}

Return as JSON: {
  "timingAnalysis": {
    "optimalLaunchWindow": "string",
    "marketReadiness": "string",
    "competitiveLandscape": "string",
    "economicFactors": [],
    "seasonalConsiderations": [],
    "riskFactors": []
  },
  "launchStrategy": {
    "phases": [
      {
        "phase": "string",
        "timeline": "string",
        "activities": [],
        "milestones": []
      }
    ],
    "criticalPath": [],
    "contingencyPlans": []
  },
  "marketIndicators": [],
  "recommendations": []
}`
          }
        ],
        max_completion_tokens: 2500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    let cleanContent = content.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const parsedContent = JSON.parse(cleanContent);
      return new Response(JSON.stringify({ timing: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ timing: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-market-timing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});