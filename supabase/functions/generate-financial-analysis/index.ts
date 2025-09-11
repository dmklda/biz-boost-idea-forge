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
            content: 'Você é um consultor financeiro especializado em startups. Forneça insights financeiros precisos baseados em dados reais de mercado.'
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

    console.log(`Generating comprehensive financial analysis for: ${idea.title}`);

    // ETAPA 1: Pesquisar dados financeiros reais com SerpAPI
    let financialData = '';
    if (serpApiKey) {
      console.log('Searching financial data with SerpAPI...');
      
      const searches = [
        `"${idea.title}" startup funding requirements Brazil 2024`,
        `${idea.title} business model revenue streams costs`,
        `${idea.title} industry operational costs Brazil`,
        `venture capital investment ${idea.title} valuation metrics`,
        `startup costs ${idea.title} break even analysis`,
        `SaaS pricing model ${idea.title} Brazil market`
      ];

      for (const query of searches) {
        const results = await searchWithSerpAPI(query, serpApiKey);
        if (results?.organic_results) {
          financialData += `\n--- Dados financeiros: ${query} ---\n`;
          results.organic_results.slice(0, 3).forEach((result: any) => {
            financialData += `${result.title}: ${result.snippet}\n`;
          });
        }
      }
    }

    // ETAPA 2: Obter insights financeiros com Perplexity
    let perplexityInsights = '';
    if (perplexityKey && financialData) {
      console.log('Getting financial insights from Perplexity...');
      
      const perplexityPrompt = `
Com base nos dados financeiros encontrados sobre "${idea.title}", analise:

1. Modelos de receita viáveis para esta solução no Brasil
2. Estrutura de custos típica para este tipo de negócio
3. Investimento inicial necessário com base em casos similares
4. Custos operacionais mensais esperados
5. Projeções realistas de receita para os primeiros 12 meses
6. Métricas financeiras chave do setor

Dados financeiros disponíveis:
${financialData}

Foque em números reais, benchmarks do mercado brasileiro e métricas específicas do setor.`;

      perplexityInsights = await queryPerplexity(perplexityPrompt, perplexityKey) || '';
    }

    // ETAPA 3: Estruturar análise financeira final com ChatGPT
    console.log('Structuring final financial analysis with ChatGPT...');
    
    const contextualPrompt = `
DADOS FINANCEIROS COLETADOS:
${financialData}

INSIGHTS FINANCEIROS ESPECIALIZADOS:
${perplexityInsights}

IDEIA PARA ANÁLISE:
- Título: ${idea.title}
- Descrição: ${idea.description}
- Público-alvo: ${idea.audience || 'Não especificado'}
- Monetização: ${idea.monetization || 'Não especificado'}
- Orçamento: ${idea.budget || 'Não especificado'}

Com base nos dados financeiros reais coletados, estruture uma análise financeira em JSON EXATO com:

{
  "revenueModel": {
    "primary": "modelo principal de receita baseado nos dados",
    "secondary": "modelo secundário de receita",
    "pricingStrategy": "estratégia de precificação específica",
    "revenueStreams": [
      {
        "stream": "fonte de receita 1",
        "percentage": "% da receita total",
        "timeline": "quando começará a gerar receita"
      }
    ]
  },
  "costStructure": {
    "fixedCosts": [
      {
        "category": "categoria de custo fixo",
        "monthlyAmount": "valor mensal em R$",
        "description": "descrição detalhada"
      }
    ],
    "variableCosts": [
      {
        "category": "categoria de custo variável",
        "percentage": "% da receita",
        "description": "descrição detalhada"
      }
    ]
  },
  "initialInvestment": {
    "total": "valor total em R$",
    "breakdown": [
      {
        "category": "categoria de investimento",
        "amount": "valor em R$",
        "description": "descrição do investimento"
      }
    ],
    "source": "fonte dos dados"
  },
  "monthlyOperatingCosts": {
    "total": "valor total mensal em R$",
    "breakdown": [
      {
        "category": "categoria de custo",
        "amount": "valor mensal em R$",
        "percentage": "% do total"
      }
    ]
  },
  "revenueProjections": {
    "year1": [
      {
        "month": 1,
        "revenue": "receita em R$",
        "customers": "número de clientes",
        "reasoning": "justificativa"
      }
    ],
    "assumptions": [
      "premissa 1 baseada nos dados",
      "premissa 2 baseada nos dados"
    ]
  },
  "breakEvenAnalysis": {
    "timeToBreakEven": "tempo em meses",
    "breakEvenRevenue": "receita mensal para break-even em R$",
    "breakEvenCustomers": "número de clientes necessários",
    "analysis": "análise detalhada baseada nos dados"
  },
  "fundingRequirements": {
    "totalNeeded": "valor total necessário em R$",
    "runway": "tempo de duração do investimento",
    "stages": [
      {
        "stage": "fase do investimento",
        "amount": "valor em R$",
        "milestone": "marco a ser atingido"
      }
    ]
  },
  "financialRisks": [
    {
      "risk": "risco específico 1",
      "impact": "alto/médio/baixo",
      "probability": "alta/média/baixa",
      "mitigation": "estratégia de mitigação"
    }
  ],
  "profitabilityTimeline": {
    "grossProfit": "mês quando atingirá lucro bruto",
    "netProfit": "mês quando atingirá lucro líquido",
    "positiveMargins": "quando as margens ficarão positivas",
    "reasoning": "justificativa baseada nos dados"
  },
  "keyMetrics": [
    {
      "metric": "métrica chave 1",
      "value": "valor ou faixa",
      "benchmark": "benchmark do setor",
      "importance": "por que é importante"
    }
  ]
}

IMPORTANTE: Use APENAS dados financeiros reais encontrados. Se não houver dados específicos, seja transparente sobre isso. Não invente números ou métricas.`;

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
            content: 'Você é um consultor financeiro sênior que estrutura dados financeiros reais em análises profissionais. Retorne APENAS o JSON solicitado, sem explicações adicionais.'
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        max_completion_tokens: 3500,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate financial analysis');
    }

    const data = await response.json();
    let analysisContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (analysisContent.startsWith('```json')) {
      analysisContent = analysisContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let financialAnalysis;
    try {
      financialAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Comprehensive financial analysis generated successfully');

    return new Response(JSON.stringify({
      analysis: financialAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in financial analysis function:', error);
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