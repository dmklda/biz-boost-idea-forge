
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

    console.log(`Generating daily insights for user: ${user.id}`);

    // Check if insights already exist for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingInsights } = await supabase
      .from('daily_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('generated_date', today)
      .single();

    if (existingInsights) {
      console.log('Insights already exist for today, returning existing insights');
      return new Response(JSON.stringify({ 
        insights: existingInsights.insight_data,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user profile and activity data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: ideas } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: analyses } = await supabase
      .from('idea_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: recentTransactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Prepare data for AI analysis
    const userData = {
      profile: {
        plan: profile?.plan || 'free',
        credits: profile?.credits || 0,
        totalIdeas: ideas?.length || 0,
        totalAnalyses: analyses?.length || 0,
        accountAge: profile?.created_at ? Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
      },
      recentActivity: {
        ideasThisWeek: ideas?.filter(idea => 
          new Date(idea.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0,
        analysesThisWeek: analyses?.filter(analysis => 
          new Date(analysis.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0,
        lastActivity: ideas?.[0]?.created_at || analyses?.[0]?.created_at
      },
      performance: {
        averageScore: analyses?.length > 0 ? 
          Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) : 0,
        highestScore: analyses?.length > 0 ? Math.max(...analyses.map(a => a.score)) : 0,
        improvementTrend: analyses?.length >= 2 ? 
          analyses.slice(0, 3).reduce((sum, a) => sum + a.score, 0) / 3 -
          analyses.slice(-3).reduce((sum, a) => sum + a.score, 0) / 3 : 0
      },
      engagement: {
        creditsUsed: recentTransactions?.filter(t => t.amount < 0).length || 0,
        favoriteIdeasCount: 0, // Could fetch from idea_favorites if needed
        planUpgradeCandidate: profile?.plan === 'free' && (ideas?.length || 0) > 5
      }
    };

    console.log('User data prepared for AI analysis:', JSON.stringify(userData, null, 2));

    // Generate insights using OpenAI
    const prompt = `
    Analise os dados de atividade do usuário e gere EXATAMENTE 3 insights inteligentes e personalizados em português brasileiro.

    Dados do usuário:
    ${JSON.stringify(userData, null, 2)}

    IMPORTANTE: Você DEVE gerar EXATAMENTE 3 insights únicos e diferentes entre si. Cada insight deve ser:
    1. Específico e baseado nos dados reais do usuário
    2. Acionável com recomendações claras
    3. Motivacional e construtivo
    4. Relevante para empreendedores
    5. Único e não repetitivo

    Tipos de insights disponíveis:
    - activity_trend: Para padrões de atividade
    - performance: Para análise de desempenho
    - engagement: Para engajamento e uso da plataforma
    - growth: Para crescimento e desenvolvimento
    - strategy: Para estratégias e planejamento

    Retorne OBRIGATORIAMENTE um JSON no seguinte formato com EXATAMENTE 3 insights:
    {
      "insights": [
        {
          "type": "activity_trend",
          "title": "Título do insight",
          "description": "Descrição detalhada baseada nos dados",
          "recommendation": "Recomendação específica de ação",
          "icon": "TrendingUp" | "BarChart" | "Target" | "Lightbulb" | "Calendar"
        },
        {
          "type": "performance",
          "title": "Título do insight",
          "description": "Descrição detalhada baseada nos dados",
          "recommendation": "Recomendação específica de ação",
          "icon": "TrendingUp" | "BarChart" | "Target" | "Lightbulb" | "Calendar"
        },
        {
          "type": "engagement",
          "title": "Título do insight",
          "description": "Descrição detalhada baseada nos dados",
          "recommendation": "Recomendação específica de ação",
          "icon": "TrendingUp" | "BarChart" | "Target" | "Lightbulb" | "Calendar"
        }
      ]
    }

    Foque em padrões reais dos dados fornecidos e evite insights genéricos. CERTIFIQUE-SE de retornar EXATAMENTE 3 insights diferentes.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: 'Você é um especialista em análise de dados de empreendedorismo que gera insights personalizados para ajudar empreendedores a melhorar seus resultados. Sempre retorne exatamente 3 insights únicos e diferentes.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate insights');
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    console.log('AI response received:', aiResponse);

    // Clean up the response if it has markdown formatting
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    // Parse AI response
    let insightsData;
    try {
      insightsData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback insights if AI parsing fails - always exactly 3
      insightsData = {
        insights: [
          {
            type: "activity_trend",
            title: "Acompanhe sua Jornada",
            description: `Você já criou ${userData.profile.totalIdeas} ideias e realizou ${userData.profile.totalAnalyses} análises.`,
            recommendation: "Continue explorando novas ideias para expandir seu portfólio empreendedor.",
            icon: "TrendingUp"
          },
          {
            type: "performance",
            title: "Desenvolvimento Contínuo",
            description: "Sua experiência como empreendedor está crescendo a cada análise realizada.",
            recommendation: "Foque em implementar as recomendações das suas análises anteriores.",
            icon: "Target"
          },
          {
            type: "engagement",
            title: "Mantenha o Momentum",
            description: "Sua dedicação ao processo de validação de ideias é fundamental para o sucesso.",
            recommendation: "Estabeleça uma rotina regular de análise de novas oportunidades.",
            icon: "BarChart"
          }
        ]
      };
    }

    // Ensure we always have exactly 3 insights
    if (!insightsData.insights || insightsData.insights.length !== 3) {
      console.warn('AI did not return exactly 3 insights, using fallback');
      insightsData = {
        insights: [
          {
            type: "activity_trend",
            title: "Progresso Constante",
            description: `Com ${userData.profile.totalIdeas} ideias criadas, você está construindo um portfólio sólido.`,
            recommendation: "Continue desenvolvendo novas ideias semanalmente para manter o crescimento.",
            icon: "TrendingUp"
          },
          {
            type: "performance",
            title: "Qualidade em Foco",
            description: "Cada análise realizada aprimora sua capacidade de avaliar oportunidades de negócio.",
            recommendation: "Revise suas análises anteriores para identificar padrões de sucesso.",
            icon: "Target"
          },
          {
            type: "engagement",
            title: "Engajamento Ativo",
            description: "Sua participação ativa na plataforma demonstra comprometimento com o sucesso.",
            recommendation: "Explore as ferramentas disponíveis para maximizar seus resultados.",
            icon: "BarChart"
          }
        ]
      };
    }

    // Store insights in database
    const { data: savedInsights, error: saveError } = await supabase
      .from('daily_insights')
      .insert({
        user_id: user.id,
        insight_data: insightsData,
        generated_date: today,
        insight_type: 'daily'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving insights:', saveError);
      // Still return the insights even if saving fails
    } else {
      console.log('Insights saved successfully:', savedInsights.id);
    }

    return new Response(JSON.stringify({ 
      insights: insightsData,
      cached: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-daily-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
