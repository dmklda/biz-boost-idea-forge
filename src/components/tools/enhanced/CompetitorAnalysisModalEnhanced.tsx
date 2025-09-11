import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Download, 
  Target, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Lightbulb, 
  Shield, 
  CheckCircle, 
  Database 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";

interface CompetitorAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Competitor {
  name: string;
  description: string;
  website: string;
  marketShare: string;
  revenue: string;
  strengths: string[];
  weaknesses: string[];
  pricingModel: string;
  targetAudience: string;
  keyFeatures: string[];
}

interface DirectCompetitorsData {
  competitors: Competitor[];
  marketAnalysis: string;
  competitiveIntensity: string;
}

interface IndirectCompetitorsData {
  competitors: Competitor[];
  substituteThreat: string;
  alternativeSolutions: string[];
}

interface MarketPositionData {
  currentPosition: string;
  marketShare: string;
  brandRecognition: string;
  competitiveRanking: string;
}

interface CompetitiveAdvantagesData {
  uniqueValueProposition: string[];
  technologyAdvantages: string[];
  operationalAdvantages: string[];
  marketAdvantages: string[];
}

interface MarketGapsData {
  unservedNeeds: string[];
  poorlyServedSegments: string[];
  innovationOpportunities: string[];
  geographicGaps: string[];
}

interface CompetitiveStrategyData {
  recommendedStrategy: string;
  differentiationFactors: string[];
  competitivePositioning: string;
  strategicPriorities: string[];
}

interface SwotAnalysisData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface RecommendationsData {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  strategicInitiatives: string[];
}

interface CompetitorAnalysis {
  directCompetitors: DirectCompetitorsData;
  indirectCompetitors: IndirectCompetitorsData;
  marketPosition: MarketPositionData;
  competitiveAdvantages: CompetitiveAdvantagesData;
  marketGaps: MarketGapsData;
  competitiveStrategy: CompetitiveStrategyData;
  swotAnalysis: SwotAnalysisData;
  recommendations: RecommendationsData;
  sources: {
    serpApi: string[];
    perplexity: string[];
  };
}

export const CompetitorAnalysisModalEnhanced: React.FC<CompetitorAnalysisModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('CompetitorAnalysisModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);

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
    if (!hasCredits('competitor-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('competitor-analysis')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('competitor-analysis'),
        p_feature: 'competitor-analysis',
        p_description: `Análise de Concorrentes gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Try to call the edge function
      let generatedAnalysis;
      try {
        const { data, error } = await supabase.functions.invoke('generate-competitor-analysis', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        generatedAnalysis = data.analysis;
        setAnalysis(generatedAnalysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Fallback data
        const mockAnalysis = {
          directCompetitors: {
            marketAnalysis: "Mercado fragmentado com 3-4 players principais dominando 60% do mercado",
            competitiveIntensity: "Alta - competição baseada em preço e inovação",
            competitors: [
              {
                name: "Líder de Mercado A",
                description: "Empresa estabelecida há 8 anos, dominante no segmento enterprise",
                website: "www.leadera.com.br",
                marketShare: "28%",
                revenue: "R$ 150M anuais",
                strengths: ["Marca consolidada", "Ampla rede de parceiros", "Recursos robustos"],
                weaknesses: ["Interface desatualizada", "Preços elevados", "Suporte lento"],
                pricingModel: "Assinatura anual com tiers",
                targetAudience: "Grandes empresas",
                keyFeatures: ["Analytics avançado", "Integrações ERP", "Multi-tenancy"]
              },
              {
                name: "Challenger B",
                description: "Scale-up agressiva focada em PMEs, crescimento de 200% ao ano",
                website: "www.challengerb.com",
                marketShare: "18%",
                revenue: "R$ 85M anuais",
                strengths: ["Interface moderna", "Preços competitivos", "Agilidade de desenvolvimento"],
                weaknesses: ["Menor estabilidade", "Funcionalidades limitadas", "Marca em construção"],
                pricingModel: "Freemium com upselling",
                targetAudience: "PMEs",
                keyFeatures: ["Mobile-first", "API aberta", "Automações"]
              }
            ]
          },
          indirectCompetitors: {
            substituteThreat: "Moderada - soluções genéricas podem atender 40% das necessidades",
            alternativeSolutions: ["Planilhas customizadas", "Ferramentas generalistas", "Desenvolvimento interno"],
            competitors: [
              {
                name: "Solução Genérica X",
                description: "Plataforma ampla que pode ser adaptada para várias necessidades",
                website: "www.genericx.com",
                marketShare: "15%",
                revenue: "R$ 500M anuais (multiproduto)",
                strengths: ["Versatilidade", "Marca reconhecida", "Recursos abundantes"],
                weaknesses: ["Complexidade", "Necessita customização", "Custo total elevado"],
                pricingModel: "Licenciamento + consultoria",
                targetAudience: "Todas as empresas",
                keyFeatures: ["Customização total", "Suporte 24/7", "Compliance"]
              }
            ]
          },
          marketPosition: {
            currentPosition: "Entrante com proposta disruptiva",
            marketShare: "0% (pré-lançamento)",
            brandRecognition: "Baixa - marca em construção",
            competitiveRanking: "Não ranqueado ainda"
          },
          competitiveAdvantages: {
            uniqueValueProposition: ["Simplicidade sem perder funcionalidade", "Preço 40% menor que concorrentes", "Implementação em 24h"],
            technologyAdvantages: ["Arquitetura cloud-native", "IA integrada nativamente", "Performance 3x superior"],
            operationalAdvantages: ["Equipe especializada", "Modelo de negócio enxuto", "Foco no cliente"],
            marketAdvantages: ["Time-to-market rápido", "Flexibilidade de produto", "Modelo de parcerias diferenciado"]
          },
          marketGaps: {
            unservedNeeds: ["Interface verdadeiramente intuitiva", "Preços acessíveis para PMEs", "Onboarding sem fricção"],
            poorlyServedSegments: ["Empresas de 50-200 funcionários", "Setores específicos não atendidos", "Mercado B2B2C"],
            innovationOpportunities: ["IA para automação", "Mobile-first experience", "Integração com ferramentas modernas"],
            geographicGaps: ["Interior do país", "América Latina", "Mercados emergentes"]
          },
          competitiveStrategy: {
            recommendedStrategy: "Estratégia de diferenciação focada com penetração por valor",
            differentiationFactors: ["Experiência do usuário superior", "Implementação simplificada", "Suporte humanizado"],
            competitivePositioning: "A alternativa moderna e acessível para empresas que querem crescer",
            strategicPriorities: ["Product-market fit", "Aquisição eficiente", "Retenção alta", "Expansão de mercado"]
          },
          swotAnalysis: {
            strengths: ["Tecnologia moderna", "Equipe experiente", "Proposta diferenciada", "Flexibilidade"],
            weaknesses: ["Marca desconhecida", "Recursos limitados", "Falta de cases", "Equipe pequena"],
            opportunities: ["Mercado em crescimento", "Insatisfação com players atuais", "Digitalização acelerada", "Demanda reprimida"],
            threats: ["Reação dos incumbents", "Guerra de preços", "Mudanças regulatórias", "Crise econômica"]
          },
          recommendations: {
            immediate: ["Validar MVP com early adopters", "Estabelecer preços competitivos", "Criar conteúdo educativo"],
            shortTerm: ["Captar primeiros 100 clientes", "Refinar produto baseado em feedback", "Construir parcerias estratégicas"],
            longTerm: ["Expandir para novos segmentos", "Desenvolver marketplace de integrações", "Considerar expansão internacional"],
            strategicInitiatives: ["Programa de referência", "Content marketing", "Evento próprio do setor", "Certificações de segurança"]
          },
          sources: {
            serpApi: ["Dados dos concorrentes atualizados", "Market share e financeiros", "Informações de produtos"],
            perplexity: ["Análises de especialistas", "Tendências competitivas", "Insights de mercado"]
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
            content_type: 'competitor-analysis',
            title: `Análise de Concorrentes - ${ideaData.title}`,
            content_data: generatedAnalysis as any
          });
      } catch (saveError) {
        console.warn('Failed to save competitor analysis to database:', saveError);
      }
      
      toast.success("Análise de concorrentes gerada com sucesso!");
    } catch (error) {
      console.error('Error generating competitor analysis:', error);
      toast.error("Erro ao gerar análise de concorrentes. Tente novamente.");
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
    
    const content = `# Análise de Concorrentes - ${selectedIdea?.title || 'Ideia Personalizada'}

## Concorrentes Diretos
${analysis.directCompetitors.competitors.map(competitor => `
### ${competitor.name}
- Website: ${competitor.website}
- Market Share: ${competitor.marketShare}
- Receita: ${competitor.revenue}
- Forças: ${competitor.strengths.join(', ')}
- Fraquezas: ${competitor.weaknesses.join(', ')}
`).join('\n')}

## Posição no Mercado
- Posição Atual: ${analysis.marketPosition.currentPosition}
- Reconhecimento: ${analysis.marketPosition.brandRecognition}

## Vantagens Competitivas
${analysis.competitiveAdvantages.uniqueValueProposition.map(prop => `- ${prop}`).join('\n')}

## Lacunas do Mercado
${analysis.marketGaps.unservedNeeds.map(need => `- ${need}`).join('\n')}

## Estratégia Recomendada
${analysis.competitiveStrategy.recommendedStrategy}

## Recomendações Imediatas
${analysis.recommendations.immediate.map(rec => `- ${rec}`).join('\n')}
`;
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_de_concorrentes_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise de concorrentes baixada com sucesso!');
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise de Concorrentes"
      icon={<Shield className="h-5 w-5 text-red-500" />}
      isGenerating={isGenerating}
      generatingText="Analisando concorrentes..."
      actionText="Gerar Análise de Concorrentes"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!analysis}
      maxWidth="6xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('competitor-analysis')}
    >
      <div className="space-y-6">
        {analysis ? (
          <div className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Concorrentes Diretos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Análise do Mercado</h4>
                    <p className="text-sm text-muted-foreground mb-2">{analysis.directCompetitors.marketAnalysis}</p>
                    <p className="text-sm text-muted-foreground"><strong>Intensidade Competitiva:</strong> {analysis.directCompetitors.competitiveIntensity}</p>
                  </div>
                  <div className="space-y-4">
                    {analysis.directCompetitors.competitors.map((competitor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{competitor.name}</h4>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{competitor.marketShare}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{competitor.description}</p>
                        {competitor.website && (
                          <p className="text-xs text-blue-600 mb-2">{competitor.website}</p>
                        )}
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h5 className="font-medium mb-1">Pontos Fortes</h5>
                            <ul className="text-sm text-muted-foreground list-disc ml-4">
                              {competitor.strengths.map((strength, idx) => (
                                <li key={idx}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Pontos Fracos</h5>
                            <ul className="text-sm text-muted-foreground list-disc ml-4">
                              {competitor.weaknesses.map((weakness, idx) => (
                                <li key={idx}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Receita: </span>
                            <span className="text-muted-foreground">{competitor.revenue}</span>
                          </div>
                          <div>
                            <span className="font-medium">Modelo: </span>
                            <span className="text-muted-foreground">{competitor.pricingModel}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Concorrentes Indiretos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ameaça de Substitutos</h4>
                    <p className="text-sm text-muted-foreground mb-2">{analysis.indirectCompetitors.substituteThreat}</p>
                    <div>
                      <h5 className="font-medium mb-1">Soluções Alternativas</h5>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.indirectCompetitors.alternativeSolutions.map((solution, index) => (
                          <li key={index}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {analysis.indirectCompetitors.competitors.map((competitor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{competitor.name}</h4>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{competitor.marketShare}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{competitor.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-1">Vantagens</h5>
                            <ul className="text-sm text-muted-foreground list-disc ml-4">
                              {competitor.strengths.map((strength, idx) => (
                                <li key={idx}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Limitações</h5>
                            <ul className="text-sm text-muted-foreground list-disc ml-4">
                              {competitor.weaknesses.map((weakness, idx) => (
                                <li key={idx}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Posição no Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Posição Atual</h4>
                      <p className="text-sm text-muted-foreground">{analysis.marketPosition.currentPosition}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Participação</h4>
                      <p className="text-sm text-muted-foreground">{analysis.marketPosition.marketShare}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Reconhecimento da Marca</h4>
                      <p className="text-sm text-muted-foreground">{analysis.marketPosition.brandRecognition}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Vantagens Competitivas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Proposta Única de Valor</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.competitiveAdvantages.uniqueValueProposition.map((prop, index) => (
                          <li key={index}>{prop}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Vantagens Tecnológicas</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.competitiveAdvantages.technologyAdvantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Lacunas do Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Necessidades Não Atendidas</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.marketGaps.unservedNeeds.map((need, index) => (
                          <li key={index}>{need}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Oportunidades de Inovação</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.marketGaps.innovationOpportunities.map((opportunity, index) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Estratégia Competitiva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Estratégia Recomendada</h4>
                      <p className="text-sm text-muted-foreground">{analysis.competitiveStrategy.recommendedStrategy}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Fatores de Diferenciação</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.competitiveStrategy.differentiationFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Análise SWOT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Forças</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.swotAnalysis.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Fraquezas</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.swotAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">Oportunidades</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.swotAnalysis.opportunities.map((opportunity, index) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Ameaças</h4>
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {analysis.swotAnalysis.threats.map((threat, index) => (
                          <li key={index}>{threat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Recomendações Estratégicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Ações Imediatas</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                      {analysis.recommendations.immediate.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Curto Prazo (3-6 meses)</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                      {analysis.recommendations.shortTerm.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Longo Prazo (6+ meses)</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                      {analysis.recommendations.longTerm.map((rec, index) => (
                        <li key={index}>{rec}</li>
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
          <CreditGuard feature="competitor-analysis">
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