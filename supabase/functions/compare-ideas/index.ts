
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

// Definir headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IdeaData {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  monetization: string | null;
  score?: number;
  status?: string;
  strengths?: string[];
  weaknesses?: string[];
  market_size?: string;
  differentiation?: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    console.log('Starting compare-ideas function');
    
    // Verificar o corpo da requisição
    const text = await req.text();
    if (!text || text.trim() === '') {
      console.error('Empty request body');
      return new Response(
        JSON.stringify({ error: 'Corpo da requisição vazio' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse do corpo da requisição
    let requestBody;
    try {
      requestBody = JSON.parse(text);
      console.log('Request body parsed:', { ideas: requestBody.ideas?.length });
    } catch (parseError) {
      console.error("Erro ao parsear o corpo da requisição:", parseError);
      return new Response(
        JSON.stringify({ error: 'Corpo da requisição inválido', details: parseError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { ideas } = requestBody;

    // Validar os dados de entrada
    if (!Array.isArray(ideas) || ideas.length < 2 || ideas.length > 3) {
      console.error('Invalid ideas array:', { length: ideas?.length });
      return new Response(
        JSON.stringify({ error: 'Deve fornecer entre 2 e 3 ideias para comparação' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se temos uma chave de API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'API key não encontrada' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Preparar dados das ideias para o prompt
    const ideasData = ideas.map((idea: IdeaData) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      audience: idea.audience || "Não especificado",
      problem: idea.problem || "Não especificado",
      monetization: idea.monetization || "Não especificado",
      score: idea.score || 0,
      status: idea.status || "Pendente",
      strengths: idea.strengths || [],
      weaknesses: idea.weaknesses || [],
      market_size: idea.market_size || "Não especificado",
      differentiation: idea.differentiation || "Não especificado"
    }));

    console.log('Ideas data prepared for comparison:', ideasData.length);

    // Criar cliente OpenAI
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    // Construir prompt para a análise
    const prompt = `
Analise e compare as seguintes ideias de negócios em português brasileiro:

${ideasData.map((idea, index) => `
IDEIA ${index + 1}: ${idea.title}
Descrição: ${idea.description}
Público-alvo: ${idea.audience}
Problema a resolver: ${idea.problem}
Monetização: ${idea.monetization}
Pontuação atual: ${idea.score}%
Status: ${idea.status}
Pontos fortes: ${idea.strengths.join(', ') || 'Não especificado'}
Pontos fracos: ${idea.weaknesses.join(', ') || 'Não especificado'}
Tamanho do mercado: ${idea.market_size}
Diferenciação: ${idea.differentiation}
`).join('\n')}

Forneça uma análise comparativa APENAS em formato JSON válido. Responda com exatamente este formato:

{
  "competitiveAdvantage": "Análise detalhada das vantagens competitivas de cada ideia em relação às outras",
  "marketPotential": ["baixo/médio/alto para ideia 1", "baixo/médio/alto para ideia 2", "baixo/médio/alto para ideia 3 se houver"],
  "executionDifficulty": ["baixa/média/alta para ideia 1", "baixa/média/alta para ideia 2", "baixa/média/alta para ideia 3 se houver"],
  "investmentRequired": ["baixo/médio/alto para ideia 1", "baixo/médio/alto para ideia 2", "baixo/médio/alto para ideia 3 se houver"],
  "scalabilityPotential": ["baixo/médio/alto para ideia 1", "baixo/médio/alto para ideia 2", "baixo/médio/alto para ideia 3 se houver"],
  "innovationLevel": ["baixo/médio/alto para ideia 1", "baixo/médio/alto para ideia 2", "baixo/médio/alto para ideia 3 se houver"],
  "riskLevel": ["baixo/médio/alto para ideia 1", "baixo/médio/alto para ideia 2", "baixo/médio/alto para ideia 3 se houver"],
  "keyStrengthComparison": "Análise comparativa dos principais pontos fortes de cada ideia",
  "keyWeaknessComparison": "Análise comparativa dos principais pontos fracos de cada ideia",
  "recommendedFocus": "Recomendações específicas para melhorar cada ideia",
  "overallRecommendation": "Recomendação final sobre qual ideia parece mais promissora e por quê"
}

IMPORTANTE: Responda APENAS com o JSON, sem texto adicional antes ou depois.`;

    console.log("Enviando prompt para o OpenAI...");

    // Chamar a API OpenAI
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 2500,
      temperature: 0.3,
      stop: null,
    });

    console.log("Resposta recebida do OpenAI");

    // Verificar se a resposta da OpenAI existe
    if (!completion.data || !completion.data.choices || completion.data.choices.length === 0) {
      console.error("Resposta da OpenAI inválida ou vazia");
      throw new Error("A API OpenAI retornou uma resposta inválida ou vazia");
    }

    // Processar a resposta
    const rawResponse = completion.data.choices[0].text?.trim() || "";
    console.log("Raw response length:", rawResponse.length);
    
    let insights;
    try {
      // Limpar a resposta e tentar extrair JSON
      let cleanResponse = rawResponse;
      
      // Remover qualquer texto antes do primeiro {
      const firstBrace = cleanResponse.indexOf('{');
      if (firstBrace > 0) {
        cleanResponse = cleanResponse.substring(firstBrace);
      }
      
      // Remover qualquer texto após o último }
      const lastBrace = cleanResponse.lastIndexOf('}');
      if (lastBrace > 0) {
        cleanResponse = cleanResponse.substring(0, lastBrace + 1);
      }
      
      insights = JSON.parse(cleanResponse);
      console.log("Insights parsed successfully");
      
      // Validar campos obrigatórios
      const requiredFields = [
        'competitiveAdvantage', 'marketPotential', 'executionDifficulty', 
        'investmentRequired', 'scalabilityPotential', 'overallRecommendation'
      ];
      
      const missingFields = requiredFields.filter(field => !insights[field]);
      
      if (missingFields.length > 0) {
        console.log(`Campos ausentes na resposta: ${missingFields.join(', ')}`);
        insights = createFallbackInsights(ideasData, missingFields, insights);
      }
      
    } catch (e) {
      console.error("Erro ao processar resposta JSON:", e);
      console.log("Resposta problemática:", rawResponse.substring(0, 500) + "...");
      
      // Criar insights de fallback
      insights = createFallbackInsights(ideasData);
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Extrair token de autorização
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Verificar a sessão do usuário
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User authenticated:', user.id);

    // Salvar os insights na tabela de comparações
    const ideaIds = ideasData.map(idea => idea.id);
    const { data: comparisonData, error: comparisonError } = await supabaseClient
      .from('idea_comparisons')
      .insert({
        user_id: user.id,
        idea_ids: ideaIds,
        comparison_insights: insights,
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (comparisonError) {
      console.error("Erro ao salvar comparação:", comparisonError);
    } else {
      console.log('Comparison saved with ID:', comparisonData?.id);
    }

    console.log('Comparison completed successfully');

    // Retornar os insights
    return new Response(
      JSON.stringify({ 
        insights,
        comparison_id: comparisonData?.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error("Erro geral:", error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Função para criar insights básicos quando a IA não retornar dados adequados
function createFallbackInsights(ideasData: any[], missingFields: string[] = [], partialInsights: any = {}) {
  const fallbackInsights = {
    competitiveAdvantage: "Análise detalhada não disponível no momento. Recomendamos revisar os dados das ideias e tentar novamente.",
    marketPotential: ideasData.map(() => "médio"),
    executionDifficulty: ideasData.map(() => "média"),
    investmentRequired: ideasData.map(() => "médio"),
    scalabilityPotential: ideasData.map(() => "médio"),
    innovationLevel: ideasData.map(() => "médio"),
    riskLevel: ideasData.map(() => "médio"),
    keyStrengthComparison: "Comparação de pontos fortes não disponível no momento.",
    keyWeaknessComparison: "Comparação de pontos fracos não disponível no momento.",
    recommendedFocus: "Recomendamos focar na validação adicional destas ideias com potenciais clientes e especialistas do setor.",
    overallRecommendation: "Análise detalhada não disponível. Todas as ideias apresentam potencial e merecem consideração adicional. Sugerimos revisar os dados e tentar novamente."
  };
  
  // Manter qualquer campo que já tenha sido retornado corretamente
  return {
    ...fallbackInsights,
    ...partialInsights
  };
}
