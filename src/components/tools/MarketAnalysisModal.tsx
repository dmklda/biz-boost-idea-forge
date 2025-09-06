import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { TrendingUp, RefreshCw, Target, Shield, Lightbulb, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MarketAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MarketAnalysis {
  marketSize: string;
  targetAudience: string;
  marketTrends: string[];
  opportunities: string[];
  threats: string[];
  competitiveAdvantage: string[];
  entryBarriers: string[];
  recommendations: string[];
}

export const MarketAnalysisModal: React.FC<MarketAnalysisModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error("Selecione uma ideia ou digite uma descrição");
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error("Digite uma descrição da sua ideia");
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      const { data, error } = await supabase.functions.invoke('generate-market-analysis', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
      toast.success("Análise de mercado gerada com sucesso!");
    } catch (error) {
      console.error('Error generating market analysis:', error);
      toast.error("Erro ao gerar análise. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setAnalysis(null);
    setUseCustom(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Análise de Mercado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector 
            selectedIdea={selectedIdea}
            onSelectIdea={setSelectedIdea}
            customIdea={customIdea}
            onCustomIdeaChange={setCustomIdea}
            useCustom={useCustom}
            onUseCustomChange={setUseCustom}
            label="Selecione uma ideia para análise de mercado"
            placeholder="Ex: App de delivery para pets que conecta donos com cuidadores locais..."
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isGenerating ? "Analisando..." : "Gerar Análise"}
            </Button>
            
            {analysis && (
              <Button variant="outline" onClick={handleReset}>
                Nova Análise
              </Button>
            )}
          </div>

          {analysis && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Tamanho do Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.marketSize}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Público-Alvo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.targetAudience}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Tendências do Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.marketTrends?.map((trend, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">•</Badge>
                        <span className="text-sm">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Oportunidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.opportunities?.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">•</Badge>
                        <span className="text-sm">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Ameaças
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.threats?.map((threat, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="destructive" className="mt-1">•</Badge>
                        <span className="text-sm">{threat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Vantagens Competitivas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.competitiveAdvantage?.map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">•</Badge>
                        <span className="text-sm">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    Recomendações Estratégicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations?.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge className="mt-1">{index + 1}</Badge>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};