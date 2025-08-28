import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BenchmarkRequest {
  sector: string;
  region: 'brazil' | 'latam' | 'global';
  companyStage: 'startup' | 'scaleup' | 'established';
  businessModel: string;
  targetMetrics?: string[];
}

interface BenchmarkMetric {
  name: string;
  value: number;
  unit: string;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  description: string;
  source: string;
  lastUpdated: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  importance: 'critical' | 'important' | 'moderate';
}

interface IndustryBenchmark {
  sector: string;
  region: string;
  companyStage: string;
  metrics: BenchmarkMetric[];
  marketInsights: {
    marketSize: number;
    growthRate: number;
    competitionLevel: 'low' | 'medium' | 'high' | 'very_high';
    entryBarriers: string[];
    keySuccessFactors: string[];
    typicalChallenges: string[];
  };
  financialBenchmarks: {
    averageRevenue: number;
    averageValuation: number;
    burnRate: number;
    timeToBreakeven: number;
    fundingRounds: {
      seed: number;
      seriesA: number;
      seriesB: number;
    };
  };
  operationalBenchmarks: {
    customerAcquisitionCost: number;
    lifetimeValue: number;
    churnRate: number;
    grossMargin: number;
    employeeCount: number;
    revenuePerEmployee: number;
  };
  generatedAt: string;
}

// Comprehensive industry benchmarks database
const INDUSTRY_BENCHMARKS = {
  brazil: {
    fintech: {
      startup: {
        metrics: [
          {
            name: 'Customer Acquisition Cost (CAC)',
            value: 85,
            unit: 'R$',
            percentile_25: 45,
            percentile_50: 75,
            percentile_75: 120,
            percentile_90: 180,
            description: 'Custo médio para adquirir um novo cliente',
            source: 'ABFintech 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Lifetime Value (LTV)',
            value: 850,
            unit: 'R$',
            percentile_25: 400,
            percentile_50: 750,
            percentile_75: 1200,
            percentile_90: 2000,
            description: 'Valor total que um cliente gera durante seu relacionamento',
            source: 'ABFintech 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Monthly Churn Rate',
            value: 8.5,
            unit: '%',
            percentile_25: 3.2,
            percentile_50: 6.8,
            percentile_75: 12.5,
            percentile_90: 18.0,
            description: 'Taxa mensal de cancelamento de clientes',
            source: 'ABFintech 2024',
            lastUpdated: '2024-01-15',
            trend: 'decreasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Monthly Active Users Growth',
            value: 15.2,
            unit: '%',
            percentile_25: 5.0,
            percentile_50: 12.0,
            percentile_75: 22.0,
            percentile_90: 35.0,
            description: 'Crescimento mensal de usuários ativos',
            source: 'ABFintech 2024',
            lastUpdated: '2024-01-15',
            trend: 'stable' as const,
            importance: 'important' as const
          },
          {
            name: 'Time to Break-even',
            value: 18,
            unit: 'meses',
            percentile_25: 12,
            percentile_50: 16,
            percentile_75: 24,
            percentile_90: 36,
            description: 'Tempo médio para atingir o ponto de equilíbrio',
            source: 'Distrito 2024',
            lastUpdated: '2024-01-15',
            trend: 'stable' as const,
            importance: 'important' as const
          }
        ],
        marketInsights: {
          marketSize: 45000000000, // R$ 45 bilhões
          growthRate: 25.5,
          competitionLevel: 'very_high' as const,
          entryBarriers: [
            'Regulamentação BACEN complexa',
            'Alto investimento em compliance',
            'Necessidade de licenças específicas',
            'Competição com bancos tradicionais'
          ],
          keySuccessFactors: [
            'Experiência do usuário superior',
            'Compliance regulatório rigoroso',
            'Tecnologia robusta e segura',
            'Parcerias estratégicas',
            'Foco em nichos específicos'
          ],
          typicalChallenges: [
            'Aquisição de clientes em mercado saturado',
            'Manutenção de margens com competição acirrada',
            'Adaptação constante a mudanças regulatórias',
            'Escalabilidade técnica',
            'Gestão de risco de crédito'
          ]
        },
        financialBenchmarks: {
          averageRevenue: 2500000, // R$ 2.5M
          averageValuation: 15000000, // R$ 15M
          burnRate: 180000, // R$ 180K/mês
          timeToBreakeven: 18,
          fundingRounds: {
            seed: 800000, // R$ 800K
            seriesA: 5000000, // R$ 5M
            seriesB: 15000000 // R$ 15M
          }
        },
        operationalBenchmarks: {
          customerAcquisitionCost: 85,
          lifetimeValue: 850,
          churnRate: 8.5,
          grossMargin: 65.0,
          employeeCount: 25,
          revenuePerEmployee: 100000
        }
      }
    },
    healthtech: {
      startup: {
        metrics: [
          {
            name: 'Customer Acquisition Cost (CAC)',
            value: 320,
            unit: 'R$',
            percentile_25: 180,
            percentile_50: 280,
            percentile_75: 450,
            percentile_90: 650,
            description: 'Custo médio para adquirir um novo cliente/paciente',
            source: 'HealthTech Report 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Patient Retention Rate',
            value: 78.5,
            unit: '%',
            percentile_25: 65.0,
            percentile_50: 75.0,
            percentile_75: 85.0,
            percentile_90: 92.0,
            description: 'Taxa de retenção de pacientes após 12 meses',
            source: 'HealthTech Report 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Clinical Validation Time',
            value: 14,
            unit: 'meses',
            percentile_25: 8,
            percentile_50: 12,
            percentile_75: 18,
            percentile_90: 24,
            description: 'Tempo médio para validação clínica',
            source: 'ANVISA Studies 2024',
            lastUpdated: '2024-01-15',
            trend: 'decreasing' as const,
            importance: 'important' as const
          },
          {
            name: 'Regulatory Approval Success Rate',
            value: 68.0,
            unit: '%',
            percentile_25: 45.0,
            percentile_50: 65.0,
            percentile_75: 80.0,
            percentile_90: 90.0,
            description: 'Taxa de sucesso em aprovações regulatórias',
            source: 'ANVISA Studies 2024',
            lastUpdated: '2024-01-15',
            trend: 'stable' as const,
            importance: 'critical' as const
          }
        ],
        marketInsights: {
          marketSize: 12000000000, // R$ 12 bilhões
          growthRate: 18.2,
          competitionLevel: 'medium' as const,
          entryBarriers: [
            'Regulamentação ANVISA rigorosa',
            'Necessidade de validação clínica',
            'Compliance com normas médicas',
            'Integração com sistemas hospitalares'
          ],
          keySuccessFactors: [
            'Evidência clínica robusta',
            'Parcerias com profissionais de saúde',
            'Compliance regulatório',
            'Usabilidade para profissionais',
            'Integração com workflow médico'
          ],
          typicalChallenges: [
            'Longo ciclo de validação clínica',
            'Resistência à adoção por profissionais',
            'Complexidade regulatória',
            'Necessidade de evidências científicas',
            'Integração com sistemas legados'
          ]
        },
        financialBenchmarks: {
          averageRevenue: 1800000,
          averageValuation: 12000000,
          burnRate: 150000,
          timeToBreakeven: 24,
          fundingRounds: {
            seed: 600000,
            seriesA: 4000000,
            seriesB: 12000000
          }
        },
        operationalBenchmarks: {
          customerAcquisitionCost: 320,
          lifetimeValue: 2400,
          churnRate: 21.5,
          grossMargin: 72.0,
          employeeCount: 18,
          revenuePerEmployee: 100000
        }
      }
    },
    edtech: {
      startup: {
        metrics: [
          {
            name: 'Student Acquisition Cost (SAC)',
            value: 45,
            unit: 'R$',
            percentile_25: 25,
            percentile_50: 40,
            percentile_75: 65,
            percentile_90: 95,
            description: 'Custo médio para adquirir um novo estudante',
            source: 'EdTech Brasil 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Course Completion Rate',
            value: 68.5,
            unit: '%',
            percentile_25: 45.0,
            percentile_50: 65.0,
            percentile_75: 80.0,
            percentile_90: 90.0,
            description: 'Taxa de conclusão de cursos',
            source: 'EdTech Brasil 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'critical' as const
          },
          {
            name: 'Monthly Active Learners Growth',
            value: 22.3,
            unit: '%',
            percentile_25: 8.0,
            percentile_50: 18.0,
            percentile_75: 30.0,
            percentile_90: 45.0,
            description: 'Crescimento mensal de estudantes ativos',
            source: 'EdTech Brasil 2024',
            lastUpdated: '2024-01-15',
            trend: 'stable' as const,
            importance: 'important' as const
          },
          {
            name: 'Student Satisfaction Score',
            value: 4.2,
            unit: '/5',
            percentile_25: 3.5,
            percentile_50: 4.0,
            percentile_75: 4.5,
            percentile_90: 4.8,
            description: 'Pontuação média de satisfação dos estudantes',
            source: 'EdTech Brasil 2024',
            lastUpdated: '2024-01-15',
            trend: 'increasing' as const,
            importance: 'important' as const
          }
        ],
        marketInsights: {
          marketSize: 8500000000, // R$ 8.5 bilhões
          growthRate: 28.7,
          competitionLevel: 'high' as const,
          entryBarriers: [
            'Necessidade de conteúdo de qualidade',
            'Competição com instituições tradicionais',
            'Regulamentação MEC para certificação',
            'Sazonalidade educacional'
          ],
          keySuccessFactors: [
            'Qualidade do conteúdo educacional',
            'Experiência de aprendizagem envolvente',
            'Certificações reconhecidas',
            'Tecnologia adaptativa',
            'Suporte ao estudante'
          ],
          typicalChallenges: [
            'Alta taxa de abandono de cursos',
            'Sazonalidade nas matrículas',
            'Competição por atenção dos estudantes',
            'Necessidade de atualização constante',
            'Monetização de conteúdo gratuito'
          ]
        },
        financialBenchmarks: {
          averageRevenue: 1200000,
          averageValuation: 8000000,
          burnRate: 120000,
          timeToBreakeven: 15,
          fundingRounds: {
            seed: 500000,
            seriesA: 3000000,
            seriesB: 8000000
          }
        },
        operationalBenchmarks: {
          customerAcquisitionCost: 45,
          lifetimeValue: 380,
          churnRate: 31.5,
          grossMargin: 78.0,
          employeeCount: 15,
          revenuePerEmployee: 80000
        }
      }
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { sector, region = 'brazil', companyStage = 'startup', businessModel, targetMetrics }: BenchmarkRequest = await req.json();
    
    if (!sector) {
      throw new Error('Sector is required');
    }

    console.log(`Generating industry benchmarks for ${sector} in ${region} (${companyStage})`);

    // Get base benchmark data
    const benchmarkData = INDUSTRY_BENCHMARKS[region]?.[sector]?.[companyStage];
    
    if (!benchmarkData) {
      throw new Error(`Benchmark data not available for ${sector} in ${region} (${companyStage})`);
    }

    // Filter metrics if specific ones are requested
    let filteredMetrics = benchmarkData.metrics;
    if (targetMetrics && targetMetrics.length > 0) {
      filteredMetrics = benchmarkData.metrics.filter(metric => 
        targetMetrics.some(target => 
          metric.name.toLowerCase().includes(target.toLowerCase())
        )
      );
    }

    // Generate AI-powered insights
    const aiInsights = await generateAIBenchmarkInsights(
      sector,
      region,
      companyStage,
      benchmarkData,
      businessModel
    );

    // Enrich with comparative analysis
    const enrichedMetrics = await enrichMetricsWithComparison(filteredMetrics, sector, region);

    const result: IndustryBenchmark = {
      sector,
      region,
      companyStage,
      metrics: enrichedMetrics,
      marketInsights: {
        ...benchmarkData.marketInsights,
        ...aiInsights.marketInsights
      },
      financialBenchmarks: benchmarkData.financialBenchmarks,
      operationalBenchmarks: benchmarkData.operationalBenchmarks,
      generatedAt: new Date().toISOString()
    };

    console.log(`Industry benchmarks generated for ${sector}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in industry-benchmarks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        benchmarks: null
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Enrich metrics with comparative analysis
async function enrichMetricsWithComparison(
  metrics: BenchmarkMetric[], 
  sector: string, 
  region: string
): Promise<BenchmarkMetric[]> {
  return metrics.map(metric => {
    // Add contextual information based on sector
    let enhancedDescription = metric.description;
    
    if (sector === 'fintech') {
      if (metric.name.includes('CAC')) {
        enhancedDescription += '. No setor FinTech, CACs baixos são críticos devido à alta competição.';
      } else if (metric.name.includes('LTV')) {
        enhancedDescription += '. LTV alto é essencial para justificar investimentos em aquisição.';
      }
    } else if (sector === 'healthtech') {
      if (metric.name.includes('Retention')) {
        enhancedDescription += '. Retenção alta é crucial devido ao ciclo longo de validação clínica.';
      }
    } else if (sector === 'edtech') {
      if (metric.name.includes('Completion')) {
        enhancedDescription += '. Taxa de conclusão alta indica qualidade do conteúdo e engajamento.';
      }
    }
    
    return {
      ...metric,
      description: enhancedDescription
    };
  });
}

// Generate AI-powered benchmark insights
async function generateAIBenchmarkInsights(
  sector: string,
  region: string,
  companyStage: string,
  benchmarkData: any,
  businessModel: string
): Promise<{ marketInsights: any }> {
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiApiKey) {
    return {
      marketInsights: {}
    };
  }

  const prompt = `
  Analise o setor ${sector} no ${region} para empresas em estágio ${companyStage}.
  
  DADOS DO SETOR:
  Tamanho do mercado: R$ ${benchmarkData.marketInsights.marketSize.toLocaleString()}
  Taxa de crescimento: ${benchmarkData.marketInsights.growthRate}%
  Nível de competição: ${benchmarkData.marketInsights.competitionLevel}
  
  MODELO DE NEGÓCIO: ${businessModel}
  
  MÉTRICAS PRINCIPAIS:
  ${benchmarkData.metrics.map((m: any) => `- ${m.name}: ${m.value} ${m.unit} (mediana: ${m.percentile_50})`).join('\n')}
  
  Forneça insights específicos sobre:
  1. Tendências emergentes no setor
  2. Oportunidades de diferenciação
  3. Riscos específicos do momento atual
  4. Recomendações estratégicas
  
  Seja específico e prático para o contexto brasileiro.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const result = await response.json();
    const insights = result.choices[0]?.message?.content || '';
    
    return {
      marketInsights: {
        aiInsights: insights,
        emergingTrends: extractTrends(insights),
        strategicRecommendations: extractRecommendations(insights)
      }
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      marketInsights: {}
    };
  }
}

// Extract trends from AI insights
function extractTrends(insights: string): string[] {
  const lines = insights.split('\n');
  const trends: string[] = [];
  let inTrends = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('tendência') || line.toLowerCase().includes('trend')) {
      inTrends = true;
      continue;
    }
    
    if (inTrends && (line.startsWith('- ') || line.match(/^\d+\./))) {
      trends.push(line.replace(/^[-\d.\s]+/, '').trim());
    } else if (inTrends && line.trim() === '') {
      break;
    }
  }
  
  return trends.slice(0, 5);
}

// Extract recommendations from AI insights
function extractRecommendations(insights: string): string[] {
  const lines = insights.split('\n');
  const recommendations: string[] = [];
  let inRecommendations = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recomenda') || line.toLowerCase().includes('estratég')) {
      inRecommendations = true;
      continue;
    }
    
    if (inRecommendations && (line.startsWith('- ') || line.match(/^\d+\./))) {
      recommendations.push(line.replace(/^[-\d.\s]+/, '').trim());
    } else if (inRecommendations && line.trim() === '') {
      break;
    }
  }
  
  return recommendations.slice(0, 5);
}