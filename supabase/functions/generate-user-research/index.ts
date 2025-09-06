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

    console.log(`Generating user research for: ${idea.title}`);

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
            content: `Você é um especialista em pesquisa de usuários e UX. 
            Analise a ideia fornecida e retorne uma pesquisa de usuários estruturada em JSON com:
            - personas: array de 3-4 personas detalhadas
            - userJourney: jornada do usuário passo a passo
            - painPoints: principais dores dos usuários
            - motivations: motivações e necessidades
            - behaviors: comportamentos e padrões de uso
            - demographics: dados demográficos
            - interviewQuestions: perguntas para entrevistas
            - surveyQuestions: perguntas para pesquisas quantitativas
            - researchMethods: métodos de pesquisa recomendados
            - kpis: métricas para medir sucesso
            
            Retorne apenas o JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Analise os usuários para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}

Retorne uma pesquisa de usuários completa em JSON.`
          }
        ],
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate user research');
    }

    const data = await response.json();
    let researchContent = data.choices[0].message.content.trim();
    
    if (researchContent.startsWith('```json')) {
      researchContent = researchContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let userResearch;
    try {
      userResearch = JSON.parse(researchContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', researchContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('User research generated successfully');

    return new Response(JSON.stringify({
      research: userResearch
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in user research function:', error);
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