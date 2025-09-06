import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { Input } from "@/components/ui/input";

interface InvestmentSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvestmentSimulatorModal = ({ open, onOpenChange }: InvestmentSimulatorModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [rounds, setRounds] = useState<string>("Seed, Series A, Series B");
  const [valuation, setValuation] = useState<string>("$1M");
  const [equityOffered, setEquityOffered] = useState<string>("20%");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSimulation, setGeneratedSimulation] = useState<any>(null);
  
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const { toast } = useToast();

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

  if (generatedSimulation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Simulação de Investimento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadSimulation} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => setGeneratedSimulation(null)} 
                variant="outline" 
                size="sm"
              >
                Nova Simulação
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedSimulation.rounds && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rodadas de Investimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedSimulation.rounds.map((round: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{round.name || `Rodada ${index + 1}`}</Badge>
                            <span className="text-sm font-medium">{round.amount}</span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-2 text-xs">
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
                    <div className="grid md:grid-cols-2 gap-4">
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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Simulador de Investimento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rodadas Esperadas</label>
              <Input 
                value={rounds} 
                onChange={(e) => setRounds(e.target.value)}
                placeholder="Ex: Seed, Series A, Series B"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Valuation Inicial</label>
              <Input 
                value={valuation} 
                onChange={(e) => setValuation(e.target.value)}
                placeholder="Ex: $1M"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Equity por Rodada</label>
              <Input 
                value={equityOffered} 
                onChange={(e) => setEquityOffered(e.target.value)}
                placeholder="Ex: 20%"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Custo: {getFeatureCost('investment-simulator')} créditos
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedIdea || isGenerating || !hasCredits('investment-simulator')}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                'Simular Investimento'
              )}
            </Button>
          </div>

          {!hasCredits('investment-simulator') && (
            <p className="text-sm text-red-600 text-center">
              Créditos insuficientes. <a href="/dashboard/credits" className="underline">Comprar créditos</a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};