import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Download, 
  Package, 
  Target, 
  Briefcase, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  FileText,
  Rocket,
  BarChart,
  Lightbulb,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StartupKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StartupKitModalEnhanced = ({ open, onOpenChange }: StartupKitModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKit, setGeneratedKit] = useState<any>(null);
  const [customIdeaValue, setCustomIdeaValue] = useState("");
  const [useCustomIdea, setUseCustomIdea] = useState(false);
  const [customIdeaDetails, setCustomIdeaDetails] = useState({
    title: "",
    description: "",
    audience: "",
    problem: "",
    monetization: ""
  });
  
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

    if (!hasCredits('startup-kit')) {
      toast.error(`Você precisa de ${getFeatureCost('startup-kit')} créditos para usar esta ferramenta`);
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
          toast.error("Preencha pelo menos o título e a descrição da sua ideia");
          setIsGenerating(false);
          return;
        }

        ideaToUse = customIdeaDetails;
        descriptionText = `Kit completo para ideia personalizada: ${customIdeaDetails.title}`;
      } else {
        ideaToUse = selectedIdea;
        descriptionText = `Kit completo para ${selectedIdea.title}`;
      }

      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('startup-kit'),
        p_feature: 'startup-kit',
        p_description: descriptionText
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar kit
      const { data, error } = await supabase.functions.invoke('generate-startup-kit', {
        body: { idea: ideaToUse }
      });

      if (error) throw error;

      setGeneratedKit(data.kit);
      toast({
        title: "Kit de startup gerado!",
        description: `Foram deduzidos ${getFeatureCost('startup-kit')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar kit:', error);
      toast({
        title: "Erro ao gerar kit",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setGeneratedKit(null);
    setUseCustomIdea(false);
    setCustomIdeaDetails({
      title: "",
      description: "",
      audience: "",
      problem: "",
      monetization: ""
    });
  };

  const copyToClipboard = () => {
    if (generatedKit) {
      navigator.clipboard.writeText(JSON.stringify(generatedKit, null, 2));
      toast({
        title: "Kit copiado!",
        description: "O kit foi copiado para a área de transferência.",
      });
    }
  };

  const downloadKit = () => {
    if (generatedKit) {
      const dataStr = JSON.stringify(generatedKit, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `startup-kit-${selectedIdea?.title || 'kit'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Icon for the modal
  const kitIcon = <Package className="h-5 w-5 text-orange-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Kit Completo de Startup"
      icon={kitIcon}
      isGenerating={isGenerating}
      generatingText="Gerando kit..."
      actionText="Gerar Kit Completo"
      onAction={handleGenerate}
      actionDisabled={!selectedIdea || isGenerating || !hasCredits('startup-kit')}
      resetText="Novo Kit"
      onReset={handleReset}
      showReset={!!generatedKit}
      creditCost={getFeatureCost('startup-kit')}
      maxWidth={generatedKit ? "4xl" : "2xl"}
      actionText={useCustomIdea ? "Gerar Kit para Nova Startup" : "Gerar Kit Completo"}
      actionDisabled={isGenerating || (!selectedIdea && !useCustomIdea) || (useCustomIdea && (!customIdeaDetails.title || !customIdeaDetails.description)) || !hasCredits('startup-kit')}
    >
      {generatedKit ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Kit Completo de Startup Premium</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Copiar</span>
              </Button>
              <Button onClick={downloadKit} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="essentials" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="essentials">Essenciais</TabsTrigger>
              <TabsTrigger value="strategy">Estratégia</TabsTrigger>
              <TabsTrigger value="launch">Lançamento</TabsTrigger>
              <TabsTrigger value="growth">Crescimento</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="essentials" className="space-y-4 pr-4 pt-4">
                {generatedKit.businessNames && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        Sugestões de Nome
                      </CardTitle>
                      <CardDescription>Nomes memoráveis e disponíveis para registro</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {generatedKit.businessNames.map((name: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-sm p-2">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedKit.mission && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Missão
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{generatedKit.mission}</p>
                      </CardContent>
                    </Card>
                  )}

                  {generatedKit.vision && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Rocket className="h-4 w-4 text-blue-500" />
                          Visão
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{generatedKit.vision}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {generatedKit.valuePropositions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Propostas de Valor
                      </CardTitle>
                      <CardDescription>Diferenciais competitivos do seu negócio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {generatedKit.valuePropositions.map((prop: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                            <Badge variant="secondary" className="mt-1">VP</Badge>
                            <p className="text-sm">{prop}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.legalStructure && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Estrutura Legal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">{generatedKit.legalStructure.recommendation}</p>
                        <div className="mt-2 pt-2 border-t">
                          <h5 className="text-sm font-medium mb-1">Documentos Necessários:</h5>
                          <ul className="space-y-1">
                            {generatedKit.legalStructure.documents?.map((doc: string, index: number) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4 pr-4 pt-4">
                {generatedKit.targetAudience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Público-Alvo
                      </CardTitle>
                      <CardDescription>Perfil detalhado dos seus clientes ideais</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedKit.targetAudience.segments?.map((segment: any, index: number) => (
                          <div key={index} className="border-l-2 border-primary pl-4 py-1">
                            <h5 className="font-medium text-sm">{segment.name}</h5>
                            <p className="text-sm text-muted-foreground">{segment.description}</p>
                            {segment.characteristics && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {segment.characteristics.map((char: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{char}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.mvpFeatures && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        Features do MVP
                      </CardTitle>
                      <CardDescription>Funcionalidades essenciais para validação</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {generatedKit.mvpFeatures.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50">
                            <Badge variant="default" className="text-xs">Feature</Badge>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.competitiveAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-blue-500" />
                        Análise Competitiva
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedKit.competitiveAnalysis.competitors?.map((competitor: any, index: number) => (
                          <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                            <h5 className="font-medium text-sm">{competitor.name}</h5>
                            <p className="text-sm text-muted-foreground mb-1">{competitor.description}</p>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-muted-foreground">Força:</span>
                              <Badge 
                                variant={competitor.strength === "Alta" ? "destructive" : 
                                       competitor.strength === "Média" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {competitor.strength}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="launch" className="space-y-4 pr-4 pt-4">
                {generatedKit.fundingStrategy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Estratégia de Funding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">{generatedKit.fundingStrategy.recommendation}</p>
                        <div className="mt-2 pt-2 border-t">
                          <h5 className="text-sm font-medium mb-1">Fontes Potenciais:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {generatedKit.fundingStrategy.sources?.map((source: any, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <Badge variant="outline" className="mt-1">{source.type}</Badge>
                                <div>
                                  <p className="text-sm font-medium">{source.name}</p>
                                  <p className="text-xs text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.launchChecklist && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Checklist de Lançamento
                      </CardTitle>
                      <CardDescription>Passos essenciais para um lançamento bem-sucedido</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {generatedKit.launchChecklist.map((item: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.marketingPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-orange-500" />
                        Plano de Marketing de Lançamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedKit.marketingPlan.channels?.map((channel: any, index: number) => (
                          <div key={index} className="border-l-2 border-primary pl-4 py-1">
                            <h5 className="font-medium text-sm">{channel.name}</h5>
                            <p className="text-sm text-muted-foreground">{channel.strategy}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-muted-foreground">Prioridade:</span>
                              <Badge 
                                variant={channel.priority === "Alta" ? "default" : 
                                       channel.priority === "Média" ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {channel.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="growth" className="space-y-4 pr-4 pt-4">
                {generatedKit.ninetyDayPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Plano para 90 Dias
                      </CardTitle>
                      <CardDescription>Roteiro detalhado para os primeiros 3 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {generatedKit.ninetyDayPlan.phases?.map((phase: any, index: number) => (
                          <div key={index} className="border-l-2 border-primary pl-4 py-1">
                            <h5 className="font-medium text-sm">{phase.name}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                            <div className="space-y-1">
                              {phase.tasks?.map((task: string, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-primary text-sm">•</span>
                                  <p className="text-sm">{task}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.keyMetrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-green-500" />
                        Métricas-Chave
                      </CardTitle>
                      <CardDescription>Indicadores essenciais para monitorar o progresso</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {generatedKit.keyMetrics.map((metric: any, index: number) => (
                          <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-sm">{metric.name}</span>
                              <p className="text-xs text-muted-foreground">{metric.description}</p>
                            </div>
                            {metric.target && (
                              <Badge variant="outline" className="self-start">
                                Meta: {metric.target}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.scalingStrategy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-blue-500" />
                        Estratégia de Escala
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{generatedKit.scalingStrategy.overview}</p>
                      <div className="space-y-3">
                        {generatedKit.scalingStrategy.milestones?.map((milestone: any, index: number) => (
                          <div key={index} className="border-l-2 border-primary pl-4 py-1">
                            <h5 className="font-medium text-sm">{milestone.name}</h5>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            {milestone.target && (
                              <Badge variant="outline" className="mt-1">
                                {milestone.target}
                              </Badge>
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
          <div className="text-center p-6 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Kit Completo Premium para Startups</h3>
            <p className="text-sm text-muted-foreground mb-4">Um pacote completo e estratégico com tudo que você precisa para lançar e escalar seu negócio com sucesso.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <Briefcase className="h-5 w-5 text-blue-500 mb-1" />
                <div>Identidade de Marca</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <Target className="h-5 w-5 text-blue-500 mb-1" />
                <div>Missão e Visão</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <FileText className="h-5 w-5 text-blue-500 mb-1" />
                <div>Estrutura Legal</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <Users className="h-5 w-5 text-blue-500 mb-1" />
                <div>Análise de Público</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                <div>MVP Detalhado</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <DollarSign className="h-5 w-5 text-green-500 mb-1" />
                <div>Estratégia de Funding</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <Rocket className="h-5 w-5 text-orange-500 mb-1" />
                <div>Plano de Marketing</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <Calendar className="h-5 w-5 text-blue-500 mb-1" />
                <div>Roadmap 90 Dias</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <BarChart className="h-5 w-5 text-green-500 mb-1" />
                <div>Métricas-Chave</div>
              </div>
              <div className="flex flex-col items-center p-2 bg-card rounded-lg shadow-sm border">
                <Rocket className="h-5 w-5 text-blue-500 mb-1" />
                <div>Estratégia de Escala</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-2">Premium</Badge>
              Desenvolvido por especialistas em startups e negócios digitais
            </div>
          </div>

          <Tabs defaultValue="saved" onValueChange={(value) => setUseCustomIdea(value === "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                Usar Ideia Existente
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Criar Nova Startup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startup-title" className="text-base font-medium">Nome da Startup</Label>
                  <Input
                    id="startup-title"
                    placeholder="Digite o nome da sua startup"
                    value={customIdeaDetails.title}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, title: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="startup-description" className="text-base font-medium">Descrição do Negócio</Label>
                  <Textarea
                    id="startup-description"
                    placeholder="Descreva sua ideia de negócio em detalhes..."
                    value={customIdeaDetails.description}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, description: e.target.value})}
                    className="mt-2 min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startup-audience" className="text-base font-medium">Público-Alvo</Label>
                    <Textarea
                      id="startup-audience"
                      placeholder="Quem são seus clientes ideais?"
                      value={customIdeaDetails.audience}
                      onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, audience: e.target.value})}
                      className="mt-2 min-h-[80px] resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startup-problem" className="text-base font-medium">Problema Resolvido</Label>
                    <Textarea
                      id="startup-problem"
                      placeholder="Qual problema sua startup resolve?"
                      value={customIdeaDetails.problem}
                      onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, problem: e.target.value})}
                      className="mt-2 min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="startup-monetization" className="text-base font-medium">Modelo de Monetização</Label>
                  <Textarea
                    id="startup-monetization"
                    placeholder="Como você planeja ganhar dinheiro? (ex: assinatura, freemium, marketplace)"
                    value={customIdeaDetails.monetization}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, monetization: e.target.value})}
                    className="mt-2 min-h-[80px] resize-none"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Dicas para uma startup de sucesso:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Foque em um problema específico e relevante</li>
                    <li>Conheça bem seu público-alvo</li>
                    <li>Tenha um modelo de negócio claro</li>
                    <li>Comece com um MVP (Produto Mínimo Viável)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ToolModalBase>
  );
};