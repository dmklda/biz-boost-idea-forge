import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para pesquisar no SerpAPI
async function searchWithSerpAPI(query: string, serpApiKey: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5`);
    if (!response.ok) throw new Error('SerpAPI request failed');
    return await response.json();
  } catch (error) {
    console.error('SerpAPI error:', error);
    return null;
  }
}

// Função para consultar Perplexity
async function queryPerplexity(prompt: string, perplexityKey: string) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista de mercado especializado. Forneça insights precisos e atualizados baseados em dados reais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        return_related_questions: false,
        search_recency_filter: 'month'
      }),
    });
    
    if (!response.ok) throw new Error('Perplexity request failed');
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity error:', error);
    return null;
  }
}

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
    const serpApiKey = Deno.env.get('SERPAPI_API_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating comprehensive market analysis for: ${idea.title}`);

    // ETAPA 1: Pesquisar dados reais com SerpAPI
    let marketData = '';
    if (serpApiKey) {
      console.log('Searching market data with SerpAPI...');
      
      const searches = [
        `"${idea.title}" market size Brazil 2024 2025`,
        `${idea.audience || 'consumidores'} market trends Brazil`,
        `${idea.title} industry analysis market share`,
        `startup investment ${idea.title} Brazil funding`
      ];

      for (const query of searches) {
        const results = await searchWithSerpAPI(query, serpApiKey);
        if (results?.organic_results) {
          marketData += `\n--- Dados de: ${query} ---\n`;
          results.organic_results.slice(0, 3).forEach((result: any) => {
            marketData += `${result.title}: ${result.snippet}\n`;
          });
        }
      }
    }

    // ETAPA 2: Obter insights com Perplexity
    let perplexityInsights = '';
    if (perplexityKey && marketData) {
      console.log('Getting insights from Perplexity...');
      
      const perplexityPrompt = `
Com base nos dados de mercado encontrados sobre "${idea.title}", analise:

1. Tamanho real do mercado brasileiro para esta solução
2. Principais tendências atuais que impactam este setor
3. Oportunidades específicas identificadas
4. Principais ameaças e desafios do mercado
5. Barreiras de entrada mais relevantes

Dados de mercado disponíveis:
${marketData}

Foque em informações específicas, números reais e insights acionáveis para o mercado brasileiro.`;

      perplexityInsights = await queryPerplexity(perplexityPrompt, perplexityKey) || '';
    }

    // ETAPA 3: Estruturar análise final com ChatGPT
    console.log('Structuring final analysis with ChatGPT...');
    
    const contextualPrompt = `
DADOS DE MERCADO COLETADOS:
${marketData}

INSIGHTS ESPECIALIZADOS:
${perplexityInsights}

IDEIA PARA ANÁLISE:
- Título: ${idea.title}
- Descrição: ${idea.description}
- Público-alvo: ${idea.audience || 'Não especificado'}
- Problema: ${idea.problem || 'Não especificado'}

Com base nos dados reais coletados, estruture uma análise de mercado em JSON EXATO com:

{
  "marketSize": {
    "value": "string com valor específico encontrado",
    "description": "descrição detalhada do tamanho do mercado",
    "source": "fonte dos dados"
  },
  "targetAudience": {
    "primary": "segmento principal específico",
    "secondary": "segmento secundário",
    "demographics": "dados demográficos reais",
    "psychographics": "características comportamentais"
  },
  "marketTrends": [
    {
      "trend": "tendência específica 1",
      "impact": "impacto positivo/negativo/neutro",
      "timeline": "prazo estimado",
      "source": "fonte da informação"
    }
  ],
  "opportunities": [
    {
      "opportunity": "oportunidade específica 1",
      "potential": "alto/médio/baixo",
      "timeline": "curto/médio/longo prazo",
      "reasoning": "justificativa baseada nos dados"
    }
  ],
  "threats": [
    {
      "threat": "ameaça específica 1",
      "severity": "alta/média/baixa",
      "probability": "alta/média/baixa",
      "mitigation": "estratégia de mitigação"
    }
  ],
  "competitiveAdvantage": [
    "vantagem específica 1 baseada nos dados",
    "vantagem específica 2 baseada nos dados"
  ],
  "entryBarriers": [
    {
      "barrier": "barreira específica 1",
      "difficulty": "alta/média/baixa",
      "solution": "como superar"
    }
  ],
  "recommendations": [
    {
      "action": "recomendação específica 1",
      "priority": "alta/média/baixa",
      "reasoning": "justificativa baseada nos dados",
      "timeline": "prazo para implementação"
    }
  ]
}

IMPORTANTE: Use APENAS dados reais encontrados. Se não houver dados específicos, seja transparente sobre isso. Não invente números ou informações.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista de mercado sênior que estrutura dados reais em análises profissionais. Retorne APENAS o JSON solicitado, sem explicações adicionais.'
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        max_completion_tokens: 3000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate market analysis');
    }

    const data = await response.json();
    let analysisContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (analysisContent.startsWith('```json')) {
      analysisContent = analysisContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let marketAnalysis;
    try {
      marketAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Comprehensive market analysis generated successfully');

    return new Response(JSON.stringify({
      analysis: marketAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in market analysis function:', error);
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