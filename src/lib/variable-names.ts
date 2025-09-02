// Variable name mapping utility for human-readable names
import { useMemo } from 'react';

export interface VariableMapping {
  name: string;
  displayName: string;
  description: string;
  category: 'market' | 'financial' | 'operational' | 'customer';
}

export const VARIABLE_MAPPINGS: Record<string, VariableMapping> = {
  // Market variables
  market_demand: {
    name: 'market_demand',
    displayName: 'Market Demand',
    description: 'Overall market demand fluctuation',
    category: 'market'
  },
  competition_intensity: {
    name: 'competition_intensity',
    displayName: 'Competition Intensity',
    description: 'Level of competitive pressure in the market',
    category: 'market'
  },
  market_saturation_rate: {
    name: 'market_saturation_rate',
    displayName: 'Market Saturation Rate',
    description: 'Rate at which the market becomes saturated',
    category: 'market'
  },
  platform_adoption_rate: {
    name: 'platform_adoption_rate',
    displayName: 'Platform Adoption Rate',
    description: 'Speed of platform adoption by users',
    category: 'market'
  },

  // Financial variables
  operational_costs: {
    name: 'operational_costs',
    displayName: 'Operational Costs',
    description: 'Monthly operational cost variations',
    category: 'financial'
  },
  cpm_fluctuation: {
    name: 'cpm_fluctuation',
    displayName: 'CPM Fluctuation',
    description: 'Cost per mille advertising rate changes',
    category: 'financial'
  },
  transaction_volume_volatility: {
    name: 'transaction_volume_volatility',
    displayName: 'Transaction Volume Volatility',
    description: 'Variability in transaction volumes',
    category: 'financial'
  },

  // Customer variables
  repeat_purchase_rate: {
    name: 'repeat_purchase_rate',
    displayName: 'Repeat Purchase Rate',
    description: 'Rate of customers making repeat purchases',
    category: 'customer'
  },
  churn_rate_variation: {
    name: 'churn_rate_variation',
    displayName: 'Churn Rate Variation',
    description: 'Fluctuation in customer churn rates',
    category: 'customer'
  },
  customer_acquisition_efficiency: {
    name: 'customer_acquisition_efficiency',
    displayName: 'Customer Acquisition Efficiency',
    description: 'Efficiency of customer acquisition campaigns',
    category: 'customer'
  },
  user_engagement_rate: {
    name: 'user_engagement_rate',
    displayName: 'User Engagement Rate',
    description: 'Level of user engagement with the product',
    category: 'customer'
  }
};

/**
 * Get human-readable name for a variable
 */
export const getHumanReadableVariableName = (variableName: string): string => {
  const mapping = VARIABLE_MAPPINGS[variableName];
  if (mapping) {
    return mapping.displayName;
  }
  
  // Fallback: convert snake_case to Title Case
  return variableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get variable description
 */
export const getVariableDescription = (variableName: string): string => {
  const mapping = VARIABLE_MAPPINGS[variableName];
  return mapping?.description || 'Variable description not available';
};

/**
 * Get variable category
 */
export const getVariableCategory = (variableName: string): string => {
  const mapping = VARIABLE_MAPPINGS[variableName];
  return mapping?.category || 'other';
};

/**
 * Get category color for styling
 */
export const getCategoryColor = (category: string): string => {
  const colors = {
    market: 'text-blue-600 bg-blue-50 border-blue-200',
    financial: 'text-green-600 bg-green-50 border-green-200',
    operational: 'text-purple-600 bg-purple-50 border-purple-200',
    customer: 'text-orange-600 bg-orange-50 border-orange-200',
    other: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  
  return colors[category as keyof typeof colors] || colors.other;
};

/**
 * Hook for memoized variable name translations
 */
export const useVariableNames = (variables: string[]) => {
  return useMemo(() => {
    return variables.reduce((acc, variable) => {
      acc[variable] = getHumanReadableVariableName(variable);
      return acc;
    }, {} as Record<string, string>);
  }, [variables]);
};