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

    console.log(`Generating SEO analysis for: ${idea.title}`);

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
            content: `Você é um especialista em SEO e marketing digital. 
            Analise a ideia fornecida e retorne uma análise SEO estruturada em JSON com:
            - keywords: palavras-chave principais e secundárias
            - contentStrategy: estratégia de conteúdo SEO
            - technicalSeo: aspectos técnicos de SEO
            - onPageOptimization: otimizações on-page
            - linkBuilding: estratégias de link building
            - localSeo: SEO local (se aplicável)
            - competitorAnalysis: análise de concorrentes SEO
            - contentCalendar: calendário de conteúdo
            - metrics: métricas para acompanhar
            - recommendations: recomendações prioritárias
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Analise o SEO para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.location ? `Localização: ${idea.location}` : ''}

Retorne uma análise SEO completa em JSON.`
          }
        ],
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate SEO analysis');
    }

    const data = await response.json();
    let seoContent = data.choices[0].message.content.trim();
    
    if (seoContent.startsWith('```json')) {
      seoContent = seoContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let seoAnalysis;
    try {
      seoAnalysis = JSON.parse(seoContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', seoContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('SEO analysis generated successfully');

    return new Response(JSON.stringify({
      analysis: seoAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in SEO analysis function:', error);
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