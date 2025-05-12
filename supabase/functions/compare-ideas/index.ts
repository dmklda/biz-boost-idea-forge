
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
    // Verificar o corpo da requisição antes de fazer o parse como JSON
    const text = await req.text();
    if (!text || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Corpo da requisição vazio' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse do corpo da requisição com tratamento de erro
    let requestBody;
    try {
      requestBody = JSON.parse(text);
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

    const { ideas, apiKey } = requestBody;

    // Validar os dados de entrada
    if (!Array.isArray(ideas) || ideas.length < 2 || ideas.length > 3) {
      return new Response(
        JSON.stringify({ error: 'Deve fornecer entre 2 e 3 ideias para comparação' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se temos uma chave de API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || apiKey;
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key não encontrada' }),
        { 
          status: 400,
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

    // Criar cliente OpenAI
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    // Construir prompt para a análise
    const prompt = `
Analise e compare as seguintes ideias de negócios:

${ideasData.map((idea, index) => `
IDEIA ${index + 1}: ${idea.title}
Descrição: ${idea.description}
Público-alvo: ${idea.audience}
Problema a resolver: ${idea.problem}
Monetização: ${idea.monetization}
Pontuação: ${idea.score}
Status: ${idea.status}
Pontos fortes: ${idea.strengths.join(', ')}
Pontos fracos: ${idea.weaknesses.join(', ')}
Tamanho do mercado: ${idea.market_size}
Diferenciação: ${idea.differentiation}
`).join('\n')}

Por favor, forneça uma análise comparativa das ideias em formato JSON com os seguintes elementos:
1. "competitiveAdvantage": Uma análise das vantagens competitivas de cada ideia em relação às outras
2. "marketPotential": Avaliação do potencial de mercado de cada ideia (baixo, médio, alto)
3. "executionDifficulty": Avaliação da dificuldade de execução de cada ideia (baixa, média, alta)
4. "investmentRequired": Estimativa relativa do investimento necessário para cada ideia (baixo, médio, alto)
5. "scalabilityPotential": Avaliação do potencial de escalabilidade de cada ideia (baixo, médio, alto)
6. "innovationLevel": Avaliação do nível de inovação de cada ideia (baixo, médio, alto)
7. "riskLevel": Avaliação do nível de risco de cada ideia (baixo, médio, alto)
8. "keyStrengthComparison": Uma análise dos principais pontos fortes de cada ideia
9. "keyWeaknessComparison": Uma análise dos principais pontos fracos de cada ideia
10. "recommendedFocus": Recomendações específicas para melhorar cada ideia
11. "overallRecommendation": Uma recomendação final sobre qual ideia parece mais promissora e por quê

Forneça o resultado apenas em formato JSON válido, sem qualquer texto adicional antes ou depois do JSON. Certifique-se de que a resposta seja um objeto JSON completo, sem erros de sintaxe.

Formato da resposta:
{
  "competitiveAdvantage": "análise aqui",
  "marketPotential": ["baixo", "médio", "alto"],
  "executionDifficulty": ["baixa", "média", "alta"],
  "investmentRequired": ["baixo", "médio", "alto"],
  "scalabilityPotential": ["baixo", "médio", "alto"],
  "innovationLevel": ["baixo", "médio", "alto"],
  "riskLevel": ["baixo", "médio", "alto"],
  "keyStrengthComparison": "análise aqui",
  "keyWeaknessComparison": "análise aqui",
  "recommendedFocus": "recomendações aqui",
  "overallRecommendation": "recomendação final aqui"
}
`;

    console.log("Enviando prompt para o OpenAI...");

    // Chamar a API OpenAI com parâmetros mais seguros para garantir resposta completa
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 3000, // Aumentar o limite de tokens ainda mais
      temperature: 0.3, // Reduzir ainda mais a temperatura para maior previsibilidade
      stop: null, // Remover qualquer stop token para garantir resposta completa
    });

    // Verificar se a resposta da OpenAI existe e tem o conteúdo esperado
    if (!completion.data || !completion.data.choices || completion.data.choices.length === 0) {
      console.error("Resposta da OpenAI inválida ou vazia");
      throw new Error("A API OpenAI retornou uma resposta inválida ou vazia");
    }

    // Processar a resposta com tratamento de erro aprimorado
    const rawResponse = completion.data.choices[0].text?.trim() || "";
    
    console.log("Resposta recebida do OpenAI");
    console.log("Tamanho da resposta:", rawResponse.length);
    
    let insights;
    try {
      // Tentar encontrar um objeto JSON válido na resposta, usando regex para maior precisão
      const jsonRegex = /{[\s\S]*}/;
      const jsonMatch = rawResponse.match(jsonRegex);
      
      if (!jsonMatch) {
        console.error("Não foi possível encontrar um objeto JSON válido na resposta da OpenAI");
        throw new Error("Formato de resposta inválido da API OpenAI");
      }
      
      const jsonStr = jsonMatch[0];
      insights = JSON.parse(jsonStr);
      
      // Validar se temos os campos esperados
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
      console.log("Resposta recebida:", rawResponse);
      
      // Criar um insights de fallback em caso de falha no parsing
      insights = createFallbackInsights(ideasData);
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Extrair token de autorização
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
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
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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
    }

    // Atualizar os insights das ideias individuais
    for (const idea of ideasData) {
      const { error: updateError } = await supabaseClient
        .from('idea_analyses')
        .update({
          ai_insights: {
            lastComparison: new Date().toISOString(),
            comparedWith: ideaIds.filter(id => id !== idea.id),
            insights: {
              competitiveAdvantage: insights.competitiveAdvantage,
              marketPotential: insights.marketPotential,
              recommendedFocus: insights.recommendedFocus,
              overallRecommendation: insights.overallRecommendation
            }
          },
          last_insight_generation: new Date().toISOString()
        })
        .eq('idea_id', idea.id);
        
      if (updateError) {
        console.error(`Erro ao atualizar insights para ideia ${idea.id}:`, updateError);
      }
    }

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
    console.error("Erro:", error);
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
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
    competitiveAdvantage: "Não foi possível gerar uma análise detalhada das vantagens competitivas. Recomendamos rever os dados das ideias e tentar novamente.",
    marketPotential: ideasData.map(() => "médio"),
    executionDifficulty: ideasData.map(() => "média"),
    investmentRequired: ideasData.map(() => "médio"),
    scalabilityPotential: ideasData.map(() => "médio"),
    innovationLevel: ideasData.map(() => "médio"),
    riskLevel: ideasData.map(() => "médio"),
    keyStrengthComparison: "Não foi possível comparar os pontos fortes em detalhes.",
    keyWeaknessComparison: "Não foi possível comparar os pontos fracos em detalhes.",
    recommendedFocus: "Recomendamos focar na validação adicional destas ideias com potenciais clientes e especialistas do setor.",
    overallRecommendation: "Devido a limitações na análise, não foi possível determinar qual ideia é mais promissora. Sugerimos revisar os dados fornecidos e tentar novamente, ou consultar um especialista no setor."
  };
  
  // Manter qualquer campo que já tenha sido retornado corretamente
  return {
    ...fallbackInsights,
    ...partialInsights
  };
}
