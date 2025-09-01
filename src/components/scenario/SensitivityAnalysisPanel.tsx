import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  AlertTriangle, 
  Info,
  BarChart3,
  Activity,
  Layers,
  Settings,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { SimulationVariable, useScenarioSimulator } from "@/hooks/useScenarioSimulator";
import { toast } from "@/components/ui/sonner";

interface SensitivityResult {
  variable: string;
  baseValue: number;
  testValue: number;
  baseResult: number;
  testResult: number;
  sensitivity: number;
  elasticity: number;
  impact: 'high' | 'medium' | 'low';
}

interface TornadoData {
  variable: string;
  low: number;
  high: number;
  range: number;
}

interface SpiderData {
  variable: string;
  sensitivity: number;
  impact: number;
}

interface SensitivityAnalysisPanelProps {
  variables: SimulationVariable[];
  baselineResult: number;
  onVariableChange: (variableName: string, newValue: number) => void;
  onRunAnalysis: () => Promise<number>;
}

const SensitivityAnalysisPanel = ({ 
  variables, 
  baselineResult, 
  onVariableChange, 
  onRunAnalysis 
}: SensitivityAnalysisPanelProps) => {
  // Use proper baseline result from simulation data
  const actualBaselineResult = baselineResult || 0;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sensitivityResults, setSensitivityResults] = useState<SensitivityResult[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [analysisRange, setAnalysisRange] = useState(20); // ±20% by default
  const [activeTab, setActiveTab] = useState('tornado');
  const [isRealTime, setIsRealTime] = useState(false);
  const { getVariableTypeInfo } = useScenarioSimulator();

  useEffect(() => {
    if (variables.length > 0 && !selectedVariable) {
      setSelectedVariable(variables[0].name);
    }
  }, [variables]);

  const runSensitivityAnalysis = async () => {
    console.log("🔍 Iniciando análise de sensibilidade");
    console.log("📊 Variáveis:", variables);
    console.log("📈 Baseline result:", actualBaselineResult);
    
    if (!onRunAnalysis || variables.length === 0) {
      toast.error('Função de análise não disponível ou variáveis não definidas');
      return;
    }

    if (actualBaselineResult <= 0) {
      console.error("❌ Baseline result inválido:", actualBaselineResult);
      toast.error("Resultado baseline inválido. Execute uma simulação primeiro.");
      return;
    }

    setIsAnalyzing(true);
    const results: SensitivityResult[] = [];

    try {
      console.log(`🚀 Analisando ${variables.length} variáveis`);
      
      for (const variable of variables) {
        console.log(`🔬 Testando variável: ${variable.name}`);
        const baseValue = variable.parameters.mean || variable.parameters.mode || 1;
        const rangeFactor = analysisRange / 100;
        const originalValue = baseValue;
        
        try {
          // Test high value (+range%)
          const highValue = baseValue * (1 + rangeFactor);
          console.log(`📈 Testando +${analysisRange}%: ${highValue}`);
          onVariableChange(variable.name, highValue);
          const highResult = await onRunAnalysis();
          console.log(`✅ Resultado alto: ${highResult}`);

          // Test low value (-range%)
          const lowValue = baseValue * (1 - rangeFactor);
          console.log(`📉 Testando -${analysisRange}%: ${lowValue}`);
          onVariableChange(variable.name, lowValue);
          const lowResult = await onRunAnalysis();
          console.log(`✅ Resultado baixo: ${lowResult}`);

          // Reset to original value
          onVariableChange(variable.name, originalValue);

          // Calculate sensitivity metrics with better validation
          const highChange = highResult && actualBaselineResult ? ((highResult - actualBaselineResult) / actualBaselineResult) * 100 : 0;
          const lowChange = lowResult && actualBaselineResult ? ((lowResult - actualBaselineResult) / actualBaselineResult) * 100 : 0;
          const averageSensitivity = Math.abs((highChange + lowChange) / 2);
          
          const sensitivity = averageSensitivity / (analysisRange / 10); // Sensitivity per 1% change
          const elasticity = averageSensitivity;
          
          let impact: 'high' | 'medium' | 'low';
          if (averageSensitivity > 10) impact = 'high';
          else if (averageSensitivity > 5) impact = 'medium';
          else impact = 'low';
          
          console.log(`📊 Métricas calculadas para ${variable.name}:`, {
            sensitivity,
            elasticity,
            impact,
            highChange,
            lowChange,
            averageSensitivity
          });

          results.push({
            variable: variable.name,
            baseValue: originalValue,
            testValue: highValue,
            baseResult: actualBaselineResult,
            testResult: highResult,
            sensitivity,
            elasticity,
            impact
          });
        } catch (variableError) {
          console.error(`❌ Erro ao testar variável ${variable.name}:`, variableError);
          // Reset value and continue with next variable
          onVariableChange(variable.name, originalValue);
        }
      }

      console.log("✅ Análise concluída. Resultados:", results);
      
      // Sort by absolute elasticity (highest impact first)
      results.sort((a, b) => Math.abs(b.elasticity) - Math.abs(a.elasticity));
      setSensitivityResults(results);
      
      if (results.length > 0) {
        toast.success(`Análise de sensibilidade concluída! ${results.length} variáveis analisadas.`);
      } else {
        toast.error("Nenhuma variável foi analisada com sucesso. Verifique os dados.");
      }
    } catch (error) {
      console.error('❌ Erro na análise:', error);
      toast.error('Erro ao executar análise de sensibilidade');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runSingleVariableAnalysis = async (variableName: string, newValue: number) => {
    if (!onRunAnalysis) return;

    const updatedVariables = variables.map(v => 
      v.name === variableName 
        ? { ...v, parameters: { ...v.parameters, mean: newValue, mode: newValue } }
        : v
    );

    try {
      // First update the variables
      onVariableChange(variableName, newValue);
      const result = await onRunAnalysis();
      const variable = variables.find(v => v.name === variableName);
      const baseValue = variable?.parameters.mean || variable?.parameters.mode || 1;
      const percentChange = ((newValue - baseValue) / baseValue) * 100;
      const resultChange = actualBaselineResult > 0 ? 
        ((result - actualBaselineResult) / actualBaselineResult) * 100 : 0;
      
      toast.success(`Variação de ${percentChange.toFixed(1)}% resultou em ${resultChange.toFixed(1)}% de mudança no resultado`);
      return result;
    } catch (error) {
      console.error('Error in single variable analysis:', error);
      return actualBaselineResult;
    }
  };

  // Prepare tornado chart data
  const tornadoData: TornadoData[] = sensitivityResults.map(result => {
    const rangeFactor = analysisRange / 100;
    const lowImpact = result.baseResult * (1 - Math.abs(result.elasticity) / 100 * rangeFactor);
    const highImpact = result.baseResult * (1 + Math.abs(result.elasticity) / 100 * rangeFactor);
    
    return {
      variable: result.variable.replace(/_/g, ' '),
      low: Math.min(lowImpact, highImpact),
      high: Math.max(lowImpact, highImpact),
      range: Math.abs(highImpact - lowImpact)
    };
  });

  // Prepare spider chart data
  const spiderData: SpiderData[] = sensitivityResults.map(result => ({
    variable: result.variable.replace(/_/g, ' '),
    sensitivity: Math.abs(result.sensitivity),
    impact: Math.abs(result.elasticity)
  }));

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[impact];
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Análise de Sensibilidade
          </CardTitle>
          <CardDescription>
            Analise como mudanças nas variáveis impactam os resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="analysis-range">Faixa de Análise (±%)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  id="analysis-range"
                  value={[analysisRange]}
                  onValueChange={(value) => setAnalysisRange(value[0])}
                  max={50}
                  min={5}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{analysisRange}%</span>
              </div>
            </div>
            
            <div>
              <Label>Resultado Base</Label>
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-medium">
                {formatCurrency(actualBaselineResult)}
                {actualBaselineResult <= 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    ❌ Execute uma simulação primeiro
                  </div>
                )}
                {actualBaselineResult > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Baseline válido
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={runSensitivityAnalysis}
                disabled={isAnalyzing || variables.length === 0 || actualBaselineResult <= 0}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Executar Análise
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Visualization */}
      {sensitivityResults.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tornado">Tornado Chart</TabsTrigger>
            <TabsTrigger value="spider">Spider Chart</TabsTrigger>
            <TabsTrigger value="table">Tabela Detalhada</TabsTrigger>
            <TabsTrigger value="interactive">Análise Interativa</TabsTrigger>
          </TabsList>

          {/* Tornado Chart */}
          <TabsContent value="tornado">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tornado Chart - Impacto das Variáveis
                </CardTitle>
                <CardDescription>
                  Visualização do impacto de cada variável no resultado final
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={tornadoData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatCurrency} />
                    <YAxis type="category" dataKey="variable" width={120} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Impacto']} />
                    <Bar dataKey="range" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spider Chart */}
          <TabsContent value="spider">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Spider Chart - Sensibilidade vs Impacto
                </CardTitle>
                <CardDescription>
                  Comparação multidimensional das variáveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={spiderData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="variable" />
                    <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                    <Radar
                      name="Sensibilidade"
                      dataKey="sensitivity"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Impacto"
                      dataKey="impact"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Table */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Resultados Detalhados</CardTitle>
                <CardDescription>
                  Métricas completas de sensibilidade para cada variável
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sensitivityResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">
                          {result.variable.replace(/_/g, ' ')}
                        </h4>
                        <Badge className={getImpactColor(result.impact)}>
                          {result.impact.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Sensibilidade</p>
                          <p className="font-semibold">{formatPercentage(result.sensitivity)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Elasticidade</p>
                          <p className="font-semibold">{formatPercentage(result.elasticity)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Valor Base</p>
                          <p className="font-semibold">{result.baseValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Resultado Base</p>
                          <p className="font-semibold">{formatCurrency(result.baseResult)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactive Analysis */}
          <TabsContent value="interactive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Análise Interativa
                </CardTitle>
                <CardDescription>
                  Teste diferentes valores para as variáveis em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="variable-select">Selecionar Variável</Label>
                      <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma variável" />
                        </SelectTrigger>
                        <SelectContent>
                          {variables.map((variable) => (
                            <SelectItem key={variable.name} value={variable.name}>
                              {variable.name.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="real-time"
                        checked={isRealTime}
                        onChange={(e) => setIsRealTime(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="real-time">Análise em Tempo Real</Label>
                    </div>
                  </div>

                  {selectedVariable && (
                    <div className="space-y-4">
                      {variables
                        .filter(v => v.name === selectedVariable)
                        .map((variable) => {
                          const baseValue = variable.parameters.mean || variable.parameters.mode || 1;
                          const typeInfo = getVariableTypeInfo(variable.type);
                          
                          return (
                            <div key={variable.name} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="font-medium capitalize">
                                    {variable.name.replace(/_/g, ' ')}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {typeInfo.icon} {typeInfo.name} • Valor atual: {baseValue.toFixed(2)}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {variable.impact}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <Label>Novo Valor</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Slider
                                      value={[baseValue]}
                                      onValueChange={async (value) => {
                                        if (isRealTime) {
                                          await runSingleVariableAnalysis(variable.name, value[0]);
                                        }
                                         onVariableChange(variable.name, value[0]);
                                      }}
                                      max={baseValue * 2}
                                      min={baseValue * 0.1}
                                      step={baseValue * 0.01}
                                      className="flex-1"
                                    />
                                    <span className="text-sm font-medium w-16">
                                      {baseValue.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newValue = baseValue * 0.8;
                                      runSingleVariableAnalysis(variable.name, newValue);
                                    }}
                                  >
                                    -20%
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      runSingleVariableAnalysis(variable.name, baseValue);
                                    }}
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newValue = baseValue * 1.2;
                                      runSingleVariableAnalysis(variable.name, newValue);
                                    }}
                                  >
                                    +20%
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Insights and Recommendations */}
      {sensitivityResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Insights da Análise de Sensibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Variáveis de Alto Impacto
                  </h4>
                  <ul className="text-sm space-y-1">
                    {sensitivityResults
                      .filter(r => r.impact === 'high')
                      .slice(0, 3)
                      .map((result, index) => (
                        <li key={index} className="text-red-700 dark:text-red-300">
                          • {result.variable.replace(/_/g, ' ')}
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Variáveis de Médio Impacto
                  </h4>
                  <ul className="text-sm space-y-1">
                    {sensitivityResults
                      .filter(r => r.impact === 'medium')
                      .slice(0, 3)
                      .map((result, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300">
                          • {result.variable.replace(/_/g, ' ')}
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    Variáveis de Baixo Impacto
                  </h4>
                  <ul className="text-sm space-y-1">
                    {sensitivityResults
                      .filter(r => r.impact === 'low')
                      .slice(0, 3)
                      .map((result, index) => (
                        <li key={index} className="text-green-700 dark:text-green-300">
                          • {result.variable.replace(/_/g, ' ')}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Recomendações Estratégicas
                </h4>
                <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                  <li>• Foque no controle das variáveis de alto impacto para maximizar resultados</li>
                  <li>• Monitore constantemente as variáveis mais sensíveis</li>
                  <li>• Considere estratégias de hedge para variáveis de alto risco</li>
                  <li>• Use as variáveis de baixo impacto como alavancas operacionais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SensitivityAnalysisPanel;