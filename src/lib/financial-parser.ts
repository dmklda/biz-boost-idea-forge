/**
 * Parser inteligente para extrair dados financeiros de strings descritivas
 */

// Padrões de regex para valores monetários
const CURRENCY_PATTERNS = [
  /R\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/g,  // R$ 100.000,00
  /\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g,    // $ 100,000.00
  /([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*reais?/gi, // 100.000 reais
  /([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)\s*dólares?/gi, // 100,000 dólares
  /([0-9]+\.?[0-9]*[kK])/g,                          // 100k, 50K
  /([0-9]+\.?[0-9]*[mM])/g,                          // 1.5m, 2M
];

// Padrões para números sem formatação monetária
const NUMBER_PATTERNS = [
  /([0-9]+(?:\.[0-9]{3})*)/g,  // 100.000
  /([0-9]+(?:,[0-9]{3})*)/g,   // 100,000
  /([0-9]+)/g,                 // 100
];

/**
 * Extrai valor numérico de uma string com formato monetário
 */
export function parseFinancialValue(text: string): number {
  if (typeof text === 'number') {
    return text;
  }
  
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Remove espaços extras e normaliza
  const cleanText = text.trim();
  
  // Tenta extrair com padrões monetários primeiro
  for (const pattern of CURRENCY_PATTERNS) {
    const matches = Array.from(cleanText.matchAll(pattern));
    if (matches.length > 0) {
      const match = matches[0][1] || matches[0][0];
      return parseNumericValue(match);
    }
  }
  
  // Se não encontrou, tenta com padrões numéricos
  for (const pattern of NUMBER_PATTERNS) {
    const matches = Array.from(cleanText.matchAll(pattern));
    if (matches.length > 0) {
      const match = matches[0][1] || matches[0][0];
      return parseNumericValue(match);
    }
  }
  
  return 0;
}

/**
 * Converte string numérica para número
 */
function parseNumericValue(value: string): number {
  if (!value) return 0;
  
  // Remove caracteres não numéricos exceto pontos, vírgulas e k/m
  let cleanValue = value.replace(/[^\d.,kKmM]/g, '');
  
  // Trata sufixos k/m
  if (cleanValue.toLowerCase().includes('k')) {
    const baseValue = parseFloat(cleanValue.replace(/[kK]/g, ''));
    return baseValue * 1000;
  }
  
  if (cleanValue.toLowerCase().includes('m')) {
    const baseValue = parseFloat(cleanValue.replace(/[mM]/g, ''));
    return baseValue * 1000000;
  }
  
  // Trata formato brasileiro (100.000,00)
  if (cleanValue.includes('.') && cleanValue.includes(',')) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  }
  // Trata formato americano (100,000.00)
  else if (cleanValue.includes(',') && cleanValue.lastIndexOf('.') > cleanValue.lastIndexOf(',')) {
    cleanValue = cleanValue.replace(/,/g, '');
  }
  // Trata vírgula como separador decimal (100,50)
  else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
    cleanValue = cleanValue.replace(',', '.');
  }
  
  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Extrai dados financeiros de análise de ideia
 */
export function extractFinancialData(analysis: any): {
  initial_investment: number;
  monthly_costs: number;
  pricing: number;
  revenue_per_month?: number;
  target_market_size?: number;
} {
  const financial = analysis?.financial_analysis || {};
  const market = analysis?.market_analysis || {};
  
  // Extrai investimento inicial
  let initial_investment = 0;
  if (financial.initial_investment) {
    initial_investment = parseFinancialValue(financial.initial_investment);
  } else if (financial.investment || financial.startup_cost) {
    initial_investment = parseFinancialValue(financial.investment || financial.startup_cost);
  }
  
  // Extrai custos mensais
  let monthly_costs = 0;
  if (financial.monthly_costs) {
    monthly_costs = parseFinancialValue(financial.monthly_costs);
  } else if (financial.operational_costs || financial.running_costs) {
    monthly_costs = parseFinancialValue(financial.operational_costs || financial.running_costs);
  }
  
  // Extrai preço
  let pricing = 0;
  if (financial.pricing) {
    pricing = parseFinancialValue(financial.pricing);
  } else if (financial.price || financial.subscription_price) {
    pricing = parseFinancialValue(financial.price || financial.subscription_price);
  }
  
  // Extrai receita mensal estimada
  let revenue_per_month = 0;
  if (financial.revenue_per_month || financial.monthly_revenue) {
    revenue_per_month = parseFinancialValue(financial.revenue_per_month || financial.monthly_revenue);
  }
  
  // Extrai tamanho do mercado
  let target_market_size = 0;
  if (market.target_market_size || market.market_size) {
    target_market_size = parseFinancialValue(market.target_market_size || market.market_size);
  }
  
  return {
    initial_investment,
    monthly_costs,
    pricing,
    revenue_per_month,
    target_market_size
  };
}

/**
 * Valida se os dados financeiros são suficientes para simulação
 */
export function validateFinancialData(data: {
  initial_investment?: number;
  monthly_costs?: number;
  pricing?: number;
}): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!data.initial_investment || data.initial_investment <= 0) {
    warnings.push('Investimento inicial não especificado ou inválido');
  }
  
  if (!data.monthly_costs || data.monthly_costs <= 0) {
    warnings.push('Custos mensais não especificados ou inválidos');
  }
  
  if (!data.pricing || data.pricing <= 0) {
    warnings.push('Preço do produto/serviço não especificado ou inválido');
  }
  
  if (data.monthly_costs && data.pricing && data.monthly_costs > data.pricing * 100) {
    warnings.push('Custos mensais parecem muito altos em relação ao preço');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Gera valores padrão inteligentes baseados no contexto da ideia
 */
export function generateSmartDefaults(ideaData: any): {
  initial_investment: number;
  monthly_costs: number;
  pricing: number;
  target_market_size: number;
} {
  const description = (ideaData.description || '').toLowerCase();
  const monetization = (ideaData.monetization || '').toLowerCase();
  
  // Determina categoria da ideia
  let category = 'saas'; // padrão
  
  if (description.includes('app') || description.includes('software') || description.includes('plataforma')) {
    category = 'saas';
  } else if (description.includes('loja') || description.includes('produto') || description.includes('venda')) {
    category = 'ecommerce';
  } else if (description.includes('serviço') || description.includes('consultoria') || description.includes('freelance')) {
    category = 'service';
  } else if (description.includes('físico') || description.includes('restaurante') || description.includes('loja física')) {
    category = 'physical';
  }
  
  // Valores padrão por categoria
  const defaults = {
    saas: {
      initial_investment: 50000,
      monthly_costs: 5000,
      pricing: 49,
      target_market_size: 100000
    },
    ecommerce: {
      initial_investment: 30000,
      monthly_costs: 8000,
      pricing: 99,
      target_market_size: 50000
    },
    service: {
      initial_investment: 10000,
      monthly_costs: 3000,
      pricing: 200,
      target_market_size: 10000
    },
    physical: {
      initial_investment: 100000,
      monthly_costs: 15000,
      pricing: 150,
      target_market_size: 20000
    }
  };
  
  return defaults[category];
}