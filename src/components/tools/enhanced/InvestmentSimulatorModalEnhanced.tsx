import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, TrendingUp, DollarSign, PieChart, BarChart4, Calculator, Plus, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvestmentSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvestmentSimulatorModalEnhanced = ({ open, onOpenChange }: InvestmentSimulatorModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [rounds, setRounds] = useState<string>("Seed, Series A, Series B");
  const [valuation, setValuation] = useState<string>("$1M");
  const [equityOffered, setEquityOffered] = useState<string>("20%");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSimulation, setGeneratedSimulation] = useState<any>(null);
  const [useCustomIdea, setUseCustomIdea] = useState(false);
  const [customIdeaDetails, setCustomIdeaDetails] = useState({
    title: "",
    description: "",
    industry: "",
    businessModel: "",
    targetMarket: ""
  });
  const [simulationType, setSimulationType] = useState<string>("standard");
  
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const { toast } = useToast();

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleGenerate = async () => {
    if (!useCustomIdea && !selectedIdea) {
      toast.error("Selecione uma ideia ou crie uma personalizada");
      return;
    }

    if (!hasCredits('investment-simulator')) {
      toast.error(`Você precisa de ${getFeatureCost('investment-simulator')} créditos para usar esta ferramenta`);
      return;
    }

    try {
      setIsGenerating(true);

      // Preparar a ideia a ser usada
      let ideaToUse;
      let descriptionText;

      if (useCustomIdea) {
        // Validar campos obrigatórios da ideia personalizada
        if (!customIdeaDetails.title || !customIdeaDetails.description) {
          toast.error("Preencha pelo menos o título e a descrição do seu negócio");
          setIsGenerating(false);
          return;
        }

        ideaToUse = {
          title: customIdeaDetails.title,
          description: customIdeaDetails.description,
          industry: customIdeaDetails.industry,
          businessModel: customIdeaDetails.businessModel,
          targetMarket: customIdeaDetails.targetMarket
        };
        descriptionText = `Simulação de investimento para ${customIdeaDetails.title}`;
      } else {
        ideaToUse = selectedIdea;
        descriptionText = `Simulação de investimento para ${selectedIdea.title}`;
      }

      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('investment-simulator'),
        p_feature: 'investment-simulator',
        p_description: descriptionText
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar simulação
      const { data, error } = await supabase.functions.invoke('generate-investment-simulator', {
        body: { 
          idea: ideaToUse,
          rounds,
          valuation,
          equityOffered,
          simulationType
        }
      });

      if (error) throw error;

      setGeneratedSimulation(data.simulation);
      toast({
        title: "Simulação gerada com sucesso!",
        description: `Foram deduzidos ${getFeatureCost('investment-simulator')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar simulação:', error);
      toast({
        title: "Erro ao gerar simulação",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setRounds("Seed, Series A, Series B");
    setValuation("$1M");
    setEquityOffered("20%");
    setGeneratedSimulation(null);
    setUseCustomIdea(false);
    setCustomIdeaDetails({
      title: "",
      description: "",
      industry: "",
      businessModel: "",
      targetMarket: ""
    });
    setSimulationType("standard");
  };

  const copyToClipboard = () => {
    if (generatedSimulation) {
      navigator.clipboard.writeText(JSON.stringify(generatedSimulation, null, 2));
      toast({
        title: "Simulação copiada!",
        description: "A simulação foi copiada para a área de transferência.",
      });
    }
  };

  const downloadSimulation = () => {
    if (generatedSimulation) {
      const dataStr = JSON.stringify(generatedSimulation, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `investment-simulation-${selectedIdea?.title || 'simulation'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Icon for the modal
  const simulatorIcon = <TrendingUp className="h-5 w-5 text-blue-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Simulador de Investimento"
      icon={simulatorIcon}
      isGenerating={isGenerating}
      generatingText="Simulando investimentos..."
      actionText="Simular Investimento"
      onAction={handleGenerate}
      actionDisabled={!selectedIdea || isGenerating || !hasCredits('investment-simulator')}
      resetText="Nova Simulação"
      onReset={handleReset}
      showReset={!!generatedSimulation}
      creditCost={getFeatureCost('investment-simulator')}
      maxWidth={generatedSimulation ? "4xl" : "2xl"}
    >
      {generatedSimulation ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Simulação de Investimento</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Copiar</span>
              </Button>
              <Button onClick={downloadSimulation} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="rounds" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="rounds">
                <DollarSign className="h-4 w-4 mr-2" />
                Rodadas
              </TabsTrigger>
              <TabsTrigger value="scenarios">
                <PieChart className="h-4 w-4 mr-2" />
                Cenários
              </TabsTrigger>
              <TabsTrigger value="projections">
                <BarChart4 className="h-4 w-4 mr-2" />
                Projeções
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="rounds" className="space-y-4 pr-4 pt-4">
                {generatedSimulation.rounds && (
                  <div className="space-y-3">
                    {generatedSimulation.rounds.map((round: any, index: number) => (
                      <Card key={index} className={index === 0 ? "border-primary" : ""}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              {round.name || `Rodada ${index + 1}`}
                            </div>
                            <Badge variant="secondary">{round.amount}</Badge>
                          </CardTitle>
                          {index === 0 && <CardDescription>Primeira rodada de investimento</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-muted rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">Valuation</div>
                              <div className="font-medium">{round.valuation}</div>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">Equity</div>
                              <div className="font-medium">{round.equity}</div>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">Diluição</div>
                              <div className="font-medium">{round.dilution}</div>
                            </div>
                          </div>
                          {round.investors && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-muted-foreground mb-2">Investidores Potenciais</div>
                              <div className="flex flex-wrap gap-2">
                                {round.investors.map((investor: string, i: number) => (
                                  <Badge key={i} variant="outline">{investor}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {generatedSimulation.fundingJourney && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Jornada de Financiamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedSimulation.fundingJourney.map((step: any, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{step.stage}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              {step.timeline && (
                                <Badge variant="outline" className="mt-1">{step.timeline}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-4 pr-4 pt-4">
                {generatedSimulation.scenarios && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(generatedSimulation.scenarios).map(([scenario, data]: [string, any]) => (
                      <Card key={scenario} className={scenario === 'realista' ? "border-primary" : ""}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base capitalize">{scenario}</CardTitle>
                          {scenario === 'realista' && <CardDescription>Cenário mais provável</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {typeof data === 'object' && Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                                <span className="text-sm">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {generatedSimulation.investorProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Perfil de Investidor Ideal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedSimulation.investorProfile.map((profile: any, index: number) => (
                          <div key={index} className="border-l-2 border-primary pl-4 py-1">
                            <h4 className="font-medium text-sm">{profile.type}</h4>
                            <p className="text-sm text-muted-foreground">{profile.description}</p>
                            {profile.expectations && (
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground mb-1">Expectativas:</div>
                                <div className="flex flex-wrap gap-1">
                                  {profile.expectations.map((exp: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="projections" className="space-y-4 pr-4 pt-4">
                {generatedSimulation.exitScenarios && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart4 className="h-4 w-4 text-blue-500" />
                        Projeções de Saída
                      </CardTitle>
                      <CardDescription>
                        Estimativas de retorno em diferentes cenários de saída
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedSimulation.exitScenarios.map((scenario: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">{scenario.type || `Cenário ${index + 1}`}</span>
                            <div className="text-sm">
                              <span className="text-green-600 font-medium">{scenario.returns}</span>
                              {scenario.multiple && (
                                <span className="text-muted-foreground ml-2">({scenario.multiple})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedSimulation.financialProjections && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Projeções Financeiras</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(generatedSimulation.financialProjections).map(([period, data]: [string, any]) => (
                          <div key={period} className="border rounded-lg p-3">
                            <h4 className="font-medium mb-2">{period}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {typeof data === 'object' && Object.entries(data).map(([key, value]) => (
                                <div key={key} className="bg-muted p-2 rounded-lg">
                                  <div className="text-xs text-muted-foreground mb-1">{key}</div>
                                  <div className="font-medium">{String(value)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedSimulation.keyMetrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Métricas-Chave</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {generatedSimulation.keyMetrics.map((metric: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">{metric.name}</div>
                            <div className="font-medium">{metric.value}</div>
                            {metric.description && (
                              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                            )}
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
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="saved" onValueChange={(value) => setUseCustomIdea(value === "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Usar Ideia Existente
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <Calculator className="h-4 w-4" />
                Simulação Personalizada
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-title" className="text-base font-medium">Nome do Negócio</Label>
                  <Input
                    id="business-title"
                    placeholder="Digite o nome do seu negócio"
                    value={customIdeaDetails.title}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, title: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="business-description" className="text-base font-medium">Descrição do Negócio</Label>
                  <Textarea
                    id="business-description"
                    placeholder="Descreva seu negócio em detalhes..."
                    value={customIdeaDetails.description}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, description: e.target.value})}
                    className="mt-2 min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-industry" className="text-sm font-medium">Indústria/Setor</Label>
                    <Input
                      id="business-industry"
                      placeholder="Ex: Fintech, SaaS, E-commerce"
                      value={customIdeaDetails.industry}
                      onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, industry: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="business-model" className="text-sm font-medium">Modelo de Negócio</Label>
                    <Input
                      id="business-model"
                      placeholder="Ex: SaaS, Marketplace, Assinatura"
                      value={customIdeaDetails.businessModel}
                      onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, businessModel: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="target-market" className="text-sm font-medium">Mercado-Alvo</Label>
                  <Input
                    id="target-market"
                    placeholder="Descreva seu público-alvo"
                    value={customIdeaDetails.targetMarket}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, targetMarket: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Parâmetros da Simulação</h3>
              <Select value={simulationType} onValueChange={setSimulationType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Simulação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="detailed">Detalhada</SelectItem>
                  <SelectItem value="conservative">Conservadora</SelectItem>
                  <SelectItem value="aggressive">Agressiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Rodadas Esperadas</Label>
                <Input 
                  value={rounds} 
                  onChange={(e) => setRounds(e.target.value)}
                  placeholder="Ex: Seed, Series A, Series B"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Valuation Inicial</Label>
                <Input 
                  value={valuation} 
                  onChange={(e) => setValuation(e.target.value)}
                  placeholder="Ex: $1M"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Equity por Rodada</Label>
                <Input 
                  value={equityOffered} 
                  onChange={(e) => setEquityOffered(e.target.value)}
                  placeholder="Ex: 20%"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolModalBase>
  );
};