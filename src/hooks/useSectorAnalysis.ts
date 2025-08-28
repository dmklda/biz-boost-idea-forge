import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface SectorAnalysisData {
  sector: string;
  analysisType: string;
  analysis: string;
  specificMetrics: string[];
  keyConsiderations: string[];
  regulatoryFrameworks: string[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  nextSteps: string[];
  generatedAt: string;
}

export interface IdeaData {
  title: string;
  description: string;
  audience: string;
  problem: string;
  solution: string;
  monetization?: string;
  competition?: string;
  budget?: string;
  location?: string;
}

export type SectorType = 'fintech' | 'healthtech' | 'edtech' | 'sustainability' | 'ecommerce' | 'saas';
export type AnalysisType = 'comprehensive' | 'regulatory' | 'market' | 'technical' | 'competitive';

export const useSectorAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SectorAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performSectorAnalysis = async (
    ideaData: IdeaData,
    sector: SectorType,
    analysisType: AnalysisType = 'comprehensive',
    language: string = 'pt'
  ): Promise<SectorAnalysisData | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Starting ${analysisType} analysis for ${sector} sector`);
      
      const { data, error } = await supabase.functions.invoke('sector-analysis', {
        body: {
          ideaData,
          sector,
          analysisType,
          language
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro na análise setorial');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da análise');
      }

      setAnalysisResult(data);
      toast.success(`Análise ${getAnalysisTypeLabel(analysisType)} concluída!`);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na análise';
      setError(errorMessage);
      toast.error(`Erro na análise: ${errorMessage}`);
      console.error('Sector analysis error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSectorInfo = (sector: SectorType) => {
    const sectorInfo = {
      fintech: {
        name: 'FinTech',
        description: 'Tecnologia Financeira',
        icon: '💰',
        color: 'bg-green-500',
        keyAreas: ['Pagamentos', 'Investimentos', 'Crédito', 'Banking', 'Insurance']
      },
      healthtech: {
        name: 'HealthTech',
        description: 'Tecnologia em Saúde',
        icon: '🏥',
        color: 'bg-blue-500',
        keyAreas: ['Telemedicina', 'Diagnóstico', 'Gestão Hospitalar', 'Wearables', 'Farmácia Digital']
      },
      edtech: {
        name: 'EdTech',
        description: 'Tecnologia Educacional',
        icon: '📚',
        color: 'bg-purple-500',
        keyAreas: ['E-learning', 'Gestão Escolar', 'Gamificação', 'Avaliação', 'Capacitação Corporativa']
      },
      sustainability: {
        name: 'Sustentabilidade',
        description: 'Tecnologia Sustentável',
        icon: '🌱',
        color: 'bg-emerald-500',
        keyAreas: ['Energia Renovável', 'Economia Circular', 'Carbon Credits', 'Smart Cities', 'AgTech']
      },
      ecommerce: {
        name: 'E-commerce',
        description: 'Comércio Eletrônico',
        icon: '🛒',
        color: 'bg-orange-500',
        keyAreas: ['Marketplace', 'Logistics', 'Payment', 'CRM', 'Analytics']
      },
      saas: {
        name: 'SaaS',
        description: 'Software como Serviço',
        icon: '☁️',
        color: 'bg-indigo-500',
        keyAreas: ['Produtividade', 'CRM', 'ERP', 'Analytics', 'Comunicação']
      }
    };
    
    return sectorInfo[sector];
  };

  const getAnalysisTypeInfo = (analysisType: AnalysisType) => {
    const analysisInfo = {
      comprehensive: {
        name: 'Análise Abrangente',
        description: 'Análise completa cobrindo todos os aspectos do setor',
        icon: '🔍',
        estimatedTime: '3-5 minutos'
      },
      regulatory: {
        name: 'Análise Regulatória',
        description: 'Foco em compliance e aspectos regulamentares',
        icon: '⚖️',
        estimatedTime: '2-3 minutos'
      },
      market: {
        name: 'Análise de Mercado',
        description: 'Análise de mercado, competição e oportunidades',
        icon: '📊',
        estimatedTime: '2-3 minutos'
      },
      technical: {
        name: 'Análise Técnica',
        description: 'Aspectos técnicos e de implementação',
        icon: '⚙️',
        estimatedTime: '2-3 minutos'
      },
      competitive: {
        name: 'Análise Competitiva',
        description: 'Análise detalhada da concorrência',
        icon: '🏆',
        estimatedTime: '2-3 minutos'
      }
    };
    
    return analysisInfo[analysisType];
  };

  const getAnalysisTypeLabel = (analysisType: AnalysisType): string => {
    return getAnalysisTypeInfo(analysisType).name;
  };

  const getSectorLabel = (sector: SectorType): string => {
    return getSectorInfo(sector).name;
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const exportAnalysis = (format: 'json' | 'txt' = 'json') => {
    if (!analysisResult) {
      toast.error('Nenhuma análise para exportar');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(analysisResult, null, 2);
      filename = `analise-${analysisResult.sector}-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      content = formatAnalysisAsText(analysisResult);
      filename = `analise-${analysisResult.sector}-${Date.now()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Análise exportada com sucesso!');
  };

  const formatAnalysisAsText = (analysis: SectorAnalysisData): string => {
    return `
ANÁLISE SETORIAL - ${analysis.sector.toUpperCase()}
Tipo: ${getAnalysisTypeLabel(analysis.analysisType as AnalysisType)}
Gerado em: ${new Date(analysis.generatedAt).toLocaleString('pt-BR')}

${'='.repeat(50)}
ANÁLISE PRINCIPAL
${'='.repeat(50)}

${analysis.analysis}

${'='.repeat(50)}
RECOMENDAÇÕES
${'='.repeat(50)}

${analysis.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

${'='.repeat(50)}
RISCOS IDENTIFICADOS
${'='.repeat(50)}

${analysis.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}

${'='.repeat(50)}
OPORTUNIDADES
${'='.repeat(50)}

${analysis.opportunities.map((opp, i) => `${i + 1}. ${opp}`).join('\n')}

${'='.repeat(50)}
PRÓXIMOS PASSOS
${'='.repeat(50)}

${analysis.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${'='.repeat(50)}
MÉTRICAS ESPECÍFICAS DO SETOR
${'='.repeat(50)}

${analysis.specificMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

${'='.repeat(50)}
FRAMEWORKS REGULATÓRIOS
${'='.repeat(50)}

${analysis.regulatoryFrameworks.map((framework, i) => `${i + 1}. ${framework}`).join('\n')}

${'='.repeat(50)}
CONSIDERAÇÕES-CHAVE
${'='.repeat(50)}

${analysis.keyConsiderations.map((consideration, i) => `${i + 1}. ${consideration}`).join('\n')}
    `;
  };

  return {
    // State
    isLoading,
    analysisResult,
    error,
    
    // Actions
    performSectorAnalysis,
    clearAnalysis,
    exportAnalysis,
    
    // Utilities
    getSectorInfo,
    getAnalysisTypeInfo,
    getSectorLabel,
    getAnalysisTypeLabel
  };
};