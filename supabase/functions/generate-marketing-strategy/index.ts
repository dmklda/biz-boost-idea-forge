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

    console.log(`Generating marketing strategy for: ${idea.title}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em marketing digital e growth hacking. 
            Analise a ideia fornecida e retorne uma estratégia de marketing estruturada em JSON com:
            - marketingGoals: objetivos de marketing SMART
            - targetSegments: segmentos de mercado priorizados
            - channels: canais de marketing recomendados
            - contentStrategy: estratégia de conteúdo
            - budgetAllocation: alocação de orçamento por canal
            - timeline: cronograma de ações para 12 meses
            - kpis: métricas principais para acompanhar
            - campaigns: campanhas específicas recomendadas
            - partnerships: parcerias estratégicas sugeridas
            - growthHacks: táticas de growth hacking
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Crie estratégia de marketing para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}
${idea.location ? `Localização: ${idea.location}` : ''}

Retorne uma estratégia de marketing completa em JSON.`
          }
        ],
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate marketing strategy');
    }

    const data = await response.json();
    let strategyContent = data.choices[0].message.content.trim();
    
    if (strategyContent.startsWith('```json')) {
      strategyContent = strategyContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let strategy;
    try {
      strategy = JSON.parse(strategyContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', strategyContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Marketing strategy generated successfully');

    return new Response(JSON.stringify({
      strategy: strategy
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in marketing strategy function:', error);
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