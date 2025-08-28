import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SectorAnalysisRequest {
  ideaData: {
    title: string;
    description: string;
    audience: string;
    problem: string;
    solution: string;
    monetization?: string;
    competition?: string;
    budget?: string;
    location?: string;
  };
  sector: 'fintech' | 'healthtech' | 'edtech' | 'sustainability' | 'ecommerce' | 'saas';
  analysisType: 'comprehensive' | 'regulatory' | 'market' | 'technical' | 'competitive';
  language?: string;
}

interface SectorPrompts {
  [key: string]: {
    comprehensive: string;
    regulatory: string;
    market: string;
    technical: string;
    competitive: string;
    specificMetrics: string[];
    keyConsiderations: string[];
    regulatoryFrameworks: string[];
  };
}

const SECTOR_PROMPTS: SectorPrompts = {
  fintech: {
    comprehensive: `
    Você é um especialista em FinTech com 15+ anos de experiência no setor financeiro e tecnológico.
    Analise esta ideia de negócio FinTech considerando:
    
    ASPECTOS REGULATÓRIOS:
    - Compliance com LGPD, Open Banking, PIX
    - Licenças necessárias (BACEN, CVM, SUSEP)
    - KYC/AML requirements
    - PCI DSS para pagamentos
    - Sandbox regulatório
    
    ASPECTOS TÉCNICOS:
    - Arquitetura de segurança financeira
    - APIs bancárias e integrações
    - Criptografia e tokenização
    - Infraestrutura cloud para dados financeiros
    - Disaster recovery e backup
    
    MERCADO E COMPETIÇÃO:
    - Análise de incumbentes vs fintechs
    - Barreiras de entrada regulatórias
    - Network effects no setor financeiro
    - Tendências de Open Finance
    - Potencial de parcerias bancárias
    
    MÉTRICAS ESPECÍFICAS:
    - CAC (Customer Acquisition Cost)
    - LTV (Lifetime Value)
    - Take rate ou spread
    - AUM (Assets Under Management)
    - TPV (Total Payment Volume)
    - Churn rate
    - Time to break-even
    `,
    regulatory: `
    Foque especificamente nos aspectos regulatórios para FinTech no Brasil:
    - Resoluções do BACEN aplicáveis
    - Processo de licenciamento
    - Requisitos de capital mínimo
    - Governança corporativa exigida
    - Relatórios regulatórios obrigatórios
    - Sandbox do BACEN
    - Compliance com Lei do Sigilo Bancário
    `,
    market: `
    Analise o mercado FinTech brasileiro:
    - Tamanho do mercado endereçável
    - Segmentação por produtos financeiros
    - Análise de concorrentes diretos e indiretos
    - Tendências de adoção digital
    - Oportunidades de parcerias
    - Barreiras competitivas
    `,
    technical: `
    Avalie os aspectos técnicos específicos de FinTech:
    - Arquitetura de sistemas financeiros
    - Segurança e criptografia
    - Integrações bancárias necessárias
    - Escalabilidade para transações financeiras
    - Compliance técnico (PCI DSS, etc.)
    `,
    competitive: `
    Analise o cenário competitivo FinTech:
    - Mapeamento de concorrentes diretos
    - Análise de diferenciação
    - Vantagens competitivas sustentáveis
    - Ameaças de novos entrantes
    - Poder de barganha de fornecedores/clientes
    `,
    specificMetrics: [
      'Customer Acquisition Cost (CAC)',
      'Lifetime Value (LTV)',
      'Take Rate',
      'Assets Under Management (AUM)',
      'Total Payment Volume (TPV)',
      'Monthly Recurring Revenue (MRR)',
      'Churn Rate',
      'Net Promoter Score (NPS)',
      'Cost of Risk',
      'Regulatory Capital Ratio'
    ],
    keyConsiderations: [
      'Compliance regulatório',
      'Segurança de dados financeiros',
      'Licenças e autorizações',
      'Parcerias bancárias',
      'Escalabilidade técnica',
      'Network effects',
      'Trust e credibilidade'
    ],
    regulatoryFrameworks: [
      'Resolução BACEN 4.656/2018 (SCD)',
      'Lei 12.865/2013 (Arranjos de Pagamento)',
      'LGPD (Lei 13.709/2018)',
      'Circular BACEN 3.978/2020 (Open Banking)',
      'Resolução CMN 4.893/2021 (PIX)',
      'PCI DSS',
      'ISO 27001'
    ]
  },
  
  healthtech: {
    comprehensive: `
    Você é um especialista em HealthTech com experiência em regulamentação médica e inovação em saúde.
    Analise esta ideia considerando:
    
    ASPECTOS REGULATÓRIOS:
    - ANVISA e classificação de dispositivos médicos
    - CFM e telemedicina
    - LGPD para dados de saúde
    - Certificações ISO 13485, ISO 14155
    - Boas Práticas de Fabricação (BPF)
    
    ASPECTOS CLÍNICOS:
    - Evidências científicas necessárias
    - Estudos clínicos e validação
    - Protocolos médicos
    - Integração com workflow clínico
    - Usabilidade para profissionais de saúde
    
    MERCADO E REEMBOLSO:
    - Modelo de reembolso (SUS, ANS, particular)
    - Evidência de custo-efetividade
    - Adoção por sistemas de saúde
    - Ciclo de vendas para hospitais
    - Parcerias com operadoras
    
    MÉTRICAS ESPECÍFICAS:
    - Clinical outcomes
    - Patient satisfaction scores
    - Time to diagnosis/treatment
    - Cost per QALY
    - Adoption rate por especialidade
    - Regulatory approval timeline
    `,
    regulatory: `
    Foque nos aspectos regulatórios específicos de HealthTech:
    - Classificação ANVISA (Classe I, II, III, IV)
    - Registro de software médico
    - Certificação de Boas Práticas
    - Resolução CFM sobre telemedicina
    - Compliance com LGPD para dados sensíveis
    - Certificações internacionais (FDA, CE)
    `,
    market: `
    Analise o mercado de saúde brasileiro:
    - Segmentação público vs privado
    - Análise de stakeholders (médicos, hospitais, operadoras)
    - Tendências de digitalização em saúde
    - Oportunidades de parcerias
    - Barreiras de adoção
    `,
    technical: `
    Avalie aspectos técnicos de HealthTech:
    - Interoperabilidade (HL7, FHIR)
    - Segurança de dados médicos
    - Integração com sistemas hospitalares
    - Usabilidade clínica
    - Validação de algoritmos médicos
    `,
    competitive: `
    Analise competição em HealthTech:
    - Incumbentes vs startups
    - Diferenciação clínica
    - Vantagens de first-mover
    - Barreiras regulatórias
    - Network effects em saúde
    `,
    specificMetrics: [
      'Clinical Outcomes',
      'Patient Satisfaction (HCAHPS)',
      'Time to Diagnosis',
      'Cost per QALY',
      'Adoption Rate',
      'Regulatory Approval Time',
      'Clinical Trial Success Rate',
      'Healthcare Provider NPS',
      'Patient Engagement Rate',
      'Clinical Workflow Efficiency'
    ],
    keyConsiderations: [
      'Regulamentação ANVISA',
      'Evidências clínicas',
      'Integração com workflow médico',
      'Privacidade de dados de saúde',
      'Reembolso e sustentabilidade',
      'Adoção por profissionais',
      'Interoperabilidade'
    ],
    regulatoryFrameworks: [
      'RDC ANVISA 185/2001 (Software Médico)',
      'Resolução CFM 2.314/2022 (Telemedicina)',
      'LGPD Art. 11 (Dados Sensíveis)',
      'ISO 13485 (Dispositivos Médicos)',
      'ISO 14155 (Estudos Clínicos)',
      'IEC 62304 (Software Médico)',
      'HIPAA (se aplicável)'
    ]
  },
  
  edtech: {
    comprehensive: `
    Você é um especialista em EdTech com experiência em pedagogia digital e mercado educacional.
    Analise esta ideia considerando:
    
    ASPECTOS PEDAGÓGICOS:
    - Alinhamento com BNCC
    - Metodologias ativas de aprendizagem
    - Personalização e adaptatividade
    - Avaliação e analytics de aprendizagem
    - Acessibilidade educacional
    
    ASPECTOS REGULATÓRIOS:
    - LGPD para dados de menores
    - Marco Civil da Internet
    - Regulamentação MEC
    - Certificações educacionais
    - Direitos autorais de conteúdo
    
    MERCADO EDUCACIONAL:
    - Segmentação (K-12, superior, corporativo)
    - Ciclo de vendas B2B2C
    - Sazonalidade educacional
    - Parcerias com instituições
    - Modelo de precificação
    
    MÉTRICAS ESPECÍFICAS:
    - Learning outcomes
    - Student engagement
    - Completion rates
    - Time to proficiency
    - Teacher satisfaction
    - Cost per student
    - Retention rates
    `,
    regulatory: `
    Foque nos aspectos regulatórios de EdTech:
    - LGPD para dados de crianças e adolescentes
    - Marco Civil da Internet
    - Regulamentação de EAD (MEC)
    - Direitos autorais de conteúdo educacional
    - Certificações e acreditações
    - Acessibilidade digital (Lei 13.146/2015)
    `,
    market: `
    Analise o mercado educacional brasileiro:
    - Segmentação por nível educacional
    - Público vs privado
    - Tendências de digitalização
    - Comportamento de compra institucional
    - Sazonalidade e ciclos orçamentários
    `,
    technical: `
    Avalie aspectos técnicos de EdTech:
    - Learning Management Systems (LMS)
    - Analytics de aprendizagem
    - Gamificação e engagement
    - Acessibilidade (WCAG)
    - Integração com sistemas educacionais
    `,
    competitive: `
    Analise competição em EdTech:
    - Players estabelecidos vs startups
    - Diferenciação pedagógica
    - Network effects educacionais
    - Barreiras de switching
    - Vantagens de conteúdo proprietário
    `,
    specificMetrics: [
      'Learning Outcomes',
      'Student Engagement Rate',
      'Course Completion Rate',
      'Time to Proficiency',
      'Teacher Adoption Rate',
      'Cost per Student',
      'Student Retention Rate',
      'Assessment Scores Improvement',
      'Platform Usage Time',
      'Content Effectiveness Score'
    ],
    keyConsiderations: [
      'Eficácia pedagógica',
      'Proteção de dados de menores',
      'Adoção por educadores',
      'Acessibilidade e inclusão',
      'Escalabilidade de conteúdo',
      'Integração curricular',
      'Sustentabilidade financeira'
    ],
    regulatoryFrameworks: [
      'LGPD Art. 14 (Dados de Crianças)',
      'Lei 12.965/2014 (Marco Civil)',
      'Decreto 9.057/2017 (EAD)',
      'Lei 13.146/2015 (Acessibilidade)',
      'BNCC (Base Nacional Comum)',
      'WCAG 2.1 (Acessibilidade Web)',
      'Lei 9.610/1998 (Direitos Autorais)'
    ]
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

    const { ideaData, sector, analysisType, language = 'pt' }: SectorAnalysisRequest = await req.json();
    
    if (!ideaData || !sector) {
      throw new Error('ideaData and sector are required');
    }

    console.log(`Performing ${analysisType} analysis for ${sector} sector`);

    const sectorPrompts = SECTOR_PROMPTS[sector];
    if (!sectorPrompts) {
      throw new Error(`Sector ${sector} not supported`);
    }

    // Get the specific prompt for the analysis type
    const specificPrompt = sectorPrompts[analysisType as keyof typeof sectorPrompts] as string;
    
    const systemPrompt = `
    ${specificPrompt}
    
    DADOS DA IDEIA:
    Título: ${ideaData.title}
    Descrição: ${ideaData.description}
    Público-alvo: ${ideaData.audience}
    Problema: ${ideaData.problem}
    Solução: ${ideaData.solution}
    Monetização: ${ideaData.monetization || 'Não especificado'}
    Concorrência: ${ideaData.competition || 'Não especificado'}
    Orçamento: ${ideaData.budget || 'Não especificado'}
    Localização: ${ideaData.location || 'Brasil'}
    
    INSTRUÇÕES:
    1. Forneça uma análise detalhada e específica para o setor ${sector.toUpperCase()}
    2. Use as métricas específicas do setor: ${sectorPrompts.specificMetrics.join(', ')}
    3. Considere os frameworks regulatórios: ${sectorPrompts.regulatoryFrameworks.join(', ')}
    4. Aborde as considerações-chave: ${sectorPrompts.keyConsiderations.join(', ')}
    5. Seja específico e prático nas recomendações
    6. Inclua riscos e oportunidades específicos do setor
    7. Sugira próximos passos concretos
    
    Responda em português brasileiro com uma análise estruturada e detalhada.
    `;

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Calling OpenAI for sector-specific analysis...');
    
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      throw new Error(`OpenAI API error: ${openAiResponse.status} - ${errorText}`);
    }

    const openAiResult = await openAiResponse.json();
    const analysis = openAiResult.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis received from OpenAI');
    }

    // Structure the response
    const structuredAnalysis = {
      sector,
      analysisType,
      analysis,
      specificMetrics: sectorPrompts.specificMetrics,
      keyConsiderations: sectorPrompts.keyConsiderations,
      regulatoryFrameworks: sectorPrompts.regulatoryFrameworks,
      recommendations: extractRecommendations(analysis),
      risks: extractRisks(analysis),
      opportunities: extractOpportunities(analysis),
      nextSteps: extractNextSteps(analysis),
      generatedAt: new Date().toISOString()
    };

    console.log(`Sector analysis completed for ${sector}`);

    return new Response(
      JSON.stringify(structuredAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sector-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        sector: null,
        analysis: null
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions to extract structured information
function extractRecommendations(analysis: string): string[] {
  const recommendations: string[] = [];
  const lines = analysis.split('\n');
  let inRecommendations = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recomenda') || line.toLowerCase().includes('sugest')) {
      inRecommendations = true;
    }
    if (inRecommendations && (line.startsWith('- ') || line.startsWith('• '))) {
      recommendations.push(line.substring(2).trim());
    }
    if (inRecommendations && line.trim() === '') {
      inRecommendations = false;
    }
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

function extractRisks(analysis: string): string[] {
  const risks: string[] = [];
  const lines = analysis.split('\n');
  let inRisks = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('risco') || line.toLowerCase().includes('desafio')) {
      inRisks = true;
    }
    if (inRisks && (line.startsWith('- ') || line.startsWith('• '))) {
      risks.push(line.substring(2).trim());
    }
    if (inRisks && line.trim() === '') {
      inRisks = false;
    }
  }
  
  return risks.slice(0, 5);
}

function extractOpportunities(analysis: string): string[] {
  const opportunities: string[] = [];
  const lines = analysis.split('\n');
  let inOpportunities = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('oportunidade') || line.toLowerCase().includes('potencial')) {
      inOpportunities = true;
    }
    if (inOpportunities && (line.startsWith('- ') || line.startsWith('• '))) {
      opportunities.push(line.substring(2).trim());
    }
    if (inOpportunities && line.trim() === '') {
      inOpportunities = false;
    }
  }
  
  return opportunities.slice(0, 5);
}

function extractNextSteps(analysis: string): string[] {
  const nextSteps: string[] = [];
  const lines = analysis.split('\n');
  let inNextSteps = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('próximo') || line.toLowerCase().includes('passo') || 
        line.toLowerCase().includes('ação')) {
      inNextSteps = true;
    }
    if (inNextSteps && (line.startsWith('- ') || line.startsWith('• '))) {
      nextSteps.push(line.substring(2).trim());
    }
    if (inNextSteps && line.trim() === '') {
      inNextSteps = false;
    }
  }
  
  return nextSteps.slice(0, 5);
}