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
import { Loader2, Calculator, TrendingUp, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface CacLtvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MetricBreakdown {
  metric: string;
  value: number;
  unit: string;
  description: string;
  benchmark: string;
  status: 'Excelente' | 'Bom' | 'Médio' | 'Precisa Melhorar';
}

interface OptimizationTip {
  area: string;
  current_value: number;
  target_value: number;
  recommendations: string[];
  impact: 'Alto' | 'Médio' | 'Baixo';
}

interface CacLtvResults {
  cac: MetricBreakdown;
  ltv: MetricBreakdown;
  ltv_cac_ratio: MetricBreakdown;
  payback_period: MetricBreakdown;
  detailed_breakdown: {
    marketing_costs: number;
    sales_costs: number;
    acquisition_rate: number;
    monthly_revenue_per_customer: number;
    gross_margin: number;
    churn_rate: number;
    customer_lifespan: number;
  };
  optimization_tips: OptimizationTip[];
  industry_benchmarks: {
    industry: string;
    avg_cac: number;
    avg_ltv: number;
    avg_ratio: number;
  };
  scenarios: Array<{
    scenario: string;
    cac: number;
    ltv: number;
    ratio: number;
    description: string;
  }>;
}

export const CacLtvModal: React.FC<CacLtvModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CacLtvResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    industry: '',
    monthly_marketing_spend: '',
    monthly_sales_spend: '',
    new_customers_month: '',
    average_monthly_revenue: '',
    gross_margin_percent: '',
    monthly_churn_rate: '',
    business_model: '',
    customer_segments: ''
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
      const { data, error } = await supabase.functions.invoke('generate-cac-ltv', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Cálculo CAC/LTV gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      toast.error("Erro ao calcular métricas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      industry: '',
      monthly_marketing_spend: '',
      monthly_sales_spend: '',
      new_customers_month: '',
      average_monthly_revenue: '',
      gross_margin_percent: '',
      monthly_churn_rate: '',
      business_model: '',
      customer_segments: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excelente': return 'bg-green-100 text-green-800';
      case 'Bom': return 'bg-blue-100 text-blue-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Precisa Melhorar': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto': return 'text-red-600';
      case 'Médio': return 'text-yellow-600';
      case 'Baixo': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const cost = 8;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora CAC/LTV
          </DialogTitle>
          <DialogDescription>
            Calcule e otimize métricas essenciais para o sucesso da sua startup.
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
                  placeholder="Descreva sua ideia de negócio..."
                  value={formData.business_idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_idea: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Setor/Indústria</Label>
                <Input
                  id="industry"
                  placeholder="Ex: SaaS, E-commerce, Fintech"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_marketing_spend">Gasto Mensal com Marketing (R$)</Label>
                <Input
                  id="monthly_marketing_spend"
                  placeholder="Ex: 5000"
                  type="number"
                  value={formData.monthly_marketing_spend}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_marketing_spend: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_sales_spend">Gasto Mensal com Vendas (R$)</Label>
                <Input
                  id="monthly_sales_spend"
                  placeholder="Ex: 3000"
                  type="number"
                  value={formData.monthly_sales_spend}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_sales_spend: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_customers_month">Novos Clientes por Mês</Label>
                <Input
                  id="new_customers_month"
                  placeholder="Ex: 100"
                  type="number"
                  value={formData.new_customers_month}
                  onChange={(e) => setFormData(prev => ({ ...prev, new_customers_month: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="average_monthly_revenue">Receita Média por Cliente/Mês (R$)</Label>
                <Input
                  id="average_monthly_revenue"
                  placeholder="Ex: 100"
                  type="number"
                  value={formData.average_monthly_revenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, average_monthly_revenue: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gross_margin_percent">Margem Bruta (%)</Label>
                <Input
                  id="gross_margin_percent"
                  placeholder="Ex: 80"
                  type="number"
                  value={formData.gross_margin_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, gross_margin_percent: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_churn_rate">Taxa de Churn Mensal (%)</Label>
                <Input
                  id="monthly_churn_rate"
                  placeholder="Ex: 5"
                  type="number"
                  value={formData.monthly_churn_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_churn_rate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_model">Modelo de Negócio</Label>
                <Input
                  id="business_model"
                  placeholder="Ex: SaaS, Freemium, Marketplace"
                  value={formData.business_model}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_model: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_segments">Segmentos de Clientes</Label>
                <Input
                  id="customer_segments"
                  placeholder="Ex: PMEs, Enterprise, Consumer"
                  value={formData.customer_segments}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_segments: e.target.value }))}
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
                  Calculando Métricas...
                </>
              ) : (
                `Calcular CAC/LTV (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Análise CAC/LTV</h3>
              <Button variant="outline" onClick={handleReset}>
                Novo Cálculo
              </Button>
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[results.cac, results.ltv, results.ltv_cac_ratio, results.payback_period].map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{metric?.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {metric?.value?.toFixed(metric.unit === '%' ? 1 : 0)}{metric?.unit}
                    </div>
                    <Badge className={getStatusColor(metric?.status || '')} variant="secondary">
                      {metric?.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">{metric?.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Benchmark:</strong> {metric?.benchmark}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Breakdown Detalhado */}
            {results.detailed_breakdown && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Breakdown Detalhado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Custos de Marketing</div>
                      <div className="text-muted-foreground">R$ {results.detailed_breakdown.marketing_costs?.toFixed(0)}/mês</div>
                    </div>
                    <div>
                      <div className="font-medium">Custos de Vendas</div>
                      <div className="text-muted-foreground">R$ {results.detailed_breakdown.sales_costs?.toFixed(0)}/mês</div>
                    </div>
                    <div>
                      <div className="font-medium">Taxa de Aquisição</div>
                      <div className="text-muted-foreground">{results.detailed_breakdown.acquisition_rate?.toFixed(0)} clientes/mês</div>
                    </div>
                    <div>
                      <div className="font-medium">Receita por Cliente</div>
                      <div className="text-muted-foreground">R$ {results.detailed_breakdown.monthly_revenue_per_customer?.toFixed(0)}/mês</div>
                    </div>
                    <div>
                      <div className="font-medium">Margem Bruta</div>
                      <div className="text-muted-foreground">{results.detailed_breakdown.gross_margin?.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Taxa de Churn</div>
                      <div className="text-muted-foreground">{results.detailed_breakdown.churn_rate?.toFixed(1)}%/mês</div>
                    </div>
                    <div>
                      <div className="font-medium">Vida Útil do Cliente</div>
                      <div className="text-muted-foreground">{results.detailed_breakdown.customer_lifespan?.toFixed(1)} meses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benchmarks da Indústria */}
            {results.industry_benchmarks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Benchmarks da Indústria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Indústria</div>
                      <div className="text-lg font-bold">{results.industry_benchmarks.industry}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">CAC Médio</div>
                      <div className="text-lg font-bold">R$ {results.industry_benchmarks.avg_cac?.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">LTV Médio</div>
                      <div className="text-lg font-bold">R$ {results.industry_benchmarks.avg_ltv?.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Ratio Médio</div>
                      <div className="text-lg font-bold">{results.industry_benchmarks.avg_ratio?.toFixed(1)}:1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dicas de Otimização */}
            {results.optimization_tips?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Dicas de Otimização
                </h4>
                <div className="space-y-4">
                  {results.optimization_tips.map((tip, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          {tip.area}
                          <Badge className={getImpactColor(tip.impact)} variant="outline">
                            Impacto {tip.impact}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Valor Atual:</span>
                            <span className="ml-2">{tip.current_value?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Meta:</span>
                            <span className="ml-2 text-green-600">{tip.target_value?.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Recomendações:</h5>
                          <ul className="space-y-1">
                            {tip.recommendations?.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Cenários */}
            {results.scenarios?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Cenários de Otimização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.scenarios.map((scenario, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h5 className="font-medium mb-2">{scenario.scenario}</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                          <div>
                            <span className="font-medium">CAC:</span>
                            <span className="ml-2">R$ {scenario.cac?.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="font-medium">LTV:</span>
                            <span className="ml-2">R$ {scenario.ltv?.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Ratio:</span>
                            <span className="ml-2">{scenario.ratio?.toFixed(1)}:1</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};