import { SimulationVariable } from "@/hooks/useScenarioSimulator";
import { getHumanReadableVariableName } from "@/lib/variable-names";

interface OfflineAnalysisFallbackProps {
  variables: SimulationVariable[];
  baselineResult: number;
  analysisRange: number;
}

// Simplified offline analysis using known elasticities and approximations
export const useOfflineAnalysisFallback = () => {
  
  // Known elasticity ranges for different variable types
  const getVariableElasticity = (variableName: string, impact: string): number => {
    const elasticityMap = {
      // High impact variables
      market_demand: { revenue: 1.2, costs: 0.0, growth_rate: 0.8, market_share: 1.0, churn_rate: 0.0 },
      pricing: { revenue: 1.5, costs: 0.0, growth_rate: 0.3, market_share: 0.4, churn_rate: 0.2 },
      customer_acquisition_efficiency: { revenue: 0.8, costs: 0.4, growth_rate: 1.1, market_share: 0.6, churn_rate: 0.0 },
      
      // Medium impact variables
      operational_costs: { revenue: 0.0, costs: 1.0, growth_rate: 0.0, market_share: 0.0, churn_rate: 0.0 },
      competition_intensity: { revenue: 0.6, costs: 0.1, growth_rate: 0.4, market_share: 1.2, churn_rate: 0.3 },
      
      // Low-medium impact variables
      churn_rate_variation: { revenue: 0.7, costs: 0.0, growth_rate: 0.5, market_share: 0.0, churn_rate: 1.4 },
      transaction_volume_volatility: { revenue: 1.1, costs: 0.2, growth_rate: 0.6, market_share: 0.3, churn_rate: 0.0 },
      
      // Low impact variables
      cpm_fluctuation: { revenue: 0.4, costs: 0.0, growth_rate: 0.1, market_share: 0.1, churn_rate: 0.0 },
      user_engagement_rate: { revenue: 0.5, costs: 0.0, growth_rate: 0.3, market_share: 0.2, churn_rate: 0.1 },
      repeat_purchase_rate: { revenue: 0.3, costs: 0.0, growth_rate: 0.2, market_share: 0.0, churn_rate: 0.0 },
      market_saturation_rate: { revenue: 0.2, costs: 0.0, growth_rate: 0.4, market_share: 0.3, churn_rate: 0.0 }
    };
    
    return elasticityMap[variableName]?.[impact] || 0.5; // Default elasticity
  };
  
  const calculateOfflineAnalysis = ({ variables, baselineResult, analysisRange }: OfflineAnalysisFallbackProps) => {
    const results: any[] = [];
    
    variables.forEach(variable => {
      const baseValue = variable.parameters?.mean || variable.parameters?.mode || 1;
      const elasticity = getVariableElasticity(variable.name, variable.impact);
      
      // Calculate approximate impact using elasticity
      const percentChange = analysisRange / 100; // Convert to decimal
      const outputPercentChange = elasticity * percentChange;
      const impact = Math.abs(baselineResult * outputPercentChange);
      
      // Generate approximate high and low results
      const highResult = baselineResult + impact;
      const lowResult = baselineResult - impact;
      
      // Calculate sensitivity (simplified)
      const sensitivity = elasticity * 100; // Convert to percentage
      
      results.push({
        variable: variable.name,
        baselineValue: baseValue,
        lowValue: baseValue - (baseValue * percentChange),
        highValue: baseValue + (baseValue * percentChange),
        lowResult,
        highResult,
        impact,
        sensitivity,
        elasticity: elasticity * 100,
        isOfflineCalculation: true // Flag to indicate this is approximated
      });
    });
    
    // Sort by impact (descending)
    return results.sort((a, b) => b.impact - a.impact);
  };
  
  const getRecommendations = (results: any[]) => {
    const highImpactVars = results.filter(r => r.elasticity > 80);
    const mediumImpactVars = results.filter(r => r.elasticity >= 40 && r.elasticity <= 80);
    const lowImpactVars = results.filter(r => r.elasticity < 40);
    
      const recommendations = [
        `Foque em otimizar as ${highImpactVars.length} variáveis de maior impacto para resultados rápidos`,
        `Monitore de perto: ${highImpactVars.map(v => getHumanReadableVariableName(v.variable)).join(', ')}`,
        `Considere estratégias para as variáveis de médio impacto: ${mediumImpactVars.map(v => getHumanReadableVariableName(v.variable)).join(', ')}`,
        lowImpactVars.length > 0 ? `Menor prioridade: ${lowImpactVars.map(v => getHumanReadableVariableName(v.variable)).join(', ')}` : null
      ].filter(Boolean) as string[];

      return {
        highImpact: highImpactVars.map(v => v.variable),
        mediumImpact: mediumImpactVars.map(v => v.variable),
        lowImpact: lowImpactVars.map(v => v.variable),
        recommendations
      };
  };
  
  return {
    calculateOfflineAnalysis,
    getRecommendations
  };
};

export default useOfflineAnalysisFallback;