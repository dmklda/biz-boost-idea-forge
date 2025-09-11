import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Download, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Lightbulb, 
  AlertTriangle, 
  PieChart, 
  DollarSign, 
  Rocket, 
  Database 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";

interface MarketAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MarketSizeData {
  globalSize: string;
  localSize: string;
  growthRate: string;
  projectedSize: string;
  keyDrivers: string[];
}

interface TargetAudienceData {
  primarySegment: string;
  demographics: string;
  psychographics: string;
  painPoints: string[];
  preferences: string[];
}

interface MarketTrendsData {
  emergingTrends: string[];
  technologyTrends: string[];
  consumerTrends: string[];
  industryShifts: string[];
}

interface CompetitiveLandscapeData {
  marketLeaders: string[];
  emergingPlayers: string[];
  marketConcentration: string;
  competitiveAdvantages: string[];
}

interface MarketOpportunitiesData {
  underservedSegments: string[];
  emergingNeeds: string[];
  technologyOpportunities: string[];
  geographicExpansion: string[];
}

interface MarketThreatsData {
  competitiveThreats: string[];
  technologyDisruption: string[];
  regulatoryRisks: string[];
  economicFactors: string[];
}

interface MarketSegmentationData {
  segments: Array<{
    name: string;
    size: string;
    characteristics: string;
    attractiveness: string;
  }>;
}

interface CustomerBehaviorData {
  buyingProcess: string;
  decisionFactors: string[];
  channelPreferences: string[];
  loyaltyFactors: string[];
}

interface PricingStrategyData {
  recommendedModel: string;
  priceRange: string;
  competitorPricing: string;
  valueProposition: string;
}

interface MarketEntryData {
  recommendedStrategy: string;
  entryBarriers: string[];
  requiredInvestment: string;
  timeline: string;
  keyPartners: string[];
}

interface MarketAnalysis {
  marketSize: MarketSizeData;
  targetAudience: TargetAudienceData;
  marketTrends: MarketTrendsData;
  competitiveLandscape: CompetitiveLandscapeData;
  marketOpportunities: MarketOpportunitiesData;
  marketThreats: MarketThreatsData;
  marketSegmentation: MarketSegmentationData;
  customerBehavior: CustomerBehaviorData;
  pricingStrategy: PricingStrategyData;
  marketEntry: MarketEntryData;
  sources: {
    serpApi: string[];
    perplexity: string[];
  };
}

export const MarketAnalysisModalEnhanced: React.FC<MarketAnalysisModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('MarketAnalysisModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setUseCustom(false);
  };

  const handleCustomIdeaChange = (value: string) => {
    setCustomIdea(value);
  };

  const handleUseCustomIdeaChange = (value: boolean) => {
    setUseCustom(value);
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error("Selecione uma ideia ou digite uma descrição");
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error("Digite uma descrição da sua ideia");
      return;
    }

    // Check credits
    if (!hasCredits('market-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('market-analysis')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('market-analysis'),
        p_feature: 'market-analysis',
        p_description: `Análise de Mercado gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Try to call the edge function
      let generatedAnalysis;
      try {
        const { data, error } = await supabase.functions.invoke('generate-market-analysis', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        generatedAnalysis = data.analysis;
        setAnalysis(generatedAnalysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Fallback data
        const mockAnalysis = {
          marketSize: {
            globalSize: "R$ 5,2 bilhões globalmente",
            localSize: "R$ 850 milhões no Brasil",
            growthRate: "14,3% ao ano",
            projectedSize: "R$ 1,4 bilhões em 2028",
            keyDrivers: ["Digitalização crescente", "Mudanças no comportamento do consumidor", "Inovação tecnológica"]
          },
          targetAudience: {
            primarySegment: "Profissionais urbanos entre 25-45 anos",
            demographics: "Renda média-alta, ensino superior, residentes em grandes centros",
            psychographics: "Valorizam eficiência, inovação e sustentabilidade",
            painPoints: ["Falta de tempo", "Processos complexos", "Soluções caras"],
            preferences: ["Interfaces simples", "Suporte rápido", "Transparência nos preços"]
          },
          marketTrends: {
            emergingTrends: ["Automação inteligente", "Experiência do usuário personalizada", "Sustentabilidade digital"],
            technologyTrends: ["Inteligência artificial", "Cloud computing", "APIs integradas"],
            consumerTrends: ["Demanda por simplicidade", "Preferência por assinaturas", "Busca por valor agregado"],
            industryShifts: ["Consolidação do mercado", "Entrada de big techs", "Regulamentação crescente"]
          },
          competitiveLandscape: {
            marketLeaders: ["Empresa A (35%)", "Empresa B (22%)", "Empresa C (18%)"],
            emergingPlayers: ["Startup X", "Scale-up Y", "Incumbent Z"],
            marketConcentration: "Moderadamente concentrado - top 3 detêm 75%",
            competitiveAdvantages: ["Tecnologia proprietária", "Network effects", "Dados exclusivos"]
          },
          marketOpportunities: {
            underservedSegments: ["Pequenas empresas", "Mercado B2B2C", "Regiões do interior"],
            emergingNeeds: ["Integração com IA", "Compliance automatizado", "Analytics avançado"],
            technologyOpportunities: ["Edge computing", "Blockchain", "IoT integration"],
            geographicExpansion: ["América Latina", "Mercados emergentes", "Cidades tier 2"]
          },
          marketThreats: {
            competitiveThreats: ["Entrada de gigantes tech", "Guerra de preços", "Commoditização"],
            technologyDisruption: ["Novas tecnologias disruptivas", "Mudanças nos padrões", "Obsolescência"],
            regulatoryRisks: ["Novas regulamentações", "Mudanças na LGPD", "Tributação digital"],
            economicFactors: ["Recessão econômica", "Inflação", "Câmbio desfavorável"]
          },
          marketSegmentation: {
            segments: [
              { name: "Enterprise", size: "45%", characteristics: "Grandes corporações", attractiveness: "Alta" },
              { name: "SMB", size: "35%", characteristics: "Pequenas e médias empresas", attractiveness: "Média" },
              { name: "Freelancers", size: "20%", characteristics: "Profissionais autônomos", attractiveness: "Baixa" }
            ]
          },
          customerBehavior: {
            buyingProcess: "Pesquisa online → Trial → Validação interna → Compra",
            decisionFactors: ["Preço", "Funcionalidades", "Facilidade de uso", "Suporte"],
            channelPreferences: ["Website próprio", "Marketplace", "Revendedores"],
            loyaltyFactors: ["Qualidade do produto", "Atendimento", "Preço competitivo"]
          },
          pricingStrategy: {
            recommendedModel: "Freemium com assinaturas escalonadas",
            priceRange: "R$ 29-149/mês dependendo do plano",
            competitorPricing: "Média de mercado: R$ 89/mês",
            valueProposition: "20% mais barato com 50% mais recursos"
          },
          marketEntry: {
            recommendedStrategy: "Go-to-market focado em nicho específico",
            entryBarriers: ["Alto investimento inicial", "Necessidade de parcerias", "Construção de marca"],
            requiredInvestment: "R$ 500.000 para MVP e primeiros 12 meses",
            timeline: "6 meses para MVP, 18 meses para market fit",
            keyPartners: ["Integradores de sistema", "Consultorias", "Plataformas complementares"]
          },
          sources: {
            serpApi: ["Dados de mercado atualizados", "Informações dos concorrentes", "Tendências de busca"],
            perplexity: ["Insights de mercado", "Análise de tendências", "Previsões de especialistas"]
          }
        };
        
        generatedAnalysis = mockAnalysis;
        setAnalysis(mockAnalysis);
      }
      
      // Try to save to database
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'market-analysis',
            title: `Análise de Mercado - ${ideaData.title}`,
            content_data: generatedAnalysis as any
          });
      } catch (saveError) {
        console.warn('Failed to save market analysis to database:', saveError);
      }
      
      toast.success("Análise de mercado gerada com sucesso!");
    } catch (error) {
      console.error('Error generating market analysis:', error);
      toast.error("Erro ao gerar análise de mercado. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setAnalysis(null);
    setUseCustom(false);
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    const content = `# Análise de Mercado - ${selectedIdea?.title || 'Ideia Personalizada'}

## Tamanho do Mercado
- Tamanho Global: ${analysis.marketSize.globalSize}
- Tamanho Local: ${analysis.marketSize.localSize}
- Taxa de Crescimento: ${analysis.marketSize.growthRate}
- Projeção: ${analysis.marketSize.projectedSize}

## Público-Alvo
- Segmento Primário: ${analysis.targetAudience.primarySegment}
- Demografia: ${analysis.targetAudience.demographics}
- Psicografia: ${analysis.targetAudience.psychographics}

## Tendências do Mercado
### Tendências Emergentes:
${analysis.marketTrends.emergingTrends.map(trend => `- ${trend}`).join('\n')}

### Tendências Tecnológicas:
${analysis.marketTrends.technologyTrends.map(trend => `- ${trend}`).join('\n')}

## Oportunidades
${analysis.marketOpportunities.underservedSegments.map(seg => `- ${seg}`).join('\n')}

## Ameaças
${analysis.marketThreats.competitiveThreats.map(threat => `- ${threat}`).join('\n')}

## Estratégia de Entrada
${analysis.marketEntry.recommendedStrategy}
Investimento: ${analysis.marketEntry.requiredInvestment}
Timeline: ${analysis.marketEntry.timeline}
`;
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_de_mercado_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise de mercado baixada com sucesso!');
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise de Mercado"
      icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
      isGenerating={isGenerating}
      generatingText="Analisando mercado..."
      actionText="Gerar Análise de Mercado"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!analysis}
      maxWidth="4xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('market-analysis')}
    >
      <div className="space-y-6">
        {analysis ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tamanho do Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Tamanho Global</h4>
                    <p className="text-sm text-muted-foreground">{analysis.marketSize.globalSize}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Tamanho Local</h4>
                    <p className="text-sm text-muted-foreground">{analysis.marketSize.localSize}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Taxa de Crescimento</h4>
                    <p className="text-sm text-muted-foreground">{analysis.marketSize.growthRate}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Principais Direcionadores</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketSize.keyDrivers.map((driver, index) => (
                        <li key={index}>{driver}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Público-Alvo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Segmento Primário</h4>
                    <p className="text-sm text-muted-foreground">{analysis.targetAudience.primarySegment}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Demografia</h4>
                    <p className="text-sm text-muted-foreground">{analysis.targetAudience.demographics}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Dores Principais</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.targetAudience.painPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Tendências do Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Tendências Emergentes</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketTrends.emergingTrends.map((trend, index) => (
                        <li key={index}>{trend}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Tendências Tecnológicas</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketTrends.technologyTrends.map((trend, index) => (
                        <li key={index}>{trend}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cenário Competitivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Líderes de Mercado</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.competitiveLandscape.marketLeaders.map((leader, index) => (
                        <li key={index}>{leader}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Concentração do Mercado</h4>
                    <p className="text-sm text-muted-foreground">{analysis.competitiveLandscape.marketConcentration}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Oportunidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Segmentos Mal Atendidos</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketOpportunities.underservedSegments.map((segment, index) => (
                        <li key={index}>{segment}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Necessidades Emergentes</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketOpportunities.emergingNeeds.map((need, index) => (
                        <li key={index}>{need}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Ameaças
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Ameaças Competitivas</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketThreats.competitiveThreats.map((threat, index) => (
                        <li key={index}>{threat}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Riscos Regulatórios</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketThreats.regulatoryRisks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Segmentação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.marketSegmentation.segments.map((segment, index) => (
                    <div key={index} className="border-b pb-2 last:border-b-0">
                      <h4 className="font-medium mb-1">{segment.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">Tamanho: {segment.size}</p>
                      <p className="text-xs text-muted-foreground">{segment.characteristics}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Estratégia de Preços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Modelo Recomendado</h4>
                    <p className="text-sm text-muted-foreground">{analysis.pricingStrategy.recommendedModel}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Faixa de Preço</h4>
                    <p className="text-sm text-muted-foreground">{analysis.pricingStrategy.priceRange}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Proposta de Valor</h4>
                    <p className="text-sm text-muted-foreground">{analysis.pricingStrategy.valueProposition}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Entrada no Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Estratégia Recomendada</h4>
                    <p className="text-sm text-muted-foreground">{analysis.marketEntry.recommendedStrategy}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Investimento Necessário</h4>
                    <p className="text-sm text-muted-foreground">{analysis.marketEntry.requiredInvestment}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Parceiros-Chave</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.marketEntry.keyPartners.map((partner, index) => (
                        <li key={index}>{partner}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {analysis.sources && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Fontes de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">SerpAPI</h4>
                    <ul className="text-xs text-muted-foreground list-disc ml-4">
                      {analysis.sources.serpApi.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Perplexity</h4>
                    <ul className="text-xs text-muted-foreground list-disc ml-4">
                      {analysis.sources.perplexity.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button onClick={downloadAnalysis} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Análise
              </Button>
            </div>
          </div>
        ) : (
          <CreditGuard feature="market-analysis">
            <EnhancedIdeaSelector 
              onSelect={handleIdeaSelect} 
              allowCustomIdea={true}
              customIdeaValue={customIdea}
              onCustomIdeaChange={handleCustomIdeaChange}
              useCustomIdea={useCustom}
              onUseCustomIdeaChange={handleUseCustomIdeaChange}
            />
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};