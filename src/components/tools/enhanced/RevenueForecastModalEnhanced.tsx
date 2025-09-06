import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RevenueForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RevenueForecastModalEnhanced = ({ open, onOpenChange }: RevenueForecastModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [timeHorizon, setTimeHorizon] = useState<string>("");
  const [revenueModel, setRevenueModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForecast, setGeneratedForecast] = useState<any>(null);
  
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

  const handleReset = () => {
    setSelectedIdea(null);
    setTimeHorizon("");
    setRevenueModel("");
    setGeneratedForecast(null);
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

  // Icon for the modal
  const forecastIcon = <DollarSign className="h-5 w-5 text-green-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Previsão de Receita"
      icon={forecastIcon}
      isGenerating={isGenerating}
      generatingText="Projetando receitas..."
      actionText="Gerar Previsão"
      onAction={handleGenerate}
      actionDisabled={!selectedIdea || !timeHorizon || !revenueModel || isGenerating || !hasCredits('revenue-forecast')}
      resetText="Nova Previsão"
      onReset={handleReset}
      showReset={!!generatedForecast}
      creditCost={getFeatureCost('revenue-forecast')}
      maxWidth={generatedForecast ? "4xl" : "2xl"}
    >
      {generatedForecast ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={downloadForecast} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <div className="grid gap-4 pr-4">
              {generatedForecast.projections && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projeções por Cenário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </ScrollArea>
        </div>
      ) : (
        <div className="space-y-6">
          <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Horizonte Temporal</Label>
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
              <Label className="text-sm font-medium mb-2 block">Modelo de Receita</Label>
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
        </div>
      )}
    </ToolModalBase>
  );
};