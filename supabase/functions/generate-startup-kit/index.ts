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
    const { idea } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating complete startup kit for: ${idea.title}`);

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
            content: `Você é um consultor especializado em startups. 
            Crie um kit completo de startup que inclua:
            - businessNames: 5 nomes sugeridos para a empresa
            - mission: missão da empresa
            - vision: visão da empresa
            - values: valores fundamentais
            - pitchDeck: estrutura de pitch deck com 10 slides
            - businessModel: modelo de negócio resumido
            - marketingStrategy: estratégia de marketing inicial
            - timeline: cronograma de 6 meses
            - teamRoles: papéis essenciais da equipe
            - fundingStrategy: estratégia de captação de recursos
            - mvpFeatures: funcionalidades do MVP
            - successMetrics: métricas de sucesso
            
            Retorne apenas JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Crie um kit completo de startup para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}

Retorne um kit completo de startup em JSON.`
          }
        ],
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate startup kit');
    }

    const data = await response.json();
    let kitContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (kitContent.startsWith('```json')) {
      kitContent = kitContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let startupKit;
    try {
      startupKit = JSON.parse(kitContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', kitContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Startup kit generated successfully');

    return new Response(JSON.stringify({
      kit: startupKit
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in startup kit function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});