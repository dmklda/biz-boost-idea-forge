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
  finalNetProfit?: number;
  finalOperationalProfit?: number;
  totalRevenue?: number;
  totalCosts?: number;
  breakEvenMonth?: number | null;
  monthsToBreakEven?: number | null;
  npv?: number;
  roi?: number;
  profitMargin?: number;
  paybackPeriod?: number | null;
  investmentRecovery?: number;
  monthlyProjections?: {
    month: number;
    revenue: number;
    costs: number;
    operationalProfit: number;
    cumulativeOperationalProfit: number;
    cumulativeNetProfit: number;
    netPresentValue: number;
  }[];
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
  revenueModel?: string;
  simulationParams: SimulationParams;
  results: { [key: string]: MonteCarloResult };
  sensitivityAnalysis: SensitivityAnalysis[];
  insights: string;
  generatedAt: string;
  metadata: {
    totalIterations: number;
    timeHorizon: number;
    confidenceLevel: number;
    revenueModel?: string;
  };
}

export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

export const useScenarioSimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulationCache, setSimulationCache] = useState<Map<string, any>>(new Map());

  const runSimulation = async (
    ideaData: IdeaFinancialData,
    simulationParams: SimulationParams,
    scenarioTypes: ScenarioType[] = ['optimistic', 'realistic', 'pessimistic']
  ): Promise<SimulationResults | null> => {
    try {
      setIsSimulating(true);
      setError(null);
      
      // Create cache key for optimization
      const cacheKey = JSON.stringify({ 
        ideaData: {
          title: ideaData.title,
          initial_investment: ideaData.initial_investment,
          monthly_costs: ideaData.monthly_costs,
          pricing: ideaData.pricing,
          revenue_model: ideaData.revenue_model
        },
        simulationParams: {
          timeHorizon: simulationParams.timeHorizon,
          iterations: simulationParams.iterations,
          variables: simulationParams.variables.map(v => ({
            name: v.name,
            parameters: v.parameters
          }))
        },
        scenarioTypes
      });
      
      // Check cache for repeated simulations
      if (simulationCache.has(cacheKey)) {
        console.log('🚀 Using cached simulation result');
        const cachedResult = simulationCache.get(cacheKey);
        setSimulationResults(cachedResult);
        toast.success('Resultado da simulação (cache)');
        return cachedResult;
      }
      
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
      
      // Cache the result for future use
      setSimulationCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, data);
        // Limit cache size to prevent memory issues
        if (newCache.size > 10) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        return newCache;
      });
      
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
    const revenueModel = ideaData.revenue_model || 'one_time';

    // Base variables for all models
    variables.push({
      name: 'market_demand',
      type: 'normal',
      parameters: {
        mean: 1.0,
        stdDev: 0.25
      },
      impact: 'revenue'
    });

    variables.push({
      name: 'operational_costs',
      type: 'triangular',
      parameters: {
        min: 0.8,
        max: 1.3,
        mode: 1.0
      },
      impact: 'costs'
    });

    variables.push({
      name: 'competition_intensity',
      type: 'uniform',
      parameters: {
        min: 0.7,
        max: 1.4
      },
      impact: 'market_share'
    });

    // Model-specific variables
    switch (revenueModel) {
      case 'subscription':
      case 'freemium':
        variables.push({
          name: 'churn_rate_variation',
          type: 'normal',
          parameters: {
            mean: 1.0,
            stdDev: 0.3
          },
          impact: 'churn_rate'
        });
        
        variables.push({
          name: 'customer_acquisition_efficiency',
          type: 'triangular',
          parameters: {
            min: 0.6,
            max: 1.5,
            mode: 1.0
          },
          impact: 'growth_rate'
        });
        break;

      case 'marketplace':
        variables.push({
          name: 'transaction_volume_volatility',
          type: 'lognormal',
          parameters: {
            mean: 0.0,
            stdDev: 0.4
          },
          impact: 'revenue'
        });
        
        variables.push({
          name: 'platform_adoption_rate',
          type: 'triangular',
          parameters: {
            min: 0.5,
            max: 2.0,
            mode: 1.0
          },
          impact: 'growth_rate'
        });
        break;

      case 'advertising':
        variables.push({
          name: 'cpm_fluctuation',
          type: 'normal',
          parameters: {
            mean: 1.0,
            stdDev: 0.35
          },
          impact: 'revenue'
        });
        
        variables.push({
          name: 'user_engagement_rate',
          type: 'uniform',
          parameters: {
            min: 0.6,
            max: 1.4
          },
          impact: 'revenue'
        });
        break;

      case 'one_time':
      default:
        variables.push({
          name: 'repeat_purchase_rate',
          type: 'triangular',
          parameters: {
            min: 0.1,
            max: 0.4,
            mode: 0.2
          },
          impact: 'revenue'
        });
        
        variables.push({
          name: 'market_saturation_rate',
          type: 'normal',
          parameters: {
            mean: 1.0,
            stdDev: 0.2
          },
          impact: 'growth_rate'
        });
        break;
    }

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

  const getScenarioInfo = (scenario: ScenarioType | string) => {
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
    
    return scenarioInfo[scenario as ScenarioType] || {
      name: 'Desconhecido',
      description: 'Cenário não identificado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '❓'
    };
  };

  const saveSimulation = async (simulationName: string): Promise<boolean> => {
    if (!simulationResults) {
      toast.error('Nenhuma simulação para salvar');
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // Map revenue model names correctly
      const revenueModelMapping: { [key: string]: string } = {
        'Subscription': 'subscription',
        'subscription': 'subscription',
        'Freemium': 'freemium',
        'freemium': 'freemium', 
        'Marketplace': 'marketplace',
        'marketplace': 'marketplace',
        'Advertising': 'advertising',
        'advertising': 'advertising',
        'One-time Payment': 'one_time',
        'one_time': 'one_time',
        'One Time': 'one_time',
        'SaaS': 'subscription', // SaaS maps to subscription
        'B2B SaaS': 'subscription',
        'B2C SaaS': 'subscription'
      };

      const originalRevenueModel = simulationResults.revenueModel || 
                                  simulationResults.metadata?.revenueModel || 
                                  'subscription';
      
      const normalizedRevenueModel = revenueModelMapping[originalRevenueModel] || 'subscription';

      const { error } = await supabase
        .from('scenario_simulations')
        .insert({
          user_id: user.id,
          simulation_name: simulationName,
          simulation_params: simulationResults.simulationParams as any,
          results: simulationResults.results as any,
          revenue_model: normalizedRevenueModel,
          financial_data: {
            idea_title: simulationResults.ideaTitle,
            generated_at: simulationResults.generatedAt,
            original_revenue_model: originalRevenueModel
          } as any
        });

      if (error) {
        console.error('Error saving simulation:', error);
        toast.error('Erro ao salvar simulação');
        return false;
      }

      toast.success('Simulação salva com sucesso!');
      return true;
    } catch (error) {
      console.error('Error saving simulation:', error);
      toast.error('Erro inesperado ao salvar simulação');
      return false;
    }
  };

  const loadSimulations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('scenario_simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading simulations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading simulations:', error);
      return [];
    }
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
    saveSimulation,
    loadSimulations,
    
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