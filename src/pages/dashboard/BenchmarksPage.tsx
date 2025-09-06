import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { CreditGuard } from "@/components/CreditGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Users,
  Zap,
  RefreshCw,
  Download,
  Info,
  AlertTriangle,
  Lightbulb,
  Plus,
  Calendar,
  Tag
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { IdeaSelector } from "@/components/regulatory-analysis/IdeaSelector";

interface BenchmarkMetric {
  name: string;
  value: number;
  unit: string;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  description: string;
  source: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  importance: 'critical' | 'important' | 'moderate';
}

interface Idea {
  id: string;
  title: string;
  description: string;
  audience?: string;
  monetization?: string;
  location?: string;
  created_at: string;
  status: string;
}

interface IndustryBenchmark {
  sector: string;
  region: string;
  companyStage: string;
  metrics: BenchmarkMetric[];
  marketInsights: any;
  financialBenchmarks: any;
  operationalBenchmarks: any;
  generatedAt: string;
  ideaComparison?: any;
  realTimeData?: any;
}

const BenchmarksPage = () => {
  const { authState } = useAuth();
  const { hasFeatureAccess } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<IndustryBenchmark | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [useExistingIdea, setUseExistingIdea] = useState(true);
  const [formData, setFormData] = useState({
    sector: '',
    region: 'brazil',
    companyStage: 'startup',
    businessModel: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIdeaSelect = (idea: Idea | null) => {
    setSelectedIdea(idea);
    if (idea) {
      // Auto-fill form data from idea
      setFormData(prev => ({
        ...prev,
        businessModel: idea.monetization || prev.businessModel,
        region: idea.location?.toLowerCase().includes('brasil') ? 'brazil' : prev.region
      }));
    }
  };

  const generateBenchmarks = async () => {
    if (useExistingIdea && !selectedIdea) {
      toast.error('Por favor, selecione uma ideia');
      return;
    }
    if (!formData.sector) {
      toast.error('Por favor, selecione um setor');
      return;
    }

    try {
      setIsLoading(true);
      
      const requestBody = {
        sector: formData.sector,
        region: formData.region,
        companyStage: formData.companyStage,
        businessModel: formData.businessModel,
        ...(useExistingIdea && selectedIdea && {
          ideaData: {
            id: selectedIdea.id,
            title: selectedIdea.title,
            description: selectedIdea.description,
            audience: selectedIdea.audience,
            monetization: selectedIdea.monetization,
            location: selectedIdea.location
          }
        })
      };
      
      const { data, error } = await supabase.functions.invoke('industry-benchmarks', {
        body: requestBody
      });

      if (error) throw error;

      setBenchmarkResult(data);
      toast.success(useExistingIdea 
        ? 'Benchmarks personalizados gerados com sucesso!' 
        : 'Benchmarks gerados com sucesso!'
      );
    } catch (error) {
      console.error('Error generating benchmarks:', error);
      toast.error('Erro ao gerar benchmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const getImportanceColor = (importance: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      important: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      moderate: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[importance as keyof typeof colors] || colors.moderate;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === '/5') return `${value.toFixed(1)}/5`;
    if (unit === 'meses') return `${value} meses`;
    return `${value.toLocaleString()} ${unit}`;
  };

  // Prepare chart data
  const percentileData = benchmarkResult?.metrics.map(metric => ({
    name: metric.name.split(' ')[0], // Shortened name for chart
    p25: metric.percentile_25,
    p50: metric.percentile_50,
    p75: metric.percentile_75,
    p90: metric.percentile_90,
    value: metric.value
  })) || [];

  const radarData = benchmarkResult?.metrics.slice(0, 6).map(metric => ({
    metric: metric.name.split(' ')[0],
    value: (metric.value / metric.percentile_90) * 100 // Normalize to 0-100
  })) || [];

  // Check plan access
  if (!hasFeatureAccess('benchmarks')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
                Benchmarks da Indústria
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Este recurso está disponível apenas para o plano Business.
              </p>
            </div>
            <CreditGuard feature="benchmarks">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Desbloquear Benchmarks
              </Button>
            </CreditGuard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
              Benchmarks da Indústria
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
              Compare sua ideia com métricas específicas da indústria e entenda como se posicionar no mercado.
            </p>
          </div>

          {!benchmarkResult ? (
            /* Input Form */
            <div className="space-y-6">
              {/* Idea Selection Toggle */}
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    Fonte dos Dados
                  </CardTitle>
                  <CardDescription>
                    Escolha usar uma ideia existente ou criar benchmarks do zero
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={useExistingIdea ? 'default' : 'outline'}
                      onClick={() => setUseExistingIdea(true)}
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Usar Ideia Existente
                    </Button>
                    <Button
                      variant={!useExistingIdea ? 'default' : 'outline'}
                      onClick={() => {
                        setUseExistingIdea(false);
                        setSelectedIdea(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Nova Análise
                    </Button>
                  </div>
                  
                  {useExistingIdea && (
                    <IdeaSelector
                      onIdeaSelect={handleIdeaSelect}
                      selectedIdea={selectedIdea}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Configuration Form */}
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Configuração dos Benchmarks
                  </CardTitle>
                  <CardDescription>
                    {useExistingIdea && selectedIdea 
                      ? `Benchmarks personalizados para: ${selectedIdea.title}`
                      : 'Selecione as características do seu negócio para obter benchmarks relevantes'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sector">Setor *</Label>
                      <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="fintech">FinTech</SelectItem>
                          <SelectItem value="healthtech">HealthTech</SelectItem>
                          <SelectItem value="edtech">EdTech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="companyStage">Estágio da Empresa</Label>
                      <Select value={formData.companyStage} onValueChange={(value) => handleInputChange('companyStage', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="scaleup">Scale-up</SelectItem>
                          <SelectItem value="established">Estabelecida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region">Região</Label>
                      <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brazil">Brasil</SelectItem>
                          <SelectItem value="latam">América Latina</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="businessModel">Modelo de Negócio</Label>
                      <Input
                        id="businessModel"
                        value={formData.businessModel}
                        onChange={(e) => handleInputChange('businessModel', e.target.value)}
                        placeholder="Ex: SaaS, Marketplace, Freemium"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={generateBenchmarks}
                    disabled={isLoading || !formData.sector || (useExistingIdea && !selectedIdea)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Gerando Benchmarks...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        {useExistingIdea && selectedIdea 
                          ? 'Gerar Benchmarks Personalizados' 
                          : 'Gerar Benchmarks'
                        }
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Benchmark Results */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Setor</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                          {benchmarkResult.sector}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Métricas</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {benchmarkResult.metrics.length}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tamanho do Mercado</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          R$ {(benchmarkResult.marketInsights.marketSize / 1000000000).toFixed(1)}B
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Crescimento</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {benchmarkResult.marketInsights.growthRate}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Tabs defaultValue="metrics">
                <TabsList className={`grid w-full ${benchmarkResult.ideaComparison ? 'grid-cols-5' : 'grid-cols-4'}`}>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                  <TabsTrigger value="financial">Financeiro</TabsTrigger>
                  <TabsTrigger value="operational">Operacional</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  {benchmarkResult.ideaComparison && (
                    <TabsTrigger value="comparison">Comparação</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="metrics" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Percentile Chart */}
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Distribuição por Percentis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={percentileData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="p25" fill="#EF4444" name="P25" />
                            <Bar dataKey="p50" fill="#F59E0B" name="P50" />
                            <Bar dataKey="p75" fill="#10B981" name="P75" />
                            <Bar dataKey="p90" fill="#3B82F6" name="P90" />
                            <Bar dataKey="value" fill="#8B5CF6" name="Seu Valor" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Radar Chart */}
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Performance Relativa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name="Performance"
                              dataKey="value"
                              stroke="#8B5CF6"
                              fill="#8B5CF6"
                              fillOpacity={0.3}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Metrics List */}
                  <div className="space-y-4">
                    {benchmarkResult.metrics.map((metric, index) => (
                      <Card key={index} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{metric.name}</h3>
                                {getTrendIcon(metric.trend)}
                                <Badge className={getImportanceColor(metric.importance)}>
                                  {metric.importance}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">{metric.description}</p>
                              <div className="text-sm text-gray-500">
                                <strong>Fonte:</strong> {metric.source}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600 mb-1">
                                {formatValue(metric.value, metric.unit)}
                              </div>
                              <div className="text-sm text-gray-500">Valor atual</div>
                            </div>
                          </div>
                          
                          {/* Percentile Progress Bars */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>P25: {formatValue(metric.percentile_25, metric.unit)}</span>
                              <span>P50: {formatValue(metric.percentile_50, metric.unit)}</span>
                              <span>P75: {formatValue(metric.percentile_75, metric.unit)}</span>
                              <span>P90: {formatValue(metric.percentile_90, metric.unit)}</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={(metric.value / metric.percentile_90) * 100} 
                                className="h-2" 
                              />
                              <div className="absolute top-0 left-0 w-full h-2 flex">
                                <div className="w-1/4 border-r border-white"></div>
                                <div className="w-1/4 border-r border-white"></div>
                                <div className="w-1/4 border-r border-white"></div>
                                <div className="w-1/4"></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Receita Média</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">
                          {formatValue(benchmarkResult.financialBenchmarks.averageRevenue, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Valuation Médio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-blue-600">
                          {formatValue(benchmarkResult.financialBenchmarks.averageValuation, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Burn Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-red-600">
                          {formatValue(benchmarkResult.financialBenchmarks.burnRate, 'R$')}/mês
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Tempo para Break-even</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-purple-600">
                          {benchmarkResult.financialBenchmarks.timeToBreakeven} meses
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Seed Round</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-orange-600">
                          {formatValue(benchmarkResult.financialBenchmarks.fundingRounds.seed, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Series A</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-indigo-600">
                          {formatValue(benchmarkResult.financialBenchmarks.fundingRounds.seriesA, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="operational" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">CAC</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-red-600">
                          {formatValue(benchmarkResult.operationalBenchmarks.customerAcquisitionCost, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">LTV</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">
                          {formatValue(benchmarkResult.operationalBenchmarks.lifetimeValue, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Churn Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-orange-600">
                          {benchmarkResult.operationalBenchmarks.churnRate.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Margem Bruta</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-blue-600">
                          {benchmarkResult.operationalBenchmarks.grossMargin.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Funcionários</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-purple-600">
                          {benchmarkResult.operationalBenchmarks.employeeCount}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Receita/Funcionário</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-indigo-600">
                          {formatValue(benchmarkResult.operationalBenchmarks.revenuePerEmployee, 'R$')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Barreiras de Entrada</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {benchmarkResult.marketInsights.entryBarriers.map((barrier: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{barrier}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Fatores de Sucesso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {benchmarkResult.marketInsights.keySuccessFactors.map((factor: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Desafios Típicos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {benchmarkResult.marketInsights.typicalChallenges.map((challenge: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Informações do Mercado</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tamanho do Mercado</p>
                            <p className="text-2xl font-bold">
                              {formatValue(benchmarkResult.marketInsights.marketSize, 'R$')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Crescimento</p>
                            <p className="text-2xl font-bold text-green-600">
                              {benchmarkResult.marketInsights.growthRate}% ao ano
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nível de Competição</p>
                            <Badge className={getImportanceColor(benchmarkResult.marketInsights.competitionLevel)}>
                              {benchmarkResult.marketInsights.competitionLevel.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => setBenchmarkResult(null)}
                  variant="outline"
                >
                  Novo Benchmark
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BenchmarksPage;