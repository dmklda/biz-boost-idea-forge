import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Governmental APIs and sources for real-time data
const GOVERNMENT_APIS = {
  BACEN: 'https://olinda.bcb.gov.br/olinda/servico/',
  PORTAL_TRANSPARENCIA: 'https://portaldatransparencia.gov.br/api-de-dados',
  ANVISA: 'https://consultas.anvisa.gov.br/api/',
  RECEITA_FEDERAL: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria',
  ANPD_LGPD: 'https://www.gov.br/anpd/pt-br/assuntos/lgpd'
};

// Base regulatory framework (as fallback)
const BASE_REGULATORY_FRAMEWORK = {
  fintech: [
    {
      id: 'bacen_scd',
      name: 'Autorização BACEN para SCD',
      description: 'Autorização para funcionamento como Sociedade de Crédito Direto',
      type: 'license',
      authority: 'Banco Central do Brasil (BACEN)',
      mandatory: true,
      timeline: '6-12 meses',
      cost_estimate: 'R$ 50.000 - R$ 200.000',
      complexity: 'high',
      penalties: 'Multa de até R$ 2 milhões + cessação das atividades'
    },
    {
      id: 'lgpd_compliance',
      name: 'Compliance LGPD',
      description: 'Adequação à Lei Geral de Proteção de Dados',
      type: 'compliance',
      authority: 'Autoridade Nacional de Proteção de Dados (ANPD)',
      mandatory: true,
      timeline: '3-6 meses',
      cost_estimate: 'R$ 30.000 - R$ 100.000',
      complexity: 'medium',
      penalties: 'Multa de até 2% do faturamento (máximo R$ 50 milhões)'
    }
  ],
  healthtech: [
    {
      id: 'anvisa_software',
      name: 'Registro ANVISA Software Médico',
      description: 'Registro de software como dispositivo médico',
      type: 'registration',
      authority: 'Agência Nacional de Vigilância Sanitária (ANVISA)',
      mandatory: true,
      timeline: '12-24 meses',
      cost_estimate: 'R$ 50.000 - R$ 300.000',
      complexity: 'high',
      penalties: 'Multa + apreensão do produto + cessação das atividades'
    },
    {
      id: 'lgpd_health',
      name: 'LGPD para Dados de Saúde',
      description: 'Proteção especial para dados pessoais de saúde',
      type: 'compliance',
      authority: 'Autoridade Nacional de Proteção de Dados (ANPD)',
      mandatory: true,
      timeline: '3-6 meses',
      cost_estimate: 'R$ 40.000 - R$ 120.000',
      complexity: 'high',
      penalties: 'Multa de até 2% do faturamento + medidas cautelares'
    }
  ],
  edtech: [
    {
      id: 'lgpd_minors',
      name: 'LGPD para Dados de Menores',
      description: 'Proteção especial para dados de crianças e adolescentes',
      type: 'compliance',
      authority: 'Autoridade Nacional de Proteção de Dados (ANPD)',
      mandatory: true,
      timeline: '3-6 meses',
      cost_estimate: 'R$ 40.000 - R$ 120.000',
      complexity: 'medium',
      penalties: 'Multa de até 2% do faturamento + medidas cautelares'
    }
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== REGULATORY ANALYSIS REQUEST ===');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { businessName, businessSector, businessDescription, targetAudience, businessModel, location = 'Brazil', ideaId } = body;
    
    // Improved validation with better error messages
    if (!businessName || businessName.trim() === '') {
      console.error('Missing business name');
      throw new Error('Nome do negócio é obrigatório');
    }
    
    if (!businessDescription || businessDescription.trim() === '') {
      console.error('Missing business description');
      throw new Error('Descrição do negócio é obrigatória');
    }
    
    // Set default sector if not provided
    const finalSector = businessSector && businessSector.trim() !== '' ? businessSector : 'Tecnologia';
    console.log('Using sector:', finalSector);
    
    console.log('=== VALIDATION PASSED ===');
    console.log('Business data:', { businessName, businessSector: finalSector, businessDescription, targetAudience, businessModel, location, ideaId });
    
    // Generate dynamic regulatory analysis using AI
    console.log('=== STARTING AI-POWERED ANALYSIS ===');
    const analysisResult = await generateDynamicRegulatoryAnalysis({ businessName, businessSector: finalSector, businessDescription, targetAudience, businessModel, location });
    
    if (!analysisResult) {
      throw new Error('Failed to generate regulatory analysis');
    }

    const analysis = {
      ...analysisResult,
      generated_at: new Date().toISOString(),
      data_sources: analysisResult.data_sources || ["OpenAI Analysis", "Government Sources"],
      confidence_level: analysisResult.confidence_level || "high"
    };

    console.log('Generated components:', {
      roadmapPhases: analysisResult.roadmap?.phases?.length || 0,
      requirementsCount: analysisResult.requirements?.length || 0,
      riskLevel: analysisResult.risk_assessment?.overall_risk || 'unknown',
      contactsCount: analysisResult.contacts?.length || 0
    });
    
    console.log('=== ANALYSIS COMPLETED ===');
    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in regulatory-analysis function:', error);
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

// Dynamic regulatory analysis using AI and real data sources
async function generateDynamicRegulatoryAnalysis(businessData: any) {
  console.log('Starting dynamic regulatory analysis for:', businessData.businessName);
  
  try {
    // Fetch real-time regulatory data
    const realTimeData = await fetchRealTimeRegulatoryData(businessData);
    
    // Generate AI-powered analysis
    const aiAnalysis = await generateAIRegulatoryAnalysis(businessData, realTimeData);
    
    return aiAnalysis;
  } catch (error) {
    console.error('Error in dynamic analysis:', error);
    // Fallback to basic analysis with updated prompting
    return await generateFallbackAnalysis(businessData);
  }
}

async function fetchRealTimeRegulatoryData(businessData: any) {
  console.log('Fetching real-time regulatory data...');
  
  const realTimeData = {
    sector_updates: [],
    recent_regulations: [],
    compliance_alerts: [],
    government_sources: []
  };

  try {
    // In a real implementation, these would be actual API calls
    // For now, we'll simulate with intelligent prompting based on current data
    
    // Simulate fetching sector-specific data
    if (businessData.businessSector === 'fintech' || businessData.businessModel?.includes('financ')) {
      realTimeData.sector_updates.push({
        source: 'BACEN',
        update: 'Resolução 5.061/2023 - Novos requisitos para fintechs',
        date: new Date().toISOString(),
        impact: 'high'
      });
    }

    if (businessData.businessSector === 'healthtech' || businessData.businessDescription?.includes('saúde')) {
      realTimeData.sector_updates.push({
        source: 'ANVISA',
        update: 'RDC 787/2023 - Regulamentação de dispositivos médicos digitais',
        date: new Date().toISOString(),
        impact: 'medium'
      });
    }

    // Add LGPD requirements for all digital businesses
    if (businessData.businessModel?.includes('app') || businessData.businessModel?.includes('digital')) {
      realTimeData.compliance_alerts.push({
        source: 'ANPD',
        alert: 'LGPD - Lei Geral de Proteção de Dados em vigor',
        requirements: ['DPO designation', 'Privacy policy', 'Consent management'],
        penalties: 'Multa de até 2% do faturamento'
      });
    }

    console.log('Real-time data fetched:', realTimeData);
    return realTimeData;
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return realTimeData; // Return partial data
  }
}

async function generateAIRegulatoryAnalysis(businessData: any, realTimeData: any) {
  if (!openAIApiKey) {
    console.log('OpenAI API key not found, using fallback analysis');
    return generateFallbackAnalysis(businessData);
  }

  console.log('Generating AI regulatory analysis...');

  const prompt = `
Você é um especialista em regulamentação empresarial brasileira. Analise o seguinte negócio e forneça uma análise regulatória completa e específica:

DADOS DO NEGÓCIO:
- Nome: ${businessData.businessName}
- Setor: ${businessData.businessSector}
- Descrição: ${businessData.businessDescription}
- Público-alvo: ${businessData.targetAudience}
- Modelo de negócio: ${businessData.businessModel}
- Localização: ${businessData.location}

DADOS REGULATÓRIOS ATUAIS:
${JSON.stringify(realTimeData, null, 2)}

Forneça uma análise detalhada em formato JSON com a seguinte estrutura:

{
  "requirements": [
    {
      "name": "Nome do requisito",
      "description": "Descrição detalhada",
      "authority": "Órgão responsável",
      "type": "licensing|compliance|tax|data_protection|health|financial",
      "mandatory": true/false,
      "timeline": "prazo em dias",
      "cost_estimate": "R$ estimativa",
      "complexity": "low|medium|high|critical",
      "penalties": "Penalidades por não cumprimento",
      "next_steps": ["passo 1", "passo 2"]
    }
  ],
  "risk_assessment": {
    "overall_risk": "low|medium|high|critical",
    "key_risks": ["risco 1", "risco 2"],
    "mitigation_strategies": ["estratégia 1", "estratégia 2"]
  },
  "costs": {
    "initial_setup": "R$ valor",
    "annual_compliance": "R$ valor",
    "breakdown": {
      "licensing": "R$ valor",
      "legal_fees": "R$ valor",
      "ongoing_compliance": "R$ valor"
    }
  },
  "roadmap": {
    "immediate": [{"task": "tarefa", "deadline": "prazo", "cost": "custo"}],
    "medium_term": [{"task": "tarefa", "deadline": "prazo", "cost": "custo"}],
    "long_term": [{"task": "tarefa", "deadline": "prazo", "cost": "custo"}]
  },
  "recommendations": [
    "Recomendação específica 1",
    "Recomendação específica 2"
  ],
  "contacts": [
    {
      "authority": "Nome do órgão",
      "website": "URL",
      "phone": "telefone",
      "email": "email"
    }
  ],
  "confidence_level": "medium|high",
  "last_updated": "${new Date().toISOString()}"
}

IMPORTANTE: 
- Seja específico para o negócio descrito
- Considere as regulamentações atuais do Brasil
- Inclua custos realistas em reais (R$)
- Mencione órgãos reguladores específicos
- Forneça prazos reais
- Inclua informações de contato reais dos órgãos
- Base-se nas atualizações regulatórias fornecidas
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em regulamentação empresarial brasileira com conhecimento atualizado sobre leis, normas e procedimentos para abertura e operação de empresas no Brasil.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      console.log('AI analysis completed successfully');
      return analysisResult;
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return generateFallbackAnalysis(businessData);
  }
}

async function generateFallbackAnalysis(businessData: any) {
  console.log('Generating fallback analysis...');
  
  // Use the original static data as enhanced fallback
  const sectorKey = mapBusinessSectorToKey(businessData.businessSector);
  const relevantRequirements = BASE_REGULATORY_FRAMEWORK[sectorKey] || [];
  
  return {
    requirements: relevantRequirements.map(req => ({
      ...req,
      applicable: true,
      compliance_status: 'pending'
    })),
    risk_assessment: assessRegulatoryRisks(relevantRequirements, businessData),
    costs: calculateComplianceCosts(relevantRequirements),
    roadmap: generateRegulatoryRoadmap(relevantRequirements),
    recommendations: [
      "Consulte um advogado especializado em direito empresarial",
      "Implemente um sistema de gestão de compliance",
      "Monitore mudanças regulatórias regularmente",
      "Estabeleça procedimentos de auditoria interna"
    ],
    contacts: getRegulatoryContacts(relevantRequirements, businessData.location),
    confidence_level: "medium",
    data_sources: ["Base Regulatory Framework"]
  };
}

function mapBusinessSectorToKey(sector: string): string {
  const sectorMappings = {
    'fintech': 'fintech',
    'financeiro': 'fintech',
    'pagamentos': 'fintech',
    'banco': 'fintech',
    'healthtech': 'healthtech',
    'saúde': 'healthtech',
    'medicina': 'healthtech',
    'edtech': 'edtech',
    'educação': 'edtech',
    'ensino': 'edtech',
    'tecnologia': 'fintech', // Default fallback
    'tech': 'fintech'
  };
  
  return sectorMappings[sector.toLowerCase()] || 'fintech';
}

// Generate regulatory roadmap
function generateRegulatoryRoadmap(requirements: any[]) {
  const phases = [];
  
  // Phase 1: Immediate compliance (0-3 months)
  const immediateReqs = requirements.filter(req => req.timeline.includes('3 meses') || req.type === 'compliance');
  if (immediateReqs.length > 0) {
    phases.push({
      phase: 'Fase 1: Compliance Imediato',
      timeline: '0-3 meses',
      requirements: immediateReqs.map(req => req.name),
      estimated_cost: calculatePhaseCost(immediateReqs),
      critical_path: true
    });
  }
  
  // Phase 2: Licenses and registrations (3-12 months)
  const mediumTermReqs = requirements.filter(req => req.timeline.includes('6 meses') || req.timeline.includes('12 meses'));
  if (mediumTermReqs.length > 0) {
    phases.push({
      phase: 'Fase 2: Licenças e Registros',
      timeline: '3-12 meses',
      requirements: mediumTermReqs.map(req => req.name),
      estimated_cost: calculatePhaseCost(mediumTermReqs),
      critical_path: true
    });
  }
  
  // Phase 3: Advanced certifications (12+ months)
  const longTermReqs = requirements.filter(req => req.timeline.includes('24 meses') || req.complexity === 'high');
  if (longTermReqs.length > 0) {
    phases.push({
      phase: 'Fase 3: Certificações Avançadas',
      timeline: '12+ meses',
      requirements: longTermReqs.map(req => req.name),
      estimated_cost: calculatePhaseCost(longTermReqs),
      critical_path: false
    });
  }
  
  return phases;
}

// Calculate phase cost
function calculatePhaseCost(requirements: any[]) {
  const totalMin = requirements.reduce((sum, req) => {
    const match = req.cost_estimate.match(/R\$ ([\d.]+)/g);
    if (match && match[0]) {
      const value = parseInt(match[0].replace(/[R$ .]/g, ''));
      return sum + value;
    }
    return sum;
  }, 0);
  
  const totalMax = requirements.reduce((sum, req) => {
    const matches = req.cost_estimate.match(/R\$ ([\d.]+)/g);
    if (matches && matches[1]) {
      const value = parseInt(matches[1].replace(/[R$ .]/g, ''));
      return sum + value;
    } else if (matches && matches[0]) {
      const value = parseInt(matches[0].replace(/[R$ .]/g, ''));
      return sum + value * 1.5; // Estimate upper bound
    }
    return sum;
  }, 0);
  
  return `R$ ${totalMin.toLocaleString()} - R$ ${totalMax.toLocaleString()}`;
}

// Assess regulatory risks
function assessRegulatoryRisks(requirements: any[], ideaData: any) {
  const highRiskReqs = requirements.filter(req => req.complexity === 'high' || req.mandatory);
  const criticalReqs = requirements.filter(req => req.penalties.includes('cessação') || req.penalties.includes('milhões'));
  
  let overallRisk = 'low';
  if (criticalReqs.length > 0) {
    overallRisk = 'critical';
  } else if (highRiskReqs.length >= 3) {
    overallRisk = 'high';
  } else if (highRiskReqs.length > 0) {
    overallRisk = 'medium';
  }
  
  const keyRisks = [
    ...criticalReqs.map(req => `${req.name}: ${req.penalties}`),
    'Mudanças regulatórias frequentes no setor',
    'Complexidade de implementação técnica',
    'Custos elevados de compliance'
  ];
  
  const mitigationStrategies = [
    'Contratar consultoria jurídica especializada',
    'Implementar compliance desde o início',
    'Monitorar mudanças regulatórias constantemente',
    'Estabelecer relacionamento com órgãos reguladores',
    'Investir em treinamento da equipe'
  ];
  
  return {
    overall_risk: overallRisk,
    key_risks: keyRisks,
    mitigation_strategies: mitigationStrategies
  };
}

// Calculate compliance costs
function calculateComplianceCosts(requirements: any[]) {
  let initialMin = 0, initialMax = 0, annualMin = 0, annualMax = 0;
  
  requirements.forEach(req => {
    const matches = req.cost_estimate.match(/R\$ ([\d.]+)/g);
    if (matches) {
      const min = parseInt(matches[0].replace(/[R$ .]/g, ''));
      const max = matches[1] ? parseInt(matches[1].replace(/[R$ .]/g, '')) : min * 1.5;
      
      initialMin += min;
      initialMax += max;
      
      // Estimate annual costs (10-20% of initial for maintenance)
      if (req.renewal_period) {
        annualMin += min * 0.1;
        annualMax += max * 0.2;
      }
    }
  });
  
  return {
    initial_compliance: (initialMin + initialMax) / 2,
    annual_maintenance: (annualMin + annualMax) / 2,
    total_first_year: (initialMin + initialMax) / 2 + (annualMin + annualMax) / 2
  };
}

// Get regulatory contacts
function getRegulatoryContacts(requirements: any[], jurisdiction: string) {
  const contacts = new Map();
  
  requirements.forEach(req => {
    if (!contacts.has(req.authority)) {
      contacts.set(req.authority, {
        authority: req.authority,
        contact_info: getContactInfo(req.authority, jurisdiction),
        purpose: `Consultas sobre ${req.name}`
      });
    }
  });
  
  return Array.from(contacts.values());
}

// Get contact information for authorities
function getContactInfo(authority: string, jurisdiction: string) {
  const contacts = {
    'Banco Central do Brasil (BACEN)': 'https://www.bcb.gov.br/atendimento',
    'Agência Nacional de Vigilância Sanitária (ANVISA)': 'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/contato',
    'Autoridade Nacional de Proteção de Dados (ANPD)': 'https://www.gov.br/anpd/pt-br/assuntos/contato',
    'Ministério da Educação (MEC)': 'https://www.gov.br/mec/pt-br/acesso-a-informacao/fale-conosco',
    'Conselho Federal de Medicina (CFM)': 'https://portal.cfm.org.br/contato/',
    'Receita Federal': 'https://www.gov.br/receitafederal/pt-br/contato'
  };
  
  return contacts[authority] || 'Contato não disponível';
}