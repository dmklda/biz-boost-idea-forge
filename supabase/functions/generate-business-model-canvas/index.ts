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

    console.log(`Generating Business Model Canvas for: ${idea.title}`);

    // Try multiple models for better reliability
    const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-2025-04-14'];
    let response;
    let lastError;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `Você é um consultor de negócios especializado em Business Model Canvas. 
                Crie um Business Model Canvas completo para a ideia fornecida e retorne em JSON com os 9 blocos:
                - keyPartners: parceiros-chave
                - keyActivities: atividades-chave
                - keyResources: recursos-chave
                - valuePropositions: propostas de valor
                - customerRelationships: relacionamento com clientes
                - channels: canais
                - customerSegments: segmentos de clientes
                - costStructure: estrutura de custos
                - revenueStreams: fontes de receita
                
                Cada campo deve ter uma descrição detalhada e itens específicos.
                Retorne apenas o JSON, sem explicações adicionais.`
              },
              {
                role: 'user',
                content: `Crie um Business Model Canvas para esta ideia:
                
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}

Retorne um Business Model Canvas completo em JSON.`
              }
            ],
            max_tokens: 3000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          console.log(`Successfully connected with model: ${model}`);
          break;
        } else {
          const errorData = await response.json();
          lastError = new Error(errorData.error?.message || `Model ${model} failed`);
          console.error(`Model ${model} failed:`, lastError.message);
          continue;
        }
      } catch (error) {
        lastError = error;
        console.error(`Error with model ${model}:`, error.message);
        continue;
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error('All models failed to generate Business Model Canvas');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate Business Model Canvas');
    }

    const data = await response.json();
    let canvasContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (canvasContent.startsWith('```json')) {
      canvasContent = canvasContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let canvas;
    try {
      canvas = JSON.parse(canvasContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', canvasContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Business Model Canvas generated successfully');

    return new Response(JSON.stringify({
      canvas: canvas
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in Business Model Canvas function:', error);
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