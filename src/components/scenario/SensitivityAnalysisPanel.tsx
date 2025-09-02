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
  baselineValue: number;
  lowValue: number;
  highValue: number;
  lowResult: number;
  highResult: number;
  impact: number;
  sensitivity: number;
  elasticity: number;
}

interface TornadoData {
  variable: string;
  low: number;
  high: number;
  impact: number;
}

interface SpiderData {
  variable: string;
  sensitivity: number;
  impact: number;
  elasticity: number;
}

interface SensitivityAnalysisPanelProps {
  variables: SimulationVariable[];
  baselineResult: number;
  onVariableChange: (variableName: string, newValue: number) => void;
  onRunAnalysis: (variables: SimulationVariable[]) => Promise<number>;
}

const SensitivityAnalysisPanel = ({ 
  variables, 
  baselineResult, 
  onVariableChange, 
  onRunAnalysis 
}: SensitivityAnalysisPanelProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SensitivityResult[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [analysisRange, setAnalysisRange] = useState(20); // ±20% by default
  const [activeTab, setActiveTab] = useState('tornado');
  const [currentVariableValue, setCurrentVariableValue] = useState<number>(0);
  const { getVariableTypeInfo } = useScenarioSimulator();

  // Initialize selected variable and current value
  useEffect(() => {
    if (variables && variables.length > 0 && !selectedVariable) {
      setSelectedVariable(variables[0].name);
      setCurrentVariableValue(variables[0].parameters?.mean || variables[0].parameters?.mode || 1);
    }
  }, [variables, selectedVariable]);

  // Update current value when selected variable changes
  useEffect(() => {
    if (selectedVariable && variables) {
      const variable = variables.find(v => v.name === selectedVariable);
      if (variable) {
        setCurrentVariableValue(variable.parameters?.mean || variable.parameters?.mode || 1);
      }
    }
  }, [selectedVariable, variables]);

  const runSensitivityAnalysis = async () => {
    if (!variables || variables.length === 0) {
      toast.error("Nenhuma variável disponível para análise");
      return;
    }

    console.log("🔍 Iniciando análise de sensibilidade completa...");
    console.log("📊 Baseline inicial:", baselineResult);
    console.log("🔧 Variáveis:", variables.map(v => ({ name: v.name, value: v.parameters?.mean || v.parameters?.mode || 1 })));

    if (!baselineResult || baselineResult === 0) {
      toast.error("Resultado baseline não disponível. Execute uma simulação primeiro.");
      return;
    }

    setIsAnalyzing(true);
    const newResults: SensitivityResult[] = [];

    try {
      for (const variable of variables) {
        console.log(`🔍 Analisando variável: ${variable.name}`);
        
        // Calculate range based on analysis range (±%)
        const baseValue = variable.parameters?.mean || variable.parameters?.mode || 1;
        const delta = (baseValue * analysisRange) / 100;
        const lowValue = Math.max(0, baseValue - delta);
        const highValue = baseValue + delta;

        // Test low value
        const lowTestVars = variables.map(v => 
          v.name === variable.name ? { ...v, baseValue: lowValue } : v
        );
        const lowResult = await onRunAnalysis(lowTestVars);

        // Test high value  
        const highTestVars = variables.map(v =>
          v.name === variable.name ? { ...v, baseValue: highValue } : v
        );
        const highResult = await onRunAnalysis(highTestVars);

        if (lowResult && highResult && lowResult !== 0 && highResult !== 0) {
          // Calculate absolute impact
          const impact = Math.abs(highResult - lowResult);
          
          // Calculate sensitivity as change in output per unit change in input
          const inputChange = highValue - lowValue;
          const outputChange = highResult - lowResult;
          const sensitivity = inputChange !== 0 ? Math.abs(outputChange / inputChange) : 0;
          
          // Calculate elasticity as percentage change in output / percentage change in input
          const percentInputChange = ((highValue - lowValue) / baseValue) * 100;
          const percentOutputChange = ((highResult - lowResult) / baselineResult) * 100;
          const elasticity = percentInputChange !== 0 ? Math.abs(percentOutputChange / percentInputChange) : 0;

          newResults.push({
            variable: variable.name,
            baselineValue: baseValue,
            lowValue,
            highValue,
            lowResult,
            highResult,
            impact,
            sensitivity,
            elasticity
          });

          console.log(`✅ ${variable.name}: Impact=${impact.toFixed(2)}, Sensitivity=${sensitivity.toFixed(4)}, Elasticity=${elasticity.toFixed(2)}`);
        } else {
          console.warn(`⚠️ Resultado inválido para ${variable.name}: low=${lowResult}, high=${highResult}`);
        }
      }

      console.log("📈 Análise concluída:", newResults);
      setResults(newResults);
      
      if (newResults.length > 0) {
        toast.success(`Análise de sensibilidade concluída para ${newResults.length} variáveis`);
      } else {
        toast.error("Não foi possível calcular sensibilidade para nenhuma variável");
      }
    } catch (error) {
      console.error("❌ Erro na análise:", error);
      toast.error("Erro durante a análise de sensibilidade");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runSingleVariableAnalysis = async (variableName: string, newValue: number) => {
    if (!variables || !baselineResult) return;

    console.log(`🔍 Análise única para ${variableName}:`, newValue);

    const testVars = variables.map(v => 
      v.name === variableName ? { ...v, baseValue: newValue } : v
    );
    
    try {
      const result = await onRunAnalysis(testVars);
      console.log(`📊 Resultado único: ${result}`);
      
      if (result && result !== 0) {
        const impact = Math.abs(result - baselineResult);
        const percentChange = ((result - baselineResult) / baselineResult) * 100;
        
        toast.success(`${variableName}: ${formatCurrency(result)} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%)`);
        return result;
      } else {
        toast.error(`Não foi possível calcular resultado para ${variableName}`);
      }
    } catch (error) {
      console.error(`Erro na análise de ${variableName}:`, error);
      toast.error(`Erro ao analisar ${variableName}`);
    }
  };

  // Prepare data for charts
  const tornadoData: TornadoData[] = results.map(result => {
    // Calculate relative impact from baseline
    const lowImpact = baselineResult - result.lowResult;
    const highImpact = result.highResult - baselineResult;
    
    return {
      variable: result.variable,
      low: lowImpact,
      high: highImpact,
      impact: result.impact
    };
  }).sort((a, b) => b.impact - a.impact);

  const spiderData: SpiderData[] = results.length > 0 ? results.map(result => {
    // Normalize values for radar chart (0-100 scale)
    const maxImpact = Math.max(...results.map(r => r.impact));
    const maxSensitivity = Math.max(...results.map(r => r.sensitivity));
    const maxElasticity = Math.max(...results.map(r => r.elasticity));
    
    return {
      variable: result.variable,
      sensitivity: maxSensitivity > 0 ? (result.sensitivity / maxSensitivity) * 100 : 0,
      impact: maxImpact > 0 ? (result.impact / maxImpact) * 100 : 0,
      elasticity: maxElasticity > 0 ? Math.min((result.elasticity / maxElasticity) * 100, 100) : 0
    };
  }) : [];

  const getImpactColor = (impact: number) => {
    if (impact > baselineResult * 0.1) return 'text-red-600 bg-red-50 border-red-200';
    if (impact > baselineResult * 0.05) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
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
                {formatCurrency(baselineResult)}
                {baselineResult <= 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    ❌ Execute uma simulação primeiro
                  </div>
                )}
                {baselineResult > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Baseline válido
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={runSensitivityAnalysis}
                disabled={isAnalyzing || variables.length === 0 || baselineResult <= 0}
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tornado">Tornado Chart</TabsTrigger>
          <TabsTrigger value="spider">Spider Chart</TabsTrigger>
          <TabsTrigger value="table">Tabela Detalhada</TabsTrigger>
          <TabsTrigger value="interactive">Análise Interativa</TabsTrigger>
        </TabsList>

        <TabsContent value="tornado" className="space-y-4">
          {tornadoData.length > 0 ? (
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tornadoData} layout="horizontal" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="variable" width={120} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value > 0 ? '+' : ''}${formatCurrency(value)}`, 
                          name === 'low' ? 'Impacto Negativo' : 'Impacto Positivo'
                        ]}
                      />
                      <Bar dataKey="low" fill="hsl(var(--destructive))" />
                      <Bar dataKey="high" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">Execute a análise para ver o gráfico Tornado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="spider" className="space-y-4">
          {spiderData.length > 0 ? (
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={spiderData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="variable" />
                      <PolarRadiusAxis angle={0} domain={[0, 100]} />
                      <Radar
                        name="Sensibilidade"
                        dataKey="sensitivity"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                      />
                      <Radar
                        name="Impacto"
                        dataKey="impact"
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.2}
                      />
                      <Radar
                        name="Elasticidade"
                        dataKey="elasticity"
                        stroke="hsl(var(--secondary))"
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.2}
                      />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">Execute a análise para ver o gráfico Spider</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          {results.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Resultados Detalhados</CardTitle>
                <CardDescription>
                  Métricas completas de sensibilidade para cada variável
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">
                          {result.variable.replace(/_/g, ' ')}
                        </h4>
                        <Badge className={getImpactColor(result.impact)}>
                          {result.impact > baselineResult * 0.1 ? 'ALTO' : 
                           result.impact > baselineResult * 0.05 ? 'MÉDIO' : 'BAIXO'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Sensibilidade</p>
                          <p className="font-semibold">{result.sensitivity.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Elasticidade</p>
                          <p className="font-semibold">{result.elasticity.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Impacto</p>
                          <p className="font-semibold">{formatCurrency(result.impact)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Baseline</p>
                          <p className="font-semibold">{formatCurrency(baselineResult)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">Execute a análise para ver a tabela detalhada</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4">
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
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-[120px]">Variável:</Label>
                  <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecione uma variável" />
                    </SelectTrigger>
                    <SelectContent>
                      {variables?.map((variable) => (
                        <SelectItem key={variable.name} value={variable.name}>
                          {variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVariable && variables && (
                  <div className="space-y-4">
                    {(() => {
                      const variable = variables.find(v => v.name === selectedVariable);
                      if (!variable) return null;

                      const baseValue = variable.parameters?.mean || variable.parameters?.mode || 1;
                      const min = baseValue * 0.5;
                      const max = baseValue * 1.5;

                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Valor: {formatCurrency(currentVariableValue)}</Label>
                              <span className="text-sm text-muted-foreground">
                                Baseline: {formatCurrency(baselineResult)} | Original: {formatCurrency(baseValue)}
                              </span>
                            </div>
                            <Slider
                              value={[currentVariableValue]}
                              min={min}
                              max={max}
                              step={baseValue * 0.01}
                              onValueChange={(values) => {
                                setCurrentVariableValue(values[0]);
                                // Debounced analysis - only update variable in parent after user stops dragging
                                if (selectedVariable) {
                                  onVariableChange?.(selectedVariable, values[0]);
                                }
                              }}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{formatCurrency(min)}</span>
                              <span>{formatCurrency(max)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => runSingleVariableAnalysis(selectedVariable, currentVariableValue)}
                              disabled={!baselineResult}
                              className="flex-1"
                            >
                              Analisar Impacto
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCurrentVariableValue(baseValue);
                                onVariableChange?.(selectedVariable, baseValue);
                              }}
                              disabled={currentVariableValue === baseValue}
                            >
                              Reset
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights and Recommendations */}
      {results.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights da Análise de Sensibilidade
          </h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const sortedByElasticity = results.sort((a, b) => b.elasticity - a.elasticity);
              const sortedByImpact = results.sort((a, b) => b.impact - a.impact);
              
              const mostSensitive = sortedByElasticity[0];
              const leastSensitive = sortedByElasticity[sortedByElasticity.length - 1];
              const highestImpact = sortedByImpact[0];

              return (
                <>
                  <p>
                    <strong>Variável mais sensível:</strong> {mostSensitive.variable} 
                    (elasticidade: {mostSensitive.elasticity.toFixed(2)})
                  </p>
                  <p>
                    <strong>Maior impacto absoluto:</strong> {highestImpact.variable} 
                    ({formatCurrency(highestImpact.impact)})
                  </p>
                  <p>
                    <strong>Variável mais estável:</strong> {leastSensitive.variable} 
                    (elasticidade: {leastSensitive.elasticity.toFixed(2)})
                  </p>
                  
                  {/* Strategic recommendations */}
                  <div className="mt-3 space-y-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>🎯 Foco principal:</strong> Monitore "{mostSensitive.variable}" - pequenas mudanças 
                        causam grandes impactos ({mostSensitive.elasticity.toFixed(1)}% de elasticidade).
                      </p>
                    </div>
                    
                    {highestImpact.variable !== mostSensitive.variable && (
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <p className="text-orange-700 dark:text-orange-300">
                          <strong>💰 Maior impacto:</strong> "{highestImpact.variable}" pode gerar 
                          variações de até {formatCurrency(highestImpact.impact)} nos resultados.
                        </p>
                      </div>
                    )}
                    
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <p className="text-green-700 dark:text-green-300">
                        <strong>✅ Mais estável:</strong> "{leastSensitive.variable}" é uma base sólida 
                        para projeções (baixa volatilidade).
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SensitivityAnalysisPanel;