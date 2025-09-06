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
    const { idea, roadmapType, duration, team } = await req.json();
    
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
            content: `You are a product roadmap expert specializing in startup development planning. You create detailed, actionable roadmaps with clear milestones and timelines. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Create a detailed development roadmap for: "${idea.title}" - ${idea.description}
            
Roadmap Type: ${roadmapType || 'Product Development'}
Duration: ${duration || '12 months'}
Team Size: ${team || 'Small startup team'}
Budget: ${idea.budget || 'Bootstrapped'}

Generate a comprehensive roadmap including:
1. Phases/milestones with timeline
2. Deliverables for each phase
3. Resource requirements
4. Dependencies and risk factors
5. Key performance indicators
6. Go-to-market strategy timeline
7. MVP features vs future releases
8. Technology stack recommendations

Return as JSON: {
  "phases": [],
  "timeline": {},
  "deliverables": {},
  "resources": {},
  "dependencies": [],
  "kpis": [],
  "goToMarket": {},
  "mvpFeatures": [],
  "futureReleases": [],
  "techStack": []
}`
          }
        ],
        temperature: 0.4,
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
      return new Response(JSON.stringify({ roadmap: parsedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ roadmap: cleanContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-roadmap function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});