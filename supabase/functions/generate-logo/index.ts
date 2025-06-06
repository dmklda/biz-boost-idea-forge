
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, logoStyle, colorScheme, logoType, customPrompt } = await req.json();

    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build the logo generation prompt
    const styleDescriptions = {
      modern: "clean, minimalist, contemporary design with simple geometric shapes",
      classic: "traditional, timeless design with elegant typography and classic elements",
      playful: "fun, creative, colorful design with playful elements and dynamic shapes",
      corporate: "professional, serious, corporate design with strong typography",
      tech: "futuristic, innovative, high-tech design with digital elements"
    };

    const colorDescriptions = {
      brand: "colors that reflect the business nature and target audience",
      monochrome: "black, white and gray tones only",
      vibrant: "bright, energetic, saturated colors",
      pastel: "soft, delicate, light colors",
      earth: "natural, organic, earth tones"
    };

    const typeDescriptions = {
      text_only: "typographic logo with stylized text only, no icons or symbols",
      icon_only: "symbol or icon only, no text elements",
      text_and_icon: "combination of text and icon/symbol working together harmoniously"
    };

    let prompt = `Create a professional ${styleDescriptions[logoStyle]} logo for "${idea.title}" - ${idea.description}. `;
    
    if (idea.audience) {
      prompt += `Target audience: ${idea.audience}. `;
    }

    prompt += `Style: ${typeDescriptions[logoType]}. `;
    prompt += `Color scheme: ${colorDescriptions[colorScheme]}. `;
    
    if (customPrompt) {
      prompt += `Additional requirements: ${customPrompt}. `;
    }

    prompt += "The logo should be clean, scalable, memorable, and work well in both large and small sizes. Create a high-quality, professional logo suitable for business use.";

    console.log(`Generating logo for idea: ${idea.title}`);
    console.log(`Prompt: ${prompt}`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png',
        background: 'transparent'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate logo');
    }

    const data = await response.json();
    
    // gpt-image-1 returns base64 data, we need to convert it to a data URL
    const base64Image = data.data[0].b64_json;
    const logoUrl = `data:image/png;base64,${base64Image}`;

    console.log('Logo generated successfully');

    return new Response(JSON.stringify({ 
      logoUrl,
      ideaTitle: idea.title,
      style: logoStyle,
      colorScheme,
      logoType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-logo function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
