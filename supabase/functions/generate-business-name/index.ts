import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
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
    console.log(`Generating business name for idea: ${idea.title}`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em naming e branding. Crie nomes criativos, memoráveis e profissionais para empresas/produtos. SEMPRE retorne um nome válido, nunca uma resposta vazia. O nome deve ter entre 2-4 palavras e ser adequado para uso comercial.'
          },
          {
            role: 'user',
            content: `Crie UM nome criativo e profissional para esta empresa/produto:

TÍTULO: ${idea.title}
DESCRIÇÃO: ${idea.description}
${idea.audience ? `PÚBLICO-ALVO: ${idea.audience}` : ''}
${idea.problem ? `PROBLEMA QUE RESOLVE: ${idea.problem}` : ''}

INSTRUÇÕES:
- Retorne APENAS o nome da empresa
- O nome deve ser único e memorável
- Máximo 3-4 palavras
- Sem aspas, pontos ou explicações
- Exemplo de resposta: TechFlow Solutions`
          }
        ],
        max_completion_tokens: 20
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate business name');
    }
    const data = await response.json();
    const generatedName = data.choices[0]?.message?.content?.trim() || '';
    
    console.log('Business name generated successfully:', generatedName);
    
    // Validate that the name is not empty and retry if needed
    if (!generatedName || generatedName.length === 0) {
      console.log('First attempt returned empty name, retrying with fallback prompt...');
      
      // Retry with a simpler, more direct prompt
      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'Generate a business name. Always respond with just the name, nothing else.'
            },
            {
              role: 'user',
              content: `Business name for: ${idea.title}. Just return the name.`
            }
          ],
          max_tokens: 15
        })
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryName = retryData.choices[0]?.message?.content?.trim() || '';
        
        if (retryName && retryName.length > 0) {
          console.log('Retry successful:', retryName);
          return new Response(JSON.stringify({
            name: retryName
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      // If both attempts fail, provide a fallback name
      const fallbackName = `${idea.title.split(' ').slice(0, 2).join(' ')} Pro`;
      console.log('Using fallback name:', fallbackName);
      
      return new Response(JSON.stringify({
        name: fallbackName
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(JSON.stringify({
      name: generatedName
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-business-name function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
