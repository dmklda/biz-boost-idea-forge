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
    const { idea, contentType = 'social-posts' } = await req.json();
    
    if (!idea) {
      throw new Error('Idea is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating ${contentType} for: ${idea.title}`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (contentType) {
      case 'social-posts':
        systemPrompt = `Você é um especialista em marketing digital. 
        Crie posts para redes sociais e retorne em JSON com:
        - instagram: array de 5 posts para Instagram com hashtags
        - linkedin: array de 3 posts profissionais para LinkedIn  
        - twitter: array de 5 tweets engajadores
        - facebook: array de 3 posts para Facebook
        Cada post deve ter: content, hashtags e best_time_to_post.`;
        break;
      
      case 'blog-articles':
        systemPrompt = `Você é um especialista em content marketing.
        Crie conteúdo para blog e retorne em JSON com:
        - articles: array de 5 artigos com title, outline, keywords, word_count
        - contentCalendar: cronograma de publicação mensal
        - seoStrategy: estratégia de SEO para os artigos`;
        break;
        
      case 'marketing-strategy':
        systemPrompt = `Você é um estrategista de marketing digital.
        Crie estratégia completa e retorne em JSON com:
        - targetAudience: personas detalhadas
        - channels: canais de marketing recomendados
        - contentPillars: pilares de conteúdo
        - campaignIdeas: ideias de campanhas
        - budget: sugestão de orçamento mensal
        - timeline: cronograma de 90 dias`;
        break;
        
      default:
        systemPrompt = `Você é um especialista em marketing digital. 
        Crie conteúdo de marketing variado conforme solicitado.`;
    }

    userPrompt = `Crie ${contentType} para esta ideia:
    
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.problem ? `Problema que resolve: ${idea.problem}` : ''}

Retorne o conteúdo em JSON estruturado.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    let contentData = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (contentData.startsWith('```json')) {
      contentData = contentData.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let content;
    try {
      content = JSON.parse(contentData);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', contentData);
      throw new Error('Invalid response format from AI');
    }

    console.log(`${contentType} generated successfully`);

    return new Response(JSON.stringify({
      content,
      contentType
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in content marketing function:', error);
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