import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegulatoryAnalysisRequest {
  ideaData: {
    title: string;
    description: string;
    sector: string;
    business_model: string;
    target_audience: string;
    location: string;
    data_handling: boolean;
    financial_transactions: boolean;
    health_data: boolean;
    minors_data: boolean;
    international_operations: boolean;
  };
  analysisDepth: 'basic' | 'comprehensive' | 'expert';
  jurisdiction: 'brazil' | 'usa' | 'eu' | 'global';
}

interface RegulatoryRequirement {
  id: string;
  name: string;
  description: string;
  type: 'license' | 'registration' | 'certification' | 'compliance' | 'reporting';
  authority: string;
  mandatory: boolean;
  timeline: string;
  cost_estimate: string;
  complexity: 'low' | 'medium' | 'high';
  penalties: string;
  renewal_period?: string;
  prerequisites?: string[];
}

interface ComplianceFramework {
  name: string;
  description: string;
  applicability: string;
  key_requirements: string[];
  implementation_timeline: string;
  compliance_cost: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface RegulatoryRoadmap {
  phase: string;
  timeline: string;
  requirements: string[];
  estimated_cost: string;
  critical_path: boolean;
}

interface RegulatoryAnalysisResult {
  sector: string;
  jurisdiction: string;
  requirements: RegulatoryRequirement[];
  frameworks: ComplianceFramework[];
  roadmap: RegulatoryRoadmap[];
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high' | 'critical';
    key_risks: string[];
    mitigation_strategies: string[];
  };
  estimated_costs: {
    initial_compliance: number;
    annual_maintenance: number;
    total_first_year: number;
  };
  recommendations: string[];
  next_steps: string[];
  regulatory_contacts: {
    authority: string;
    contact_info: string;
    purpose: string;
  }[];
  generatedAt: string;
}

// Comprehensive regulatory database by sector and jurisdiction
const REGULATORY_DATABASE = {
  brazil: {
    fintech: {
      requirements: [
        {
          id: 'bacen_scd',
          name: 'Autorização BACEN para SCD',
          description: 'Autorização para funcionamento como Sociedade de Crédito Direto',
          type: 'license' as const,
          authority: 'Banco Central do Brasil (BACEN)',
          mandatory: true,
          timeline: '6-12 meses',
          cost_estimate: 'R$ 50.000 - R$ 200.000',
          complexity: 'high' as const,
          penalties: 'Multa de até R$ 2 milhões + cessação das atividades',
          renewal_period: 'Não aplicável (permanente)',
          prerequisites: ['Capital mínimo R$ 1 milhão', 'Governança corporativa', 'Sistemas de controle']
        },
        {
          id: 'pix_arrangement',
          name: 'Arranjo de Pagamento PIX',
          description: 'Registro para participação no ecossistema PIX',
          type: 'registration' as const,
          authority: 'Banco Central do Brasil (BACEN)',
          mandatory: false,
          timeline: '3-6 meses',
          cost_estimate: 'R$ 10.000 - R$ 50.000',
          complexity: 'medium' as const,
          penalties: 'Exclusão do arranjo PIX',
          renewal_period: 'Anual'
        },
        {
          id: 'lgpd_compliance',
          name: 'Compliance LGPD',
          description: 'Adequação à Lei Geral de Proteção de Dados',
          type: 'compliance' as const,
          authority: 'Autoridade Nacional de Proteção de Dados (ANPD)',
          mandatory: true,
          timeline: '3-6 meses',
          cost_estimate: 'R$ 30.000 - R$ 100.000',
          complexity: 'medium' as const,
          penalties: 'Multa de até 2% do faturamento (máximo R$ 50 milhões)'
        },
        {
          id: 'pci_dss',
          name: 'Certificação PCI DSS',
          description: 'Padrão de segurança para dados de cartão de pagamento',
          type: 'certification' as const,
          authority: 'PCI Security Standards Council',
          mandatory: true,
          timeline: '6-12 meses',
          cost_estimate: 'R$ 100.000 - R$ 500.000',
          complexity: 'high' as const,
          penalties: 'Multas das bandeiras + suspensão de processamento',
          renewal_period: 'Anual'
        }
      ],
      frameworks: [
        {
          name: 'Resolução BACEN 4.656/2018',
          description: 'Regulamentação de Sociedades de Crédito Direto',
          applicability: 'Empresas que concedem crédito com recursos próprios',
          key_requirements: [
            'Capital mínimo de R$ 1 milhão',
            'Estrutura de governança corporativa',
            'Sistemas de controle de riscos',
            'Auditoria independente'
          ],
          implementation_timeline: '12-18 meses',
          compliance_cost: 'R$ 200.000 - R$ 1.000.000',
          risk_level: 'high' as const
        },
        {
          name: 'Lei 12.865/2013 - Arranjos de Pagamento',
          description: 'Regulamentação de arranjos e instituições de pagamento',
          applicability: 'Empresas que processam pagamentos',
          key_requirements: [
            'Autorização do BACEN',
            'Capital mínimo conforme modalidade',
            'Segregação de recursos',
            'Relatórios regulatórios'
          ],
          implementation_timeline: '6-12 meses',
          compliance_cost: 'R$ 100.000 - R$ 500.000',
          risk_level: 'medium' as const
        }
      ]
    },
    healthtech: {
      requirements: [
        {
          id: 'anvisa_software',
          name: 'Registro ANVISA Software Médico',
          description: 'Registro de software como dispositivo médico',
          type: 'registration' as const,
          authority: 'Agência Nacional de Vigilância Sanitária (ANVISA)',
          mandatory: true,
          timeline: '12-24 meses',
          cost_estimate: 'R$ 50.000 - R$ 300.000',
          complexity: 'high' as const,
          penalties: 'Multa + apreensão do produto + cessação das atividades',
          renewal_period: '10 anos'
        },
        {
          id: 'cfm_telemedicine',
          name: 'Compliance Telemedicina CFM',
          description: 'Adequação às normas do Conselho Federal de Medicina',
          type: 'compliance' as const,
          authority: 'Conselho Federal de Medicina (CFM)',
          mandatory: true,
          timeline: '3-6 meses',
          cost_estimate: 'R$ 20.000 - R$ 80.000',
          complexity: 'medium' as const,
          penalties: 'Processo ético-profissional + suspensão das atividades'
        },
        {
          id: 'iso_13485',
          name: 'Certificação ISO 13485',
          description: 'Sistema de gestão da qualidade para dispositivos médicos',
          type: 'certification' as const,
          authority: 'Organismos de Certificação Acreditados',
          mandatory: false,
          timeline: '6-12 meses',
          cost_estimate: 'R$ 80.000 - R$ 200.000',
          complexity: 'high' as const,
          penalties: 'Perda de credibilidade + dificuldades comerciais',
          renewal_period: '3 anos'
        }
      ],
      frameworks: [
        {
          name: 'RDC ANVISA 185/2001',
          description: 'Regulamento técnico para software médico',
          applicability: 'Software que auxilia diagnóstico ou tratamento',
          key_requirements: [
            'Classificação de risco',
            'Estudos clínicos (se aplicável)',
            'Documentação técnica completa',
            'Sistema de qualidade'
          ],
          implementation_timeline: '12-24 meses',
          compliance_cost: 'R$ 100.000 - R$ 500.000',
          risk_level: 'high' as const
        }
      ]
    },
    edtech: {
      requirements: [
        {
          id: 'lgpd_minors',
          name: 'LGPD para Dados de Menores',
          description: 'Proteção especial para dados de crianças e adolescentes',
          type: 'compliance' as const,
          authority: 'Autoridade Nacional de Proteção de Dados (ANPD)',
          mandatory: true,
          timeline: '3-6 meses',
          cost_estimate: 'R$ 40.000 - R$ 120.000',
          complexity: 'medium' as const,
          penalties: 'Multa de até 2% do faturamento + medidas cautelares'
        },
        {
          id: 'mec_ead',
          name: 'Credenciamento MEC EAD',
          description: 'Credenciamento para oferta de cursos à distância',
          type: 'license' as const,
          authority: 'Ministério da Educação (MEC)',
          mandatory: false,
          timeline: '12-24 meses',
          cost_estimate: 'R$ 100.000 - R$ 500.000',
          complexity: 'high' as const,
          penalties: 'Impossibilidade de emitir diplomas reconhecidos'
        }
      ],
      frameworks: [
        {
          name: 'LGPD Art. 14 - Dados de Crianças',
          description: 'Tratamento de dados pessoais de crianças e adolescentes',
          applicability: 'Plataformas que coletam dados de menores de 18 anos',
          key_requirements: [
            'Consentimento específico dos pais/responsáveis',
            'Melhor interesse da criança',
            'Minimização de dados',
            'Transparência adaptada à idade'
          ],
          implementation_timeline: '3-6 meses',
          compliance_cost: 'R$ 50.000 - R$ 150.000',
          risk_level: 'high' as const
        }
      ]
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { ideaData, analysisDepth = 'comprehensive', jurisdiction = 'brazil' }: RegulatoryAnalysisRequest = await req.json();
    
    if (!ideaData || !ideaData.sector) {
      throw new Error('ideaData with sector is required');
    }

    console.log(`Performing ${analysisDepth} regulatory analysis for ${ideaData.sector} in ${jurisdiction}`);

    // Get base regulatory data
    const sectorData = REGULATORY_DATABASE[jurisdiction]?.[ideaData.sector as keyof typeof REGULATORY_DATABASE.brazil];
    
    if (!sectorData) {
      throw new Error(`Regulatory data not available for sector ${ideaData.sector} in ${jurisdiction}`);
    }

    // Filter requirements based on business characteristics
    const applicableRequirements = filterRequirementsByBusiness(sectorData.requirements, ideaData);
    const applicableFrameworks = sectorData.frameworks;

    // Generate regulatory roadmap
    const roadmap = generateRegulatoryRoadmap(applicableRequirements);

    // Assess risks
    const riskAssessment = assessRegulatoryRisks(applicableRequirements, ideaData);

    // Calculate costs
    const estimatedCosts = calculateComplianceCosts(applicableRequirements);

    // Generate AI-powered recommendations
    const aiAnalysis = await generateAIRegulatoryAnalysis(
      ideaData,
      applicableRequirements,
      applicableFrameworks,
      analysisDepth
    );

    // Get regulatory contacts
    const regulatoryContacts = getRegulatoryContacts(applicableRequirements, jurisdiction);

    const result: RegulatoryAnalysisResult = {
      sector: ideaData.sector,
      jurisdiction,
      requirements: applicableRequirements,
      frameworks: applicableFrameworks,
      roadmap,
      risk_assessment: riskAssessment,
      estimated_costs: estimatedCosts,
      recommendations: aiAnalysis.recommendations,
      next_steps: aiAnalysis.next_steps,
      regulatory_contacts: regulatoryContacts,
      generatedAt: new Date().toISOString()
    };

    console.log(`Regulatory analysis completed for ${ideaData.sector}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regulatory-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        result: null
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Filter requirements based on business characteristics
function filterRequirementsByBusiness(requirements: RegulatoryRequirement[], ideaData: any): RegulatoryRequirement[] {
  return requirements.filter(req => {
    // Always include mandatory requirements
    if (req.mandatory) return true;
    
    // Filter based on business model and characteristics
    if (req.id.includes('pix') && !ideaData.financial_transactions) return false;
    if (req.id.includes('telemedicine') && !ideaData.health_data) return false;
    if (req.id.includes('ead') && ideaData.target_audience !== 'students') return false;
    
    return true;
  });
}

// Generate regulatory roadmap
function generateRegulatoryRoadmap(requirements: RegulatoryRequirement[]): RegulatoryRoadmap[] {
  const phases: RegulatoryRoadmap[] = [];
  
  // Phase 1: Immediate compliance (0-3 months)
  const immediateReqs = requirements.filter(req => 
    req.timeline.includes('3 meses') || req.type === 'compliance'
  );
  
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
  const mediumTermReqs = requirements.filter(req => 
    req.timeline.includes('6 meses') || req.timeline.includes('12 meses')
  );
  
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
  const longTermReqs = requirements.filter(req => 
    req.timeline.includes('24 meses') || req.complexity === 'high'
  );
  
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
function calculatePhaseCost(requirements: RegulatoryRequirement[]): string {
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
function assessRegulatoryRisks(requirements: RegulatoryRequirement[], ideaData: any): any {
  const highRiskReqs = requirements.filter(req => req.complexity === 'high' || req.mandatory);
  const criticalReqs = requirements.filter(req => 
    req.penalties.includes('cessação') || req.penalties.includes('milhões')
  );
  
  let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
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
function calculateComplianceCosts(requirements: RegulatoryRequirement[]): any {
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
function getRegulatoryContacts(requirements: RegulatoryRequirement[], jurisdiction: string): any[] {
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
function getContactInfo(authority: string, jurisdiction: string): string {
  const contacts: { [key: string]: string } = {
    'Banco Central do Brasil (BACEN)': 'www.bcb.gov.br | 145 (Central de Atendimento)',
    'Agência Nacional de Vigilância Sanitária (ANVISA)': 'www.anvisa.gov.br | 0800 642 9782',
    'Autoridade Nacional de Proteção de Dados (ANPD)': 'www.gov.br/anpd | anpd@anpd.gov.br',
    'Conselho Federal de Medicina (CFM)': 'www.cfm.org.br | (61) 3445-5900',
    'Ministério da Educação (MEC)': 'www.mec.gov.br | 0800 616161'
  };
  
  return contacts[authority] || 'Contato não disponível';
}

// Generate AI-powered regulatory analysis
async function generateAIRegulatoryAnalysis(
  ideaData: any,
  requirements: RegulatoryRequirement[],
  frameworks: ComplianceFramework[],
  depth: string
): Promise<{ recommendations: string[], next_steps: string[] }> {
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiApiKey) {
    return {
      recommendations: ['Consulte um advogado especializado em direito regulatório'],
      next_steps: ['Identifique os requisitos obrigatórios', 'Desenvolva cronograma de compliance']
    };
  }

  const prompt = `
  Analise os requisitos regulatórios para a seguinte ideia de negócio:
  
  IDEIA: ${ideaData.title}
  SETOR: ${ideaData.sector}
  DESCRIÇÃO: ${ideaData.description}
  MODELO DE NEGÓCIO: ${ideaData.business_model}
  
  REQUISITOS IDENTIFICADOS:
  ${requirements.map(req => `- ${req.name}: ${req.description} (${req.mandatory ? 'Obrigatório' : 'Opcional'})`).join('\n')}
  
  FRAMEWORKS APLICÁVEIS:
  ${frameworks.map(fw => `- ${fw.name}: ${fw.description}`).join('\n')}
  
  Forneça:
  1. 5 recomendações estratégicas específicas para compliance
  2. 5 próximos passos práticos e priorizados
  
  Seja específico, prático e considere o contexto brasileiro.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const result = await response.json();
    const content = result.choices[0]?.message?.content || '';
    
    // Parse recommendations and next steps from AI response
    const recommendations = extractListFromText(content, 'recomendações');
    const nextSteps = extractListFromText(content, 'próximos passos');
    
    return { recommendations, next_steps };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return {
      recommendations: ['Consulte um advogado especializado em direito regulatório'],
      next_steps: ['Identifique os requisitos obrigatórios', 'Desenvolva cronograma de compliance']
    };
  }
}

// Extract list items from AI text response
function extractListFromText(text: string, section: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  let inSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes(section.toLowerCase())) {
      inSection = true;
      continue;
    }
    
    if (inSection && (line.startsWith('- ') || line.match(/^\d+\./))) {
      items.push(line.replace(/^[-\d.\s]+/, '').trim());
    } else if (inSection && line.trim() === '') {
      break;
    }
  }
  
  return items.slice(0, 5); // Limit to 5 items
}