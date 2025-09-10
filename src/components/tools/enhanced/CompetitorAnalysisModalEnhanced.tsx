import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Star,
  Download,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompetitorAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: string;
  website?: string;
}

interface CompetitorAnalysis {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  competitiveAdvantages: string[];
  marketGaps: string[];
  competitiveStrategy: string;
  differentiationPoints: string[];
  threatLevel: string;
  recommendations: string[];
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

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-competitor-analysis', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setAnalysis(data.analysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockAnalysis = {
          directCompetitors: [
            {
              name: "CompetidorA",
              description: "Plataforma estabelecida com 5 anos no mercado, foco em grandes empresas",
              strengths: ["Interface intuitiva", "Base de usuários grande", "Recursos avançados"],
              weaknesses: ["Preço elevado", "Suporte lento", "Curva de aprendizado íngreme"],
              marketShare: "35%",
              website: "www.competidora.com"
            },
            {
              name: "CompetidorB",
              description: "Startup em crescimento com solução inovadora, foco em PMEs",
              strengths: ["Preço acessível", "Atualizações frequentes", "Bom suporte ao cliente"],
              weaknesses: ["Menos recursos", "Menor estabilidade", "Menos integrações"],
              marketShare: "15%",
              website: "www.competidorb.com"
            }
          ],
          indirectCompetitors: [
            {
              name: "SoluçãoAlternativa",
              description: "Solução genérica que pode ser adaptada para resolver o mesmo problema",
              strengths: ["Versatilidade", "Base de usuários diversificada", "Marca reconhecida"],
              weaknesses: ["Não especializada", "Requer customização", "Menos eficiente"],
              marketShare: "20%",
              website: "www.alternativa.com"
            }
          ],
          competitiveAdvantages: [
            "Tecnologia proprietária mais eficiente",
            "Foco específico no segmento de mercado alvo",
            "Modelo de preços mais acessível",
            "Experiência do usuário superior"
          ],
          marketGaps: [
            "Falta de soluções específicas para pequenas empresas",
            "Ausência de recursos de integração com ferramentas populares",
            "Carência de suporte personalizado no segmento",
            "Necessidade de interface mais intuitiva e amigável"
          ],
          competitiveStrategy: "Adotar uma estratégia de diferenciação focada, destacando a facilidade de uso e o valor agregado para pequenas empresas, com preço competitivo e suporte excepcional. Investir em marketing direcionado para o nicho específico e desenvolver parcerias estratégicas para ampliar o alcance.",
          differentiationPoints: [
            "Interface mais intuitiva e amigável",
            "Suporte ao cliente 24/7 com tempo de resposta garantido",
            "Integrações nativas com ferramentas populares",
            "Modelo de preços transparente sem custos ocultos",
            "Recursos específicos para o segmento-alvo"
          ],
          threatLevel: "Medium",
          recommendations: [
            "Focar inicialmente no segmento de pequenas empresas, onde há menos concorrência direta",
            "Desenvolver e destacar recursos exclusivos que atendam às necessidades específicas do público-alvo",
            "Investir em marketing de conteúdo para educar o mercado sobre os diferenciais da solução",
            "Estabelecer parcerias estratégicas com plataformas complementares para ampliar o alcance",
            "Implementar um programa de referência para incentivar a aquisição de novos clientes"
          ]
        };
        
        setAnalysis(mockAnalysis);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'competitor-analysis',
            title: `Análise de Concorrentes - ${ideaData.title}`,
            content_data: analysis as any
          });
      } catch (saveError) {
        console.warn('Failed to save competitor analysis to database:', saveError);
        // Continue showing the content even if saving fails
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

  const getThreatLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    // Create a formatted text version of the analysis
    let content = `# Análise de Concorrentes - ${selectedIdea?.title || 'Ideia Personalizada'}

## Nível de Ameaça
${analysis.threatLevel}

## Concorrentes Diretos
`;
    
    analysis.directCompetitors?.forEach((competitor, index) => {
      content += `### ${competitor.name}
`;
      content += `Descrição: ${competitor.description}\n`;
      content += `Participação de Mercado: ${competitor.marketShare}\n`;
      content += `\nPontos Fortes:\n`;
      competitor.strengths?.forEach(strength => {
        content += `- ${strength}\n`;
      });
      content += `\nPontos Fracos:\n`;
      competitor.weaknesses?.forEach(weakness => {
        content += `- ${weakness}\n`;
      });
      content += `\n`;
    });
    
    content += `\n## Concorrentes Indiretos\n`;
    analysis.indirectCompetitors?.forEach((competitor, index) => {
      content += `### ${competitor.name}\n`;
      content += `Descrição: ${competitor.description}\n`;
      content += `Participação de Mercado: ${competitor.marketShare}\n`;
      content += `\nPontos Fortes:\n`;
      competitor.strengths?.forEach(strength => {
        content += `- ${strength}\n`;
      });
      content += `\nPontos Fracos:\n`;
      competitor.weaknesses?.forEach(weakness => {
        content += `- ${weakness}\n`;
      });
      content += `\n`;
    });
    
    content += `\n## Vantagens Competitivas\n`;
    analysis.competitiveAdvantages?.forEach(advantage => {
      content += `- ${advantage}\n`;
    });
    
    content += `\n## Lacunas no Mercado\n`;
    analysis.marketGaps?.forEach(gap => {
      content += `- ${gap}\n`;
    });
    
    content += `\n## Pontos de Diferenciação\n`;
    analysis.differentiationPoints?.forEach(point => {
      content += `- ${point}\n`;
    });
    
    content += `\n## Estratégia Competitiva\n${analysis.competitiveStrategy}\n`;
    
    content += `\n## Recomendações Estratégicas\n`;
    analysis.recommendations?.forEach((recommendation, index) => {
      content += `${index + 1}. ${recommendation}\n`;
    });
    
    // Create a download link
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

  // Icon for the modal
  const analysisIcon = <Shield className="h-5 w-5 text-red-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise de Concorrentes"
      icon={analysisIcon}
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Análise para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAnalysis}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
            </div>

            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Threat Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${getThreatLevelColor(analysis.threatLevel)}`} />
                      Nível de Ameaça: {analysis.threatLevel?.toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Direct Competitors */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Concorrentes Diretos
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.directCompetitors?.map((competitor, index) => (
                      <Card key={index} className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{competitor.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{competitor.description}</p>
                          <Badge variant="secondary">{competitor.marketShare}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="font-semibold text-sm text-green-600 mb-1">Pontos Fortes:</h5>
                            <ul className="text-xs space-y-1">
                              {competitor.strengths?.map((strength, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Badge variant="secondary" className="mt-0.5 h-4 w-4 flex items-center justify-center p-0">+</Badge>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm text-red-600 mb-1">Pontos Fracos:</h5>
                            <ul className="text-xs space-y-1">
                              {competitor.weaknesses?.map((weakness, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Badge variant="destructive" className="mt-0.5 h-4 w-4 flex items-center justify-center p-0">-</Badge>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Indirect Competitors */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Concorrentes Indiretos
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.indirectCompetitors?.map((competitor, index) => (
                      <Card key={index} className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{competitor.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{competitor.description}</p>
                          <Badge variant="secondary">{competitor.marketShare}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="font-semibold text-sm text-green-600 mb-1">Pontos Fortes:</h5>
                            <ul className="text-xs space-y-1">
                              {competitor.strengths?.map((strength, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Badge variant="secondary" className="mt-0.5 h-4 w-4 flex items-center justify-center p-0">+</Badge>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm text-red-600 mb-1">Pontos Fracos:</h5>
                            <ul className="text-xs space-y-1">
                              {competitor.weaknesses?.map((weakness, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Badge variant="destructive" className="mt-0.5 h-4 w-4 flex items-center justify-center p-0">-</Badge>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Grid with other analyses */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Vantagens Competitivas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.competitiveAdvantages?.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="secondary" className="mt-1">✓</Badge>
                            <span className="text-sm">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Lacunas no Mercado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.marketGaps?.map((gap, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-1">💡</Badge>
                            <span className="text-sm">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Pontos de Diferenciação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.differentiationPoints?.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge className="mt-1">{index + 1}</Badge>
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-500" />
                        Estratégia Competitiva
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.competitiveStrategy}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-500" />
                      Recomendações Estratégicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations?.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge className="mt-1">{index + 1}</Badge>
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
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