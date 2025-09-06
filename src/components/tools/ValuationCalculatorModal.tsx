import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Target, Download, Loader2 } from "lucide-react";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface ValuationCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ValuationCalculatorModal = ({ open, onOpenChange }: ValuationCalculatorModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [valuation, setValuation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { authState } = useAuth();
  const { hasCredits } = usePlanAccess();

  const deductCredits = async (featureType: string, itemId: string) => {
    try {
      const { data, error } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: 7,
        p_feature: featureType,
        p_item_id: itemId,
        p_description: 'Análise de valuation gerada'
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

    if (!hasCredits('valuation-calculator')) {
      toast.error("Créditos insuficientes");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-valuation-calculator', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setValuation(data.valuation);
      await deductCredits('valuation-calculator', selectedIdea.id);
      toast.success("Análise de valuation gerada com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar análise de valuation");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Valuation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          {selectedIdea && !valuation && (
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
                    Calculando valuation...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Calcular Valuation (7 créditos)
                  </>
                )}
              </Button>
            </div>
          )}

          {valuation && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="methods">Métodos</TabsTrigger>
                <TabsTrigger value="projections">Projeções</TabsTrigger>
                <TabsTrigger value="risks">Riscos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5" />
                        Valuation Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(valuation.currentValuation || 0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Faixa de Valor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Mínimo:</span>
                          <span className="font-semibold">{formatCurrency(valuation.valuationRange?.min || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Provável:</span>
                          <span className="font-semibold">{formatCurrency(valuation.valuationRange?.probable || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Máximo:</span>
                          <span className="font-semibold">{formatCurrency(valuation.valuationRange?.max || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Próxima Rodada</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(valuation.nextRoundProjection?.valuation || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Em {valuation.nextRoundProjection?.timeframe || '12-18 meses'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Empresas Comparáveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {valuation.comparableCompanies?.map((company: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{company.name}</h4>
                            <p className="text-sm text-muted-foreground">{company.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(company.valuation)}</p>
                            <Badge variant="secondary">{company.multiple}x Revenue</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methods" className="space-y-4">
                <div className="grid gap-4">
                  {valuation.valuationMethods?.map((method: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          {method.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <div className="flex justify-between items-center">
                            <span>Valuation Estimado:</span>
                            <span className="text-lg font-bold">{formatCurrency(method.valuation)}</span>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-2">Múltiplos Aplicados:</h5>
                            <div className="grid gap-2 md:grid-cols-2">
                              {method.multiples?.map((multiple: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{multiple.metric}:</span>
                                  <span>{multiple.value}x</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="projections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Projeções de Receita (5 anos)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {valuation.revenueProjections?.map((projection: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-semibold">Ano {projection.year}</span>
                            <p className="text-sm text-muted-foreground">{projection.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(projection.revenue)}</p>
                            <Badge variant="outline">
                              {projection.growth > 0 ? '+' : ''}{projection.growth}% crescimento
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <Target className="h-5 w-5" />
                        Fatores de Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {valuation.riskFactors?.map((risk: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="h-5 w-5" />
                        Marcos de Valor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {valuation.milestones?.map((milestone: any, index: number) => (
                          <div key={index} className="border-l-2 border-green-500 pl-3">
                            <h5 className="font-semibold">{milestone.title}</h5>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            <Badge variant="secondary" className="mt-1">
                              +{milestone.valueIncrease}% valuation
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {valuation && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Análise
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};