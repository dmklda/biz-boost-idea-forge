
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, documentType, customRequirements } = await req.json();

    if (!idea || !documentType) {
      throw new Error('Idea and document type are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT token
    const jwt = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Build the prompt based on document type
    let systemPrompt = '';
    let userPrompt = '';

    if (documentType === 'prd') {
      systemPrompt = `Você é um Product Manager experiente especializado em criar Product Requirements Documents (PRDs) profissionais e detalhados. Crie PRDs que sejam claros, actionáveis e completos.`;
      
      userPrompt = `
Crie um PRD (Product Requirements Document) profissional e detalhado para a seguinte ideia de negócio:

**Título:** ${idea.title}
**Descrição:** ${idea.description}
**Público-alvo:** ${idea.audience || 'Não especificado'}
**Problema:** ${idea.problem || 'Não especificado'}
**Monetização:** ${idea.monetization || 'Não especificado'}

${customRequirements ? `**Requisitos específicos:** ${customRequirements}` : ''}

O PRD deve incluir:

1. **VISÃO GERAL**
   - Objetivo do produto
   - Visão e missão
   - Contexto de mercado

2. **ANÁLISE DE MERCADO**
   - Público-alvo detalhado
   - Persona primária
   - Análise competitiva
   - Oportunidade de mercado

3. **REQUISITOS FUNCIONAIS**
   - Features principais (MVP)
   - Features secundárias
   - User stories detalhadas
   - Critérios de aceitação

4. **REQUISITOS NÃO-FUNCIONAIS**
   - Performance
   - Segurança
   - Usabilidade
   - Escalabilidade

5. **ARQUITETURA E TECNOLOGIA**
   - Stack tecnológico recomendado
   - Integrações necessárias
   - Considerações de infraestrutura

6. **ROADMAP E CRONOGRAMA**
   - Fases de desenvolvimento
   - Marcos importantes
   - Timeline estimado

7. **MÉTRICAS E KPIS**
   - Métricas de sucesso
   - KPIs principais
   - Métodos de medição

8. **RISCOS E MITIGAÇÕES**
   - Principais riscos identificados
   - Estratégias de mitigação

Formate o documento em Markdown com seções bem estruturadas e detalhadas.
`;
    } else {
      systemPrompt = `Você é um empreendedor experiente e consultor de startups especializado em criar planos de MVP (Minimum Viable Product) práticos e executáveis. Foque em soluções simples, viáveis e de rápida implementação.`;
      
      userPrompt = `
Crie um plano de MVP (Minimum Viable Product) prático e executável para a seguinte ideia de negócio:

**Título:** ${idea.title}
**Descrição:** ${idea.description}
**Público-alvo:** ${idea.audience || 'Não especificado'}
**Problema:** ${idea.problem || 'Não especificado'}
**Monetização:** ${idea.monetization || 'Não especificado'}

${customRequirements ? `**Requisitos específicos:** ${customRequirements}` : ''}

O plano de MVP deve incluir:

1. **DEFINIÇÃO DO MVP**
   - Proposta de valor principal
   - Funcionalidade core essencial
   - O que NÃO incluir no MVP

2. **PÚBLICO-ALVO INICIAL**
   - Segmento específico para testar
   - Early adopters ideais
   - Como alcançá-los

3. **FEATURES MÍNIMAS**
   - Lista priorizada de funcionalidades
   - User flow básico
   - Interface essencial

4. **VALIDAÇÃO E TESTES**
   - Hipóteses a validar
   - Métodos de teste
   - Métricas de validação

5. **DESENVOLVIMENTO**
   - Abordagem técnica simples
   - Tecnologias recomendadas
   - Timeline de 2-3 meses

6. **GO-TO-MARKET**
   - Estratégia de lançamento
   - Canais de distribuição
   - Preço inicial

7. **ORÇAMENTO ESTIMADO**
   - Custos de desenvolvimento
   - Custos operacionais
   - Investimento mínimo necessário

8. **PRÓXIMOS PASSOS**
   - Ações imediatas
   - Marcos de 30/60/90 dias
   - Critérios para pivotar ou prosseguir

Formate o documento em Markdown com seções práticas e actionáveis, focando na viabilidade e execução rápida.
`;
    }

    console.log(`Generating ${documentType} for idea: ${idea.title}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate document');
    }

    const data = await response.json();
    const document = data.choices[0].message.content;

    // Save to generated_content table
    const contentData = {
      documentType,
      customRequirements,
      ideaTitle: idea.title,
      ideaDescription: idea.description,
      ideaAudience: idea.audience,
      ideaProblem: idea.problem,
      ideaMonetization: idea.monetization,
      document
    };

    const documentTitle = documentType === 'prd' ? 'PRD' : 'Plano MVP';

    const { data: savedContent, error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        idea_id: idea.id,
        content_type: documentType,
        title: `${documentTitle} - ${idea.title}`,
        content_data: contentData,
        file_url: null
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      // Don't throw error here, just log it - user still gets the document
    }

    console.log(`${documentType.toUpperCase()} generated and saved successfully`);

    return new Response(JSON.stringify({ 
      document,
      documentType,
      ideaTitle: idea.title,
      savedContentId: savedContent?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-prd-mvp function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
