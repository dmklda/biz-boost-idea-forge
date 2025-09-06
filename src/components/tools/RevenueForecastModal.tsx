import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RevenueForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RevenueForecastModal = ({ open, onOpenChange }: RevenueForecastModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [timeHorizon, setTimeHorizon] = useState<string>("");
  const [revenueModel, setRevenueModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForecast, setGeneratedForecast] = useState<any>(null);
  
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
        p_amount: getFeatureCost('revenue-forecast'),
        p_feature: 'revenue-forecast',
        p_description: `Previsão de receita para ${selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar previsão
      const { data, error } = await supabase.functions.invoke('generate-revenue-forecast', {
        body: { 
          idea: selectedIdea,
          timeHorizon,
          revenueModel
        }
      });

      if (error) throw error;

      setGeneratedForecast(data.forecast);
      toast({
        title: "Previsão de receita gerada!",
        description: `Foram deduzidos ${getFeatureCost('revenue-forecast')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar previsão:', error);
      toast({
        title: "Erro ao gerar previsão",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedForecast) {
      navigator.clipboard.writeText(JSON.stringify(generatedForecast, null, 2));
      toast({
        title: "Previsão copiada!",
        description: "A previsão foi copiada para a área de transferência.",
      });
    }
  };

  const downloadForecast = () => {
    if (generatedForecast) {
      const dataStr = JSON.stringify(generatedForecast, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-forecast-${selectedIdea?.title || 'forecast'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (generatedForecast) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Previsão de Receita
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadForecast} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => setGeneratedForecast(null)} 
                variant="outline" 
                size="sm"
              >
                Nova Previsão
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedForecast.projections && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projeções por Cenário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(generatedForecast.projections).map(([scenario, data]: [string, any]) => (
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

              {generatedForecast.revenueStreams && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fontes de Receita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedForecast.revenueStreams.map((stream: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary">{stream.name || `Stream ${index + 1}`}</Badge>
                          <span className="text-sm">{stream.description || stream}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedForecast.keyMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Principais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(generatedForecast.keyMetrics).map(([metric, value]) => (
                        <div key={metric} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{metric}:</span>
                          <span>{String(value)}</span>
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
            <DollarSign className="h-5 w-5 text-green-500" />
            Previsão de Receita
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Horizonte Temporal</label>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-year">1 ano</SelectItem>
                  <SelectItem value="2-years">2 anos</SelectItem>
                  <SelectItem value="3-years">3 anos</SelectItem>
                  <SelectItem value="5-years">5 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Modelo de Receita</label>
              <Select value={revenueModel} onValueChange={setRevenueModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Assinatura (SaaS)</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="advertising">Publicidade</SelectItem>
                  <SelectItem value="transaction">Transacional</SelectItem>
                  <SelectItem value="licensing">Licenciamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Custo: {getFeatureCost('revenue-forecast')} créditos
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedIdea || isGenerating || !hasCredits('revenue-forecast')}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Projetando...
                </>
              ) : (
                'Gerar Previsão'
              )}
            </Button>
          </div>

          {!hasCredits('revenue-forecast') && (
            <p className="text-sm text-red-600 text-center">
              Créditos insuficientes. <a href="/dashboard/credits" className="underline">Comprar créditos</a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};