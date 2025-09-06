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
    const { idea, industry, timeframe } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a trend analysis expert with access to real-time market data. Analyze current trends and provide actionable insights in JSON format.'
          },
          {
            role: 'user',
            content: `Analyze current market trends for: "${idea.title}" - ${idea.description}
            
Industry: ${industry || idea.category || 'Technology'}
Timeframe: ${timeframe || '2024-2025'}
Location: ${idea.location || 'Global'}

Provide a comprehensive trend analysis including:
1. Current market trends
2. Emerging opportunities
3. Technology trends affecting this space
4. Consumer behavior shifts
5. Competitive landscape changes
6. Risk factors and challenges
7. Growth predictions
8. Actionable recommendations

Return as JSON: {
  "currentTrends": [],
  "emergingOpportunities": [],
  "technologyTrends": [],
  "consumerBehavior": [],
  "competitiveLandscape": [],
  "riskFactors": [],
  "growthPredictions": {},
  "recommendations": []
}`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Perplexity API error:', data);
      throw new Error(`Perplexity API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    
    // Clean up the response and parse JSON
    let cleanContent = content.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const parsedContent = JSON.parse(cleanContent);
      return new Response(JSON.stringify({ analysis: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ analysis: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-trend-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});