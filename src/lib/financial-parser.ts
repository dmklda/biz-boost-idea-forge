/**
 * Parser inteligente para extrair dados financeiros de strings descritivas
 */

// Padrões de regex para valores monetários com contexto
const CURRENCY_PATTERNS = [
  // Padrões específicos com contexto para melhor extração
  /investimento\s+(?:inicial\s+)?(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /investir\s+R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /capital\s+(?:inicial\s+)?(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /orçamento\s+(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /custo\s+(?:mensal\s+|inicial\s+)?(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /preço\s+(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /valor\s+(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  /receita\s+(?:mensal\s+)?(?:de\s+)?R?\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
  // Padrões gerais de moeda
  /R\$?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/g,
  /\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g,
  /([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*reais?/gi,
  // Números abreviados
  /([0-9]+(?:\.[0-9]+)?)\s*(?:mil|k)/gi,
  /([0-9]+(?:\.[0-9]+)?)\s*(?:milhão|milhões|mi|m)/gi,
  // Números básicos
  /([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/g
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
  const normalizedText = text.trim().toLowerCase();
  
  let bestValue = 0;
  let bestConfidence = 0;
  
  // Tenta extrair com padrões monetários primeiro (maior confiança)
  for (const pattern of CURRENCY_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex
    const matches = Array.from(normalizedText.matchAll(pattern));
    
    for (const match of matches) {
      const numericValue = parseNumericValue(match[1] || match[0]);
      // Aplica limites realistas para valores financeiros
      if (numericValue > 0 && numericValue <= 100000000) {
        // Calcula confiança baseada na especificidade do padrão
        let confidence = match[0].includes('investimento') || match[0].includes('custo') ? 3 : 
                        match[0].includes('r$') || match[0].includes('$') ? 2 : 1;
        
        if (confidence > bestConfidence || (confidence === bestConfidence && numericValue > bestValue)) {
          bestValue = numericValue;
          bestConfidence = confidence;
        }
      }
    }
  }

  // Se não encontrou boa correspondência, tenta padrões numéricos
  if (bestValue === 0) {
    for (const pattern of NUMBER_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = Array.from(normalizedText.matchAll(pattern));
      
      for (const match of matches) {
        const numericValue = parseNumericValue(match[1] || match[0]);
        if (numericValue > bestValue) {
          bestValue = numericValue;
        }
      }
    }
  }

  return bestValue;
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
  if (!analysis) {
    return {
      initial_investment: 0,
      monthly_costs: 0,
      pricing: 0,
    };
  }

  // Trata diferentes formatos de análise
  const content = typeof analysis === 'string' ? analysis : 
                  analysis.content || analysis.analysis || 
                  JSON.stringify(analysis);

  const text = content.toLowerCase();

  // Extrai diferentes métricas financeiras com parsing contextual
  const extractValue = (patterns: string[]) => {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      if (match) {
        for (const m of match) {
          const value = parseFinancialValue(m);
          if (value > 0) return value;
        }
      }
    }
    return 0;
  };

  return {
    initial_investment: extractValue([
      'investimento\\s+inicial[^.]*',
      'capital\\s+inicial[^.]*', 
      'investir[^.]*',
      'orçamento\\s+inicial[^.]*'
    ]),
    monthly_costs: extractValue([
      'custo\\s+mensal[^.]*',
      'gastos\\s+mensais[^.]*',
      'despesas\\s+mensais[^.]*',
      'custos\\s+operacionais[^.]*'
    ]),
    pricing: extractValue([
      'preço[^.]*',
      'valor\\s+do\\s+produto[^.]*',
      'valor\\s+da\\s+assinatura[^.]*',
      'mensalidade[^.]*',
      'cobrança[^.]*'
    ]),
    revenue_per_month: extractValue([
      'receita\\s+mensal[^.]*',
      'faturamento\\s+mensal[^.]*',
      'vendas\\s+mensais[^.]*'
    ]),
    target_market_size: extractValue([
      'tamanho\\s+do\\s+mercado[^.]*',
      'mercado\\s+total[^.]*',
      'público\\s+alvo[^.]*',
      'potencial\\s+de\\s+clientes[^.]*'
    ]),
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
 * Detecta automaticamente o modelo de receita baseado na descrição e monetização
 */
export function detectRevenueModel(ideaData: any): string {
  const description = (ideaData.description || '').toLowerCase();
  const monetization = (ideaData.monetization || '').toLowerCase();
  
  // Padrões para diferentes modelos de receita
  if (monetization.includes('assinatura') || monetization.includes('subscription') || 
      monetization.includes('mensal') || monetization.includes('saas') ||
      description.includes('assinatura') || description.includes('saas')) {
    return 'subscription';
  }
  
  if (monetization.includes('freemium') || description.includes('freemium') ||
      (monetization.includes('grátis') && monetization.includes('premium'))) {
    return 'freemium';
  }
  
  if (monetization.includes('marketplace') || monetization.includes('comissão') ||
      description.includes('marketplace') || description.includes('plataforma de vendas')) {
    return 'marketplace';
  }
  
  if (monetization.includes('publicidade') || monetization.includes('anúncios') ||
      monetization.includes('ads') || description.includes('publicidade')) {
    return 'advertising';
  }
  
  if (monetization.includes('venda única') || monetization.includes('one-time') ||
      description.includes('produto físico') || description.includes('e-commerce')) {
    return 'one_time';
  }
  
  // Padrão baseado na descrição
  if (description.includes('app') || description.includes('software') || description.includes('plataforma')) {
    return 'subscription';
  }
  
  return 'one_time'; // padrão
}

/**
 * Gera valores padrão inteligentes baseados no contexto da ideia e modelo de receita
 */
export function generateSmartDefaults(ideaData: any): {
  initial_investment: number;
  monthly_costs: number;
  pricing: number;
  target_market_size: number;
  revenue_model: string;
} {
  const description = (ideaData.description || '').toLowerCase();
  const revenueModel = detectRevenueModel(ideaData);
  
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
  
  // Valores padrão por categoria e modelo de receita
  const defaults = {
    saas: {
      subscription: { initial_investment: 50000, monthly_costs: 5000, pricing: 49, target_market_size: 100000 },
      freemium: { initial_investment: 75000, monthly_costs: 8000, pricing: 99, target_market_size: 500000 },
      one_time: { initial_investment: 40000, monthly_costs: 4000, pricing: 299, target_market_size: 50000 }
    },
    ecommerce: {
      one_time: { initial_investment: 30000, monthly_costs: 8000, pricing: 99, target_market_size: 50000 },
      marketplace: { initial_investment: 100000, monthly_costs: 15000, pricing: 5, target_market_size: 200000 },
      subscription: { initial_investment: 40000, monthly_costs: 6000, pricing: 29, target_market_size: 75000 }
    },
    service: {
      one_time: { initial_investment: 10000, monthly_costs: 3000, pricing: 200, target_market_size: 10000 },
      subscription: { initial_investment: 15000, monthly_costs: 4000, pricing: 99, target_market_size: 25000 },
      freemium: { initial_investment: 20000, monthly_costs: 5000, pricing: 149, target_market_size: 50000 }
    },
    physical: {
      one_time: { initial_investment: 100000, monthly_costs: 15000, pricing: 150, target_market_size: 20000 },
      subscription: { initial_investment: 120000, monthly_costs: 18000, pricing: 39, target_market_size: 15000 },
      marketplace: { initial_investment: 150000, monthly_costs: 20000, pricing: 8, target_market_size: 100000 }
    }
  };
  
  const result = defaults[category]?.[revenueModel] || defaults.saas.subscription;
  
  // Aplica limites de segurança
  return {
    initial_investment: Math.max(1000, Math.min(result.initial_investment, 10000000)),
    monthly_costs: Math.max(100, Math.min(result.monthly_costs, 1000000)),
    pricing: Math.max(1, Math.min(result.pricing, 100000)),
    target_market_size: Math.max(1000, Math.min(result.target_market_size, 100000000)),
    revenue_model: revenueModel
  };
}

/**
 * Extrai métricas específicas do modelo de receita
 */
export function extractRevenueMetrics(analysis: any, revenueModel: string): {
  cac?: number;
  ltv?: number;
  churn_rate?: number;
  conversion_rate?: number;
  commission_rate?: number;
  cpm?: number;
} {
  if (!analysis) return {};
  
  const content = typeof analysis === 'string' ? analysis : 
                  analysis.content || analysis.analysis || 
                  JSON.stringify(analysis);
  const text = content.toLowerCase();
  
  const extractPercentage = (patterns: string[]) => {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      if (match) {
        for (const m of match) {
          const value = parseFloat(m.replace(/[^\d.,]/g, '').replace(',', '.'));
          if (value > 0 && value <= 100) return value / 100; // Convert to decimal
        }
      }
    }
    return null;
  };
  
  const extractValue = (patterns: string[]) => {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      if (match) {
        for (const m of match) {
          const value = parseFinancialValue(m);
          if (value > 0) return value;
        }
      }
    }
    return null;
  };
  
  const metrics: any = {};
  
  // Métricas comuns
  const cac = extractValue(['cac[^.]*', 'custo.*aquisição.*cliente[^.]*', 'customer.*acquisition.*cost[^.]*']);
  if (cac) metrics.cac = cac;
  
  const ltv = extractValue(['ltv[^.]*', 'lifetime.*value[^.]*', 'valor.*vida.*cliente[^.]*']);
  if (ltv) metrics.ltv = ltv;
  
  // Métricas específicas por modelo
  if (revenueModel === 'subscription' || revenueModel === 'freemium') {
    const churn = extractPercentage(['churn.*?([0-9]+(?:[.,][0-9]+)?%)', 'cancelamento.*?([0-9]+(?:[.,][0-9]+)?%)']);
    if (churn) metrics.churn_rate = churn;
  }
  
  if (revenueModel === 'freemium') {
    const conversion = extractPercentage(['conversão.*?([0-9]+(?:[.,][0-9]+)?%)', 'conversion.*?([0-9]+(?:[.,][0-9]+)?)']);
    if (conversion) metrics.conversion_rate = conversion;
  }
  
  if (revenueModel === 'marketplace') {
    const commission = extractPercentage(['comissão.*?([0-9]+(?:[.,][0-9]+)?%)', 'taxa.*?([0-9]+(?:[.,][0-9]+)?%)']);
    if (commission) metrics.commission_rate = commission;
  }
  
  if (revenueModel === 'advertising') {
    const cpm = extractValue(['cpm[^.]*', 'custo.*mil.*impressões[^.]*']);
    if (cpm) metrics.cpm = cpm;
  }
  
  return metrics;
}