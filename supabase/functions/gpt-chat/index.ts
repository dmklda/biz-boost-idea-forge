
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock responses for the chat function
// In a real implementation, this would use OpenAI's API
const mockResponses = [
  "Excelente pergunta! Baseado na sua ideia, recomendo começar focando no problema principal que você está resolvendo. O diferencial competitivo está na solução única que você oferece para este problema.",
  "Analisando sua ideia, vejo grande potencial no modelo de monetização por assinatura. Considerando seu público-alvo, um modelo freemium poderia atrair usuários iniciais enquanto mantém uma fonte de receita sustentável.",
  "Sua ideia tem bom potencial de mercado! Para validá-la, sugiro começar com entrevistas com potenciais clientes para confirmar que o problema realmente existe e que sua solução é desejável. Um MVP simples também seria importante para testar suas hipóteses.",
  "Considerando as tendências atuais do mercado, sua ideia está bem posicionada. Entretanto, recomendo ficar atento à concorrência indireta que poderia entrar nesse espaço. Sua vantagem competitiva precisa ser clara e defensável.",
  "Para o desenvolvimento inicial, recomendo focar nas funcionalidades essenciais que resolvem o problema central. A arquitetura técnica deve ser escalável, mas não precisa ser perfeita no início. Use tecnologias que permitam desenvolvimento rápido.",
  "Baseado na análise de mercado, suas projeções de receita parecem otimistas mas alcançáveis. Sugiro revisar seus custos de aquisição de cliente e modelar diferentes cenários de crescimento para ter uma visão mais completa.",
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody = await req.json();
    const { ideaId, message, history } = requestBody;

    // Validate input
    if (!ideaId || !message) {
      console.error("Missing required parameters:", { ideaId, message });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Processing chat for idea:", ideaId);
    console.log("User message:", message);
    console.log("Chat history length:", history ? history.length : 0);

    // In a real implementation, this would:
    // 1. Fetch the idea details and analysis from Supabase
    // 2. Format them as context for the OpenAI API
    // 3. Call GPT-4o with the full context and chat history
    
    // For now, provide a mock response
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    const response = mockResponses[randomIndex];

    console.log("Sending response:", response);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in gpt-chat function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
