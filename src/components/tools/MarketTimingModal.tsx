import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface MarketTimingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimingFactor {
  factor: string;
  score: number;
  description: string;
  impact: 'Positivo' | 'Negativo' | 'Neutro';
}

interface LaunchWindow {
  period: string;
  score: number;
  reasoning: string;
  opportunities: string[];
  risks: string[];
}

interface TimingResults {
  overall_score: number;
  recommendation: string;
  timing_factors: TimingFactor[];
  best_launch_windows: LaunchWindow[];
  market_readiness: {
    technology: number;
    consumer_demand: number;
    competitive_landscape: number;
    regulatory_environment: number;
  };
  strategic_recommendations: string[];
  early_indicators: string[];
  risk_mitigation: string[];
}

export const MarketTimingModal: React.FC<MarketTimingModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TimingResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    industry: '',
    target_market: '',
    technology_requirements: '',
    competitive_landscape: '',
    market_trends: '',
    regulatory_factors: '',
    funding_requirements: '',
    team_readiness: ''
  });

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (!formData.business_idea.trim()) {
      toast.error("Por favor, descreva sua ideia de negócio");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-market-timing', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Análise de timing gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast.error("Erro ao gerar análise. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      industry: '',
      target_market: '',
      technology_requirements: '',
      competitive_landscape: '',
      market_trends: '',
      regulatory_factors: '',
      funding_requirements: '',
      team_readiness: ''
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'Positivo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Negativo': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const cost = 14;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Timing de Mercado
          </DialogTitle>
          <DialogDescription>
            Determine o momento ideal para lançar sua startup baseado em fatores de mercado.
            <Badge variant="secondary" className="ml-2">{cost} créditos</Badge>
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_idea">Ideia de Negócio *</Label>
                <Textarea
                  id="business_idea"
                  placeholder="Descreva sua ideia de negócio em detalhes..."
                  value={formData.business_idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_idea: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Setor/Indústria</Label>
                <Input
                  id="industry"
                  placeholder="Ex: Fintech, EdTech, HealthTech, E-commerce"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_market">Mercado-Alvo</Label>
                <Textarea
                  id="target_market"
                  placeholder="Descreva seu público-alvo e tamanho do mercado"
                  value={formData.target_market}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_market: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technology_requirements">Requisitos Tecnológicos</Label>
                <Textarea
                  id="technology_requirements"
                  placeholder="Que tecnologias são necessárias? Qual o nível de maturidade?"
                  value={formData.technology_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, technology_requirements: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitive_landscape">Cenário Competitivo</Label>
                <Textarea
                  id="competitive_landscape"
                  placeholder="Principais concorrentes, saturação do mercado, barreiras de entrada"
                  value={formData.competitive_landscape}
                  onChange={(e) => setFormData(prev => ({ ...prev, competitive_landscape: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="market_trends">Tendências de Mercado</Label>
                <Textarea
                  id="market_trends"
                  placeholder="Tendências relevantes, mudanças de comportamento, eventos econômicos"
                  value={formData.market_trends}
                  onChange={(e) => setFormData(prev => ({ ...prev, market_trends: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regulatory_factors">Fatores Regulatórios</Label>
                <Input
                  id="regulatory_factors"
                  placeholder="Regulamentações, licenças, mudanças legais"
                  value={formData.regulatory_factors}
                  onChange={(e) => setFormData(prev => ({ ...prev, regulatory_factors: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="funding_requirements">Necessidades de Financiamento</Label>
                <Input
                  id="funding_requirements"
                  placeholder="Valor necessário, fontes de financiamento"
                  value={formData.funding_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, funding_requirements: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="team_readiness">Preparação da Equipe</Label>
                <Input
                  id="team_readiness"
                  placeholder="Nível de preparação da equipe, competências necessárias"
                  value={formData.team_readiness}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_readiness: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.business_idea.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando Timing...
                </>
              ) : (
                `Gerar Análise (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Análise de Timing de Mercado</h3>
              <Button variant="outline" onClick={handleReset}>
                Nova Análise
              </Button>
            </div>

            {/* Score Geral */}
            <Card className={`${getScoreBg(results.overall_score)}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Score Geral de Timing
                  <span className={`text-2xl font-bold ${getScoreColor(results.overall_score)}`}>
                    {results.overall_score}/100
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{results.recommendation}</p>
              </CardContent>
            </Card>

            {/* Fatores de Timing */}
            {results.timing_factors?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Fatores Analisados</h4>
                <div className="space-y-3">
                  {results.timing_factors.map((factor, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getImpactIcon(factor.impact)}
                            <h5 className="font-medium text-sm">{factor.factor}</h5>
                          </div>
                          <Badge variant={factor.score >= 70 ? "default" : factor.score >= 40 ? "secondary" : "destructive"}>
                            {factor.score}/100
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Prontidão do Mercado */}
            {results.market_readiness && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Prontidão do Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.technology)}`}>
                        {results.market_readiness.technology}%
                      </div>
                      <div className="text-sm text-muted-foreground">Tecnologia</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.consumer_demand)}`}>
                        {results.market_readiness.consumer_demand}%
                      </div>
                      <div className="text-sm text-muted-foreground">Demanda</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.competitive_landscape)}`}>
                        {results.market_readiness.competitive_landscape}%
                      </div>
                      <div className="text-sm text-muted-foreground">Competição</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.regulatory_environment)}`}>
                        {results.market_readiness.regulatory_environment}%
                      </div>
                      <div className="text-sm text-muted-foreground">Regulação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Janelas de Lançamento */}
            {results.best_launch_windows?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Melhores Janelas de Lançamento
                </h4>
                <div className="space-y-4">
                  {results.best_launch_windows.map((window, index) => (
                    <Card key={index} className={index === 0 ? "border-primary" : ""}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          {window.period}
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            Score: {window.score}/100
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{window.reasoning}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2 text-green-600">Oportunidades:</h5>
                            <ul className="space-y-1">
                              {window.opportunities?.map((opp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-green-600">+</span>
                                  {opp}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2 text-red-600">Riscos:</h5>
                            <ul className="space-y-1">
                              {window.risks?.map((risk, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-red-600">-</span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações Estratégicas */}
            {results.strategic_recommendations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recomendações Estratégicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.strategic_recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">📋</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Indicadores Antecipados */}
            {results.early_indicators?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Indicadores Antecipados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.early_indicators.map((indicator, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">🔍</span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Mitigação de Riscos */}
            {results.risk_mitigation?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mitigação de Riscos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.risk_mitigation.map((mitigation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">🛡️</span>
                        {mitigation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};