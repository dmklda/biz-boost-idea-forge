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

    console.log(`Generating landing page for: ${idea.title}`);

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
            content: `Você é um especialista em desenvolvimento web e conversão. 
            Analise a ideia fornecida e retorne uma landing page completa estruturada em JSON com:
            - htmlCode: código HTML completo da landing page
            - cssCode: código CSS responsivo e moderno
            - jsCode: código JavaScript para interatividade
            - sections: seções da página (hero, features, testimonials, etc.)
            - copywriting: textos persuasivos para cada seção
            - callToActions: CTAs otimizados para conversão
            - analytics: código de analytics recomendado
            - seoElements: elementos SEO (meta tags, etc.)
            - conversionTips: dicas para melhorar conversão
            - mobileOptimization: otimizações para mobile
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Crie uma landing page para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}

Retorne uma landing page completa em JSON.`
          }
        ],
        max_completion_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate landing page');
    }

    const data = await response.json();
    let pageContent = data.choices[0].message.content.trim();
    
    if (pageContent.startsWith('```json')) {
      pageContent = pageContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let landingPage;
    try {
      landingPage = JSON.parse(pageContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', pageContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Landing page generated successfully');

    return new Response(JSON.stringify({
      page: landingPage
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in landing page function:', error);
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