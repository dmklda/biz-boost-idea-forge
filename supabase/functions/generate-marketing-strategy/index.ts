import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Função para buscar dados usando SerpAPI
async function searchWithSerpAPI(query, searchType = 'organic') {
  try {
    console.log(`Searching SerpAPI: ${query} (type: ${searchType})`);
    // Limpar a consulta para evitar caracteres especiais que possam causar erros 400
    const cleanQuery = query.replace(/[^\w\s\-\.]/g, ' ').trim();
    // Construir parâmetros de acordo com a documentação da SerpAPI
    const params = new URLSearchParams({
      q: cleanQuery,
      api_key: Deno.env.get('SERPAPI_API_KEY') || '',
      num: '10',
      hl: 'pt',
      gl: 'br'
    });
    // Adicionar modificador de tipo de pesquisa para notícias
    if (searchType === 'news') {
      params.append('tbm', 'nws');
    }
    console.log(`SerpAPI request URL: https://serpapi.com/search?${params.toString()}`);
    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SerpAPI error: ${response.status} - ${response.statusText}`);
      console.error(`SerpAPI error response: ${errorText}`);
      // Tentar com consulta mais simples se erro 400
      if (response.status === 400 && query.length > 50) {
        console.log('Retrying with shorter query...');
        const shortQuery = query.split(' ').slice(0, 5).join(' ');
        return await searchWithSerpAPI(shortQuery, searchType);
      }
      return null;
    }
    const data = await response.json();
    console.log(`SerpAPI search successful for: ${query}`);
    console.log(`SerpAPI results:`, {
      organic: data.organic_results?.length || 0,
      news: data.news_results?.length || 0,
      related_searches: data.related_searches?.length || 0,
      knowledge_graph: data.knowledge_graph ? 'Present' : 'None'
    });
    return data;
  } catch (error) {
    console.error('SerpAPI search error:', error);
    return null;
  }
}
// Função para realizar pesquisa de marketing usando SerpAPI
async function performMarketingResearch(idea) {
  const research = {
    marketingChannels: [],
    contentStrategies: [],
    marketingTrends: [],
    competitorMarketing: [],
    growthHackingTactics: [],
    marketingMetrics: []
  };
  try {
    // Pesquisar canais de marketing
    const channelsQuery = `${idea.title} melhores canais marketing ${idea.audience || ''}`;
    const channelsResults = await searchWithSerpAPI(channelsQuery, 'organic');
    if (channelsResults?.organic_results) {
      research.marketingChannels = channelsResults.organic_results.slice(0, 3).map((result)=>({
          title: result.title,
          url: result.link,
          description: result.snippet,
          source: 'SerpAPI'
        }));
    }
    // Pesquisar estratégias de conteúdo
    const contentQuery = `${idea.title} estratégia conteúdo marketing ${idea.industry || ''}`;
    const contentResults = await searchWithSerpAPI(contentQuery, 'organic');
    if (contentResults?.organic_results) {
      research.contentStrategies = contentResults.organic_results.slice(0, 3).map((result)=>({
          title: result.title,
          url: result.link,
          description: result.snippet,
          source: 'SerpAPI'
        }));
    }
    // Pesquisar tendências de marketing
    const trendsQuery = `tendências marketing digital ${idea.industry || ''} ${new Date().getFullYear()}`;
    const trendsResults = await searchWithSerpAPI(trendsQuery, 'organic');
    if (trendsResults?.organic_results) {
      research.marketingTrends = trendsResults.organic_results.slice(0, 3).map((result)=>({
          title: result.title,
          url: result.link,
          description: result.snippet,
          source: 'SerpAPI'
        }));
    }
    // Pesquisar marketing de concorrentes
    const competitorQuery = `${idea.title} concorrentes estratégias marketing ${idea.industry || ''}`;
    const competitorResults = await searchWithSerpAPI(competitorQuery, 'organic');
    if (competitorResults?.organic_results) {
      research.competitorMarketing = competitorResults.organic_results.slice(0, 3).map((result)=>({
          title: result.title,
          url: result.link,
          description: result.snippet,
          source: 'SerpAPI'
        }));
    }
    // Pesquisar táticas de growth hacking
    const growthQuery = `growth hacking táticas ${idea.industry || idea.title} baixo orçamento`;
    const growthResults = await searchWithSerpAPI(growthQuery, 'organic');
    if (growthResults?.organic_results) {
      research.growthHackingTactics = growthResults.organic_results.slice(0, 3).map((result)=>({
          title: result.title,
          url: result.link,
          description: result.snippet,
          source: 'SerpAPI'
        }));
    }
    // Pesquisar métricas de marketing
    const metricsQuery = `métricas KPIs marketing ${idea.industry || idea.title}`;
    const metricsResults = await searchWithSerpAPI(metricsQuery, 'organic');
    if (metricsResults?.organic_results) {
      research.marketingMetrics = metricsResults.organic_results.slice(0, 3).map((result)=>({
          title: result.title,
          url: result.link,
          description: result.snippet,
          source: 'SerpAPI'
        }));
    }
    return research;
  } catch (error) {
    console.error('Marketing research error:', error);
    return research;
  }
}
// Função para consultar o Perplexity AI para obter insights adicionais sobre marketing
async function getPerplexityMarketingInsights(idea, marketingResearch) {
  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      console.error('Perplexity API key not found');
      return null;
    }
    // Construir o prompt com os dados da ideia e da pesquisa de marketing
    const prompt = `
Analise esta ideia de negócio e forneça insights detalhados sobre estratégia de marketing:

Ideia: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}
${idea.location ? `Localização: ${idea.location}` : ''}

Dados de pesquisa de marketing:
- Canais: ${marketingResearch.marketingChannels.map((c)=>c.title).join(', ')}
- Tendências: ${marketingResearch.marketingTrends.map((t)=>t.title).join(', ')}

Forneça uma estratégia de marketing detalhada incluindo:
1. Objetivos de marketing SMART
2. Segmentos de mercado priorizados
3. Canais de marketing recomendados com descrição, prioridade, táticas e ROI esperado
4. Estratégia de conteúdo detalhada
5. Alocação de orçamento por canal
6. Cronograma de ações para 12 meses
7. KPIs principais para acompanhar
8. Campanhas específicas recomendadas
9. Parcerias estratégicas sugeridas
10. Táticas de growth hacking

Base sua análise em dados reais e atuais do mercado brasileiro. Seja específico e prático.
`;
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em marketing digital e growth hacking. Forneça insights precisos e baseados em dados reais sobre estratégias de marketing eficazes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get Perplexity insights');
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error);
    return null;
  }
}
// Função para combinar dados de pesquisa com insights do Perplexity e formatar para o formato esperado
async function generateMarketingStrategy(idea) {
  try {
    // Obter dados de pesquisa de marketing do SerpAPI
    const marketingResearch = await performMarketingResearch(idea);
    console.log('Marketing research completed');
    // Obter insights adicionais do Perplexity AI
    const perplexityInsights = await getPerplexityMarketingInsights(idea, marketingResearch);
    console.log('Perplexity marketing insights obtained');
    // Usar OpenAI para formatar os dados no formato esperado pelo frontend
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    const prompt = `
Baseado na ideia de negócio e nos dados de pesquisa real fornecidos, crie uma estratégia de marketing completa e específica.

IDEIA DE NEGÓCIO:
Título: ${idea.title}
Descrição: ${idea.description}
${idea.audience ? `Público-alvo: ${idea.audience}` : ''}
${idea.budget ? `Orçamento: ${idea.budget}` : ''}
${idea.location ? `Localização: ${idea.location}` : ''}

DADOS DE PESQUISA REAL (SerpAPI):
Canais de Marketing: ${JSON.stringify(marketingResearch.marketingChannels, null, 2)}
Estratégias de Conteúdo: ${JSON.stringify(marketingResearch.contentStrategies, null, 2)}
Tendências de Marketing: ${JSON.stringify(marketingResearch.marketingTrends, null, 2)}
Marketing de Concorrentes: ${JSON.stringify(marketingResearch.competitorMarketing, null, 2)}
Táticas de Growth Hacking: ${JSON.stringify(marketingResearch.growthHackingTactics, null, 2)}

INSIGHTS PERPLEXITY AI:
${perplexityInsights || 'Análise complementar não disponível'}

INSTRUÇÕES CRÍTICAS:
1. Use APENAS dados reais da pesquisa acima
2. Adapte tudo especificamente para a ideia: "${idea.title}"
3. JAMAIS use "undefined", "null" ou deixe campos vazios
4. Seja específico e prático
5. Use dados do Brasil se localização não especificada

RETORNE EXATAMENTE este JSON (substitua TODOS os valores por dados reais e específicos):

{
  "marketingGoals": [
    "Objetivo SMART específico 1 baseado na ideia",
    "Objetivo SMART específico 2 baseado na ideia",
    "Objetivo SMART específico 3 baseado na ideia"
  ],
  "targetSegments": [
    "Segmento específico 1 baseado no público da ideia",
    "Segmento específico 2 baseado no público da ideia"
  ],
  "channels": [
    {
      "name": "Nome do Canal Real",
      "description": "Descrição específica para esta ideia",
      "priority": "high",
      "tactics": ["Tática 1 específica", "Tática 2 específica"],
      "budget": "25%",
      "expectedROI": "150%"
    }
  ],
  "contentStrategy": {
    "themes": ["Tema 1 específico", "Tema 2 específico"],
    "formats": ["Formato 1", "Formato 2"],
    "distribution": ["Canal 1", "Canal 2"],
    "calendar": "Frequência específica"
  },
  "budgetAllocation": [
    {
      "channel": "Nome do Canal",
      "percentage": "25%"
    }
  ],
  "timeline": [
    {
      "period": "Mês 1-3",
      "focus": "Foco específico desta fase",
      "activities": ["Atividade 1", "Atividade 2"]
    }
  ],
  "kpis": ["KPI 1 específico", "KPI 2 específico"],
  "campaigns": [
    {
      "name": "Nome da Campanha Específica",
      "objective": "Objetivo específico",
      "channels": ["Canal 1", "Canal 2"],
      "timing": "3 meses",
      "budget": "R$ 5.000"
    }
  ],
  "partnerships": ["Parceria 1 específica", "Parceria 2 específica"],
  "growthHacks": ["Growth hack 1 específico", "Growth hack 2 específico"]
}
`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em marketing digital e growth hacking. 
Analise os dados de pesquisa fornecidos e crie uma estratégia de marketing detalhada e específica.
OBRIGATÓRIO: Retorne APENAS um JSON válido seguindo EXATAMENTE a estrutura especificada.
JAMAIS deixe campos como "undefined", "null" ou vazios.
Use dados reais da pesquisa fornecida e crie conteúdo específico e relevante.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate marketing strategy');
    }
    const data = await response.json();
    let strategyContent = data.choices[0].message.content.trim();
    // Remover marcadores de bloco de código se presentes
    if (strategyContent.startsWith('```json')) {
      strategyContent = strategyContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    let strategy;
    try {
      strategy = JSON.parse(strategyContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', strategyContent);
      throw new Error('Invalid response format from AI');
    }
    console.log('Marketing strategy generated successfully');
    // Adicionar metadados sobre as fontes de dados
    strategy.dataSources = {
      serpApi: Object.values(marketingResearch).some((arr)=>arr.length > 0),
      perplexity: !!perplexityInsights,
      timestamp: new Date().toISOString()
    };
    return strategy;
  } catch (error) {
    console.error('Error generating marketing strategy:', error);
    throw error;
  }
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { idea } = await req.json();
    if (!idea) {
      throw new Error('Idea is required');
    }
    console.log(`Generating marketing strategy for: ${idea.title}`);
    // Gerar estratégia de marketing com dados reais
    const strategy = await generateMarketingStrategy(idea);
    return new Response(JSON.stringify({
      strategy: strategy
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in marketing strategy function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
