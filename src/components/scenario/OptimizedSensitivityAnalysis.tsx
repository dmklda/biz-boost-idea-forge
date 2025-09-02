import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  StopCircle
} from "lucide-react";
import { SimulationVariable } from "@/hooks/useScenarioSimulator";
import { toast } from "@/components/ui/sonner";
import { useOfflineAnalysisFallback } from "./OfflineAnalysisFallback";

interface OptimizedSensitivityAnalysisProps {
  variables: SimulationVariable[];
  baselineResult: number;
  onRunAnalysis: (variables: SimulationVariable[]) => Promise<number>;
  onAnalysisComplete: (results: any[]) => void;
}

interface AnalysisProgress {
  current: number;
  total: number;
  currentVariable: string;
  estimatedTimeRemaining: number;
}

interface QuickResult {
  variable: string;
  baseValue: number;
  impact: number;
  sensitivity: number;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

const OptimizedSensitivityAnalysis = ({
  variables,
  baselineResult,
  onRunAnalysis,
  onAnalysisComplete
}: OptimizedSensitivityAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({ 
    current: 0, 
    total: 0, 
    currentVariable: '', 
    estimatedTimeRemaining: 0 
  });
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [analysisRange, setAnalysisRange] = useState(15); // Reduced default range for speed
  const [isCancelled, setIsCancelled] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const { calculateOfflineAnalysis, getRecommendations } = useOfflineAnalysisFallback();

  // Initialize quick results structure
  useEffect(() => {
    if (variables.length > 0) {
      setQuickResults(variables.map(variable => ({
        variable: variable.name,
        baseValue: variable.parameters?.mean || variable.parameters?.mode || 1,
        impact: 0,
        sensitivity: 0,
        status: 'pending'
      })));
    }
  }, [variables]);

  // Debounced analysis runner with progress tracking
  const runOptimizedAnalysis = useCallback(async () => {
    if (!variables || variables.length === 0 || baselineResult <= 0) {
      toast.error("Dados insuficientes para análise");
      return;
    }

    setIsAnalyzing(true);
    setIsCancelled(false);
    setStartTime(Date.now());
    
    const results: any[] = [];
    const totalVariables = variables.length;
    
    setProgress({
      current: 0,
      total: totalVariables,
      currentVariable: '',
      estimatedTimeRemaining: 0
    });

    try {
      for (let i = 0; i < variables.length; i++) {
        if (isCancelled) {
          toast.info("Análise cancelada pelo usuário");
          break;
        }

        const variable = variables[i];
        const startVarTime = Date.now();
        
        // Update progress
        setProgress(prev => ({
          ...prev,
          current: i,
          currentVariable: variable.name,
          estimatedTimeRemaining: calculateETA(startTime, i, totalVariables)
        }));

        // Update quick results status
        setQuickResults(prev => prev.map(r => 
          r.variable === variable.name 
            ? { ...r, status: 'analyzing' }
            : r
        ));

        try {
          // Analyze variable with optimized range
          const baseValue = variable.parameters?.mean || variable.parameters?.mode || 1;
          const delta = (baseValue * analysisRange) / 100;
          
          // Test only one direction for speed (high value)
          const highValue = baseValue + delta;
          const highTestVars = variables.map(v =>
            v.name === variable.name 
              ? { ...v, parameters: { ...v.parameters, mean: highValue, mode: highValue } }
              : v
          );
          
          const highResult = await onRunAnalysis(highTestVars);
          
          if (highResult && highResult !== 0) {
            const impact = Math.abs(highResult - baselineResult);
            const percentChange = ((highResult - baselineResult) / baselineResult) * 100;
            const sensitivity = Math.abs(percentChange / analysisRange); // Simplified sensitivity
            
            const result = {
              variable: variable.name,
              baselineValue: baseValue,
              lowValue: baseValue - delta,
              highValue: highValue,
              lowResult: baselineResult, // Approximation for speed
              highResult,
              impact,
              sensitivity,
              elasticity: sensitivity
            };
            
            results.push(result);
            
            // Update quick results
            setQuickResults(prev => prev.map(r => 
              r.variable === variable.name 
                ? { ...r, impact, sensitivity, status: 'completed' }
                : r
            ));
            
            // Show real-time feedback
            const changeText = percentChange > 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`;
            toast.success(`${variable.name}: ${changeText} de impacto`, {
              duration: 2000
            });
            
          } else {
            throw new Error("Resultado inválido");
          }
          
        } catch (error) {
          console.warn(`Erro ao analisar ${variable.name}:`, error);
          setQuickResults(prev => prev.map(r => 
            r.variable === variable.name 
              ? { ...r, status: 'error' }
              : r
          ));
          
          // If too many errors, suggest offline mode
          const errorCount = quickResults.filter(r => r.status === 'error').length;
          if (errorCount >= 2 && !useOfflineMode) {
            toast.error("Muitos erros detectados. Considere usar modo offline.", {
              action: {
                label: "Modo Offline",
                onClick: () => runOfflineAnalysis()
              }
            });
          }
        }
      }
      
      // Final progress update
      setProgress(prev => ({
        ...prev,
        current: totalVariables,
        currentVariable: 'Concluído',
        estimatedTimeRemaining: 0
      }));
      
      if (results.length > 0) {
        onAnalysisComplete(results);
        toast.success(`Análise otimizada concluída! ${results.length} variáveis analisadas`);
      } else {
        toast.error("Nenhuma variável foi analisada com sucesso");
      }
      
    } catch (error) {
      console.error("Erro na análise otimizada:", error);
      toast.error("Erro durante a análise");
    } finally {
      setIsAnalyzing(false);
    }
  }, [variables, baselineResult, analysisRange, onRunAnalysis, onAnalysisComplete, isCancelled, startTime]);

  // Offline analysis fallback
  const runOfflineAnalysis = useCallback(() => {
    if (!variables || variables.length === 0 || baselineResult <= 0) {
      toast.error("Dados insuficientes para análise offline");
      return;
    }

    try {
      setUseOfflineMode(true);
      setIsAnalyzing(true);
      
      toast.info("Executando análise offline baseada em estimativas...");
      
      // Simulate progress for UX
      let progressCount = 0;
      const progressInterval = setInterval(() => {
        progressCount++;
        setProgress(prev => ({
          ...prev,
          current: progressCount,
          total: variables.length,
          currentVariable: variables[progressCount - 1]?.name || 'Calculando...'
        }));
        
        if (progressCount >= variables.length) {
          clearInterval(progressInterval);
        }
      }, 200);
      
      // Calculate offline results
      setTimeout(() => {
        const offlineResults = calculateOfflineAnalysis({
          variables,
          baselineResult,
          analysisRange
        });
        
        const recommendations = getRecommendations(offlineResults);
        
        // Update quick results
        setQuickResults(offlineResults.map(result => ({
          variable: result.variable,
          baseValue: result.baselineValue,
          impact: result.impact,
          sensitivity: result.sensitivity,
          status: 'completed' as const
        })));
        
        onAnalysisComplete(offlineResults);
        
        toast.success("Análise offline concluída! Baseada em estimativas.", {
          description: "Para maior precisão, execute uma análise online completa.",
          duration: 5000
        });
        
        // Show recommendations
        recommendations.recommendations.forEach((rec, index) => {
          setTimeout(() => {
            toast.info(rec, { duration: 3000 });
          }, (index + 1) * 1000);
        });
        
        setIsAnalyzing(false);
      }, variables.length * 200 + 500);
      
    } catch (error) {
      console.error("Erro na análise offline:", error);
      toast.error("Erro na análise offline");
      setIsAnalyzing(false);
    }
  }, [variables, baselineResult, analysisRange, calculateOfflineAnalysis, getRecommendations, onAnalysisComplete]);

  const calculateETA = (startTime: number, currentIndex: number, total: number): number => {
    if (currentIndex === 0) return 0;
    
    const elapsed = Date.now() - startTime;
    const avgTimePerVariable = elapsed / currentIndex;
    const remaining = total - currentIndex;
    
    return Math.ceil((avgTimePerVariable * remaining) / 1000); // in seconds
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing': return <Activity className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'border-blue-200 bg-blue-50';
      case 'completed': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimized Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Análise de Sensibilidade Otimizada
          </CardTitle>
          <CardDescription>
            Análise rápida com feedback em tempo real e progresso detalhado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Analysis Range Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Faixa de Análise: ±{analysisRange}%</label>
                <Slider
                  value={[analysisRange]}
                  onValueChange={(value) => setAnalysisRange(value[0])}
                  max={30}
                  min={5}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Menor faixa = análise mais rápida
                </p>
              </div>
              
              <div className="flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button 
                    onClick={runOptimizedAnalysis}
                    disabled={isAnalyzing || variables.length === 0 || baselineResult <= 0}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Análise Rápida
                      </>
                    )}
                  </Button>
                  
                  {isAnalyzing ? (
                    <Button 
                      variant="outline"
                      onClick={() => setIsCancelled(true)}
                      className="px-3"
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={runOfflineAnalysis}
                      disabled={variables.length === 0 || baselineResult <= 0}
                      className="px-3"
                      title="Análise rápida baseada em estimativas"
                    >
                      ⚡ Offline
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress Indicator */}
            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso: {progress.current}/{progress.total}</span>
                  <span>
                    {progress.estimatedTimeRemaining > 0 && 
                      `ETA: ${formatTime(progress.estimatedTimeRemaining)}`
                    }
                  </span>
                </div>
                <Progress 
                  value={(progress.current / progress.total) * 100} 
                  className="w-full"
                />
                {progress.currentVariable && (
                  <p className="text-sm text-muted-foreground">
                    Analisando: <span className="font-medium">{progress.currentVariable}</span>
                  </p>
                )}
              </div>
            )}
            
            {/* Baseline Status */}
            <Alert>
              <AlertDescription>
                <strong>Baseline:</strong> R$ {baselineResult.toLocaleString()}
                {baselineResult <= 0 && (
                  <span className="text-red-600 ml-2">
                    ⚠️ Execute uma simulação primeiro
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Quick Results Display */}
      {quickResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados em Tempo Real</CardTitle>
            <CardDescription>
              Acompanhe o progresso e resultados de cada variável
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickResults.map((result, index) => (
                <div 
                  key={result.variable}
                  className={`p-3 rounded-lg border transition-all ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm capitalize">
                      {result.variable.replace(/_/g, ' ')}
                    </span>
                    {getStatusIcon(result.status)}
                  </div>
                  
                  {result.status === 'completed' && (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Impacto:</span>
                        <span className="font-medium">
                          R$ {result.impact.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sensibilidade:</span>
                        <Badge variant="outline" className="text-xs">
                          {result.sensitivity.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {result.status === 'error' && (
                    <p className="text-xs text-red-600">
                      Erro na análise
                    </p>
                  )}
                  
                  {result.status === 'pending' && (
                    <p className="text-xs text-gray-500">
                      Aguardando...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedSensitivityAnalysis;