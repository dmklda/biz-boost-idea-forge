import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
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
  
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const { toast } = useToast();

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleGenerate = async () => {
    if (!selectedIdea) return;

    try {
      setIsGenerating(true);

      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('investment-simulator'),
        p_feature: 'investment-simulator',
        p_description: `Simulação de investimento para ${selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar simulação
      const { data, error } = await supabase.functions.invoke('generate-investment-simulator', {
        body: { 
          idea: selectedIdea,
          rounds,
          valuation,
          equityOffered
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
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={downloadSimulation} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <div className="grid gap-4 pr-4">
              {generatedSimulation.rounds && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rodadas de Investimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedSimulation.rounds.map((round: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary">{round.name || `Rodada ${index + 1}`}</Badge>
                            <span className="text-sm font-medium">{round.amount}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>Valuation: {round.valuation}</div>
                            <div>Equity: {round.equity}</div>
                            <div>Diluição: {round.dilution}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedSimulation.scenarios && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cenários de Saída</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(generatedSimulation.scenarios).map(([scenario, data]: [string, any]) => (
                        <div key={scenario} className="p-4 border rounded-lg">
                          <h4 className="font-semibold capitalize mb-2">{scenario}</h4>
                          <div className="space-y-1 text-sm">
                            {typeof data === 'object' && Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedSimulation.exitScenarios && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projeções de Saída</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedSimulation.exitScenarios.map((scenario: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{scenario.type || `Cenário ${index + 1}`}</span>
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">{scenario.returns}</span>
                            {scenario.multiple && (
                              <span className="text-gray-500 ml-2">({scenario.multiple})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="space-y-6">
          <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
          
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
      )}
    </ToolModalBase>
  );
};