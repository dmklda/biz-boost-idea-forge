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
            content: `Você é um consultor de negócios especializado em Business Model Canvas. 
            Crie um Business Model Canvas completo e detalhado retornando APENAS um JSON válido com esta estrutura exata:
            
            {
              "keyPartners": "Descrição detalhada dos parceiros-chave necessários",
              "keyActivities": "Descrição das principais atividades do negócio",
              "keyResources": "Recursos essenciais para o funcionamento",
              "valuePropositions": "Propostas de valor únicas oferecidas",
              "customerRelationships": "Como se relacionar com os clientes",
              "channels": "Canais para alcançar e entregar valor aos clientes", 
              "customerSegments": "Segmentos específicos de clientes-alvo",
              "costStructure": "Principais custos e estrutura financeira",
              "revenueStreams": "Fontes de receita e modelo de monetização"
            }
            
            IMPORTANTE: 
            - Retorne APENAS o JSON, sem markdown, sem explicações
            - Cada campo deve ter pelo menos 100 caracteres de conteúdo substantivo
            - Use informações específicas baseadas na ideia fornecida
            - Todos os 9 campos são obrigatórios`
          },
          {
            role: 'user',
            content: `Crie um Business Model Canvas detalhado para esta ideia:

Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}
${idea.monetization ? `Monetização: ${idea.monetization}` : ''}
${idea.location ? `Localização: ${idea.location}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}

Gere um Business Model Canvas completo e específico para esta ideia.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate Business Model Canvas');
    }

    const data = await response.json();
    console.log('OpenAI response received:', JSON.stringify(data, null, 2));
    
    let canvasContent = data.choices[0].message.content.trim();
    console.log('Raw canvas content:', canvasContent);
    
    // Remove code block markers if present
    if (canvasContent.startsWith('```json')) {
      canvasContent = canvasContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (canvasContent.startsWith('```')) {
      canvasContent = canvasContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned canvas content:', canvasContent);
    
    let canvas;
    try {
      canvas = JSON.parse(canvasContent);
      console.log('Parsed canvas:', JSON.stringify(canvas, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', canvasContent);
      console.error('Parse error:', parseError);
      throw new Error('Invalid JSON response from AI: ' + parseError.message);
    }

    // Validate all required fields are present
    const requiredFields = [
      'keyPartners', 'keyActivities', 'keyResources', 'valuePropositions',
      'customerRelationships', 'channels', 'customerSegments', 'costStructure', 'revenueStreams'
    ];
    
    const missingFields = requiredFields.filter(field => !canvas[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required canvas fields: ${missingFields.join(', ')}`);
    }

    // Add default content for empty fields
    for (const field of requiredFields) {
      if (!canvas[field] || canvas[field].trim().length < 10) {
        canvas[field] = `Conteúdo específico para ${field} será definido com base na ideia apresentada.`;
      }
    }

    console.log('Final canvas structure:', Object.keys(canvas));
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