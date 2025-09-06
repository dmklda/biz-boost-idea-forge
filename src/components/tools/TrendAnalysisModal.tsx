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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrendAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrendAnalysisModal = ({ open, onOpenChange }: TrendAnalysisModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [industry, setIndustry] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<any>(null);
  
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
        p_amount: getFeatureCost('trend-analysis'),
        p_feature: 'trend-analysis',
        p_description: `Análise de tendências para ${selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar análise
      const { data, error } = await supabase.functions.invoke('generate-trend-analysis', {
        body: { 
          idea: selectedIdea,
          industry,
          timeframe
        }
      });

      if (error) throw error;

      setGeneratedAnalysis(data.analysis);
      toast({
        title: "Análise de tendências gerada!",
        description: `Foram deduzidos ${getFeatureCost('trend-analysis')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast({
        title: "Erro ao gerar análise",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedAnalysis) {
      navigator.clipboard.writeText(JSON.stringify(generatedAnalysis, null, 2));
      toast({
        title: "Análise copiada!",
        description: "A análise foi copiada para a área de transferência.",
      });
    }
  };

  const downloadAnalysis = () => {
    if (generatedAnalysis) {
      const dataStr = JSON.stringify(generatedAnalysis, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trend-analysis-${selectedIdea?.title || 'analysis'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (generatedAnalysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Análise de Tendências
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadAnalysis} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => setGeneratedAnalysis(null)} 
                variant="outline" 
                size="sm"
              >
                Nova Análise
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedAnalysis.currentTrends && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tendências Atuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.currentTrends.map((trend: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">Trend</Badge>
                          <p className="text-sm">{trend}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.emergingOpportunities && (
                <Card>
                  <CardHeader>
                    <CardTitle>Oportunidades Emergentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.emergingOpportunities.map((opportunity: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="default" className="mt-1">Oportunidade</Badge>
                          <p className="text-sm">{opportunity}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedAnalysis.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAnalysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">Ação</Badge>
                          <p className="text-sm">{rec}</p>
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
            <TrendingUp className="h-5 w-5 text-green-500" />
            Análise de Tendências
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Indústria</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a indústria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Tecnologia</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="healthcare">Saúde</SelectItem>
                  <SelectItem value="education">Educação</SelectItem>
                  <SelectItem value="retail">Varejo</SelectItem>
                  <SelectItem value="food">Alimentação</SelectItem>
                  <SelectItem value="logistics">Logística</SelectItem>
                  <SelectItem value="sustainability">Sustentabilidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período de Análise</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="next-3-years">Próximos 3 anos</SelectItem>
                  <SelectItem value="next-5-years">Próximos 5 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Custo: {getFeatureCost('trend-analysis')} créditos
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedIdea || isGenerating || !hasCredits('trend-analysis')}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar Tendências'
              )}
            </Button>
          </div>

          {!hasCredits('trend-analysis') && (
            <p className="text-sm text-red-600 text-center">
              Créditos insuficientes. <a href="/dashboard/credits" className="underline">Comprar créditos</a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};