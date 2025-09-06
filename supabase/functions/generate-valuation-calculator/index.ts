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

    console.log(`Generating valuation calculator for: ${idea.title}`);

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
            content: `Você é um especialista em valuation de startups e análise financeira. 
            Analise a ideia fornecida e retorne uma análise de valuation estruturada em JSON com:
            - currentValuation: valuation estimado atual
            - valuationMethods: diferentes métodos de valuation aplicados
            - comparableCompanies: empresas comparáveis e seus múltiplos
            - revenueProjections: projeções de receita para 5 anos
            - marketMultiples: múltiplos de mercado relevantes
            - dcfAnalysis: análise de DCF simplificada
            - riskFactors: fatores de risco que afetam valuation
            - valuationRange: faixa de valuation (mín, máx, provável)
            - milestones: marcos que podem aumentar valuation
            - nextRoundProjection: projeção para próxima rodada
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Calcule o valuation para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}

Retorne uma análise de valuation completa em JSON.`
          }
        ],
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate valuation analysis');
    }

    const data = await response.json();
    let valuationContent = data.choices[0].message.content.trim();
    
    if (valuationContent.startsWith('```json')) {
      valuationContent = valuationContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let valuation;
    try {
      valuation = JSON.parse(valuationContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', valuationContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Valuation analysis generated successfully');

    return new Response(JSON.stringify({
      valuation: valuation
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in valuation calculator function:', error);
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