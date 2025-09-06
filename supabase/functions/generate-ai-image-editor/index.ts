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
    const { idea, imageType, style, requirements } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate image with OpenAI
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Create a ${imageType || 'professional'} image for "${idea.title}": ${idea.description}. Style: ${style || 'modern and clean'}. ${requirements || ''}`,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    const imageData = await imageResponse.json();
    
    if (!imageResponse.ok) {
      throw new Error(`OpenAI Image API error: ${imageData.error?.message || 'Unknown error'}`);
    }

    // Get suggestions for image optimization
    const suggestionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an AI image editing expert. Provide suggestions for image optimization and editing. Return your response in valid JSON format.`
          },
          {
            role: 'user',
            content: `Provide image editing suggestions for: "${idea.title}" - ${idea.description}
            
Image Type: ${imageType || 'professional'}
Style: ${style || 'modern'}

Return as JSON: {
  "editingSuggestions": [],
  "colorPalette": [],
  "compositionTips": [],
  "brandingElements": [],
  "variations": []
}`
          }
        ],
        max_completion_tokens: 1500,
      }),
    });

    const suggestionsData = await suggestionsResponse.json();
    
    if (!suggestionsResponse.ok) {
      throw new Error(`OpenAI API error: ${suggestionsData.error?.message || 'Unknown error'}`);
    }

    const suggestions = suggestionsData.choices[0].message.content;
    let cleanSuggestions = suggestions.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const parsedSuggestions = JSON.parse(cleanSuggestions);
      return new Response(JSON.stringify({ 
        image: imageData.data[0], 
        suggestions: parsedSuggestions 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        image: imageData.data[0], 
        suggestions: cleanSuggestions 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-ai-image-editor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});