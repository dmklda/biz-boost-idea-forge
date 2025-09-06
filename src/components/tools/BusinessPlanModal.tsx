import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Building, TrendingUp, Users, DollarSign, Download, Loader2 } from "lucide-react";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface BusinessPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BusinessPlanModal = ({ open, onOpenChange }: BusinessPlanModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { authState } = useAuth();
  const { hasCredits, deductCredits } = usePlanAccess();

  const handleGenerate = async () => {
    if (!selectedIdea) {
      toast.error("Selecione uma ideia primeiro");
      return;
    }

    if (!hasCredits('business-plan')) {
      toast.error("Créditos insuficientes");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setPlan(data.plan);
      await deductCredits('business-plan', selectedIdea.id);
      toast.success("Plano de negócios gerado com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar plano de negócios");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Plano de Negócios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          {selectedIdea && !plan && (
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
                    Gerando plano...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Gerar Plano de Negócios (12 créditos)
                  </>
                )}
              </Button>
            </div>
          )}

          {plan && (
            <Tabs defaultValue="executive" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="executive">Executivo</TabsTrigger>
                <TabsTrigger value="company">Empresa</TabsTrigger>
                <TabsTrigger value="market">Mercado</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="implementation">Implementação</TabsTrigger>
              </TabsList>

              <TabsContent value="executive" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Resumo Executivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.executiveSummary}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Descrição da Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.companyDescription}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Estrutura Organizacional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.organizationManagement}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Produtos e Serviços</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.serviceOffering}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Análise de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.marketAnalysis}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estratégia de Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.marketingStrategy}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Projeções Financeiras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.financialProjections}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Necessidades de Financiamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.fundingRequest}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="implementation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plano de Implementação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.implementation}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Apêndice</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.appendix}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {plan && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Plano Completo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};