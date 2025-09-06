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
    const { idea, revenueModel, customerData, marketingSpend } = await req.json();
    
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
            content: `You are a customer metrics expert specializing in CAC (Customer Acquisition Cost) and LTV (Lifetime Value) calculations. Provide detailed analysis and recommendations. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Calculate CAC and LTV for: "${idea.title}" - ${idea.description}
            
Revenue Model: ${revenueModel || 'subscription-based'}
Customer Data: ${customerData || 'average customer profile'}
Marketing Spend: ${marketingSpend || '$10,000/month'}

Return as JSON: {
  "cacAnalysis": {
    "totalCAC": 0,
    "cacByChannel": {},
    "blendedCAC": 0,
    "organicCAC": 0,
    "paidCAC": 0,
    "cacTrends": []
  },
  "ltvAnalysis": {
    "averageLTV": 0,
    "ltvBySegment": {},
    "retentionRate": 0,
    "churnRate": 0,
    "ltvTrends": []
  },
  "ratios": {
    "ltvCacRatio": 0,
    "paybackPeriod": 0,
    "profitMargin": 0
  },
  "optimization": {
    "cacReduction": [],
    "ltvImprovement": [],
    "channelRecommendations": []
  },
  "benchmarks": {},
  "scenarios": []
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
      return new Response(JSON.stringify({ metrics: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ metrics: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-cac-ltv function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});