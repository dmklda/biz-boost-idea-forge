import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DollarSign, RefreshCw, TrendingUp, AlertTriangle, Calculator, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FinancialAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FinancialAnalysis {
  revenueModel: string;
  costStructure: string[];
  initialInvestment: string;
  monthlyOperatingCosts: string;
  revenueProjections: string[];
  breakEvenAnalysis: string;
  fundingRequirements: string;
  financialRisks: string[];
  profitabilityTimeline: string;
  keyMetrics: string[];
}

export const FinancialAnalysisModal: React.FC<FinancialAnalysisModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);

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

      const { data, error } = await supabase.functions.invoke('generate-financial-analysis', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
      toast.success("Análise financeira gerada com sucesso!");
    } catch (error) {
      console.error('Error generating financial analysis:', error);
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
            <DollarSign className="h-5 w-5 text-green-500" />
            Análise Financeira
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4" />
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
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Modelo de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.revenueModel}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-red-500" />
                    Investimento Inicial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-lg">{analysis.initialInvestment}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Ponto de Equilíbrio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.breakEvenAnalysis}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                    Necessidades de Financiamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.fundingRequirements}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-500" />
                    Estrutura de Custos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.costStructure?.map((cost, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">•</Badge>
                        <span className="text-sm">{cost}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Projeções de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.revenueProjections?.map((projection, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge className="mt-1">{index + 1}</Badge>
                        <span className="text-sm">{projection}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Riscos Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.financialRisks?.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="destructive" className="mt-1">!</Badge>
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Métricas Chave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.keyMetrics?.map((metric, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">📊</Badge>
                        <span className="text-sm">{metric}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Cronograma de Lucratividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.profitabilityTimeline}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};