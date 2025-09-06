import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Shield, RefreshCw, TrendingUp, AlertTriangle, Target, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompetitorAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: string;
  website?: string;
}

interface CompetitorAnalysis {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  competitiveAdvantages: string[];
  marketGaps: string[];
  competitiveStrategy: string;
  differentiationPoints: string[];
  threatLevel: string;
  recommendations: string[];
}

export const CompetitorAnalysisModal: React.FC<CompetitorAnalysisModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);

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

      const { data, error } = await supabase.functions.invoke('generate-competitor-analysis', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
      toast.success("Análise de concorrentes gerada com sucesso!");
    } catch (error) {
      console.error('Error generating competitor analysis:', error);
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

  const getThreatLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Análise de Concorrentes
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
            label="Selecione uma ideia para análise de concorrentes"
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
                <Shield className="h-4 w-4" />
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
            <div className="space-y-6">
              {/* Threat Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${getThreatLevelColor(analysis.threatLevel)}`} />
                    Nível de Ameaça: {analysis.threatLevel?.toUpperCase()}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Direct Competitors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Concorrentes Diretos</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {analysis.directCompetitors?.map((competitor, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{competitor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{competitor.description}</p>
                        <Badge variant="secondary">{competitor.marketShare}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-sm text-green-600 mb-1">Pontos Fortes:</h5>
                          <ul className="text-xs space-y-1">
                            {competitor.strengths?.map((strength, i) => (
                              <li key={i}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm text-red-600 mb-1">Pontos Fracos:</h5>
                          <ul className="text-xs space-y-1">
                            {competitor.weaknesses?.map((weakness, i) => (
                              <li key={i}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Grid with other analyses */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Vantagens Competitivas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.competitiveAdvantages?.map((advantage, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">✓</Badge>
                          <span className="text-sm">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Lacunas no Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.marketGaps?.map((gap, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">💡</Badge>
                          <span className="text-sm">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Pontos de Diferenciação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.differentiationPoints?.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge className="mt-1">{index + 1}</Badge>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-500" />
                      Estratégia Competitiva
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.competitiveStrategy}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-500" />
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