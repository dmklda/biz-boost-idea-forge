import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Target, MessageSquare, BarChart3, Download, Loader2 } from "lucide-react";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface UserResearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserResearchModal = ({ open, onOpenChange }: UserResearchModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [research, setResearch] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { authState } = useAuth();
  const { hasCredits } = usePlanAccess();

  const deductCredits = async (featureType: string, itemId: string) => {
    try {
      const { data, error } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: 6,
        p_feature: featureType,
        p_item_id: itemId,
        p_description: 'Pesquisa de usuários gerada'
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

    if (!hasCredits('user-research')) {
      toast.error("Créditos insuficientes");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-user-research', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setResearch(data.research);
      await deductCredits('user-research', selectedIdea.id);
      toast.success("Pesquisa de usuários gerada com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar pesquisa de usuários");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pesquisa de Usuários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          {selectedIdea && !research && (
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
                    Gerando pesquisa...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Gerar Pesquisa de Usuários (6 créditos)
                  </>
                )}
              </Button>
            </div>
          )}

          {research && (
            <Tabs defaultValue="personas" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personas">Personas</TabsTrigger>
                <TabsTrigger value="journey">Jornada</TabsTrigger>
                <TabsTrigger value="research">Pesquisa</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="personas" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {research.personas?.map((persona: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                        <Badge variant="secondary">{persona.age} anos</Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{persona.description}</p>
                        <div>
                          <strong>Motivações:</strong>
                          <ul className="list-disc list-inside text-sm mt-1">
                            {persona.motivations?.map((motivation: string, i: number) => (
                              <li key={i}>{motivation}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Dores:</strong>
                          <ul className="list-disc list-inside text-sm mt-1">
                            {persona.painPoints?.map((pain: string, i: number) => (
                              <li key={i}>{pain}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="journey" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Jornada do Usuário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {research.userJourney?.map((step: any, index: number) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h4 className="font-semibold">{step.stage}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">
                              {step.emotion}
                            </Badge>
                            {step.touchpoints?.map((touchpoint: string, i: number) => (
                              <Badge key={i} variant="secondary" className="mr-1">
                                {touchpoint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="research" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Perguntas para Entrevistas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {research.interviewQuestions?.map((question: string, index: number) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{index + 1}.</span> {question}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Perguntas para Survey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {research.surveyQuestions?.map((question: string, index: number) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{index + 1}.</span> {question}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Principais Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Comportamentos Identificados</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {research.behaviors?.map((behavior: string, index: number) => (
                            <li key={index}>{behavior}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Métodos de Pesquisa Recomendados</h4>
                        <div className="flex flex-wrap gap-2">
                          {research.researchMethods?.map((method: string, index: number) => (
                            <Badge key={index} variant="outline">{method}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">KPIs para Medir Sucesso</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {research.kpis?.map((kpi: string, index: number) => (
                            <li key={index}>{kpi}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {research && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Pesquisa
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};