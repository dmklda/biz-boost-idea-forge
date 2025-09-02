import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Download,
  Info,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { SimulationResults, ScenarioType, useScenarioSimulator } from "@/hooks/useScenarioSimulator";
import { formatCurrency } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface ScenarioSimulatorResultsProps {
  results: SimulationResults;
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
}

const ScenarioSimulatorResults = ({ results, onExport }: ScenarioSimulatorResultsProps) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('realistic');
  const [activeTab, setActiveTab] = useState('overview');
  const { getScenarioInfo, calculateROI, calculatePaybackPeriod, getConfidenceInterval } = useScenarioSimulator();

  // Debug logging
  console.log('SimulationResults received:', results);
  console.log('Results object:', results?.results);
  
  // Early return if results are not valid
  if (!results || !results.results || typeof results.results !== 'object') {
    console.warn('Invalid results object received:', results);
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Resultados não disponíveis</h3>
          <p className="text-sm text-muted-foreground">Execute uma simulação para ver os resultados aqui.</p>
        </div>
      </div>
    );
  }
  
  const scenarios = Object.keys(results.results) as ScenarioType[];
  
  // If no scenarios available, show empty state
  if (scenarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum cenário disponível</h3>
          <p className="text-sm text-muted-foreground">Execute uma simulação para gerar cenários de análise.</p>
        </div>
      </div>
    );
  }

  // Ensure activeScenario exists in the available scenarios
  const validActiveScenario = scenarios.includes(activeScenario) ? activeScenario : scenarios[0];
  const currentResult = results.results[validActiveScenario];
  
  console.log('Current scenario:', validActiveScenario);
  console.log('Current result:', currentResult);
  
  // Prepare chart data
  const chartData = currentResult?.projections?.map(projection => ({
    month: `Mês ${projection.month}`,
    revenue: projection.revenue || 0,
    costs: projection.costs || 0,
    profit: projection.profit || 0,
    cumulativeProfit: projection.cumulative_profit || 0,
    breakEvenProb: (projection.break_even_probability || 0) * 100
  })) || [];

  console.log('Chart data prepared:', chartData);

  // Comparison data for all scenarios - using first available scenario as reference
  const referenceScenario = scenarios[0] || 'realistic';
  const comparisonData = (results.results[referenceScenario]?.projections || []).map((_, index) => {
    const dataPoint: any = { month: `Mês ${index + 1}` };
    scenarios.forEach(scenario => {
      const projection = results.results[scenario]?.projections?.[index];
      if (projection) {
        dataPoint[`${scenario}_profit`] = projection.cumulative_profit || 0;
      }
    });
    return dataPoint;
  });

  console.log('Comparison data prepared:', comparisonData);

  // Risk distribution data
  const riskData = scenarios.map(scenario => {
    const result = results.results[scenario];
    return {
      scenario: getScenarioInfo(scenario).name,
      probabilityOfLoss: (result?.riskMetrics?.probability_of_loss || 0) * 100,
      valueAtRisk: Math.abs(result?.riskMetrics?.value_at_risk_95 || 0),
      expectedReturn: result?.statistics?.mean || 0
    };
  });

  console.log('Risk data prepared:', riskData);

  // Sensitivity analysis chart data
  const sensitivityData = (results.sensitivityAnalysis || []).map(analysis => ({
    variable: analysis.variable.replace(/_/g, ' '),
    impact: Math.abs(analysis.impact_on_npv || 0),
    correlation: analysis.correlation || 0
  }));

  console.log('Sensitivity data prepared:', sensitivityData);

  const getScenarioColor = (scenario: ScenarioType) => {
    const colors = {
      optimistic: '#10B981',
      realistic: '#3B82F6', 
      pessimistic: '#EF4444'
    };
    return colors[scenario];
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };
  const formatCurrencyValue = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0';
    }
    if (Math.abs(value) >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with scenario selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Resultados da Simulação Monte Carlo</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {results.metadata?.totalIterations?.toLocaleString() || 'N/A'} iterações • {results.metadata?.timeHorizon || 'N/A'} meses
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Scenario selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {scenarios.map((scenario) => {
              const info = getScenarioInfo(scenario);
              return (
                <button
                  key={scenario}
                  onClick={() => setActiveScenario(scenario)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    validActiveScenario === scenario
                      ? `${info.bgColor} ${info.color} shadow-sm`
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  {info.icon} {info.name}
                </button>
              );
            })}
          </div>
          
          {/* Export button */}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Operacional</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrencyValue(currentResult?.finalOperationalProfit)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Margem: {currentResult?.profitMargin?.toFixed(1) || 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Probabilidade de Lucro</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPercentage((1 - (currentResult?.riskMetrics?.probability_of_loss || 0)) * 100)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress 
              value={(1 - (currentResult?.riskMetrics?.probability_of_loss || 0)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payback</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentResult?.paybackPeriod ? `${currentResult.paybackPeriod} meses` : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Tempo para recuperar investimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Risco (VaR 95%)</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrencyValue(Math.abs(currentResult?.riskMetrics?.value_at_risk_95 || 0))}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Perda máxima esperada (95% confiança)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="risk">Análise de Risco</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensibilidade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cumulative profit chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Lucro Acumulado - {getScenarioInfo(validActiveScenario).name}
                </CardTitle>
                <CardDescription>
                  Evolução do lucro acumulado ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrencyValue} />
                    <Tooltip formatter={(value: number) => [formatCurrencyValue(value), 'Lucro Acumulado']} />
                    <Area 
                      type="monotone" 
                      dataKey="cumulativeProfit" 
                      stroke={getScenarioColor(validActiveScenario)} 
                      fill={getScenarioColor(validActiveScenario)}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Receita vs Custos
                </CardTitle>
                <CardDescription>
                  Comparação mensal entre receitas e custos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrencyValue} />
                    <Tooltip formatter={(value: number) => [formatCurrencyValue(value)]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Receita" />
                    <Bar dataKey="costs" fill="#EF4444" name="Custos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Statistics summary */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Cenário {getScenarioInfo(validActiveScenario).name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Média</p>
                  <p className="text-lg font-semibold">{formatCurrencyValue(currentResult?.statistics?.mean)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mediana</p>
                  <p className="text-lg font-semibold">{formatCurrencyValue(currentResult?.statistics?.median)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Desvio Padrão</p>
                  <p className="text-lg font-semibold">{formatCurrencyValue(currentResult?.statistics?.stdDev)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mínimo</p>
                  <p className="text-lg font-semibold">{formatCurrencyValue(currentResult?.statistics?.min)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Máximo</p>
                  <p className="text-lg font-semibold">{formatCurrencyValue(currentResult?.statistics?.max)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          {/* Scenario comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Cenários</CardTitle>
              <CardDescription>
                Lucro acumulado projetado para todos os cenários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrencyValue} />
                  <Tooltip formatter={(value: number) => [formatCurrencyValue(value)]} />
                  <Legend />
                  {scenarios.map((scenario, index) => (
                    <Line 
                      key={`scenario-${scenario}-${index}`}
                      type="monotone" 
                      dataKey={`${scenario}_profit`} 
                      stroke={getScenarioColor(scenario)}
                      strokeWidth={2}
                      name={getScenarioInfo(scenario).name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Break-even probability */}
          <Card>
            <CardHeader>
              <CardTitle>Probabilidade de Break-even</CardTitle>
              <CardDescription>
                Probabilidade de atingir o ponto de equilíbrio por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => [`${(value || 0).toFixed(1)}%`, 'Probabilidade']} />
                  <Area 
                    type="monotone" 
                    dataKey="breakEvenProb" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    key="break-even-area"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Análise de Risco por Cenário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: number) => [`${(value || 0).toFixed(1)}%`, 'Prob. de Perda']} />
                    <Bar 
                      dataKey="probabilityOfLoss" 
                      fill="#EF4444"
                      key="risk-bar"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Risco</CardTitle>
                <CardDescription>Cenário {getScenarioInfo(activeScenario).name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Probabilidade de Perda</span>
                  <Badge variant={(currentResult?.riskMetrics?.probability_of_loss || 0) > 0.3 ? 'destructive' : 'secondary'}>
                    {formatPercentage((currentResult?.riskMetrics?.probability_of_loss || 0) * 100)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Value at Risk (95%)</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrencyValue(Math.abs(currentResult?.riskMetrics?.value_at_risk_95 || 0))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expected Shortfall</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrencyValue(Math.abs(currentResult?.riskMetrics?.expected_shortfall || 0))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo para Break-even</span>
                  <span className="font-semibold">
                    {currentResult?.riskMetrics?.break_even_month ? `${currentResult.riskMetrics.break_even_month} meses` : 'Não atingido'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Confidence intervals */}
          <Card>
            <CardHeader>
              <CardTitle>Intervalos de Confiança</CardTitle>
              <CardDescription>
                Distribuição de resultados possíveis (95% de confiança)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Melhor Caso (95º percentil)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5% de chance de superar</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrencyValue(currentResult?.statistics?.percentile_95)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Caso Esperado (Mediana)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">50% de chance de superar</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrencyValue(currentResult?.statistics?.median)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Pior Caso (5º percentil)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5% de chance de ficar abaixo</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrencyValue(currentResult?.statistics?.percentile_5)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensitivity Analysis Tab */}
        <TabsContent value="sensitivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Análise de Sensibilidade
              </CardTitle>
              <CardDescription>
                Impacto das variáveis no resultado final
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sensitivityData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="variable" width={120} />
                  <Tooltip formatter={(value: number) => [`${(value || 0).toFixed(1)}%`, 'Impacto no VPL']} />
                  <Bar dataKey="impact" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sensitivity insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights da Análise de Sensibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.sensitivityAnalysis.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{analysis.variable.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Correlação: {(analysis.correlation || 0).toFixed(3)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {analysis.impact_on_npv > 0 ? '+' : ''}{(analysis.impact_on_npv || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Impacto no VPL
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      {results.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Insights da IA
            </CardTitle>
            <CardDescription>
              Análise inteligente dos resultados da simulação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={results.insights} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScenarioSimulatorResults;