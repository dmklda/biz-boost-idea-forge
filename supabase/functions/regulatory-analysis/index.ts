import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retrieve API keys from environment variables
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const serpApiKey = Deno.env.get('SERPAPI_API_KEY');

// Comprehensive regulatory frameworks by country and sector
const globalRegulatoryFrameworks = {
  brazil: {
    fintech: {
      authorities: ['BACEN', 'CVM', 'SUSEP'],
      requirements: ['Licença BACEN', 'Registro CVM', 'LGPD Compliance'],
      costs: { initial: 150000, annual: 50000 },
      timeframe: '12-18 meses'
    },
    healthtech: {
      authorities: ['ANVISA', 'CFM', 'ANS'],
      requirements: ['Registro ANVISA', 'Certificação ISO 13485', 'LGPD Compliance'],
      costs: { initial: 80000, annual: 30000 },
      timeframe: '8-12 meses'
    },
    agtech: {
      authorities: ['MAPA', 'INMETRO', 'ANATEL', 'IBAMA'],
      requirements: ['Registro MAPA', 'Certificação INMETRO', 'Homologação ANATEL'],
      costs: { initial: 45000, annual: 15000 },
      timeframe: '6-10 meses'
    },
    iot: {
      authorities: ['ANATEL', 'INMETRO'],
      requirements: ['Homologação ANATEL', 'Certificação INMETRO', 'LGPD Compliance'],
      costs: { initial: 25000, annual: 8000 },
      timeframe: '4-8 meses'
    }
  },
  usa: {
    fintech: {
      authorities: ['SEC', 'FINRA', 'CFTC', 'State Regulators'],
      requirements: ['SEC Registration', 'FINRA License', 'SOC 2 Compliance'],
      costs: { initial: 200000, annual: 75000 },
      timeframe: '6-12 months'
    },
    healthtech: {
      authorities: ['FDA', 'HHS', 'State Health Departments'],
      requirements: ['FDA 510(k)', 'HIPAA Compliance', 'Quality System'],
      costs: { initial: 300000, annual: 100000 },
      timeframe: '12-24 months'
    },
    iot: {
      authorities: ['FCC', 'NIST'],
      requirements: ['FCC Certification', 'NIST Cybersecurity Framework'],
      costs: { initial: 15000, annual: 5000 },
      timeframe: '3-6 months'
    }
  },
  eu: {
    fintech: {
      authorities: ['EBA', 'ESMA', 'National Regulators'],
      requirements: ['MiFID II', 'PSD2', 'GDPR Compliance'],
      costs: { initial: 180000, annual: 60000 },
      timeframe: '8-15 months'
    },
    healthtech: {
      authorities: ['EMA', 'Notified Bodies'],
      requirements: ['CE Marking', 'MDR Compliance', 'GDPR'],
      costs: { initial: 250000, annual: 80000 },
      timeframe: '12-20 months'
    },
    iot: {
      authorities: ['National Telecoms', 'ENISA'],
      requirements: ['CE Marking', 'Radio Equipment Directive', 'GDPR'],
      costs: { initial: 20000, annual: 7000 },
      timeframe: '4-8 months'
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ENHANCED REGULATORY ANALYSIS REQUEST ===');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { businessName, businessSector, businessDescription, targetAudience, businessModel, location = 'Brazil', country = 'brasil', ideaId } = body;
    
    // Improved validation with better error messages
    if (!businessName || businessName.trim() === '') {
      console.error('Missing business name');
      throw new Error('Nome do negócio é obrigatório');
    }
    
    if (!businessDescription || businessDescription.trim() === '') {
      console.error('Missing business description');
      throw new Error('Descrição do negócio é obrigatória');
    }
    
    console.log('=== VALIDATION PASSED ===');
    console.log('Business data:', { businessName, businessSector, businessDescription, targetAudience, businessModel, location, country, ideaId });
    
    // Generate enhanced dynamic regulatory analysis
    console.log('=== STARTING ENHANCED AI-POWERED ANALYSIS ===');
    const analysisResult = await generateDynamicRegulatoryAnalysis({ 
      businessName, 
      businessSector, 
      businessDescription, 
      targetAudience, 
      businessModel, 
      location,
      country 
    });
    
    if (!analysisResult) {
      throw new Error('Failed to generate regulatory analysis');
    }

    const analysis = {
      ...analysisResult,
      generated_at: new Date().toISOString(),
      data_sources: analysisResult.data_sources || ["Enhanced AI Analysis", "SerpAPI Research", "Global Regulatory Framework"],
      confidence_level: analysisResult.confidence_level || "high"
    };

    console.log('Generated enhanced analysis:', {
      roadmapPhases: analysisResult.roadmap?.phases?.length || 0,
      requirementsCount: analysisResult.requirements?.length || 0,
      riskLevel: analysisResult.riskAssessment?.overallRisk || 'unknown',
      contactsCount: analysisResult.contacts?.length || 0,
      sector: analysisResult.metadata?.sector,
      country: analysisResult.metadata?.country
    });
    
    console.log('=== ENHANCED ANALYSIS COMPLETED ===');
    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in enhanced regulatory-analysis function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      result: null
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// Intelligent sector classification using AI
async function classifyBusinessSector(businessName: string, businessDescription: string): Promise<string> {
  try {
    console.log('Classificando setor para:', businessName);
    
    // Keywords-based pre-classification for IoT + Agriculture
    const description = (businessName + ' ' + businessDescription).toLowerCase();
    const agTechKeywords = ['plant', 'plantas', 'agricultura', 'farm', 'fazenda', 'cultivo', 'horta', 'jardim', 'vegetais', 'sensor', 'monitoramento', 'irrigação', 'umidade', 'temperatura', 'luz', 'solo'];
    const iotKeywords = ['dispositivo', 'sensor', 'iot', 'internet das coisas', 'monitoramento', 'tempo real', 'app', 'aplicativo', 'automação'];
    
    const hasAgTech = agTechKeywords.some(keyword => description.includes(keyword));
    const hasIoT = iotKeywords.some(keyword => description.includes(keyword));
    
    if (hasAgTech && hasIoT) {
      console.log('Setor detectado por keywords: agtech');
      return 'agtech';
    }
    
    if (!openaiApiKey) {
      console.log('OpenAI API key não encontrada, usando fallback');
      if (hasAgTech) return 'agtech';
      if (hasIoT) return 'iot';
      return 'technology';
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em classificação de setores empresariais. Analise o nome e descrição do negócio e retorne APENAS o setor principal em uma palavra simples, sem explicações.

PRIORIDADES DE CLASSIFICAÇÃO:
- Dispositivos IoT para plantas/agricultura = "agtech"
- Monitoramento agrícola com sensores = "agtech" 
- Apps para cuidado de plantas = "agtech"
- Tecnologia + agricultura = "agtech"

Setores válidos: fintech, healthtech, edtech, agtech, logistics, retail, saas, marketplace, consulting, manufacturing, energy, construction, food, automotive, entertainment, security, iot, ai, blockchain, ecommerce, real_estate, insurance, legal, hr, marketing, design.`
          },
          {
            role: 'user',
            content: `Nome: ${businessName}\nDescrição: ${businessDescription}\n\nClassifique este negócio no setor mais específico possível.`
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const sector = data.choices[0].message.content.trim().toLowerCase();
    console.log('Setor classificado como:', sector);
    
    return sector;
  } catch (error) {
    console.error('Erro na classificação de setor:', error);
    return 'technology'; // fallback
  }
}

// Detect country from location and user selection
function detectCountry(location: string, countryParam: string): string {
  // First check user selection
  if (countryParam) {
    const countryMap = {
      'brasil': 'brazil',
      'usa': 'usa', 
      'europa': 'eu',
      'internacional': 'brazil' // default to brazil for international
    };
    return countryMap[countryParam.toLowerCase()] || 'brazil';
  }
  
  // Then check location string
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('brasil') || locationLower.includes('brazil')) return 'brazil';
  if (locationLower.includes('eua') || locationLower.includes('usa') || locationLower.includes('united states')) return 'usa';
  if (locationLower.includes('europa') || locationLower.includes('europe') || locationLower.includes('alemanha') || 
      locationLower.includes('frança') || locationLower.includes('espanha') || locationLower.includes('itália')) return 'eu';
  
  return 'brazil'; // default
}

// Enhanced SerpAPI search for regulatory information
async function searchRegulatoryInfo(businessData: any, sector: string, country: string): Promise<any> {
  if (!serpApiKey) {
    console.log('SerpAPI key não encontrada, usando dados estáticos');
    return null;
  }

  try {
    const countryNames = {
      brazil: 'Brasil',
      usa: 'United States',
      eu: 'Europe'
    };
    
    const searchTerms = [
      `${sector} regulatory requirements ${countryNames[country]} 2024`,
      `${businessData.businessDescription} licensing costs ${countryNames[country]}`,
      `regulatory authorities ${sector} ${countryNames[country]}`,
      `compliance requirements ${sector} business ${countryNames[country]}`
    ];

    const searchResults = [];
    
    for (const term of searchTerms.slice(0, 2)) { // Limit to 2 searches to avoid rate limits
      const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(term)}&api_key=${serpApiKey}&engine=google&num=5`);
      
      if (response.ok) {
        const data = await response.json();
        searchResults.push({
          term,
          results: data.organic_results || []
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return searchResults;
  } catch (error) {
    console.error('Erro na pesquisa SerpAPI:', error);
    return null;
  }
}

// Enhanced regulatory analysis with real-time data and AI
async function generateDynamicRegulatoryAnalysis(businessData: any): Promise<any> {
  console.log('Iniciando análise regulatória dinâmica para:', businessData.businessName);
  
  try {
    // Step 1: Classify business sector intelligently
    const sector = await classifyBusinessSector(businessData.businessName, businessData.businessDescription);
    console.log('Setor classificado como:', sector);
    
    // Step 2: Detect country
    const country = detectCountry(businessData.location, businessData.country);
    console.log('País detectado:', country);
    
    // Step 3: Search for current regulatory information
    const searchResults = await searchRegulatoryInfo(businessData, sector, country);
    
    // Step 4: Generate AI-based analysis with search context
    const aiAnalysis = await generateAIRegulatoryAnalysis(businessData, sector, country, searchResults);
    
    return aiAnalysis;
  } catch (error) {
    console.error('Erro na análise dinâmica:', error);
    // Fallback to enhanced static analysis
    return generateEnhancedFallbackAnalysis(businessData);
  }
}

// Generate comprehensive AI analysis with search context
async function generateAIRegulatoryAnalysis(businessData: any, sector: string, country: string, searchResults: any): Promise<any> {
  if (!openaiApiKey) {
    console.log('OpenAI API key não encontrada, usando análise estática');
    return generateEnhancedFallbackAnalysis(businessData, sector, country);
  }

  try {
    const searchContext = searchResults ? 
      searchResults.map((sr: any) => 
        `Pesquisa: "${sr.term}"\nResultados:\n${sr.results.slice(0, 3).map((r: any) => `- ${r.title}: ${r.snippet}`).join('\n')}`
      ).join('\n\n') : '';

    const frameworkData = globalRegulatoryFrameworks[country]?.[sector] || globalRegulatoryFrameworks.brazil.iot;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise regulatória global. Analise as informações fornecidas e gere uma análise regulatória detalhada e realística.

INSTRUÇÕES CRÍTICAS:
1. Use APENAS informações atuais e verificáveis
2. Custos devem ser realísticos baseados no setor e país
3. Considere regulamentações específicas do setor identificado
4. Inclua contatos de órgãos reguladores reais
5. Cronograma deve ser baseado em experiências reais do mercado

Responda em JSON válido com esta estrutura:
{
  "requirements": [
    {
      "category": "string",
      "description": "string",
      "authority": "string",
      "deadline": "string",
      "criticality": "high|medium|low"
    }
  ],
  "riskAssessment": {
    "overallRisk": "low|medium|high",
    "riskFactors": ["string"],
    "mitigationStrategies": ["string"]
  },
  "costs": {
    "initialCompliance": number,
    "annualCompliance": number,
    "breakdown": [
      {
        "item": "string",
        "cost": number,
        "frequency": "one-time|annual|monthly"
      }
    ]
  },
  "roadmap": {
    "phases": [
      {
        "name": "string",
        "duration": "string",
        "activities": ["string"],
        "estimatedCost": number
      }
    ],
    "totalTimeframe": "string"
  },
  "recommendations": ["string"],
  "contacts": [
    {
      "authority": "string",
      "contact": "string",
      "website": "string",
      "phone": "string"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `DADOS DO NEGÓCIO:
Nome: ${businessData.businessName}
Setor: ${sector}
Descrição: ${businessData.businessDescription}
Público-alvo: ${businessData.targetAudience || 'Não especificado'}
Modelo de negócio: ${businessData.businessModel || 'Não especificado'}
Localização: ${businessData.location}
País: ${country}

DADOS DE REFERÊNCIA:
${JSON.stringify(frameworkData, null, 2)}

INFORMAÇÕES DE PESQUISA ATUAL:
${searchContext || 'Nenhuma pesquisa adicional disponível'}

CONTEXTO ADICIONAL:
- Para IoT/dispositivos: considere homologação ANATEL (Brasil), FCC (EUA), CE (Europa)
- Para dados pessoais: LGPD (Brasil), GDPR (Europa), CCPA (Califórnia)
- Para financeiro: regulamentações bancárias específicas
- Para saúde: regulamentações sanitárias rigorosas
- Para agtech/agricultura: MAPA, IBAMA, licenças ambientais
- Para dispositivos que monitoram plantas: classificar como AgTech + IoT

Gere uma análise completa e realística baseada nessas informações.`
          }
        ],
        max_completion_tokens: 4000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Erro da OpenAI:', data.error);
      return generateEnhancedFallbackAnalysis(businessData, sector, country);
    }

    const analysisText = data.choices[0].message.content;
    
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        
        // Validate and enhance the result
        return {
          ...analysisResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            sector,
            country,
            hasSearchData: !!searchResults,
            aiGenerated: true
          }
        };
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON da análise IA:', parseError);
    }
    
    return generateEnhancedFallbackAnalysis(businessData, sector, country);
  } catch (error) {
    console.error('Erro na análise IA:', error);
    return generateEnhancedFallbackAnalysis(businessData, sector, country);
  }
}

// Enhanced fallback analysis with better sector classification
function generateEnhancedFallbackAnalysis(businessData: any, sector?: string, country?: string): any {
  const detectedSector = sector || mapBusinessSectorToKey(businessData.businessSector, businessData.businessDescription);
  const detectedCountry = country || 'brazil';
  
  const frameworkData = globalRegulatoryFrameworks[detectedCountry]?.[detectedSector] || 
                       globalRegulatoryFrameworks.brazil.iot;

  console.log(`Gerando análise estática aprimorada para setor: ${detectedSector}, país: ${detectedCountry}`);

  // Enhanced requirements based on sector
  const sectorRequirements = generateSectorSpecificRequirements(detectedSector, detectedCountry, businessData);
  
  // Calculate realistic costs
  const costs = calculateRealisticCosts(detectedSector, detectedCountry, frameworkData);
  
  // Generate detailed roadmap
  const roadmap = generateDetailedRoadmap(sectorRequirements, costs);
  
  // Risk assessment
  const riskAssessment = assessDetailedRisks(detectedSector, sectorRequirements);
  
  // Get relevant contacts
  const contacts = getRegulatoryContacts(detectedSector, detectedCountry);
  
  // Generate recommendations
  const recommendations = generateSectorRecommendations(detectedSector, businessData);

  return {
    requirements: sectorRequirements,
    riskAssessment,
    costs,
    roadmap,
    recommendations,
    contacts,
    metadata: {
      generatedAt: new Date().toISOString(),
      sector: detectedSector,
      country: detectedCountry,
      analysisType: 'enhanced_fallback'
    }
  };
}

// Enhanced mapping function for business sectors
function mapBusinessSectorToKey(businessSector: string, businessDescription: string): string {
  const sector = businessSector?.toLowerCase() || '';
  const description = businessDescription?.toLowerCase() || '';
  
  // Financial services
  if (sector.includes('financ') || sector.includes('payment') || sector.includes('bank') ||
      description.includes('pagamento') || description.includes('investimento') || description.includes('banco')) {
    return 'fintech';
  }
  
  // Healthcare
  if (sector.includes('saúde') || sector.includes('health') || sector.includes('médic') ||
      description.includes('médic') || description.includes('hospital') || description.includes('telemedicina')) {
    return 'healthtech';
  }
  
  // Agriculture/AgTech - Enhanced detection
  if (sector.includes('agr') || sector.includes('plant') || sector.includes('farm') ||
      description.includes('agricultura') || description.includes('planta') || description.includes('fazenda') ||
      description.includes('agronegócio') || description.includes('monitoring') || description.includes('sensor') ||
      description.includes('água') || description.includes('luz') || description.includes('temperatura') ||
      description.includes('cultivo') || description.includes('irrigação')) {
    return 'agtech';
  }
  
  // IoT/Technology/Devices - Enhanced detection
  if (sector.includes('tecnologia') || sector.includes('technology') || sector.includes('software') ||
      description.includes('dispositivo') || description.includes('sensor') || description.includes('iot') ||
      description.includes('aplicativo') || description.includes('monitoramento') || description.includes('conectado') ||
      description.includes('automação') || description.includes('eletrônico') || description.includes('wireless')) {
    return 'iot';
  }
  
  // Education
  if (sector.includes('educação') || sector.includes('education') || sector.includes('ensino') ||
      description.includes('educação') || description.includes('escola') || description.includes('curso')) {
    return 'edtech';
  }
  
  // Retail/E-commerce
  if (sector.includes('varejo') || sector.includes('retail') || sector.includes('commerce') ||
      description.includes('loja') || description.includes('venda') || description.includes('marketplace')) {
    return 'retailtech';
  }
  
  // Default to IoT as it's more common for tech startups
  return 'iot';
}

// Generate sector-specific requirements
function generateSectorSpecificRequirements(sector: string, country: string, businessData: any): any[] {
  const frameworkData = globalRegulatoryFrameworks[country]?.[sector] || globalRegulatoryFrameworks.brazil.iot;
  
  const baseRequirements = frameworkData.requirements.map((req: string, index: number) => ({
    category: getRequirementCategory(req),
    description: req,
    authority: frameworkData.authorities[Math.min(index, frameworkData.authorities.length - 1)],
    deadline: getRequirementDeadline(req),
    criticality: getRequirementCriticality(req)
  }));

  // Add specific requirements based on business description
  const additionalRequirements = getAdditionalRequirements(sector, businessData);
  
  return [...baseRequirements, ...additionalRequirements];
}

function getRequirementCategory(requirement: string): string {
  if (requirement.includes('Licença') || requirement.includes('License')) return 'Licenciamento';
  if (requirement.includes('Registro') || requirement.includes('Registration')) return 'Registro';
  if (requirement.includes('Certificação') || requirement.includes('Certification')) return 'Certificação';
  if (requirement.includes('LGPD') || requirement.includes('GDPR')) return 'Proteção de Dados';
  if (requirement.includes('Homologação') || requirement.includes('Homologation')) return 'Homologação';
  return 'Compliance';
}

function getRequirementDeadline(requirement: string): string {
  if (requirement.includes('LGPD') || requirement.includes('GDPR')) return 'Imediato';
  if (requirement.includes('Licença') || requirement.includes('License')) return '6-12 meses';
  if (requirement.includes('Certificação') || requirement.includes('Certification')) return '3-6 meses';
  return '2-4 meses';
}

function getRequirementCriticality(requirement: string): string {
  if (requirement.includes('Licença') || requirement.includes('License')) return 'high';
  if (requirement.includes('LGPD') || requirement.includes('GDPR')) return 'high';
  if (requirement.includes('Certificação') || requirement.includes('Certification')) return 'medium';
  return 'low';
}

function getAdditionalRequirements(sector: string, businessData: any): any[] {
  const additional = [];
  
  if (sector === 'agtech' || businessData.businessDescription?.toLowerCase().includes('planta')) {
    additional.push({
      category: 'Ambiental',
      description: 'Licença ambiental para atividades agrícolas',
      authority: 'IBAMA/Órgão Estadual',
      deadline: '4-8 meses',
      criticality: 'medium'
    });
  }
  
  if (businessData.businessDescription?.toLowerCase().includes('dados') || 
      businessData.businessDescription?.toLowerCase().includes('app')) {
    additional.push({
      category: 'Proteção de Dados',
      description: 'Adequação completa à LGPD',
      authority: 'ANPD',
      deadline: 'Imediato',
      criticality: 'high'
    });
  }
  
  return additional;
}

function calculateRealisticCosts(sector: string, country: string, frameworkData: any): any {
  const baseCosts = frameworkData.costs;
  
  // Add some variation based on sector complexity
  const multiplier = {
    fintech: 1.5,
    healthtech: 1.3,
    agtech: 1.0,
    iot: 0.8,
    edtech: 0.9,
    technology: 0.7
  }[sector] || 1.0;

  const initialCost = Math.round(baseCosts.initial * multiplier);
  const annualCost = Math.round(baseCosts.annual * multiplier);
  
  const breakdown = [
    { item: 'Consultoria jurídica especializada', cost: Math.round(initialCost * 0.3), frequency: 'one-time' },
    { item: 'Taxas regulatórias', cost: Math.round(initialCost * 0.4), frequency: 'one-time' },
    { item: 'Certificações e testes', cost: Math.round(initialCost * 0.2), frequency: 'one-time' },
    { item: 'Documentação e processos', cost: Math.round(initialCost * 0.1), frequency: 'one-time' },
    { item: 'Manutenção de compliance', cost: Math.round(annualCost * 0.6), frequency: 'annual' },
    { item: 'Auditoria anual', cost: Math.round(annualCost * 0.4), frequency: 'annual' }
  ];

  return {
    initialCompliance: initialCost,
    annualCompliance: annualCost,
    breakdown
  };
}

function generateDetailedRoadmap(requirements: any[], costs: any): any {
  const phases = [
    {
      name: 'Fase 1: Preparação e Documentação',
      duration: '1-2 meses',
      activities: [
        'Análise de gap regulatório',
        'Preparação de documentação inicial',
        'Contratação de consultoria especializada'
      ],
      estimatedCost: Math.round(costs.initialCompliance * 0.2)
    },
    {
      name: 'Fase 2: Submissão e Licenciamento',
      duration: '2-4 meses',
      activities: [
        'Submissão de pedidos de licença',
        'Adequação a requisitos específicos',
        'Acompanhamento de processos'
      ],
      estimatedCost: Math.round(costs.initialCompliance * 0.5)
    },
    {
      name: 'Fase 3: Certificação e Homologação',
      duration: '1-3 meses',
      activities: [
        'Testes e certificações necessárias',
        'Homologação de produtos/serviços',
        'Validação final'
      ],
      estimatedCost: Math.round(costs.initialCompliance * 0.3)
    }
  ];

  const totalMonths = phases.reduce((sum, phase) => {
    const months = parseInt(phase.duration.split('-')[1]) || 2;
    return sum + months;
  }, 0);

  return {
    phases,
    totalTimeframe: `${Math.max(4, totalMonths)} meses`
  };
}

function assessDetailedRisks(sector: string, requirements: any[]): any {
  const highCriticalityCount = requirements.filter(r => r.criticality === 'high').length;
  const mediumCriticalityCount = requirements.filter(r => r.criticality === 'medium').length;
  
  let overallRisk = 'low';
  if (highCriticalityCount >= 3) overallRisk = 'high';
  else if (highCriticalityCount >= 1 || mediumCriticalityCount >= 3) overallRisk = 'medium';

  const riskFactors = [];
  const mitigationStrategies = [];

  if (sector === 'fintech') {
    riskFactors.push('Regulamentação financeira complexa e em evolução');
    mitigationStrategies.push('Acompanhamento contínuo de mudanças regulatórias');
  }
  
  if (highCriticalityCount > 0) {
    riskFactors.push('Múltiplas aprovações regulatórias necessárias');
    mitigationStrategies.push('Cronograma bem estruturado com buffer de tempo');
  }

  riskFactors.push('Possíveis mudanças na legislação durante o processo');
  mitigationStrategies.push('Consultoria jurídica especializada contínua');

  return {
    overallRisk,
    riskFactors,
    mitigationStrategies
  };
}

function generateSectorRecommendations(sector: string, businessData: any): string[] {
  const recommendations = [
    'Inicie o processo regulatório o quanto antes, pois pode ser demorado',
    'Contrate consultoria jurídica especializada no setor'
  ];

  if (sector === 'agtech') {
    recommendations.push(
      'Considere certificação orgânica se aplicável ao seu produto',
      'Verifique questões ambientais e de sustentabilidade'
    );
  }

  if (sector === 'iot') {
    recommendations.push(
      'Homologação ANATEL é essencial para dispositivos com conectividade',
      'Considere certificações internacionais para facilitar exportação'
    );
  }

  if (businessData.businessDescription?.toLowerCase().includes('dados')) {
    recommendations.push('Priorize adequação à LGPD desde o início do desenvolvimento');
  }

  recommendations.push('Mantenha documentação detalhada de todo o processo de compliance');

  return recommendations;
}

// Get regulatory contacts with enhanced global support
function getRegulatoryContacts(sector: string, country: string = 'brazil'): any[] {
  const contactDatabase = {
    brazil: {
      agtech: [
        {
          authority: 'MAPA',
          contact: 'Ministério da Agricultura, Pecuária e Abastecimento',
          website: 'https://www.gov.br/agricultura/',
          phone: '0800 704 1995'
        },
        {
          authority: 'INMETRO',
          contact: 'Instituto Nacional de Metrologia',
          website: 'https://www.gov.br/inmetro/',
          phone: '0800 285 1818'
        },
        {
          authority: 'IBAMA',
          contact: 'Instituto Brasileiro do Meio Ambiente',
          website: 'https://www.gov.br/ibama/',
          phone: '0800 618 080'
        }
      ],
      iot: [
        {
          authority: 'ANATEL',
          contact: 'Agência Nacional de Telecomunicações',
          website: 'https://www.anatel.gov.br/',
          phone: '1331'
        },
        {
          authority: 'INMETRO',
          contact: 'Instituto Nacional de Metrologia',
          website: 'https://www.gov.br/inmetro/',
          phone: '0800 285 1818'
        }
      ],
      fintech: [
        {
          authority: 'BACEN',
          contact: 'Banco Central do Brasil',
          website: 'https://www.bcb.gov.br/',
          phone: '145'
        },
        {
          authority: 'CVM',
          contact: 'Comissão de Valores Mobiliários',
          website: 'https://www.gov.br/cvm/',
          phone: '0800 236 202'
        }
      ],
      healthtech: [
        {
          authority: 'ANVISA',
          contact: 'Agência Nacional de Vigilância Sanitária',
          website: 'https://www.gov.br/anvisa/',
          phone: '0800 642 9782'
        },
        {
          authority: 'CFM',
          contact: 'Conselho Federal de Medicina',
          website: 'https://portal.cfm.org.br/',
          phone: '(61) 3445-5900'
        }
      ]
    },
    usa: {
      iot: [
        {
          authority: 'FCC',
          contact: 'Federal Communications Commission',
          website: 'https://www.fcc.gov/',
          phone: '1-888-CALL-FCC'
        }
      ],
      fintech: [
        {
          authority: 'SEC',
          contact: 'Securities and Exchange Commission',
          website: 'https://www.sec.gov/',
          phone: '1-800-SEC-0330'
        }
      ],
      healthtech: [
        {
          authority: 'FDA',
          contact: 'Food and Drug Administration',
          website: 'https://www.fda.gov/',
          phone: '1-888-INFO-FDA'
        }
      ]
    },
    eu: {
      iot: [
        {
          authority: 'CE Marking',
          contact: 'European Conformity Assessment',
          website: 'https://ec.europa.eu/growth/single-market/ce-marking/',
          phone: 'Varia por país membro'
        }
      ],
      fintech: [
        {
          authority: 'EBA',
          contact: 'European Banking Authority',
          website: 'https://www.eba.europa.eu/',
          phone: '+33 1 86 52 70 00'
        }
      ],
      healthtech: [
        {
          authority: 'EMA',
          contact: 'European Medicines Agency',
          website: 'https://www.ema.europa.eu/',
          phone: '+31 88 781 6000'
        }
      ]
    }
  };

  const countryContacts = contactDatabase[country] || contactDatabase.brazil;
  const sectorContacts = countryContacts[sector] || countryContacts.iot || [];
  
  // Add LGPD/GDPR contact for data-related businesses
  if (country === 'brazil') {
    sectorContacts.push({
      authority: 'ANPD',
      contact: 'Autoridade Nacional de Proteção de Dados',
      website: 'https://www.gov.br/anpd/',
      phone: 'lgpd@anpd.gov.br'
    });
  }

  return sectorContacts;
}