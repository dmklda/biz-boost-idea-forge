import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { REVENUE_MODELS } from '@/types/scenario';
import type { 
  IdeaFinancialData, 
  SimulationParams, 
  SimulationResults, 
  ScenarioType,
  SimulationVariable,
  MonteCarloResult
} from '@/types/scenario';
import { toast } from '@/components/ui/sonner';

export const useScenarioSimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (
    ideaData: IdeaFinancialData,
    simulationParams: SimulationParams,
    scenarioTypes: ScenarioType[] = ['optimistic', 'realistic', 'pessimistic']
  ): Promise<SimulationResults | null> => {
    try {
      setIsSimulating(true);
      setError(null);
      
      console.log('Starting Monte Carlo simulation...');
      console.log('Input data:', { ideaData, simulationParams, scenarioTypes });
      
      const { data, error } = await supabase.functions.invoke('scenario-simulator', {
        body: {
          ideaData,
          simulationParams,
          scenarioTypes
        }
      });

      console.log('Raw response from edge function:', { data, error });

      if (error) {
        console.error('Supabase function error details:', error);
        throw new Error(error.message || 'Erro na simulação de cenários');
      }

      if (!data) {
        throw new Error('Nenhum resultado retornado da simulação');
      }

      if (data.error) {
        console.error('Edge function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('Simulation completed successfully:', data);
      setSimulationResults(data);
      toast.success('Simulação Monte Carlo concluída com sucesso!');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na simulação';
      setError(errorMessage);
      toast.error(`Erro na simulação: ${errorMessage}`);
      console.error('Detailed simulation error:', err);
      return null;
    } finally {
      setIsSimulating(false);
    }
  };

  const createDefaultVariables = (ideaData: IdeaFinancialData): SimulationVariable[] => {
    const variables: SimulationVariable[] = [];

    // Market demand variability
    variables.push({
      name: 'market_demand',
      type: 'normal',
      parameters: {
        mean: 1.0,
        stdDev: 0.2
      },
      impact: 'revenue'
    });

    // Customer acquisition cost
    variables.push({
      name: 'customer_acquisition_cost',
      type: 'triangular',
      parameters: {
        min: 0.8,
        max: 1.5,
        mode: 1.0
      },
      impact: 'costs'
    });

    // Competition impact
    variables.push({
      name: 'competition_impact',
      type: 'uniform',
      parameters: {
        min: 0.7,
        max: 1.3
      },
      impact: 'market_share'
    });

    // Operational efficiency
    variables.push({
      name: 'operational_efficiency',
      type: 'normal',
      parameters: {
        mean: 1.0,
        stdDev: 0.15
      },
      impact: 'costs'
    });

    // Market growth rate
    variables.push({
      name: 'market_growth_rate',
      type: 'triangular',
      parameters: {
        min: 0.02,
        max: 0.15,
        mode: 0.05
      },
      impact: 'growth_rate'
    });

    return variables;
  };

  const getDefaultSimulationParams = (): SimulationParams => {
    return {
      timeHorizon: 36, // 3 years
      iterations: 1000,
      confidenceLevel: 95,
      variables: []
    };
  };

  const getScenarioInfo = (scenario: ScenarioType) => {
    const scenarioInfo = {
      optimistic: {
        name: 'Otimista',
        description: 'Cenário com condições favoráveis de mercado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '📈'
      },
      realistic: {
        name: 'Realista',
        description: 'Cenário baseado em condições normais de mercado',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '📊'
      },
      pessimistic: {
        name: 'Pessimista',
        description: 'Cenário com condições adversas de mercado',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '📉'
      }
    };
    
    return scenarioInfo[scenario];
  };

  const calculateROI = (results: MonteCarloResult[], initialInvestment: number): number => {
    if (results.length === 0) return 0;
    const finalResult = results[results.length - 1];
    return ((finalResult.cumulativeProfit + initialInvestment) / initialInvestment - 1) * 100;
  };

  const calculatePaybackPeriod = (results: MonteCarloResult[]): number | null => {
    // Find the month where cumulative profit becomes positive
    for (const result of results) {
      if (result.cumulativeProfit >= 0) {
        return result.month;
      }
    }
    return null;
  };

  const getConfidenceInterval = (statistics: any, confidence: number = 0.95): [number, number] => {
    // Return confidence interval based on statistics
    return [statistics?.percentile5 || 0, statistics?.percentile95 || 0];
  };

  const exportResults = (format: 'json' | 'csv' | 'pdf' = 'json') => {
    if (!simulationResults) {
      toast.error('Nenhum resultado para exportar');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(simulationResults, null, 2);
        filename = `simulacao-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        content = convertToCSV(simulationResults);
        filename = `simulacao-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      
      default:
        content = JSON.stringify(simulationResults, null, 2);
        filename = `simulacao-${Date.now()}.json`;
        mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Resultados exportados com sucesso!');
  };

  const convertToCSV = (results: SimulationResults): string => {
    const headers = ['Scenario', 'Month', 'Revenue', 'Costs', 'Profit', 'Cumulative_Profit'];
    const rows = [headers.join(',')];

    Object.entries(results).forEach(([scenario, result]) => {
      if (result && result.results) {
        result.results.forEach(monthData => {
          rows.push([
            scenario,
            monthData.month,
            monthData.revenue.toFixed(2),
            monthData.costs.toFixed(2),
            monthData.profit.toFixed(2),
            monthData.cumulativeProfit.toFixed(2)
          ].join(','));
        });
      }
    });

    return rows.join('\n');
  };

  const clearResults = () => {
    setSimulationResults(null);
    setError(null);
  };

  const getVariableTypeInfo = (type: SimulationVariable['type']) => {
    const typeInfo = {
      normal: {
        name: 'Normal',
        description: 'Distribuição normal (curva de sino)',
        parameters: ['mean', 'stdDev'],
        icon: '📊'
      },
      uniform: {
        name: 'Uniforme',
        description: 'Distribuição uniforme (todos os valores igualmente prováveis)',
        parameters: ['min', 'max'],
        icon: '📏'
      },
      triangular: {
        name: 'Triangular',
        description: 'Distribuição triangular (valor mais provável no meio)',
        parameters: ['min', 'max', 'mode'],
        icon: '🔺'
      },
      lognormal: {
        name: 'Log-Normal',
        description: 'Distribuição log-normal (para valores sempre positivos)',
        parameters: ['mean', 'stdDev'],
        icon: '📈'
      }
    };
    
    return typeInfo[type];
  };

  const validateSimulationParams = (params: SimulationParams): string[] => {
    const errors: string[] = [];

    if (params.timeHorizon < 1 || params.timeHorizon > 120) {
      errors.push('Horizonte temporal deve estar entre 1 e 120 meses');
    }

    if (params.iterations < 100 || params.iterations > 10000) {
      errors.push('Número de iterações deve estar entre 100 e 10.000');
    }

    if (params.confidenceLevel < 0.8 || params.confidenceLevel > 0.99) {
      errors.push('Nível de confiança deve estar entre 80% e 99%');
    }

    params.variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        errors.push(`Variável ${index + 1}: Nome é obrigatório`);
      }

      const typeInfo = getVariableTypeInfo(variable.type);
      typeInfo.parameters.forEach(param => {
        if (variable.parameters[param as keyof typeof variable.parameters] === undefined) {
          errors.push(`Variável ${variable.name}: Parâmetro ${param} é obrigatório`);
        }
      });
    });

    return errors;
  };

  const getRevenueModelInfo = (modelName: string) => {
    return REVENUE_MODELS[modelName] || REVENUE_MODELS['Subscription'];
  };

  const getAvailableRevenueModels = () => {
    return Object.values(REVENUE_MODELS);
  };

  return {
    // State
    isSimulating,
    simulationResults,
    error,
    
    // Actions
    runSimulation,
    clearResults,
    exportResults,
    
    // Utilities
    createDefaultVariables,
    getDefaultSimulationParams,
    getScenarioInfo,
    getVariableTypeInfo,
    calculateROI,
    calculatePaybackPeriod,
    getConfidenceInterval,
    validateSimulationParams,
    getRevenueModelInfo,
    getAvailableRevenueModels
  };
};