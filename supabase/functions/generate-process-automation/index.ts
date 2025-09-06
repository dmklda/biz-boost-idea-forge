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
    const { idea, processes, goals, currentTools } = await req.json();
    
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
            content: `You are a business process automation expert. Analyze workflows and recommend automation strategies. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Analyze automation opportunities for: "${idea.title}" - ${idea.description}
            
Processes to analyze: ${processes || 'customer service, marketing, sales, operations'}
Goals: ${goals || 'increase efficiency and reduce costs'}
Current Tools: ${currentTools || 'basic tools'}

Return as JSON: {
  "automationPlan": {
    "processes": [
      {
        "name": "string",
        "currentState": "string",
        "automationOpportunity": "string",
        "tools": [],
        "roi": "string",
        "implementation": "string"
      }
    ],
    "priority": [],
    "timeline": {},
    "costs": {},
    "benefits": []
  },
  "toolRecommendations": [],
  "workflows": [],
  "kpis": []
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
      return new Response(JSON.stringify({ automation: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ automation: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-process-automation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});