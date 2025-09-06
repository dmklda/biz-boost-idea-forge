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
    const { idea, brandStyle = 'modern' } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating color palette for: ${idea.title}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Você é um designer especializado em branding e teoria das cores. 
            Crie uma paleta de cores para a marca e retorne em JSON com:
            - primaryPalette: 
              - primary: cor principal (hex)
              - primaryLight: versão clara da cor principal
              - primaryDark: versão escura da cor principal
            - secondaryPalette:
              - secondary: cor secundária (hex)
              - secondaryLight: versão clara
              - secondaryDark: versão escura
            - neutralPalette:
              - white: branco (#FFFFFF)
              - lightGray: cinza claro
              - mediumGray: cinza médio
              - darkGray: cinza escuro
              - black: preto (#000000)
            - accentColors: array de 3 cores de destaque com hex
            - gradients: array de 3 gradientes sugeridos
            - colorMeaning: significado psicológico das cores escolhidas
            - usageGuidelines: diretrizes de uso das cores
            - brandPersonality: personalidade da marca baseada nas cores
            
            Retorne apenas JSON, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: `Crie uma paleta de cores ${brandStyle} para esta marca:
            
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}

Considere a personalidade da marca e o público-alvo para criar cores apropriadas.
Retorne uma paleta de cores completa em JSON.`
          }
        ],
        max_completion_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate color palette');
    }

    const data = await response.json();
    console.log('OpenAI response data:', JSON.stringify(data, null, 2));
    
    // Validate OpenAI response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('OpenAI returned invalid response structure');
    }
    
    let paletteContent = data.choices[0].message.content.trim();
    
    // Check if content is empty
    if (!paletteContent) {
      console.error('Empty response from OpenAI');
      throw new Error('OpenAI returned empty response');
    }
    
    console.log('Raw palette content:', paletteContent);
    
    // Remove code block markers if present
    if (paletteContent.startsWith('```json')) {
      paletteContent = paletteContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (paletteContent.startsWith('```')) {
      paletteContent = paletteContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let colorPalette;
    try {
      colorPalette = JSON.parse(paletteContent);
      console.log('Successfully parsed color palette:', colorPalette);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', paletteContent);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI - unable to parse JSON');
    }

    console.log('Color palette generated successfully');

    return new Response(JSON.stringify({
      palette: colorPalette
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in color palette function:', error);
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