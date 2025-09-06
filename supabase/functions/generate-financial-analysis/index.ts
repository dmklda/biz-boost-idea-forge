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

    console.log(`Generating financial analysis for: ${idea.title}`);

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
            content: `Você é um consultor financeiro especializado em startups. 
            Analise o modelo financeiro para a ideia fornecida e retorne uma análise estruturada em JSON com:
            - revenueModel: modelo de receita detalhado
            - costStructure: estrutura de custos
            - initialInvestment: investimento inicial estimado
            - monthlyOperatingCosts: custos operacionais mensais
            - revenueProjections: projeções de receita (12 meses)
            - breakEvenAnalysis: análise do ponto de equilíbrio
            - fundingRequirements: necessidades de financiamento
            - financialRisks: riscos financeiros
            - profitabilityTimeline: cronograma para lucratividade
            - keyMetrics: métricas financeiras chave
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Faça uma análise financeira para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}

Retorne uma análise financeira completa em JSON.`
          }
        ],
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate financial analysis');
    }

    const data = await response.json();
    let analysisContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (analysisContent.startsWith('```json')) {
      analysisContent = analysisContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let financialAnalysis;
    try {
      financialAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Financial analysis generated successfully');

    return new Response(JSON.stringify({
      analysis: financialAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in financial analysis function:', error);
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