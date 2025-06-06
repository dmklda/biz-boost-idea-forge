
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    const { idea, logoStyle, colorScheme, logoType, customPrompt, background, outputFormat, quality } = await req.json();

    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT token
    const jwt = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
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

    // Determine the best settings based on user preferences
    const logoBackground = background || 'transparent';
    const logoOutputFormat = outputFormat || 'png';
    const logoQuality = quality || 'high';

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
        quality: logoQuality,
        background: logoBackground,
        output_format: logoOutputFormat,
        moderation: 'auto'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate logo');
    }

    const data = await response.json();
    
    // gpt-image-1 always returns base64, no URL option
    const base64Image = data.data[0].b64_json;
    
    // Convert base64 to blob for storage
    const imageData = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    
    // Generate unique filename with correct extension
    const fileExtension = logoOutputFormat === 'jpeg' ? 'jpg' : logoOutputFormat;
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;
    
    // Upload to Supabase Storage with correct content type
    const contentType = logoOutputFormat === 'png' ? 'image/png' : 
                       logoOutputFormat === 'jpeg' ? 'image/jpeg' : 
                       'image/webp';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-content')
      .upload(fileName, imageData, {
        contentType: contentType,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save logo to storage');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-content')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Save to generated_content table with new options
    const contentData = {
      logoStyle,
      colorScheme,
      logoType,
      customPrompt,
      background: logoBackground,
      outputFormat: logoOutputFormat,
      quality: logoQuality,
      ideaTitle: idea.title,
      ideaDescription: idea.description,
      prompt,
      model: 'gpt-image-1'
    };

    const { data: savedContent, error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        idea_id: idea.id,
        content_type: 'logo',
        title: `Logo - ${idea.title}`,
        content_data: contentData,
        file_url: publicUrl
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      // Don't throw error here, just log it - user still gets the logo
    }

    console.log('Logo generated and saved successfully with gpt-image-1');

    return new Response(JSON.stringify({ 
      logoUrl: publicUrl,
      ideaTitle: idea.title,
      style: logoStyle,
      colorScheme,
      logoType,
      background: logoBackground,
      outputFormat: logoOutputFormat,
      quality: logoQuality,
      model: 'gpt-image-1',
      savedContentId: savedContent?.id
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
