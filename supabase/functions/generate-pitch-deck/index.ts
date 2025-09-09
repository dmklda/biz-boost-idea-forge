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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em pitch decks para startups. 
            Crie um pitch deck completo com 12 slides e retorne APENAS JSON válido na estrutura exata abaixo:

            {
              "slides": [
                {
                  "slideNumber": 1,
                  "title": "Título específico",
                  "content": "Conteúdo detalhado e específico",
                  "speakerNotes": "Notas detalhadas para apresentação"
                }
              ]
            }

            IMPORTANTE:
            - Retorne APENAS o JSON, sem texto adicional
            - Crie exatamente 12 slides numerados de 1 a 12
            - Cada slide deve ter conteúdo substantivo e específico para a ideia
            - Conteúdo deve ser detalhado, não genérico
            - Speaker notes devem orientar a apresentação

            Estrutura dos 12 slides:
            1. Título/Cover - Nome da empresa e tagline
            2. Problema - Dor específica do mercado
            3. Solução - Como resolve o problema
            4. Mercado - Tamanho e oportunidade
            5. Produto/Demo - Características principais
            6. Modelo de Negócio - Como ganha dinheiro
            7. Tração/Validação - Evidências de sucesso
            8. Marketing - Estratégia de aquisição
            9. Competição - Análise competitiva
            10. Time - Equipe e experiência
            11. Financeiro - Projeções e necessidades
            12. Chamada para Ação - Próximos passos`
          },
          {
            role: 'user',
            content: `Crie um pitch deck para esta ideia:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}

Retorne apenas o JSON do pitch deck.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate pitch deck');
    }

    const data = await response.json();
    let pitchContent = data.choices[0].message.content.trim();
    
    console.log('Raw OpenAI response:', pitchContent);
    
    // Remove code block markers if present
    if (pitchContent.startsWith('```json')) {
      pitchContent = pitchContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (pitchContent.startsWith('```')) {
      pitchContent = pitchContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let pitchDeck;
    try {
      pitchDeck = JSON.parse(pitchContent);
      console.log('Parsed pitch deck structure:', JSON.stringify(pitchDeck, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', pitchContent);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Validate structure
    if (!pitchDeck.slides || !Array.isArray(pitchDeck.slides)) {
      console.error('Invalid pitch deck structure - missing slides array');
      throw new Error('Invalid pitch deck structure');
    }

    // Ensure all slides have required fields
    const validatedSlides = pitchDeck.slides.map((slide, index) => ({
      slideNumber: slide.slideNumber || index + 1,
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || 'Conteúdo será gerado',
      speakerNotes: slide.speakerNotes || 'Notas do apresentador'
    }));

    if (validatedSlides.length !== 12) {
      console.error(`Expected 12 slides, got ${validatedSlides.length}`);
      throw new Error('Pitch deck must have exactly 12 slides');
    }

    const finalPitchDeck = { slides: validatedSlides };
    console.log('Final pitch deck generated successfully with', validatedSlides.length, 'slides');

    return new Response(JSON.stringify({
      pitchDeck: finalPitchDeck
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