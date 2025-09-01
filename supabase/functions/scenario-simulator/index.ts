import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== SCENARIO SIMULATOR STARTED ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') }
        }
      }
    );

    const { ideaData, simulationParams, scenarioTypes } = await req.json();
    console.log('Received data:', { ideaData, simulationParams, scenarioTypes });

    // Validate input data
    if (!ideaData || !simulationParams) {
      throw new Error('ideaData and simulationParams are required');
    }

    // Detect and validate revenue model
    const revenueModel = detectRevenueModel(ideaData);
    console.log('Detected revenue model:', revenueModel);

    // Validate financial data
    const financialValidation = validateFinancialInputs(ideaData);
    if (!financialValidation.isValid) {
      throw new Error(`Invalid financial data: ${financialValidation.errors.join(', ')}`);
    }

    // Validate simulation parameters
    if (!simulationParams.timeHorizon || simulationParams.timeHorizon <= 0) {
      throw new Error('timeHorizon must be a positive number');
    }
    if (!simulationParams.iterations || simulationParams.iterations <= 0) {
      throw new Error('iterations must be a positive number');
    }

    // Ensure variables array exists
    if (!simulationParams.variables) {
      simulationParams.variables = [];
    }

    // Validate scenario types
    if (!scenarioTypes || scenarioTypes.length === 0) {
      throw new Error('At least one scenario type is required');
    }

    console.log(`Starting Monte Carlo simulation with ${simulationParams.iterations} iterations`);
    console.log(`Revenue model: ${revenueModel}`);
    console.log(`Scenarios: ${scenarioTypes.join(', ')}`);

    // Define scenario parameters based on revenue model
    const scenarios = getScenarioParameters(revenueModel);
    const results = {};
    const sensitivityAnalysis = [];

    // Run simulation for each scenario
    for (const scenarioType of scenarioTypes) {
      console.log(`Running ${scenarioType} scenario simulation...`);
      const scenarioParams = scenarios[scenarioType];
      const monteCarloResults = await runMonteCarloSimulation(ideaData, simulationParams, scenarioParams, revenueModel);
      results[scenarioType] = monteCarloResults;
    }

    // Perform sensitivity analysis
    if (simulationParams.variables.length > 0) {
      console.log('Performing sensitivity analysis...');
      for (const variable of simulationParams.variables) {
        const sensitivity = await performSensitivityAnalysis(ideaData, simulationParams, variable, scenarios.realistic, revenueModel);
        sensitivityAnalysis.push(sensitivity);
      }
    }

    // Generate insights using AI
    console.log('Generating AI insights...');
    const insights = await generateSimulationInsights(ideaData, results, sensitivityAnalysis, revenueModel);
    console.log('AI insights generated:', insights ? 'Success' : 'Failed');

    const response = {
      ideaTitle: ideaData.title,
      revenueModel,
      simulationParams,
      results,
      sensitivityAnalysis,
      insights,
      generatedAt: new Date().toISOString(),
      metadata: {
        totalIterations: simulationParams.iterations * scenarioTypes.length,
        timeHorizon: simulationParams.timeHorizon,
        confidenceLevel: simulationParams.confidenceLevel,
        revenueModel
      }
    };

    console.log('Monte Carlo simulation completed successfully');
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in scenario-simulator function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      results: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Revenue model detection
function detectRevenueModel(ideaData) {
  const description = (ideaData.description || '').toLowerCase();
  const monetization = (ideaData.monetization || '').toLowerCase();
  
  if (monetization.includes('assinatura') || monetization.includes('subscription') || 
      monetization.includes('mensal') || monetization.includes('saas')) {
    return 'subscription';
  }
  
  if (monetization.includes('freemium') || description.includes('freemium')) {
    return 'freemium';
  }
  
  if (monetization.includes('marketplace') || monetization.includes('comissão')) {
    return 'marketplace';
  }
  
  if (monetization.includes('publicidade') || monetization.includes('anúncios')) {
    return 'advertising';
  }
  
  return 'one_time';
}

// Financial validation
function validateFinancialInputs(ideaData) {
  const errors = [];
  
  if (!ideaData.initial_investment || ideaData.initial_investment <= 0) {
    errors.push('Initial investment must be greater than 0');
  }
  
  if (!ideaData.monthly_costs || ideaData.monthly_costs <= 0) {
    errors.push('Monthly costs must be greater than 0');
  }
  
  if (!ideaData.pricing || ideaData.pricing <= 0) {
    errors.push('Pricing must be greater than 0');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Scenario parameters based on revenue model
function getScenarioParameters(revenueModel) {
  const baseScenarios = {
    optimistic: {
      market_growth_multiplier: 1.3,
      customer_acquisition_multiplier: 1.5,
      retention_multiplier: 1.2,
      pricing_power_multiplier: 1.1,
      cost_efficiency_multiplier: 0.8,
      competition_impact: 0.7
    },
    realistic: {
      market_growth_multiplier: 1.0,
      customer_acquisition_multiplier: 1.0,
      retention_multiplier: 1.0,
      pricing_power_multiplier: 1.0,
      cost_efficiency_multiplier: 1.0,
      competition_impact: 1.0
    },
    pessimistic: {
      market_growth_multiplier: 0.7,
      customer_acquisition_multiplier: 0.6,
      retention_multiplier: 0.8,
      pricing_power_multiplier: 0.9,
      cost_efficiency_multiplier: 1.3,
      competition_impact: 1.4
    }
  };

  // Adjust parameters based on revenue model
  const modelAdjustments = {
    subscription: {
      churn_rate_base: 0.05, // 5% monthly churn
      growth_rate_base: 0.15, // 15% monthly growth
      market_penetration_max: 0.10 // 10% max market penetration
    },
    freemium: {
      conversion_rate_base: 0.02, // 2% conversion rate
      growth_rate_base: 0.25, // 25% monthly growth
      market_penetration_max: 0.20 // 20% max market penetration
    },
    marketplace: {
      commission_rate_base: 0.05, // 5% commission
      transaction_growth_base: 0.20, // 20% monthly transaction growth
      market_penetration_max: 0.15 // 15% max market penetration
    },
    advertising: {
      cpm_base: 5.0, // $5 CPM
      impression_growth_base: 0.30, // 30% monthly growth
      market_penetration_max: 0.25 // 25% max market penetration
    },
    one_time: {
      repeat_purchase_rate: 0.20, // 20% repeat purchases
      growth_rate_base: 0.10, // 10% monthly growth
      market_penetration_max: 0.05 // 5% max market penetration
    }
  };

  // Merge base scenarios with model-specific adjustments
  Object.keys(baseScenarios).forEach(scenario => {
    baseScenarios[scenario] = { ...baseScenarios[scenario], ...modelAdjustments[revenueModel] };
  });

  return baseScenarios;
}

// Main Monte Carlo simulation with revenue model logic
async function runMonteCarloSimulation(ideaData, params, scenarioParams, revenueModel) {
  const iterations = params.iterations;
  const timeHorizon = params.timeHorizon;
  const results = [];
  const finalValues = [];

  // Extract financial parameters
  const initialInvestment = Math.max(parseFloat(ideaData.initial_investment) || 10000, 100);
  const baseMonthlyCosts = Math.max(parseFloat(ideaData.monthly_costs) || 1000, 10);
  const pricing = Math.max(parseFloat(ideaData.pricing) || 50, 1);
  const targetMarketSize = Math.max(parseFloat(ideaData.target_market_size) || 100000, 1000);

  console.log(`Base parameters: Investment=${initialInvestment}, Costs=${baseMonthlyCosts}, Pricing=${pricing}, Market=${targetMarketSize}`);

  // Initialize tracking variables
  const monthlyResults = [];
  let totalCustomers = 0;
  let breakEvenMonth = null;

  for (let i = 0; i < iterations; i++) {
    const iterationResults = [];
    let iterationCumulativeProfit = -initialInvestment;
    let iterationCustomers = 0;
    let monthlyActiveUsers = 0;

    for (let month = 1; month <= timeHorizon; month++) {
      // Generate random factors
      const randomFactors = generateRandomFactors(params.variables, scenarioParams);
      
      // Calculate revenue based on model
      const revenueData = calculateRevenueByModel(
        revenueModel, 
        month, 
        iterationCustomers, 
        monthlyActiveUsers, 
        pricing, 
        targetMarketSize, 
        scenarioParams, 
        randomFactors
      );

      iterationCustomers = revenueData.totalCustomers;
      monthlyActiveUsers = revenueData.activeUsers;
      const monthlyRevenue = revenueData.revenue;

      // Calculate costs (with operational scaling)
      const monthlyCosts = calculateMonthlyCosts(baseMonthlyCosts, month, iterationCustomers, scenarioParams, randomFactors);
      
      // Calculate profit
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      iterationCumulativeProfit += monthlyProfit;

      // Check for break-even
      if (iterationCumulativeProfit > 0 && breakEvenMonth === null) {
        breakEvenMonth = month;
      }

      // Store first iteration for projections
      if (i === 0) {
        monthlyResults.push({
          month,
          revenue: monthlyRevenue,
          costs: monthlyCosts,
          operationalProfit: monthlyProfit,
          cumulativeProfit: iterationCumulativeProfit,
          totalCustomers: iterationCustomers,
          activeUsers: monthlyActiveUsers,
          netPresentValue: monthlyProfit / Math.pow(1 + 0.1/12, month)
        });
      }

      iterationResults.push(iterationCumulativeProfit);
    }

    results.push(iterationResults);
    finalValues.push(iterationResults[iterationResults.length - 1]);
  }

  // Calculate statistics
  const statistics = calculateStatistics(finalValues);
  const finalProfit = statistics.mean;
  const totalRevenue = monthlyResults.reduce((sum, month) => sum + month.revenue, 0);
  const totalCosts = monthlyResults.reduce((sum, month) => sum + month.costs, 0);
  const npvValues = monthlyResults.map(month => month.netPresentValue);
  const totalNPV = npvValues.reduce((sum, npv) => sum + npv, 0) - initialInvestment;

  // Calculate risk metrics
  const riskMetrics = calculateRiskMetrics(results, initialInvestment);

  return {
    scenario: 'realistic',
    revenueModel,
    finalNetProfit: finalProfit,
    finalOperationalProfit: totalRevenue - totalCosts,
    totalRevenue,
    totalCosts,
    breakEvenMonth,
    monthlyProjections: monthlyResults,
    statistics,
    riskMetrics,
    npv: totalNPV,
    roi: finalProfit > 0 ? ((finalProfit + initialInvestment) / initialInvestment) * 100 : -100,
    profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
    paybackPeriod: breakEvenMonth,
    investmentRecovery: finalProfit + initialInvestment,
    projections: monthlyResults.map(month => ({
      month: month.month,
      revenue: month.revenue,
      costs: month.costs,
      profit: month.operationalProfit,
      cumulative_profit: month.cumulativeProfit,
      total_customers: month.totalCustomers,
      active_users: month.activeUsers,
      break_even_probability: month.cumulativeProfit > 0 ? 1 : 0
    }))
  };
}

// Revenue calculation by model
function calculateRevenueByModel(model, month, currentCustomers, currentActiveUsers, pricing, marketSize, scenarioParams, randomFactors) {
  let newCustomers = 0;
  let activeUsers = currentActiveUsers;
  let totalCustomers = currentCustomers;
  let revenue = 0;

  // Base customer acquisition rate (% of market per month)
  const baseAcquisitionRate = 0.01; // 1% of market per month
  const maxPenetration = scenarioParams.market_penetration_max || 0.10;
  
  // Calculate market penetration
  const currentPenetration = totalCustomers / marketSize;
  const penetrationMultiplier = Math.max(0.1, 1 - (currentPenetration / maxPenetration));

  switch (model) {
    case 'subscription':
      // SaaS/Subscription model
      const churnRate = (scenarioParams.churn_rate_base || 0.05) * (randomFactors.churn_modifier || 1);
      const growthRate = (scenarioParams.growth_rate_base || 0.15) * scenarioParams.customer_acquisition_multiplier * penetrationMultiplier;
      
      // Calculate churn (lost customers)
      const churnedCustomers = activeUsers * churnRate;
      
      // Calculate new acquisitions
      newCustomers = Math.max(0, marketSize * baseAcquisitionRate * growthRate * (randomFactors.demand_factor || 1));
      
      // Update active users
      activeUsers = Math.max(0, activeUsers - churnedCustomers + newCustomers);
      totalCustomers += newCustomers;
      
      // Monthly recurring revenue
      revenue = activeUsers * pricing * scenarioParams.pricing_power_multiplier;
      break;

    case 'freemium':
      // Freemium model
      const conversionRate = (scenarioParams.conversion_rate_base || 0.02) * scenarioParams.retention_multiplier;
      const freeUserGrowth = (scenarioParams.growth_rate_base || 0.25) * scenarioParams.customer_acquisition_multiplier * penetrationMultiplier;
      
      // Free users acquisition
      const newFreeUsers = Math.max(0, marketSize * baseAcquisitionRate * freeUserGrowth * (randomFactors.demand_factor || 1));
      totalCustomers += newFreeUsers;
      
      // Convert free to paid
      const newPaidUsers = totalCustomers * conversionRate;
      activeUsers = Math.min(activeUsers + newPaidUsers, totalCustomers * 0.1); // Max 10% paid conversion
      
      // Revenue from paid users
      revenue = activeUsers * pricing * scenarioParams.pricing_power_multiplier;
      break;

    case 'marketplace':
      // Marketplace model
      const commissionRate = scenarioParams.commission_rate_base || 0.05;
      const transactionGrowth = (scenarioParams.transaction_growth_base || 0.20) * scenarioParams.customer_acquisition_multiplier * penetrationMultiplier;
      
      // New users joining marketplace
      newCustomers = Math.max(0, marketSize * baseAcquisitionRate * transactionGrowth * (randomFactors.demand_factor || 1));
      totalCustomers += newCustomers;
      activeUsers = totalCustomers * 0.6; // 60% monthly active
      
      // Average transaction value and frequency
      const avgTransactionValue = pricing; // Use pricing as avg transaction value
      const transactionsPerUser = 2; // Average transactions per active user per month
      
      // Total transaction volume
      const transactionVolume = activeUsers * transactionsPerUser * avgTransactionValue;
      revenue = transactionVolume * commissionRate * scenarioParams.pricing_power_multiplier;
      break;

    case 'advertising':
      // Advertising model
      const cpm = (scenarioParams.cpm_base || 5.0) * scenarioParams.pricing_power_multiplier;
      const impressionGrowth = (scenarioParams.impression_growth_base || 0.30) * scenarioParams.customer_acquisition_multiplier * penetrationMultiplier;
      
      // New users
      newCustomers = Math.max(0, marketSize * baseAcquisitionRate * impressionGrowth * (randomFactors.demand_factor || 1));
      totalCustomers += newCustomers;
      activeUsers = totalCustomers * 0.8; // 80% monthly active
      
      // Impressions per user per month
      const impressionsPerUser = 1000;
      const totalImpressions = activeUsers * impressionsPerUser;
      
      // CPM revenue
      revenue = (totalImpressions / 1000) * cpm;
      break;

    case 'one_time':
      // One-time purchase model
      const repeatRate = scenarioParams.repeat_purchase_rate || 0.20;
      const newCustomerGrowth = (scenarioParams.growth_rate_base || 0.10) * scenarioParams.customer_acquisition_multiplier * penetrationMultiplier;
      
      // New customers
      newCustomers = Math.max(0, marketSize * baseAcquisitionRate * newCustomerGrowth * (randomFactors.demand_factor || 1));
      
      // Repeat purchases from existing customers
      const repeatPurchases = totalCustomers * repeatRate;
      
      totalCustomers += newCustomers;
      activeUsers = newCustomers + repeatPurchases; // Active = new + repeat purchases this month
      
      // Revenue from all purchases
      revenue = activeUsers * pricing * scenarioParams.pricing_power_multiplier;
      break;

    default:
      // Default to one-time model
      newCustomers = Math.max(0, marketSize * baseAcquisitionRate * penetrationMultiplier * (randomFactors.demand_factor || 1));
      totalCustomers += newCustomers;
      activeUsers = newCustomers;
      revenue = activeUsers * pricing;
  }

  return {
    revenue: Math.max(0, revenue),
    totalCustomers: Math.max(0, totalCustomers),
    activeUsers: Math.max(0, activeUsers),
    newCustomers: Math.max(0, newCustomers)
  };
}

// Calculate monthly costs with scaling
function calculateMonthlyCosts(baseCosts, month, customerCount, scenarioParams, randomFactors) {
  // Fixed costs (base operational costs)
  let fixedCosts = baseCosts * scenarioParams.cost_efficiency_multiplier;
  
  // Variable costs (scale with customers)
  const variableCostPerCustomer = baseCosts * 0.1; // 10% of base costs per 1000 customers
  const variableCosts = (customerCount / 1000) * variableCostPerCustomer;
  
  // Apply inflation (small monthly increase)
  const inflationRate = 0.002; // 0.2% monthly inflation
  const inflationMultiplier = Math.pow(1 + inflationRate, month - 1);
  
  // Apply random factors
  const randomMultiplier = randomFactors.cost_factor || 1;
  
  const totalCosts = (fixedCosts + variableCosts) * inflationMultiplier * randomMultiplier;
  
  return Math.max(baseCosts * 0.5, totalCosts); // Minimum 50% of base costs
}

// Generate random factors
function generateRandomFactors(variables, scenarioParams) {
  const factors = {
    demand_factor: scenarioParams.market_growth_multiplier || 1.0,
    cost_factor: scenarioParams.cost_efficiency_multiplier || 1.0,
    churn_modifier: 1.0,
    conversion_modifier: 1.0
  };

  // Apply variable-specific factors
  if (!variables || variables.length === 0) {
    return factors;
  }

  for (const variable of variables) {
    let value;
    try {
      switch (variable.type) {
        case 'normal':
          value = generateNormalRandom(variable.parameters.mean ?? 1.0, variable.parameters.stdDev ?? 0.1);
          break;
        case 'uniform':
          value = generateUniformRandom(variable.parameters.min ?? 0.8, variable.parameters.max ?? 1.2);
          break;
        case 'triangular':
          value = generateTriangularRandom(
            variable.parameters.min ?? 0.8,
            variable.parameters.max ?? 1.2,
            variable.parameters.mode ?? 1.0
          );
          break;
        case 'lognormal':
          value = generateLogNormalRandom(variable.parameters.mean ?? 0.0, variable.parameters.stdDev ?? 0.1);
          break;
        default:
          value = 1.0;
      }
    } catch (error) {
      console.warn(`Error generating random value for variable ${variable.name}:`, error);
      value = 1.0;
    }

    // Map variable impacts to factor names
    if (variable.impact === 'revenue' || variable.name.includes('demand')) {
      factors.demand_factor *= Math.max(0.1, Math.min(3.0, value));
    } else if (variable.impact === 'costs' || variable.name.includes('cost')) {
      factors.cost_factor *= Math.max(0.5, Math.min(2.0, value));
    } else if (variable.impact === 'churn_rate' || variable.name.includes('churn')) {
      factors.churn_modifier *= Math.max(0.5, Math.min(2.0, value));
    }
  }

  return factors;
}

// Random number generators
function generateNormalRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
}

function generateUniformRandom(min, max) {
  return min + Math.random() * (max - min);
}

function generateTriangularRandom(min, max, mode) {
  const u = Math.random();
  const f = (mode - min) / (max - min);
  if (u < f) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

function generateLogNormalRandom(mean, stdDev) {
  const normal = generateNormalRandom(0, 1);
  return Math.exp(mean + stdDev * normal);
}

// Calculate statistics
function calculateStatistics(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median: sorted[Math.floor(n / 2)],
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
    percentile_5: sorted[Math.floor(n * 0.05)],
    percentile_25: sorted[Math.floor(n * 0.25)],
    percentile_75: sorted[Math.floor(n * 0.75)],
    percentile_95: sorted[Math.floor(n * 0.95)]
  };
}

// Calculate risk metrics
function calculateRiskMetrics(results, initialInvestment) {
  const finalValues = results.map(iteration => iteration[iteration.length - 1]);
  const lossCount = finalValues.filter(value => value < 0).length;
  const probabilityOfLoss = lossCount / results.length;

  // Value at Risk (95% confidence)
  const sortedFinalValues = [...finalValues].sort((a, b) => a - b);
  const varIndex = Math.floor(sortedFinalValues.length * 0.05);
  const valueAtRisk95 = sortedFinalValues[varIndex];

  // Expected Shortfall (average of worst 5%)
  const worstValues = sortedFinalValues.slice(0, varIndex + 1);
  const expectedShortfall = worstValues.reduce((sum, val) => sum + val, 0) / worstValues.length;

  // Break-even month (first month where 50% of iterations are profitable)
  let breakEvenMonth = null;
  for (let month = 0; month < results[0].length; month++) {
    const monthValues = results.map(iteration => iteration[month]);
    const profitableCount = monthValues.filter(value => value >= 0).length;
    if (profitableCount >= results.length * 0.5) {
      breakEvenMonth = month + 1;
      break;
    }
  }

  return {
    probability_of_loss: probabilityOfLoss,
    value_at_risk_95: valueAtRisk95,
    expected_shortfall: expectedShortfall,
    break_even_month: breakEvenMonth
  };
}

// Sensitivity analysis
async function performSensitivityAnalysis(ideaData, params, variable, scenarioParams, revenueModel) {
  // Run base case
  const baseResult = await runMonteCarloSimulation(ideaData, params, scenarioParams, revenueModel);
  const baseNPV = baseResult.statistics.mean;

  // Run with variable increased by 10%
  const modifiedVariable = {
    ...variable,
    parameters: {
      ...variable.parameters,
      mean: (variable.parameters.mean || 1) * 1.1
    }
  };

  const modifiedParams = {
    ...params,
    variables: params.variables.map(v => v.name === variable.name ? modifiedVariable : v)
  };

  const modifiedResult = await runMonteCarloSimulation(ideaData, modifiedParams, scenarioParams, revenueModel);
  const modifiedNPV = modifiedResult.statistics.mean;

  // Calculate sensitivity
  const npvChange = baseNPV !== 0 ? (modifiedNPV - baseNPV) / Math.abs(baseNPV) * 100 : 0;
  const correlation = npvChange / 10; // 10% change in variable

  return {
    variable: variable.name,
    correlation,
    impact_on_npv: npvChange,
    impact_on_break_even: (modifiedResult.riskMetrics.break_even_month || 0) - (baseResult.riskMetrics.break_even_month || 0)
  };
}

// AI insights generation
async function generateSimulationInsights(ideaData, results, sensitivityAnalysis, revenueModel) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('OpenAI API key not found, skipping insights generation');
      return null;
    }

    const prompt = `Analise os resultados da simulação Monte Carlo para esta ideia de negócio:

IDEA: ${ideaData.title}
MODELO DE RECEITA: ${revenueModel}
DESCRIÇÃO: ${ideaData.description}
INVESTIMENTO INICIAL: R$ ${ideaData.initial_investment}
CUSTOS MENSAIS: R$ ${ideaData.monthly_costs}
PREÇO: R$ ${ideaData.pricing}

RESULTADOS DA SIMULAÇÃO:
${Object.entries(results).map(([scenario, result]) => `
${scenario.toUpperCase()}:
- Lucro Final Médio: R$ ${result.statistics.mean.toFixed(2)}
- ROI: ${result.roi.toFixed(1)}%
- Payback: ${result.paybackPeriod || 'N/A'} meses
- Probabilidade de Perda: ${(result.riskMetrics.probability_of_loss * 100).toFixed(1)}%
`).join('')}

ANÁLISE DE SENSIBILIDADE:
${sensitivityAnalysis.map(s => `- ${s.variable}: Impacto no NPV de ${s.impact_on_npv.toFixed(1)}%`).join('\n')}

Forneça insights estratégicos específicos para o modelo de receita ${revenueModel}, incluindo:
1. Viabilidade financeira do projeto
2. Principais riscos identificados
3. Variáveis críticas que mais impactam o sucesso
4. Recomendações específicas para melhorar o payback period
5. Estratégias para mitigar riscos no modelo ${revenueModel}
6. Comparação com benchmarks típicos do setor

Seja específico e prático nas recomendações.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista financeiro especializado em simulações Monte Carlo e modelos de negócio. Forneça insights práticos e estratégicos baseados nos dados da simulação.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
}