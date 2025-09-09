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

    console.log(`Generating business plan for: ${idea.title}`);

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
            content: `Você é um consultor especialista em planos de negócios. 
            Analise a ideia fornecida e retorne um plano de negócios estruturado em JSON com:
            - executiveSummary: resumo executivo completo
            - companyDescription: descrição da empresa
            - marketAnalysis: análise de mercado detalhada
            - organizationManagement: estrutura organizacional
            - serviceOffering: descrição de produtos/serviços
            - marketingStrategy: estratégia de marketing
            - fundingRequest: necessidades de financiamento
            - financialProjections: projeções financeiras 5 anos
            - appendix: informações adicionais
            - implementation: plano de implementação
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Crie um plano de negócios para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}

Retorne um plano de negócios completo em JSON.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate business plan');
    }

    const data = await response.json();
    let planContent = data.choices[0].message.content.trim();
    
    if (planContent.startsWith('```json')) {
      planContent = planContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let businessPlan;
    try {
      businessPlan = JSON.parse(planContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', planContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Business plan generated successfully');

    return new Response(JSON.stringify({
      plan: businessPlan
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in business plan function:', error);
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