import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para pesquisar no SerpAPI
async function searchWithSerpAPI(query: string, serpApiKey: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=10`);
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
            content: 'Você é um analista competitivo especializado. Forneça análises precisas sobre concorrentes baseadas em dados reais de mercado.'
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

    console.log(`Generating comprehensive competitor analysis for: ${idea.title}`);

    // ETAPA 1: Pesquisar concorrentes reais com SerpAPI
    let competitorData = '';
    let competitorList = [];
    
    if (serpApiKey) {
      console.log('Searching competitors with SerpAPI...');
      
      const searches = [
        `"${idea.title}" competitors Brazil`,
        `${idea.title} alternative solutions market leaders`,
        `${idea.audience || 'empresas'} solutions ${idea.title}`,
        `startup competitors "${idea.title}" Brazil market`,
        `best ${idea.title} companies Brazil 2024`,
        `${idea.title} industry leaders market share`
      ];

      for (const query of searches) {
        const results = await searchWithSerpAPI(query, serpApiKey);
        if (results?.organic_results) {
          competitorData += `\n--- Concorrentes encontrados: ${query} ---\n`;
          results.organic_results.slice(0, 5).forEach((result: any) => {
            competitorData += `${result.title}: ${result.snippet}\nWebsite: ${result.link}\n---\n`;
            
            // Extrair possíveis concorrentes
            const competitorName = result.title.split(' - ')[0].split(' | ')[0];
            if (competitorName && !competitorList.includes(competitorName)) {
              competitorList.push(competitorName);
            }
          });
        }
      }
    }

    // ETAPA 2: Obter análise competitiva com Perplexity
    let perplexityInsights = '';
    if (perplexityKey && competitorData) {
      console.log('Getting competitive insights from Perplexity...');
      
      const perplexityPrompt = `
Com base nos concorrentes encontrados para "${idea.title}", analise:

1. Principais concorrentes diretos no mercado brasileiro
2. Concorrentes indiretos que oferecem soluções alternativas
3. Pontos fortes e fracos de cada concorrente principal
4. Market share e posicionamento no mercado
5. Lacunas no mercado não atendidas pelos concorrentes
6. Estratégias de diferenciação possíveis
7. Ameaças competitivas e oportunidades

Dados de concorrentes encontrados:
${competitorData}

Concorrentes identificados: ${competitorList.join(', ')}

Foque em informações específicas, análise detalhada de cada concorrente e insights acionáveis para posicionamento competitivo.`;

      perplexityInsights = await queryPerplexity(perplexityPrompt, perplexityKey) || '';
    }

    // ETAPA 3: Estruturar análise competitiva final com ChatGPT
    console.log('Structuring final competitive analysis with ChatGPT...');
    
    const contextualPrompt = `
DADOS DE CONCORRENTES COLETADOS:
${competitorData}

INSIGHTS COMPETITIVOS ESPECIALIZADOS:
${perplexityInsights}

CONCORRENTES IDENTIFICADOS:
${competitorList.join(', ')}

IDEIA PARA ANÁLISE:
- Título: ${idea.title}
- Descrição: ${idea.description}
- Público-alvo: ${idea.audience || 'Não especificado'}
- Problema: ${idea.problem || 'Não especificado'}

Com base nos dados reais de concorrentes coletados, estruture uma análise competitiva em JSON EXATO com:

{
  "directCompetitors": [
    {
      "name": "nome real do concorrente 1",
      "description": "descrição baseada nos dados encontrados",
      "website": "website real encontrado",
      "strengths": [
        "força específica 1",
        "força específica 2"
      ],
      "weaknesses": [
        "fraqueza específica 1",
        "fraqueza específica 2"
      ],
      "marketShare": "participação de mercado se disponível",
      "pricing": "modelo de preços se encontrado",
      "targetAudience": "público-alvo específico"
    }
  ],
  "indirectCompetitors": [
    {
      "name": "nome do concorrente indireto 1",
      "description": "como compete indiretamente",
      "website": "website se disponível",
      "threat": "alto/médio/baixo",
      "reasoning": "por que é uma ameaça indireta"
    }
  ],
  "competitiveAdvantages": [
    {
      "advantage": "vantagem específica 1",
      "strength": "alta/média/baixa",
      "sustainability": "sustentável/temporária",
      "reasoning": "por que é uma vantagem"
    }
  ],
  "marketGaps": [
    {
      "gap": "lacuna específica 1",
      "opportunity": "oportunidade associada",
      "size": "grande/média/pequena",
      "reasoning": "por que é uma lacuna"
    }
  ],
  "competitiveStrategy": {
    "positioning": "como se posicionar no mercado",
    "differentiation": "principal estratégia de diferenciação",
    "focus": "onde focar os esforços",
    "timeline": "cronograma de implementação"
  },
  "differentiationPoints": [
    {
      "point": "ponto de diferenciação 1",
      "impact": "alto/médio/baixo",
      "feasibility": "alta/média/baixa",
      "competitive": "difícil/fácil de copiar"
    }
  ],
  "threatLevel": {
    "overall": "high/medium/low",
    "direct": "nível de ameaça dos concorrentes diretos",
    "indirect": "nível de ameaça dos concorrentes indiretos",
    "emerging": "ameaças emergentes identificadas",
    "reasoning": "justificativa do nível de ameaça"
  },
  "recommendations": [
    {
      "action": "recomendação específica 1",
      "priority": "alta/média/baixa",
      "timeline": "prazo para implementação",
      "reasoning": "por que é importante",
      "resources": "recursos necessários"
    }
  ]
}

IMPORTANTE: Use APENAS concorrentes reais encontrados nos dados. Se não houver informações específicas sobre algum concorrente, seja transparente sobre isso. Não invente empresas ou dados.`;

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
            content: 'Você é um analista competitivo sênior que estrutura dados reais de concorrentes em análises profissionais. Retorne APENAS o JSON solicitado, sem explicações adicionais.'
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
      throw new Error(error.error?.message || 'Failed to generate competitor analysis');
    }

    const data = await response.json();
    let analysisContent = data.choices[0].message.content.trim();
    
    // Remove code block markers if present
    if (analysisContent.startsWith('```json')) {
      analysisContent = analysisContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    
    let competitorAnalysis;
    try {
      competitorAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', analysisContent);
      throw new Error('Invalid response format from AI');
    }

    console.log('Comprehensive competitor analysis generated successfully');

    return new Response(JSON.stringify({
      analysis: competitorAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in competitor analysis function:', error);
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