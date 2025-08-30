import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface SimulationVariable {
  name: string;
  type: 'normal' | 'uniform' | 'triangular' | 'lognormal';
  parameters: {
    mean?: number;
    stdDev?: number;
    min?: number;
    max?: number;
    mode?: number;
  };
  impact: 'revenue' | 'costs' | 'growth_rate' | 'market_share' | 'churn_rate';
}

export interface SimulationParams {
  timeHorizon: number; // months
  iterations: number; // Monte Carlo iterations
  confidenceLevel: number; // 0.95 for 95%
  variables: SimulationVariable[];
}

export interface IdeaFinancialData {
  title: string;
  description: string;
  monetization: string;
  target_market_size?: number;
  initial_investment?: number;
  monthly_costs?: number;
  revenue_model?: string;
  pricing?: number;
}

export interface MonteCarloResult {
  scenario: string;
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    percentile_5: number;
    percentile_25: number;
    percentile_75: number;
    percentile_95: number;
  };
  projections: {
    month: number;
    revenue: number;
    costs: number;
    profit: number;
    cumulative_profit: number;
    break_even_probability: number;
  }[];
  riskMetrics: {
    probability_of_loss: number;
    value_at_risk_95: number;
    expected_shortfall: number;
    break_even_month: number | null;
  };
}

export interface SensitivityAnalysis {
  variable: string;
  correlation: number;
  impact_on_npv: number;
  impact_on_break_even: number;
}

export interface SimulationResults {
  ideaTitle: string;
  simulationParams: SimulationParams;
  results: { [key: string]: MonteCarloResult };
  sensitivityAnalysis: SensitivityAnalysis[];
  insights: string;
  generatedAt: string;
  metadata: {
    totalIterations: number;
    timeHorizon: number;
    confidenceLevel: number;
  };
}

export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

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
      timeHorizon: 24, // 2 years
      iterations: 1000,
      confidenceLevel: 0.95,
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

  const calculateROI = (result: MonteCarloResult, initialInvestment: number): number => {
    const finalProfit = result.statistics.mean;
    return ((finalProfit + initialInvestment) / initialInvestment - 1) * 100;
  };

  const calculatePaybackPeriod = (result: MonteCarloResult): number | null => {
    // Find the month where cumulative profit becomes positive
    for (const projection of result.projections) {
      if (projection.cumulative_profit >= 0) {
        return projection.month;
      }
    }
    return null;
  };

  const getConfidenceInterval = (result: MonteCarloResult, confidence: number = 0.95): [number, number] => {
    const alpha = 1 - confidence;
    const lowerPercentile = alpha / 2;
    const upperPercentile = 1 - alpha / 2;
    
    // For 95% confidence: 2.5th and 97.5th percentiles
    return [result.statistics.percentile_5, result.statistics.percentile_95];
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
        filename = `simulacao-${simulationResults.ideaTitle.replace(/\s+/g, '-')}-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        content = convertToCSV(simulationResults);
        filename = `simulacao-${simulationResults.ideaTitle.replace(/\s+/g, '-')}-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      
      default:
        content = JSON.stringify(simulationResults, null, 2);
        filename = `simulacao-${simulationResults.ideaTitle.replace(/\s+/g, '-')}-${Date.now()}.json`;
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
    const headers = ['Scenario', 'Month', 'Revenue', 'Costs', 'Profit', 'Cumulative_Profit', 'Break_Even_Probability'];
    const rows = [headers.join(',')];

    Object.entries(results.results).forEach(([scenario, result]) => {
      result.projections.forEach(projection => {
        rows.push([
          scenario,
          projection.month,
          projection.revenue.toFixed(2),
          projection.costs.toFixed(2),
          projection.profit.toFixed(2),
          projection.cumulative_profit.toFixed(2),
          projection.break_even_probability.toFixed(4)
        ].join(','));
      });
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
    validateSimulationParams
  };
};