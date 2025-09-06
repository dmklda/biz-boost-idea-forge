import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    console.log(`Generating market analysis for: ${idea.title}`);

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
            content: `Você é um consultor de negócios especializado em análise de mercado. 
            Analise o mercado para a ideia fornecida e retorne uma análise estruturada em JSON com:
            - marketSize: tamanho do mercado
            - targetAudience: público-alvo detalhado
            - marketTrends: tendências relevantes
            - opportunities: oportunidades identificadas
            - threats: ameaças do mercado
            - competitiveAdvantage: vantagens competitivas possíveis
            - entryBarriers: barreiras de entrada
            - recommendations: recomendações estratégicas
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Analise o mercado para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}

Retorne uma análise de mercado completa em JSON.`
          }
        ],
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate market analysis');
    }

    const data = await response.json();
    let analysisContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (analysisContent.startsWith('```json')) {
      analysisContent = analysisContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let marketAnalysis;
    try {
      marketAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Market analysis generated successfully');

    return new Response(JSON.stringify({
      analysis: marketAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in market analysis function:', error);
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