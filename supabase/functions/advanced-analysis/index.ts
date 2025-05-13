
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { ideaId } = await req.json();

    // Validate input
    if (!ideaId) {
      return new Response(
        JSON.stringify({ error: "Missing ideaId parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing advanced analysis for idea: ${ideaId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we already have an analysis for this idea
    const { data: existingAnalysis, error: checkError } = await supabase
      .from("advanced_analyses")
      .select("id")
      .eq("idea_id", ideaId)
      .single();

    if (!checkError && existingAnalysis) {
      console.log("Analysis already exists for idea:", ideaId);
      return new Response(
        JSON.stringify({ 
          message: "Analysis already exists", 
          analysis: existingAnalysis 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the idea details
    console.log("Fetching idea details");
    const { data: ideaData, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .single();

    if (ideaError || !ideaData) {
      console.error("Error fetching idea data:", ideaError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch idea data", details: ideaError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch existing analysis for enrichment
    console.log("Fetching existing basic analysis");
    const { data: basicAnalysisData, error: analysisError } = await supabase
      .from("idea_analyses")
      .select("*")
      .eq("idea_id", ideaId)
      .single();
    
    console.log("Basic analysis data:", basicAnalysisData);
    console.log("Idea data:", ideaData);

    // Generate advanced analysis data based on idea and basic analysis
    const advancedAnalysis = {
      businessName: {
        name: ideaData.title || "TechFlow",
        slogan: "Inovação que transforma o mercado",
        justification: "O nome representa a essência da sua ideia e comunica claramente o valor principal do seu produto/serviço."
      },
      logoUrl: "https://placehold.co/400x400/3b82f6/FFFFFF/png?text=Logo",
      summary: {
        description: ideaData.description || "Descrição não fornecida.",
        score: basicAnalysisData?.score || 85,
        status: basicAnalysisData?.status || "Viable"
      },
      differentials: [
        "Solução inovadora para o mercado", 
        "Alto potencial de escalabilidade", 
        "Baixo custo de aquisição de clientes", 
        "Tecnologia proprietária",
        "Experiência personalizada para cada usuário"
      ],
      pitch: `${ideaData.title || "Sua ideia"} é uma solução inovadora que ${ideaData.problem ? "resolve o problema de " + ideaData.problem : "atende às necessidades do mercado atual"}, focando em ${ideaData.audience || "um público amplo"}. Nossa proposta única combina tecnologia avançada com atendimento personalizado para criar uma experiência superior para os usuários.`,
      marketAnalysis: {
        size: basicAnalysisData?.market_analysis?.market_size || "O mercado global está avaliado em aproximadamente R$ 50 bilhões com taxa de crescimento anual de 8%. No Brasil, representa cerca de R$ 5 bilhões com potencial de crescimento acelerado nos próximos 5 anos.",
        targetAudience: ideaData.audience || basicAnalysisData?.market_analysis?.target_audience || "Adultos entre 25-45 anos com renda média-alta, tecnologicamente informados e que valorizam praticidade e qualidade.",
        trends: [
          "Crescente demanda por soluções digitais integradas",
          "Maior conscientização sobre sustentabilidade",
          "Preferência por experiências personalizadas",
          "Aumento do trabalho remoto e flexível",
          "Valorização de tecnologias que otimizam tempo"
        ],
        barriers: basicAnalysisData?.market_analysis?.barriers_to_entry || [
          "Regulamentações setoriais em evolução",
          "Necessidade de educação do mercado",
          "Grandes players estabelecidos",
          "Custos iniciais de desenvolvimento"
        ]
      },
      personas: [
        {
          name: "Marcelo, 35",
          description: "Profissional ocupado que busca soluções práticas para otimizar seu tempo. Valoriza qualidade e está disposto a pagar mais por produtos que realmente resolvam seus problemas.",
          occupation: "Gerente de Marketing",
          behavior: "Procura por soluções tecnológicas e eficientes"
        },
        {
          name: "Carla, 28",
          description: "Empreendedora iniciante que busca ferramentas para crescer seu negócio com orçamento limitado. Prioriza custo-benefício e soluções escaláveis.",
          occupation: "Pequena Empreendedora",
          behavior: "Busca soluções de baixo custo com alto retorno"
        },
        {
          name: "Roberto, 42",
          description: "Dono de empresa estabelecida que procura inovação para manter competitividade. Valoriza soluções robustas e escaláveis.",
          occupation: "CEO de Empresa de Médio Porte",
          behavior: "Prioriza qualidade, segurança e escalabilidade"
        }
      ],
      monetization: {
        models: [
          {
            name: "Assinatura Mensal",
            description: "Modelo recorrente com diferentes níveis de acesso e funcionalidades",
            revenue: "R$29 - R$99 por usuário/mês"
          },
          {
            name: "Freemium",
            description: "Versão básica gratuita com recursos premium pagos",
            revenue: "Conversão média de 5-10% dos usuários gratuitos"
          },
          {
            name: ideaData.monetization || "Licenciamento Empresarial",
            description: "Pacotes customizados para empresas com múltiplos usuários",
            revenue: "R$500 - R$5.000 por empresa/mês"
          },
          {
            name: "Comissão por Transação",
            description: "Percentual sobre valores transacionados na plataforma",
            revenue: "3-5% por transação"
          }
        ],
        projections: {
          firstYear: "R$ 250.000 - R$ 500.000",
          thirdYear: "R$ 2 milhões - R$ 5 milhões",
          breakEven: "18-24 meses",
          roi: "120% após 3 anos"
        }
      },
      channels: [
        {
          name: "Marketing de Conteúdo",
          description: "Blog, YouTube e newsletter para atrair tráfego orgânico"
        },
        {
          name: "Parcerias Estratégicas",
          description: "Colaborações com empresas complementares"
        },
        {
          name: "Marketing Digital",
          description: "Campanhas direcionadas em redes sociais e Google Ads"
        },
        {
          name: "Programa de Indicação",
          description: "Incentivos para usuários que indicam novos clientes"
        },
        {
          name: "Vendas Diretas",
          description: "Equipe comercial para grandes contas e empresas"
        }
      ],
      competitors: [
        {
          name: "Competidor Principal",
          strengths: ["Marca estabelecida", "Grande base de usuários", "Altos recursos para marketing"],
          weaknesses: ["Produto genérico", "Atendimento ao cliente deficiente", "Tecnologia desatualizada"]
        },
        {
          name: "Competidor Secundário",
          strengths: ["Preços competitivos", "Boa presença online", "Interface amigável"],
          weaknesses: ["Limitações técnicas", "Pouca personalização", "Foco em mercado de massa"]
        },
        {
          name: "Concorrente Regional",
          strengths: ["Conhecimento do mercado local", "Relacionamentos estabelecidos"],
          weaknesses: ["Escala limitada", "Tecnologia defasada", "Poucos recursos para marketing"]
        }
      ],
      swot: {
        strengths: basicAnalysisData?.swot_analysis?.strengths || [
          "Proposta de valor única e clara",
          "Solução centrada no usuário",
          "Potencial de alta retenção de clientes",
          "Baixos custos operacionais",
          "Tecnologia proprietária escalável"
        ],
        weaknesses: basicAnalysisData?.swot_analysis?.weaknesses || [
          "Marca nova no mercado",
          "Necessidade de investimento inicial substancial",
          "Dependência de desenvolvimento tecnológico",
          "Time pequeno inicialmente",
          "Falta de histórico comprovado"
        ],
        opportunities: basicAnalysisData?.swot_analysis?.opportunities || [
          "Mercado em expansão",
          "Insatisfação com soluções existentes",
          "Novas tecnologias disponíveis para integração",
          "Mudanças comportamentais favoráveis",
          "Possibilidade de expansão internacional"
        ],
        threats: basicAnalysisData?.swot_analysis?.threats || [
          "Entrada de grandes players no segmento",
          "Mudanças regulatórias potenciais",
          "Rápida evolução tecnológica",
          "Recessão econômica afetando investimentos",
          "Resistência à adoção de novas tecnologias"
        ]
      },
      risks: [
        {
          name: "Risco Tecnológico",
          level: "Médio",
          description: "Desafios no desenvolvimento da solução proposta",
          mitigation: "Desenvolvimento iterativo com validação constante e contratação de especialistas técnicos"
        },
        {
          name: "Risco de Mercado",
          level: "Baixo",
          description: "Aceitação da solução pelo público-alvo",
          mitigation: "Testes beta com early adopters e coleta contínua de feedback para ajustes"
        },
        {
          name: "Risco Financeiro",
          level: "Médio",
          description: "Capital insuficiente para escalar rapidamente",
          mitigation: "Planejamento de captação de recursos e crescimento controlado com metas claras"
        },
        {
          name: "Risco Competitivo",
          level: "Alto",
          description: "Entrada de concorrentes com recursos superiores",
          mitigation: "Desenvolvimento de vantagens competitivas sustentáveis e proteção de propriedade intelectual"
        },
        {
          name: "Risco Regulatório",
          level: "Médio",
          description: "Mudanças em regulamentações do setor",
          mitigation: "Monitoramento constante do ambiente regulatório e conformidade proativa"
        }
      ],
      tools: [
        { 
          name: "Figma", 
          category: "Design",
          description: "Para prototipagem e design de interfaces"
        },
        { 
          name: "Google Analytics", 
          category: "Análise",
          description: "Para monitoramento de métricas e comportamento dos usuários"
        },
        { 
          name: "HubSpot", 
          category: "Marketing",
          description: "Para automação de marketing e gestão de relacionamento"
        },
        { 
          name: "Stripe", 
          category: "Pagamentos",
          description: "Para processamento de pagamentos e gerenciamento de assinaturas"
        },
        { 
          name: "Trello", 
          category: "Gestão",
          description: "Para gerenciamento de tarefas e projetos"
        },
        { 
          name: "Slack", 
          category: "Comunicação",
          description: "Para comunicação interna e colaborativa"
        }
      ],
      firstSteps: [
        { name: "Validação de Mercado", icon: "📊" },
        { name: "Desenvolvimento de MVP", icon: "💻" },
        { name: "Testes com Usuários", icon: "🧪" },
        { name: "Criação de Marca", icon: "🎨" },
        { name: "Campanha de Lançamento", icon: "🚀" }
      ],
      plan: {
        thirtyDays: [
          { name: "Pesquisa de Mercado Detalhada", description: "Entrevistas com 20+ potenciais usuários e análise da concorrência" },
          { name: "Definição de MVP", description: "Especificação das funcionalidades essenciais e arquitetura" },
          { name: "Montagem do Time Inicial", description: "Recrutamento de desenvolvedores, designers e especialistas de produto" },
          { name: "Desenvolvimento de Identidade Visual", description: "Criação de logo, paleta de cores e elementos visuais da marca" }
        ],
        sixtyDays: [
          { name: "Protótipo Funcional", description: "Desenvolvimento das principais interfaces e fluxos de usuário" },
          { name: "Estrutura de Marca", description: "Definição de identidade visual, tom de voz e posicionamento" },
          { name: "Planejamento de Go-to-Market", description: "Estratégia de lançamento e canais iniciais" },
          { name: "Testes de Usabilidade", description: "Testes com grupo controlado de usuários para melhorar a experiência" }
        ],
        ninetyDays: [
          { name: "Lançamento do MVP", description: "Versão beta para grupo controlado de usuários" },
          { name: "Implementação de Métricas", description: "Sistema de analytics e acompanhamento de KPIs" },
          { name: "Captação de Feedback", description: "Processo estruturado para coletar e implementar melhorias" },
          { name: "Otimização de Funil de Aquisição", description: "Ajustes nos canais de aquisição com base em dados iniciais" }
        ]
      },
      mindmap: {
        id: "root",
        label: ideaData.title || "Sua Ideia",
        children: [
          {
            id: "market",
            label: "Mercado",
            children: [
              { 
                id: "audience", 
                label: "Público-Alvo", 
                children: ideaData.audience ? [{ id: "audSpec", label: ideaData.audience }] : [
                  { id: "audDemo", label: "Demográfico" },
                  { id: "audBeh", label: "Comportamental" }
                ] 
              },
              { 
                id: "trends", 
                label: "Tendências",
                children: [
                  { id: "trend1", label: "Digitalização" },
                  { id: "trend2", label: "Sustentabilidade" }
                ]
              },
              { 
                id: "competitors", 
                label: "Concorrência",
                children: [
                  { id: "comp1", label: "Diretos" },
                  { id: "comp2", label: "Indiretos" }
                ]
              }
            ]
          },
          {
            id: "product",
            label: "Produto",
            children: [
              { 
                id: "features", 
                label: "Funcionalidades",
                children: [
                  { id: "feat1", label: "Principais" },
                  { id: "feat2", label: "Diferenciais" }
                ]
              },
              { 
                id: "roadmap", 
                label: "Planejamento",
                children: [
                  { id: "rm1", label: "Curto Prazo" },
                  { id: "rm2", label: "Longo Prazo" }
                ]
              },
              { 
                id: "tech", 
                label: "Tecnologia",
                children: [
                  { id: "tech1", label: "Plataforma" },
                  { id: "tech2", label: "Infraestrutura" }
                ]
              }
            ]
          },
          {
            id: "business",
            label: "Negócio",
            children: [
              { 
                id: "model", 
                label: "Modelo de Receita",
                children: [
                  { id: "model1", label: "Monetização" },
                  { id: "model2", label: "Precificação" }
                ]
              },
              { 
                id: "growth", 
                label: "Estratégia de Crescimento",
                children: [
                  { id: "growth1", label: "Aquisição" },
                  { id: "growth2", label: "Retenção" }
                ]
              },
              { 
                id: "finance", 
                label: "Finanças",
                children: [
                  { id: "finance1", label: "Investimento" },
                  { id: "finance2", label: "Break-even" }
                ]
              }
            ]
          }
        ]
      }
    };

    // Save the advanced analysis to the database
    console.log("Saving advanced analysis to database");
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("advanced_analyses")
      .upsert({ 
        idea_id: ideaId,
        user_id: ideaData.user_id,
        analysis_data: advancedAnalysis 
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving advanced analysis:", saveError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis", details: saveError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Advanced analysis created successfully");
    return new Response(
      JSON.stringify({ message: "Advanced analysis created successfully", analysis: savedAnalysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in advanced-analysis function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
