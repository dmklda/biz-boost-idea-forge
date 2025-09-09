import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Loader2, 
  BarChart, 
  PieChart, 
  Target, 
  Download, 
  Copy, 
  LineChart,
  Lightbulb
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CacLtvModalEnhancedProps {
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
  historical_trends?: Array<{
    period: string;
    cac: number;
    ltv: number;
    ratio: number;
  }>;
  sensitivity_analysis?: {
    churn_impact: Array<{
      churn_rate: number;
      ltv: number;
      ratio: number;
    }>;
    price_impact: Array<{
      price_change: number;
      ltv: number;
      ratio: number;
    }>;
  };
}

export const CacLtvModalEnhanced = ({
  open,
  onOpenChange,
}: CacLtvModalEnhancedProps) => {
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<CacLtvResults | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [useCustomIdea, setUseCustomIdea] = useState(false);
  const [activeTab, setActiveTab] = useState("metrics");
  const [analysisType, setAnalysisType] = useState("standard");
  
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
    customer_segments: '',
    acquisition_channels: '',
    customer_lifetime: '',
    pricing_strategy: ''
  });

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    // Preencher alguns campos com dados da ideia selecionada
    if (idea) {
      setFormData(prev => ({
        ...prev,
        business_idea: idea.description || '',
        industry: idea.industry || ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (useCustomIdea && !formData.business_idea.trim()) {
      toast.error("Por favor, descreva sua ideia de negócio");
      return;
    }

    if (!useCustomIdea && !selectedIdea) {
      toast.error("Por favor, selecione uma ideia ou crie uma personalizada");
      return;
    }

    // Validar campos obrigatórios
    const requiredFields = [
      { field: 'monthly_marketing_spend', name: 'Gasto Mensal com Marketing' },
      { field: 'monthly_sales_spend', name: 'Gasto Mensal com Vendas' },
      { field: 'new_customers_month', name: 'Novos Clientes por Mês' },
      { field: 'average_monthly_revenue', name: 'Receita Média por Cliente' },
      { field: 'gross_margin_percent', name: 'Margem Bruta' },
      { field: 'monthly_churn_rate', name: 'Taxa de Churn' }
    ];

    for (const { field, name } of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Por favor, preencha o campo ${name}`);
        return;
      }
    }

    if (!hasCredits('cac-ltv')) {
      toast.error(`Você precisa de ${getFeatureCost('cac-ltv')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('cac-ltv'),
        p_feature: 'cac-ltv',
        p_description: `Análise CAC/LTV para ${useCustomIdea ? 'ideia personalizada' : selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Preparar dados para envio
      const dataToSend = useCustomIdea ? formData : {
        ...formData,
        business_idea: selectedIdea.description,
        industry: selectedIdea.industry || formData.industry
      };

      // Adicionar o tipo de análise
      const requestData = {
        ...dataToSend,
        analysis_type: analysisType
      };

      // Gerar análise
      const { data, error } = await supabase.functions.invoke('generate-cac-ltv', {
        body: requestData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Análise CAC/LTV gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      toast.error("Erro ao calcular métricas. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setSelectedIdea(null);
    setUseCustomIdea(false);
    setAnalysisType("standard");
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
      customer_segments: '',
      acquisition_channels: '',
      customer_lifetime: '',
      pricing_strategy: ''
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

  // Função para exportar os resultados
  const exportResults = async () => {
    if (!results) return;
    
    setIsExporting(true);
    try {
      // Aqui seria implementada a lógica de exportação para PDF ou Excel
      // Por enquanto, apenas simulamos o download como JSON
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cac-ltv-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Análise exportada com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar análise:', error);
      toast.error("Erro ao exportar análise. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  // Função para copiar os resultados
  const copyResults = () => {
    if (!results) return;
    
    try {
      const dataStr = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(dataStr);
      toast.success("Análise copiada para a área de transferência!");
    } catch (error) {
      console.error('Erro ao copiar análise:', error);
      toast.error("Erro ao copiar análise. Tente novamente.");
    }
  };

  // Icon for the modal
  const calculatorIcon = <Calculator className="h-5 w-5 text-primary" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Calculadora CAC/LTV"
      icon={calculatorIcon}
      isGenerating={isGenerating}
      generatingText="Calculando métricas..."
      actionText="Calcular CAC/LTV"
      onAction={handleSubmit}
      actionDisabled={isGenerating || (!selectedIdea && !useCustomIdea) || (useCustomIdea && !formData.business_idea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!results}
      creditCost={getFeatureCost('cac-ltv')}
      maxWidth={results ? "5xl" : "2xl"}
      description="Calcule e otimize métricas essenciais para o sucesso da sua startup."
    >
      {results ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Análise CAC/LTV</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyResults}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copiar</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportResults}
                disabled={isExporting}
                className="flex items-center gap-1"
              >
                {isExporting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                    <span className="hidden sm:inline">Exportando...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="metrics" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="metrics" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                Métricas
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Otimização
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-1">
                <PieChart className="h-4 w-4" />
                Cenários
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-1">
                <LineChart className="h-4 w-4" />
                Análise
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="metrics" className="space-y-4 pr-4 pt-4">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[results.cac, results.ltv, results.ltv_cac_ratio, results.payback_period].map((metric, index) => (
                    <Card key={index} className={`border-l-4 ${getStatusColor(metric?.status || '').replace('bg-', 'border-').replace('text-', '')}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{metric?.metric}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold mb-2">
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        Breakdown Detalhado
                      </CardTitle>
                      <CardDescription>
                        Análise detalhada dos componentes que formam seu CAC e LTV
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Custos de Marketing</div>
                          <div className="text-lg font-medium">R$ {results.detailed_breakdown.marketing_costs?.toFixed(0)}/mês</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Custos de Vendas</div>
                          <div className="text-lg font-medium">R$ {results.detailed_breakdown.sales_costs?.toFixed(0)}/mês</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Taxa de Aquisição</div>
                          <div className="text-lg font-medium">{results.detailed_breakdown.acquisition_rate?.toFixed(0)} clientes/mês</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Receita por Cliente</div>
                          <div className="text-lg font-medium">R$ {results.detailed_breakdown.monthly_revenue_per_customer?.toFixed(0)}/mês</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Margem Bruta</div>
                          <div className="text-lg font-medium">{results.detailed_breakdown.gross_margin?.toFixed(1)}%</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Taxa de Churn</div>
                          <div className="text-lg font-medium">{results.detailed_breakdown.churn_rate?.toFixed(1)}%/mês</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Vida Útil do Cliente</div>
                          <div className="text-lg font-medium">{results.detailed_breakdown.customer_lifespan?.toFixed(1)} meses</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Benchmarks da Indústria */}
                {results.industry_benchmarks && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Benchmarks da Indústria
                      </CardTitle>
                      <CardDescription>
                        Comparação com médias do setor {results.industry_benchmarks.industry}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">CAC Médio</div>
                          <div className="text-lg font-medium">R$ {results.industry_benchmarks.avg_cac?.toFixed(0)}</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">LTV Médio</div>
                          <div className="text-lg font-medium">R$ {results.industry_benchmarks.avg_ltv?.toFixed(0)}</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Ratio Médio</div>
                          <div className="text-lg font-medium">{results.industry_benchmarks.avg_ratio?.toFixed(1)}:1</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="optimization" className="space-y-4 pr-4 pt-4">
                {/* Dicas de Otimização */}
                {results.optimization_tips?.length > 0 && (
                  <div className="space-y-4">
                    {results.optimization_tips.map((tip, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              {tip.area}
                            </div>
                            <Badge className={getImpactColor(tip.impact)} variant="outline">
                              Impacto {tip.impact}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-2 bg-muted rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">Valor Atual</div>
                              <div className="font-medium">{tip.current_value?.toFixed(2)}</div>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">Meta</div>
                              <div className="font-medium text-green-600">{tip.target_value?.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2">Recomendações:</h5>
                            <ul className="space-y-1">
                              {tip.recommendations?.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-gray-50">
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
                )}
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-4 pr-4 pt-4">
                {/* Cenários */}
                {results.scenarios?.length > 0 && (
                  <div className="space-y-4">
                    {results.scenarios.map((scenario, index) => (
                      <Card key={index} className={index === 0 ? "border-primary" : ""}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{scenario.scenario}</CardTitle>
                          {index === 0 && <CardDescription>Cenário recomendado</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div className="p-2 bg-muted rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">CAC</div>
                              <div className="font-medium">R$ {scenario.cac?.toFixed(0)}</div>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">LTV</div>
                              <div className="font-medium">R$ {scenario.ltv?.toFixed(0)}</div>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">Ratio</div>
                              <div className="font-medium">{scenario.ratio?.toFixed(1)}:1</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4 pr-4 pt-4">
                {/* Análise de Sensibilidade */}
                {results.sensitivity_analysis && (
                  <div className="space-y-6">
                    {/* Impacto do Churn */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-blue-500" />
                          Impacto da Taxa de Churn
                        </CardTitle>
                        <CardDescription>
                          Como diferentes taxas de churn afetam seu LTV e ratio LTV:CAC
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.sensitivity_analysis.churn_impact?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                              <div className="flex items-center gap-4">
                                <div className="w-20">
                                  <div className="text-xs text-muted-foreground">Churn</div>
                                  <div className="font-medium">{item.churn_rate}%</div>
                                </div>
                                <div className="w-24">
                                  <div className="text-xs text-muted-foreground">LTV</div>
                                  <div className="font-medium">R$ {item.ltv?.toFixed(0)}</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Ratio</div>
                                <div className="font-medium">{item.ratio?.toFixed(1)}:1</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Impacto do Preço */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          Impacto da Alteração de Preço
                        </CardTitle>
                        <CardDescription>
                          Como mudanças no preço afetam seu LTV e ratio LTV:CAC
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.sensitivity_analysis.price_impact?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                              <div className="flex items-center gap-4">
                                <div className="w-20">
                                  <div className="text-xs text-muted-foreground">Alteração</div>
                                  <div className="font-medium">{item.price_change > 0 ? '+' : ''}{item.price_change}%</div>
                                </div>
                                <div className="w-24">
                                  <div className="text-xs text-muted-foreground">LTV</div>
                                  <div className="font-medium">R$ {item.ltv?.toFixed(0)}</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Ratio</div>
                                <div className="font-medium">{item.ratio?.toFixed(1)}:1</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tendências Históricas */}
                    {results.historical_trends && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            Tendências Históricas
                          </CardTitle>
                          <CardDescription>
                            Evolução das métricas ao longo do tempo
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {results.historical_trends.map((period, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                                <div className="w-24">
                                  <div className="text-xs text-muted-foreground">Período</div>
                                  <div className="font-medium">{period.period}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-24">
                                    <div className="text-xs text-muted-foreground">CAC</div>
                                    <div className="font-medium">R$ {period.cac?.toFixed(0)}</div>
                                  </div>
                                  <div className="w-24">
                                    <div className="text-xs text-muted-foreground">LTV</div>
                                    <div className="font-medium">R$ {period.ltv?.toFixed(0)}</div>
                                  </div>
                                  <div className="w-20">
                                    <div className="text-xs text-muted-foreground">Ratio</div>
                                    <div className="font-medium">{period.ratio?.toFixed(1)}:1</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="saved" onValueChange={(value) => setUseCustomIdea(value === "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Usar Ideia Existente
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <Calculator className="h-4 w-4" />
                Análise Personalizada
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <EnhancedIdeaSelector onSelect={handleIdeaSelect} />

              {selectedIdea && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-base font-medium">Informações Complementares</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="business_model">Modelo de Negócio</Label>
                      <Input
                        id="business_model"
                        placeholder="Ex: SaaS, Freemium, Marketplace"
                        value={formData.business_model}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_model: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
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
                  <Label htmlFor="business_model">Modelo de Negócio</Label>
                  <Input
                    id="business_model"
                    placeholder="Ex: SaaS, Freemium, Marketplace"
                    value={formData.business_model}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_model: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Parâmetros da Análise</h3>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Análise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="detailed">Detalhada</SelectItem>
                  <SelectItem value="predictive">Preditiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_marketing_spend">Gasto Mensal com Marketing (R$) *</Label>
                <Input
                  id="monthly_marketing_spend"
                  placeholder="Ex: 5000"
                  type="number"
                  value={formData.monthly_marketing_spend}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_marketing_spend: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_sales_spend">Gasto Mensal com Vendas (R$) *</Label>
                <Input
                  id="monthly_sales_spend"
                  placeholder="Ex: 3000"
                  type="number"
                  value={formData.monthly_sales_spend}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_sales_spend: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_customers_month">Novos Clientes por Mês *</Label>
                <Input
                  id="new_customers_month"
                  placeholder="Ex: 100"
                  type="number"
                  value={formData.new_customers_month}
                  onChange={(e) => setFormData(prev => ({ ...prev, new_customers_month: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="average_monthly_revenue">Receita Média por Cliente/Mês (R$) *</Label>
                <Input
                  id="average_monthly_revenue"
                  placeholder="Ex: 100"
                  type="number"
                  value={formData.average_monthly_revenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, average_monthly_revenue: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gross_margin_percent">Margem Bruta (%) *</Label>
                <Input
                  id="gross_margin_percent"
                  placeholder="Ex: 80"
                  type="number"
                  value={formData.gross_margin_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, gross_margin_percent: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_churn_rate">Taxa de Churn Mensal (%) *</Label>
                <Input
                  id="monthly_churn_rate"
                  placeholder="Ex: 5"
                  type="number"
                  value={formData.monthly_churn_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_churn_rate: e.target.value }))}
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

              <div className="space-y-2">
                <Label htmlFor="acquisition_channels">Canais de Aquisição</Label>
                <Input
                  id="acquisition_channels"
                  placeholder="Ex: SEO, Ads, Social Media"
                  value={formData.acquisition_channels}
                  onChange={(e) => setFormData(prev => ({ ...prev, acquisition_channels: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_lifetime">Tempo Médio de Vida do Cliente (meses)</Label>
                <Input
                  id="customer_lifetime"
                  placeholder="Ex: 24"
                  type="number"
                  value={formData.customer_lifetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_lifetime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing_strategy">Estratégia de Preços</Label>
                <Input
                  id="pricing_strategy"
                  placeholder="Ex: Assinatura, Freemium, Tiered"
                  value={formData.pricing_strategy}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing_strategy: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Dicas para uma Análise Precisa
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Inclua todos os custos de marketing e vendas para um CAC mais preciso</li>
                <li>• Use dados reais de churn e receita média para cálculos de LTV mais confiáveis</li>
                <li>• Considere diferentes segmentos de clientes se houver variação significativa no comportamento</li>
                <li>• Revise periodicamente suas métricas para acompanhar tendências e melhorias</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </ToolModalBase>
  );
};