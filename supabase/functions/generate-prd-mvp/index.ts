import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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
      systemPrompt = `Você é um Product Manager experiente. Crie um PRD profissional e detalhado em formato Markdown.`;
      userPrompt = `Crie um PRD completo para: ${idea.title}

DESCRIÇÃO: ${idea.description}
PÚBLICO: ${idea.audience || 'Não especificado'}
PROBLEMA: ${idea.problem || 'Não especificado'}
MONETIZAÇÃO: ${idea.monetization || 'Não especificado'}
${customRequirements ? `REQUISITOS: ${customRequirements}` : ''}

Estruture o PRD com as seguintes seções em Markdown:

# PRD - ${idea.title}

## 1. VISÃO GERAL
- Objetivo do produto
- Visão e missão
- Contexto de mercado

## 2. ANÁLISE DE MERCADO
- Público-alvo detalhado
- Persona primária
- Análise competitiva

## 3. REQUISITOS FUNCIONAIS
- Features principais (MVP)
- User stories detalhadas
- Critérios de aceitação

## 4. REQUISITOS NÃO-FUNCIONAIS
- Performance, segurança, usabilidade

## 5. ARQUITETURA
- Stack tecnológico recomendado
- Integrações necessárias

## 6. ROADMAP
- Fases de desenvolvimento
- Timeline estimado

## 7. MÉTRICAS
- KPIs principais
- Métodos de medição

## 8. RISCOS
- Principais riscos e mitigações

Seja específico e detalhado em cada seção.`;
    } else {
      systemPrompt = `Você é um consultor de startups experiente. Crie um plano de MVP prático e executável em formato Markdown.`;
      userPrompt = `Crie um plano de MVP completo para: ${idea.title}

DESCRIÇÃO: ${idea.description}
PÚBLICO: ${idea.audience || 'Não especificado'}
PROBLEMA: ${idea.problem || 'Não especificado'}
MONETIZAÇÃO: ${idea.monetization || 'Não especificado'}
${customRequirements ? `REQUISITOS: ${customRequirements}` : ''}

Estruture o plano em Markdown:

# Plano MVP - ${idea.title}

## 1. DEFINIÇÃO DO MVP
- Proposta de valor principal
- Funcionalidade core essencial
- O que NÃO incluir

## 2. PÚBLICO-ALVO INICIAL
- Segmento específico para testar
- Early adopters ideais
- Como alcançá-los

## 3. FEATURES MÍNIMAS
- Lista priorizada de funcionalidades
- User flow básico
- Interface essencial

## 4. VALIDAÇÃO E TESTES
- Hipóteses a validar
- Métodos de teste
- Métricas de validação

## 5. DESENVOLVIMENTO
- Abordagem técnica simples
- Tecnologias recomendadas
- Timeline de 2-3 meses

## 6. GO-TO-MARKET
- Estratégia de lançamento
- Canais de distribuição
- Preço inicial

## 7. ORÇAMENTO ESTIMADO
- Custos de desenvolvimento
- Custos operacionais
- Investimento mínimo

## 8. PRÓXIMOS PASSOS
- Ações imediatas
- Marcos de 30/60/90 dias
- Critérios para pivotar

Seja específico e prático em cada seção.`;
    }
    console.log(`Generating ${documentType} for idea: ${idea.title}`);
    
    // Try multiple models starting with most reliable ones
    const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-2025-04-14'];
    let response;
    let lastError;
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const requestBody = {
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        };
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          console.log(`Successfully connected with model: ${model}`);
          break;
        } else {
          const errorData = await response.json();
          console.error(`Model ${model} failed:`, errorData);
          lastError = errorData;
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
      }
    }
    if (!response || !response.ok) {
      const error = lastError || { error: { message: 'All models failed' } };
      console.error('All OpenAI models failed:', error);
      throw new Error(error.error?.message || 'Failed to generate document with any available model');
    }
    
    const data = await response.json();
    console.log('OpenAI response data:', { 
      hasChoices: !!data.choices, 
      choicesLength: data.choices?.length,
      fullResponse: JSON.stringify(data, null, 2).substring(0, 1000) + '...' 
    });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from AI service');
    }
    
    const document = data.choices[0].message.content;
    console.log('Generated document details:', { 
      length: document?.length || 0,
      preview: document?.substring(0, 200) || 'EMPTY',
      type: typeof document
    });
    
    if (!document || document.trim().length === 0) {
      console.error('Empty document generated. Full response:', JSON.stringify(data, null, 2));
      throw new Error('AI service returned empty document. Please try again.');
    }
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
    const { data: savedContent, error: saveError } = await supabase.from('generated_content').insert({
      user_id: user.id,
      idea_id: idea.id,
      content_type: documentType,
      title: `${documentTitle} - ${idea.title}`,
      content_data: contentData,
      file_url: null
    }).select().single();
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
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-prd-mvp function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
