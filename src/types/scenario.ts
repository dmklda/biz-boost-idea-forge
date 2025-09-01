export interface RevenueModelConfig {
  name: string;
  label: string;
  description: string;
  baseMetrics: string[];
  growthFactors: string[];
}

export const REVENUE_MODELS: Record<string, RevenueModelConfig> = {
  'Subscription': {
    name: 'Subscription',
    label: 'Assinatura (SaaS)',
    description: 'Receita recorrente mensal baseada na base de assinantes',
    baseMetrics: ['Base de Clientes', 'Preço Mensal', 'Taxa de Churn'],
    growthFactors: ['Aquisição de Clientes', 'Retenção', 'Upselling']
  },
  'Freemium': {
    name: 'Freemium',
    label: 'Freemium',
    description: 'Modelo gratuito com conversão para planos premium',
    baseMetrics: ['Usuários Totais', 'Taxa de Conversão', 'Preço Premium'],
    growthFactors: ['Crescimento de Usuários', 'Melhoria na Conversão', 'Value Proposition']
  },
  'Commission': {
    name: 'Commission',
    label: 'Comissão (Marketplace)',
    description: 'Receita baseada em comissão sobre transações',
    baseMetrics: ['Volume de Transações', 'Taxa de Comissão', 'Ticket Médio'],
    growthFactors: ['Número de Vendedores', 'Volume por Vendedor', 'Frequência']
  },
  'Advertising': {
    name: 'Advertising',
    label: 'Publicidade',
    description: 'Receita através de anúncios e patrocínios',
    baseMetrics: ['Usuários Ativos', 'CPM/CPC', 'Engajamento'],
    growthFactors: ['Crescimento de Audiência', 'Melhoria do Targeting', 'Premium Inventory']
  },
  'One-time': {
    name: 'One-time',
    label: 'Pagamento Único',
    description: 'Venda direta de produtos ou serviços',
    baseMetrics: ['Unidades Vendidas', 'Preço Unitário', 'Margem'],
    growthFactors: ['Volume de Vendas', 'Pricing', 'Novos Produtos']
  }
};

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
  impact: 'revenue' | 'costs' | 'market_share' | 'growth_rate' | 'churn_rate';
}

export interface SimulationParams {
  timeHorizon: number;
  iterations: number;
  confidenceLevel: number;
  variables: SimulationVariable[];
}

export interface IdeaFinancialData {
  title: string;
  description: string;
  monetization: string;
  target_market_size: number;
  initial_investment: number;
  monthly_costs: number;
  revenue_model: string;
  pricing: number;
  customer_acquisition_cost?: number;
  churn_rate?: number;
}

export interface MonteCarloResult {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
  customerBase?: number;
}

export interface SimulationResults {
  [scenario: string]: {
    results: MonteCarloResult[];
    statistics: {
      mean: number;
      median: number;
      stdDev: number;
      percentile5: number;
      percentile95: number;
    };
    riskMetrics: {
      probabilityOfLoss: number;
      valueAtRisk: number;
      expectedShortfall: number;
      breakEvenMonth: number;
    };
    finalMetrics: {
      roi: number;
      paybackPeriod: number;
      netPresentValue: number;
      totalRevenue: number;
      totalCosts: number;
      netProfit: number;
    };
  };
}

export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';