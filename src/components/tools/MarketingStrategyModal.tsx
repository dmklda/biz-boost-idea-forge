import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, Calendar, DollarSign, Download, Loader2 } from "lucide-react";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface MarketingStrategyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MarketingStrategyModal = ({ open, onOpenChange }: MarketingStrategyModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { authState } = useAuth();
  const { hasCredits } = usePlanAccess();

  const deductCredits = async (featureType: string, itemId: string) => {
    try {
      const { data, error } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: 8,
        p_feature: featureType,
        p_item_id: itemId,
        p_description: 'Estratégia de marketing gerada'
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error deducting credits:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedIdea) {
      toast.error("Selecione uma ideia primeiro");
      return;
    }

    if (!hasCredits('marketing-strategy')) {
      toast.error("Créditos insuficientes");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-marketing-strategy', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setStrategy(data.strategy);
      await deductCredits('marketing-strategy', selectedIdea.id);
      toast.success("Estratégia de marketing gerada com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar estratégia de marketing");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estratégia de Marketing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          {selectedIdea && !strategy && (
            <div className="text-center py-8">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando estratégia...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    Gerar Estratégia de Marketing (8 créditos)
                  </>
                )}
              </Button>
            </div>
          )}

          {strategy && (
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="goals">Objetivos</TabsTrigger>
                <TabsTrigger value="channels">Canais</TabsTrigger>
                <TabsTrigger value="timeline">Cronograma</TabsTrigger>
                <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Objetivos SMART
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strategy.marketingGoals?.map((goal: any, index: number) => (
                        <div key={index} className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">Meta: {goal.target}</Badge>
                            <Badge variant="secondary">Prazo: {goal.timeframe}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Segmentos de Mercado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {strategy.targetSegments?.map((segment: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h4 className="font-semibold">{segment.name}</h4>
                          <p className="text-sm text-muted-foreground">{segment.description}</p>
                          <div className="mt-2">
                            <Badge variant={segment.priority === 'high' ? 'default' : 'secondary'}>
                              Prioridade {segment.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>KPIs Principais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {strategy.kpis?.map((kpi: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm">{kpi}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="channels" className="space-y-4">
                <div className="grid gap-4">
                  {strategy.channels?.map((channel: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {channel.name}
                          <Badge variant={channel.priority === 'high' ? 'default' : 'secondary'}>
                            {channel.priority} prioridade
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                          
                          <div>
                            <h5 className="font-semibold mb-2">Táticas Recomendadas:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {channel.tactics?.map((tactic: string, i: number) => (
                                <li key={i}>{tactic}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-sm">Orçamento: {channel.budget}</span>
                            </div>
                            <Badge variant="outline">ROI esperado: {channel.expectedROI}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Alocação de Orçamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {strategy.budgetAllocation?.map((allocation: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{allocation.channel}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${allocation.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{allocation.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Cronograma de 12 Meses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strategy.timeline?.map((period: any, index: number) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{period.period}</h4>
                            <Badge variant="outline">{period.focus}</Badge>
                          </div>
                          <ul className="text-sm space-y-1">
                            {period.activities?.map((activity: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campaigns" className="space-y-4">
                <div className="grid gap-4">
                  {strategy.campaigns?.map((campaign: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{campaign.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                          
                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <h5 className="font-semibold mb-1">Objetivo:</h5>
                              <p className="text-sm">{campaign.objective}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold mb-1">Público:</h5>
                              <p className="text-sm">{campaign.audience}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold mb-1">Duração:</h5>
                              <p className="text-sm">{campaign.duration}</p>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold mb-2">Canais:</h5>
                            <div className="flex flex-wrap gap-2">
                              {campaign.channels?.map((channel: string, i: number) => (
                                <Badge key={i} variant="secondary">{channel}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold mb-2">Métricas de Sucesso:</h5>
                            <ul className="list-disc list-inside text-sm">
                              {campaign.metrics?.map((metric: string, i: number) => (
                                <li key={i}>{metric}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {strategy && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Estratégia
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};