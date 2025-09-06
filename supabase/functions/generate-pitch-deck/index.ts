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

    console.log(`Generating pitch deck for: ${idea.title}`);

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
            content: `Você é um especialista em pitch decks para startups. 
            Crie um pitch deck completo com 12 slides e retorne em JSON com:
            - slides: array de 12 objetos, cada um com:
              - title: título do slide
              - content: conteúdo principal do slide
              - speakerNotes: notas para o apresentador
              - slideNumber: número do slide
            
            Os slides devem seguir esta estrutura:
            1. Título/Cover
            2. Problema
            3. Solução
            4. Mercado
            5. Produto/Demo
            6. Modelo de Negócio
            7. Tração/Validação
            8. Marketing
            9. Competição
            10. Time
            11. Financeiro
            12. Chamada para Ação
            
            Retorne apenas JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Crie um pitch deck para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}

Retorne um pitch deck completo em JSON.`
          }
        ],
        max_completion_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate pitch deck');
    }

    const data = await response.json();
    let pitchContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (pitchContent.startsWith('```json')) {
      pitchContent = pitchContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let pitchDeck;
    try {
      pitchDeck = JSON.parse(pitchContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', pitchContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Pitch deck generated successfully');

    return new Response(JSON.stringify({
      pitchDeck: pitchDeck
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in pitch deck function:', error);
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