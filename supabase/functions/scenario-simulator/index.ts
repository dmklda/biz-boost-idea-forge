import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    console.log('=== SCENARIO SIMULATOR STARTED ===');
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    const { ideaData, simulationParams, scenarioTypes } = await req.json();
    console.log('Received data:', { ideaData, simulationParams, scenarioTypes });
    if (!ideaData || !simulationParams) {
      throw new Error('ideaData and simulationParams are required');
    }
    // Validate simulation parameters
    if (!simulationParams.timeHorizon || simulationParams.timeHorizon <= 0) {
      throw new Error('timeHorizon must be a positive number');
    }
    if (!simulationParams.iterations || simulationParams.iterations <= 0) {
      throw new Error('iterations must be a positive number');
    }
    if (!simulationParams.confidenceLevel || simulationParams.confidenceLevel <= 0 || simulationParams.confidenceLevel > 100) {
      throw new Error('confidenceLevel must be between 0 and 100');
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
    console.log(`Variables count: ${simulationParams.variables.length}`);
    console.log(`Scenarios: ${scenarioTypes.join(', ')}`);
    // Define scenario parameters
    const scenarios = {
      optimistic: {
        market_growth_multiplier: 1.3,
        adoption_rate_multiplier: 1.5,
        cost_efficiency_multiplier: 0.8,
        competition_impact: 0.7
      },
      realistic: {
        market_growth_multiplier: 1.0,
        adoption_rate_multiplier: 1.0,
        cost_efficiency_multiplier: 1.0,
        competition_impact: 1.0
      },
      pessimistic: {
        market_growth_multiplier: 0.7,
        adoption_rate_multiplier: 0.6,
        cost_efficiency_multiplier: 1.3,
        competition_impact: 1.4
      }
    };
    const results = {};
    const sensitivityAnalysis = [];
    // Run simulation for each scenario
    for (const scenarioType of scenarioTypes){
      console.log(`Running ${scenarioType} scenario simulation...`);
      const scenarioParams = scenarios[scenarioType];
      const monteCarloResults = await runMonteCarloSimulation(ideaData, simulationParams, scenarioParams);
      results[scenarioType] = monteCarloResults;
    }
    // Perform sensitivity analysis
    if (simulationParams.variables.length > 0) {
      console.log('Performing sensitivity analysis...');
      for (const variable of simulationParams.variables){
        const sensitivity = await performSensitivityAnalysis(ideaData, simulationParams, variable, scenarios.realistic);
        sensitivityAnalysis.push(sensitivity);
      }
    }
    // Generate insights using AI
    console.log('Generating AI insights...');
    const insights = await generateSimulationInsights(ideaData, results, sensitivityAnalysis);
    console.log('AI insights generated:', insights ? 'Success' : 'Failed');
    const response = {
      ideaTitle: ideaData.title,
      simulationParams,
      results,
      sensitivityAnalysis,
      insights,
      generatedAt: new Date().toISOString(),
      metadata: {
        totalIterations: simulationParams.iterations * scenarioTypes.length,
        timeHorizon: simulationParams.timeHorizon,
        confidenceLevel: simulationParams.confidenceLevel
      }
    };
    console.log('Monte Carlo simulation completed successfully');
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in scenario-simulator function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      results: null
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
// Monte Carlo simulation implementation
async function runMonteCarloSimulation(ideaData, params, scenarioParams) {
  const iterations = params.iterations;
  const timeHorizon = params.timeHorizon;
  const results = []; // [iteration][month]
  const finalValues = [];
  // Base parameters
  const baseRevenue = ideaData.pricing || 100;
  const baseCosts = ideaData.monthly_costs || 50;
  const initialInvestment = ideaData.initial_investment || 10000;
  for(let i = 0; i < iterations; i++){
    const iterationResults = [];
    let cumulativeProfit = -initialInvestment;
    for(let month = 1; month <= timeHorizon; month++){
      // Generate random variables for this iteration and month
      const randomFactors = generateRandomFactors(params.variables, scenarioParams);
      // Calculate monthly metrics
      const monthlyRevenue = calculateMonthlyRevenue(baseRevenue, month, randomFactors, scenarioParams);
      const monthlyCosts = calculateMonthlyCosts(baseCosts, month, randomFactors, scenarioParams);
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      cumulativeProfit += monthlyProfit;
      iterationResults.push(cumulativeProfit);
    }
    results.push(iterationResults);
    finalValues.push(iterationResults[iterationResults.length - 1]);
  }
  // Calculate statistics
  const statistics = calculateStatistics(finalValues);
  // Calculate monthly projections (averages across iterations)
  const projections = [];
  for(let month = 0; month < timeHorizon; month++){
    const monthValues = results.map((iteration)=>iteration[month]);
    const monthStats = calculateStatistics(monthValues);
    // Calculate break-even probability for this month
    const breakEvenCount = monthValues.filter((value)=>value >= 0).length;
    const breakEvenProbability = breakEvenCount / iterations;
    projections.push({
      month: month + 1,
      revenue: calculateAverageRevenue(month + 1, params.variables, scenarioParams, baseRevenue),
      costs: calculateAverageCosts(month + 1, params.variables, scenarioParams, baseCosts),
      profit: monthStats.mean - (month === 0 ? -initialInvestment : results.map((r)=>r[month - 1] || 0).reduce((a, b)=>a + b, 0) / iterations),
      cumulative_profit: monthStats.mean,
      break_even_probability: breakEvenProbability
    });
  }
  // Calculate risk metrics
  const riskMetrics = calculateRiskMetrics(results, initialInvestment);
  return {
    scenario: 'realistic',
    statistics,
    projections,
    riskMetrics
  };
}
// Generate random factors based on variable distributions
function generateRandomFactors(variables, scenarioParams) {
  const factors = {};
  // If no variables provided, return default factors
  if (!variables || variables.length === 0) {
    return {
      'market_growth': scenarioParams.market_growth_multiplier || 1.0,
      'adoption_rate': scenarioParams.adoption_rate_multiplier || 1.0,
      'cost_efficiency': scenarioParams.cost_efficiency_multiplier || 1.0,
      'competition_impact': scenarioParams.competition_impact || 1.0
    };
  }
  for (const variable of variables){
    let value;
    try {
      switch(variable.type){
        case 'normal':
          const mean = variable.parameters.mean ?? 1.0;
          const stdDev = variable.parameters.stdDev ?? 0.1;
          value = generateNormalRandom(mean, stdDev);
          break;
        case 'uniform':
          const min = variable.parameters.min ?? 0.8;
          const max = variable.parameters.max ?? 1.2;
          value = generateUniformRandom(min, max);
          break;
        case 'triangular':
          const triMin = variable.parameters.min ?? 0.8;
          const triMax = variable.parameters.max ?? 1.2;
          const mode = variable.parameters.mode ?? 1.0;
          value = generateTriangularRandom(triMin, triMax, mode);
          break;
        case 'lognormal':
          const logMean = variable.parameters.mean ?? 0.0;
          const logStdDev = variable.parameters.stdDev ?? 0.1;
          value = generateLogNormalRandom(logMean, logStdDev);
          break;
        default:
          value = 1.0;
      }
    } catch (error) {
      console.warn(`Error generating random value for variable ${variable.name}:`, error);
      value = 1.0;
    }
    factors[variable.name] = value;
  }
  return factors;
}
// Random number generators
function generateNormalRandom(mean, stdDev) {
  // Box-Muller transformation
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
// Calculate monthly revenue with random factors
function calculateMonthlyRevenue(baseRevenue, month, factors, scenarioParams) {
  let revenue = baseRevenue;
  // Apply growth over time
  const growthRate = 0.05 * scenarioParams.market_growth_multiplier; // 5% base monthly growth
  revenue *= Math.pow(1 + growthRate, month - 1);
  // Apply random factors
  for (const [factorName, factorValue] of Object.entries(factors)){
    if (factorName.includes('revenue') || factorName.includes('demand')) {
      revenue *= factorValue;
    }
  }
  // Apply scenario multipliers
  revenue *= scenarioParams.adoption_rate_multiplier;
  revenue /= scenarioParams.competition_impact;
  return Math.max(0, revenue);
}
// Calculate monthly costs with random factors
function calculateMonthlyCosts(baseCosts, month, factors, scenarioParams) {
  let costs = baseCosts;
  // Apply cost inflation
  const inflationRate = 0.02; // 2% monthly inflation
  costs *= Math.pow(1 + inflationRate, month - 1);
  // Apply random factors
  for (const [factorName, factorValue] of Object.entries(factors)){
    if (factorName.includes('cost') || factorName.includes('expense')) {
      costs *= factorValue;
    }
  }
  // Apply scenario multipliers
  costs *= scenarioParams.cost_efficiency_multiplier;
  return Math.max(0, costs);
}
// Calculate statistics from array of values
function calculateStatistics(values) {
  const sorted = [
    ...values
  ].sort((a, b)=>a - b);
  const n = sorted.length;
  const mean = values.reduce((sum, val)=>sum + val, 0) / n;
  const variance = values.reduce((sum, val)=>sum + Math.pow(val - mean, 2), 0) / n;
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
  const finalValues = results.map((iteration)=>iteration[iteration.length - 1]);
  const lossCount = finalValues.filter((value)=>value < 0).length;
  const probabilityOfLoss = lossCount / results.length;
  // Value at Risk (95% confidence)
  const sortedFinalValues = [
    ...finalValues
  ].sort((a, b)=>a - b);
  const varIndex = Math.floor(sortedFinalValues.length * 0.05);
  const valueAtRisk95 = sortedFinalValues[varIndex];
  // Expected Shortfall (average of worst 5%)
  const worstValues = sortedFinalValues.slice(0, varIndex + 1);
  const expectedShortfall = worstValues.reduce((sum, val)=>sum + val, 0) / worstValues.length;
  // Break-even month (first month where 50% of iterations are profitable)
  let breakEvenMonth = null;
  for(let month = 0; month < results[0].length; month++){
    const monthValues = results.map((iteration)=>iteration[month]);
    const profitableCount = monthValues.filter((value)=>value >= 0).length;
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
async function performSensitivityAnalysis(ideaData, params, variable, scenarioParams) {
  // Run base case
  const baseResult = await runMonteCarloSimulation(ideaData, params, scenarioParams);
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
    variables: params.variables.map((v)=>v.name === variable.name ? modifiedVariable : v)
  };
  const modifiedResult = await runMonteCarloSimulation(ideaData, modifiedParams, scenarioParams);
  const modifiedNPV = modifiedResult.statistics.mean;
  // Calculate sensitivity
  const npvChange = (modifiedNPV - baseNPV) / baseNPV * 100;
  const correlation = npvChange / 10; // 10% change in variable
  return {
    variable: variable.name,
    correlation,
    impact_on_npv: npvChange,
    impact_on_break_even: (modifiedResult.riskMetrics.break_even_month || 0) - (baseResult.riskMetrics.break_even_month || 0)
  };
}
// Helper functions for average calculations
function calculateAverageRevenue(month, variables, scenarioParams, baseRevenue) {
  // Simplified calculation for display purposes
  const growthRate = 0.05 * scenarioParams.market_growth_multiplier;
  return baseRevenue * Math.pow(1 + growthRate, month - 1) * scenarioParams.adoption_rate_multiplier / scenarioParams.competition_impact;
}
function calculateAverageCosts(month, variables, scenarioParams, baseCosts) {
  // Simplified calculation for display purposes
  const inflationRate = 0.02;
  return baseCosts * Math.pow(1 + inflationRate, month - 1) * scenarioParams.cost_efficiency_multiplier;
}
// Generate AI insights
async function generateSimulationInsights(ideaData, results, sensitivityAnalysis) {
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiApiKey) {
    return 'Insights de IA não disponíveis - chave da API não configurada';
  }
  const prompt = `
  Analise os resultados da simulação Monte Carlo para a ideia de negócio "${ideaData.title}".
  
  RESULTADOS DA SIMULAÇÃO:
  ${JSON.stringify(results, null, 2)}
  
  ANÁLISE DE SENSIBILIDADE:
  ${JSON.stringify(sensitivityAnalysis, null, 2)}
  
  Forneça insights estratégicos sobre:
  1. Viabilidade financeira da ideia
  2. Principais riscos identificados
  3. Variáveis mais críticas para o sucesso
  4. Recomendações para mitigar riscos
  5. Estratégias para melhorar as projeções
  
  Seja específico e prático nas recomendações.
  `;
  try {
    console.log('Making OpenAI API call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 1500
      })
    });
    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('OpenAI error details:', errorText);
      return 'Erro na API do OpenAI: ' + response.statusText;
    }
    
    const result = await response.json();
    console.log('OpenAI response received successfully');
    return result.choices[0]?.message?.content || 'Não foi possível gerar insights';
  } catch (error) {
    console.error('Error generating insights:', error);
    return 'Erro ao gerar insights de IA';
  }
}
