import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Copy, 
  Download,
  LineChart,
  BarChart,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TrendAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TrendAnalysis {
  currentTrends: string[];
  emergingOpportunities: string[];
  recommendations: string[];
  marketSize?: {
    current: string;
    projected: string;
    cagr: string;
  };
  consumerBehavior?: string[];
  competitorMovements?: Array<{
    competitor: string;
    movement: string;
    impact: string;
  }>;
  regulatoryChanges?: string[];
  technologyTrends?: string[];
  riskFactors?: string[];
  timelineProjections?: Array<{
    timeframe: string;
    projection: string;
  }>;
}

export const TrendAnalysisModalEnhanced: React.FC<TrendAnalysisModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<TrendAnalysis | null>(null);
  
  // Configurações adicionais
  const [industry, setIndustry] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [customIndustry, setCustomIndustry] = useState<string>("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState<string>("");

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleFocusAreaChange = (value: string) => {
    if (focusAreas.includes(value)) {
      setFocusAreas(focusAreas.filter(area => area !== value));
    } else {
      setFocusAreas([...focusAreas, value]);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!selectedIdea) {
      toast.error("Selecione uma ideia primeiro");
      return;
    }

    if (!industry && !customIndustry) {
      toast.error("Selecione ou informe uma indústria");
      return;
    }

    if (!timeframe) {
      toast.error("Selecione um período de análise");
      return;
    }

    // Check credits
    if (!hasCredits('trend-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('trend-analysis')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('trend-analysis'),
        p_feature: 'trend-analysis',
        p_description: `Análise de tendências para: ${selectedIdea.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Generate analysis
      const { data, error } = await supabase.functions.invoke('generate-trend-analysis', {
        body: { 
          idea: selectedIdea,
          industry: industry === "other" ? customIndustry : industry,
          timeframe,
          focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
          additionalContext: additionalContext.trim() || undefined
        }
      });

      if (error) throw error;

      setGeneratedAnalysis(data.analysis);
      toast.success("Análise de tendências gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar análise de tendências:', error);
      toast.error("Erro ao gerar análise. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setIndustry("");
    setTimeframe("");
    setCustomIndustry("");
    setFocusAreas([]);
    setAdditionalContext("");
    setGeneratedAnalysis(null);
  };

  const copyToClipboard = () => {
    if (generatedAnalysis) {
      navigator.clipboard.writeText(JSON.stringify(generatedAnalysis, null, 2));
      toast.success("Análise copiada para a área de transferência!");
    }
  };

  const downloadAnalysis = () => {
    if (generatedAnalysis) {
      const dataStr = JSON.stringify(generatedAnalysis, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trend-analysis-${selectedIdea?.title || 'analysis'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Análise baixada com sucesso!");
    }
  };

  // Icon for the modal
  const trendIcon = <TrendingUp className="h-5 w-5 text-blue-500" />;

  // Renderização do formulário
  const renderForm = () => {
    return (
      <div className="space-y-6">
        <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Indústria</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a indústria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Tecnologia</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="healthcare">Saúde</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="retail">Varejo</SelectItem>
                <SelectItem value="food">Alimentação</SelectItem>
                <SelectItem value="logistics">Logística</SelectItem>
                <SelectItem value="sustainability">Sustentabilidade</SelectItem>
                <SelectItem value="other">Outra (especificar)</SelectItem>
              </SelectContent>
            </Select>

            {industry === "other" && (
              <div className="mt-2">
                <Input
                  placeholder="Especifique a indústria"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Período de Análise</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
                <SelectItem value="next-3-years">Próximos 3 anos</SelectItem>
                <SelectItem value="next-5-years">Próximos 5 anos</SelectItem>
                <SelectItem value="next-10-years">Próximos 10 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Áreas de Foco (opcional)</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "consumer-behavior", label: "Comportamento do Consumidor" },
              { id: "technology", label: "Tecnologia" },
              { id: "competition", label: "Concorrência" },
              { id: "regulation", label: "Regulamentação" },
              { id: "market-size", label: "Tamanho de Mercado" },
              { id: "risks", label: "Riscos" }
            ].map((area) => (
              <Badge 
                key={area.id} 
                variant={focusAreas.includes(area.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFocusAreaChange(area.id)}
              >
                {area.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Contexto Adicional (opcional)</Label>
          <Textarea
            placeholder="Informações adicionais relevantes para a análise..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="resize-none h-20"
          />
        </div>
      </div>
    );
  };

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!generatedAnalysis) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Análise de Tendências</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAnalysis}>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="current">Tendências Atuais</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="current" className="space-y-4 pr-4 pt-4">
              {generatedAnalysis.currentTrends?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Tendências Atuais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedAnalysis.currentTrends.map((trend, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                          <ArrowUpRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm">{trend}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.technologyTrends?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tendências Tecnológicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.technologyTrends.map((trend, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">Tech</Badge>
                          <p className="text-sm">{trend}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.consumerBehavior?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comportamento do Consumidor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.consumerBehavior.map((behavior, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">Consumidor</Badge>
                          <p className="text-sm">{behavior}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4 pr-4 pt-4">
              {generatedAnalysis.emergingOpportunities?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Oportunidades Emergentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedAnalysis.emergingOpportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                          <Badge variant="default" className="mt-1">Oportunidade</Badge>
                          <p className="text-sm">{opportunity}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.timelineProjections?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Projeções Temporais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedAnalysis.timelineProjections.map((projection, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4 py-1">
                          <h5 className="font-medium text-sm">{projection.timeframe}</h5>
                          <p className="text-sm text-muted-foreground">{projection.projection}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.riskFactors?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fatores de Risco</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowDownRight className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-4 pr-4 pt-4">
              {generatedAnalysis.marketSize && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-blue-500" />
                      Tamanho do Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="text-sm text-muted-foreground mb-1">Atual</h5>
                        <p className="text-lg font-semibold">{generatedAnalysis.marketSize.current}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="text-sm text-muted-foreground mb-1">Projetado</h5>
                        <p className="text-lg font-semibold">{generatedAnalysis.marketSize.projected}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="text-sm text-muted-foreground mb-1">CAGR</h5>
                        <p className="text-lg font-semibold">{generatedAnalysis.marketSize.cagr}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.competitorMovements?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Movimentos da Concorrência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedAnalysis.competitorMovements.map((movement, index) => (
                        <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                          <h5 className="font-medium text-sm">{movement.competitor}</h5>
                          <p className="text-sm text-muted-foreground mb-1">{movement.movement}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-muted-foreground">Impacto:</span>
                            <Badge 
                              variant={movement.impact.includes("Alto") ? "destructive" : 
                                     movement.impact.includes("Médio") ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {movement.impact}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.regulatoryChanges?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mudanças Regulatórias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.regulatoryChanges.map((change, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">Regulação</Badge>
                          <p className="text-sm">{change}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 pr-4 pt-4">
              {generatedAnalysis.recommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-green-500" />
                      Recomendações Estratégicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                          <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise de Tendências"
      icon={trendIcon}
      isGenerating={isGenerating}
      generatingText="Analisando tendências..."
      actionText="Gerar Análise"
      onAction={handleGenerate}
      actionDisabled={isGenerating || !selectedIdea || (!industry && !customIndustry) || !timeframe || !hasCredits('trend-analysis')}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!generatedAnalysis}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('trend-analysis')}
    >
      <div className="space-y-6">
        {generatedAnalysis ? renderGeneratedContent() : (
          <CreditGuard feature="trend-analysis">
            {renderForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};