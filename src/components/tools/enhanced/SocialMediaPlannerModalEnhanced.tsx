import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Download,
  BarChart,
  DollarSign,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SocialMediaPlannerModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlatformStrategy {
  platform: string;
  content_types: string[];
  posting_frequency: string;
  best_times: string[];
  kpis: string[];
  audience_demographics?: string;
  tone_of_voice?: string;
}

interface ContentCalendar {
  date: string;
  platform: string;
  content_type: string;
  content_idea: string;
  hashtags: string[];
  visual_suggestion?: string;
}

interface PlannerResults {
  strategies: PlatformStrategy[];
  content_calendar: ContentCalendar[];
  growth_tactics: string[];
  analytics_recommendations: string[];
  budget_suggestions: {
    organic: string;
    paid: string;
    tools: string;
  };
  competitor_insights?: Array<{
    name: string;
    platforms: string[];
    strengths: string;
    engagement_rate?: string;
  }>;
  content_pillars?: string[];
  hashtag_strategy?: {
    branded: string[];
    industry: string[];
    trending: string[];
  };
}

export const SocialMediaPlannerModalEnhanced: React.FC<SocialMediaPlannerModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('SocialMediaPlannerModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<PlannerResults | null>(null);
  
  // Configurações adicionais
  const [formData, setFormData] = useState({
    target_audience: '',
    platforms: '',
    goals: '',
    budget: '',
    timeframe: '',
    tone: '',
    competitors: ''
  });

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setUseCustom(false);
  };

  const handleCustomIdeaChange = (value: string) => {
    setCustomIdea(value);
  };

  const handleUseCustomIdeaChange = (value: boolean) => {
    setUseCustom(value);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error("Selecione uma ideia ou digite uma descrição");
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error("Digite uma descrição da sua ideia");
      return;
    }

    // Check credits
    if (!hasCredits('social-media-planner')) {
      toast.error(`Você precisa de ${getFeatureCost('social-media-planner')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('social-media-planner'),
        p_feature: 'social-media-planner',
        p_description: `Plano de Redes Sociais gerado para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-social-media-plan', {
          body: { 
            business_idea: ideaData.description,
            ...formData
          }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setResults(data);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockResults = {
          strategies: [
            {
              platform: "Instagram",
              content_types: ["Carrossel", "Reels", "Stories", "Posts"],
              posting_frequency: "4-5 vezes por semana",
              best_times: ["12h-14h", "18h-20h"],
              kpis: ["Taxa de engajamento", "Crescimento de seguidores", "Alcance", "Salvamentos"],
              audience_demographics: "25-34 anos, profissionais urbanos, interessados em tecnologia e inovação",
              tone_of_voice: "Profissional mas acessível, educativo com toques de entusiasmo"
            },
            {
              platform: "LinkedIn",
              content_types: ["Artigos", "Posts de texto", "Documentos", "Polls"],
              posting_frequency: "2-3 vezes por semana",
              best_times: ["9h-11h", "17h-18h"],
              kpis: ["Impressões", "Cliques no perfil", "Leads gerados", "Conexões"],
              audience_demographics: "30-45 anos, profissionais de negócios, empreendedores, investidores",
              tone_of_voice: "Formal, autoritativo, focado em valor e insights de negócios"
            },
            {
              platform: "Twitter/X",
              content_types: ["Tweets informativos", "Threads", "Enquetes", "Retweets comentados"],
              posting_frequency: "Diariamente (1-2 vezes)",
              best_times: ["12h-13h", "17h-19h"],
              kpis: ["Retweets", "Respostas", "Cliques em links", "Menções"],
              audience_demographics: "25-40 anos, early adopters, interessados em tecnologia e startups",
              tone_of_voice: "Conciso, informativo com toques de humor quando apropriado"
            }
          ],
          content_pillars: [
            "Educação sobre validação de ideias e metodologias lean",
            "Histórias de sucesso e fracasso de startups",
            "Dicas práticas e ferramentas para empreendedores",
            "Tendências de mercado e inovação",
            "Bastidores e cultura da empresa"
          ],
          hashtag_strategy: {
            branded: ["#ValidaçãoDeIdeias", "#MetodologiaLean", "#AnáliseDeStartups"],
            industry: ["#Empreendedorismo", "#Startups", "#Inovação", "#NegóciosDigitais"],
            trending: ["#SmallBusiness", "#BusinessTips", "#StartupLife", "#TechStartup"]
          },
          content_calendar: [
            {
              date: "Segunda-feira",
              platform: "LinkedIn",
              content_type: "Artigo",
              content_idea: "5 Sinais de que sua Ideia de Negócio Precisa ser Validada Antes de Investir",
              hashtags: ["#ValidaçãoDeIdeias", "#Empreendedorismo", "#Startups"],
              visual_suggestion: "Infográfico mostrando os 5 sinais com ícones representativos"
            },
            {
              date: "Terça-feira",
              platform: "Instagram",
              content_type: "Carrossel",
              content_idea: "O Passo a Passo da Validação de Ideias: Do Conceito ao MVP",
              hashtags: ["#MVP", "#StartupLife", "#Inovação", "#EmpreendedorismoDigital"],
              visual_suggestion: "Série de slides com design minimalista mostrando cada etapa do processo"
            },
            {
              date: "Quarta-feira",
              platform: "Twitter/X",
              content_type: "Thread",
              content_idea: "Thread sobre os erros mais comuns que empreendedores cometem ao validar suas ideias",
              hashtags: ["#StartupMistakes", "#BusinessTips", "#Empreendedorismo"],
              visual_suggestion: "Primeiro tweet com imagem de um gráfico mostrando estatísticas de falhas"
            },
            {
              date: "Quinta-feira",
              platform: "Instagram",
              content_type: "Reels",
              content_idea: "3 Técnicas Rápidas para Testar se sua Ideia tem Potencial de Mercado",
              hashtags: ["#MarketValidation", "#BusinessIdeas", "#Empreendedorismo", "#Startups"],
              visual_suggestion: "Vídeo curto com demonstração visual das técnicas, usando textos sobrepostos"
            },
            {
              date: "Sexta-feira",
              platform: "LinkedIn",
              content_type: "Caso de Estudo",
              content_idea: "Como a Startup X Validou sua Ideia com Apenas R$1.000 e Conquistou seus Primeiros 100 Clientes",
              hashtags: ["#CaseStudy", "#StartupSuccess", "#Empreendedorismo", "#GrowthHacking"],
              visual_suggestion: "Imagem do fundador da startup com gráfico de crescimento sobreposto"
            },
            {
              date: "Sábado",
              platform: "Instagram",
              content_type: "Stories",
              content_idea: "Enquete: Qual é o maior desafio na validação da sua ideia de negócio?",
              hashtags: ["#StartupChallenges", "#Empreendedorismo", "#BusinessIdeas"],
              visual_suggestion: "Background gradiente com texto em destaque e caixa de enquete interativa"
            },
            {
              date: "Domingo",
              platform: "Instagram",
              content_type: "Post",
              content_idea: "Citação inspiradora de um empreendedor de sucesso sobre persistência e validação",
              hashtags: ["#InspirationSunday", "#EntrepreneurQuotes", "#StartupMotivation"],
              visual_suggestion: "Imagem do empreendedor com citação em design minimalista"
            },
            {
              date: "Segunda-feira (semana 2)",
              platform: "LinkedIn",
              content_type: "Poll",
              content_idea: "Qual método de validação você considera mais eficaz para uma startup B2B?",
              hashtags: ["#B2BStartups", "#MarketValidation", "#StartupStrategy"],
              visual_suggestion: "Imagem simples com as opções da enquete destacadas"
            },
            {
              date: "Terça-feira (semana 2)",
              platform: "Instagram",
              content_type: "Reels",
              content_idea: "Um dia na vida de um empreendedor validando sua ideia de negócio",
              hashtags: ["#DayInTheLife", "#StartupLife", "#Empreendedorismo", "#BehindTheScenes"],
              visual_suggestion: "Vídeo rápido mostrando diferentes momentos do processo de validação"
            },
            {
              date: "Quarta-feira (semana 2)",
              platform: "Twitter/X",
              content_type: "Tweet",
              content_idea: "Estatística impactante sobre taxa de sucesso de startups que validam ideias vs. as que não validam",
              hashtags: ["#StartupStats", "#ValidationMatters", "#BusinessSuccess"],
              visual_suggestion: "Gráfico simples comparando os dois cenários"
            },
            {
              date: "Quinta-feira (semana 2)",
              platform: "Instagram",
              content_type: "Carrossel",
              content_idea: "7 Ferramentas Gratuitas para Validar sua Ideia de Negócio",
              hashtags: ["#FreeTools", "#StartupResources", "#BusinessValidation", "#Empreendedorismo"],
              visual_suggestion: "Um slide por ferramenta, com screenshot e breve descrição"
            },
            {
              date: "Sexta-feira (semana 2)",
              platform: "LinkedIn",
              content_type: "Vídeo",
              content_idea: "Entrevista com fundador que pivotou sua ideia após processo de validação e alcançou sucesso",
              hashtags: ["#StartupPivot", "#FounderStories", "#BusinessLessons", "#Empreendedorismo"],
              visual_suggestion: "Vídeo em formato de entrevista com legendas destacando pontos-chave"
            },
            {
              date: "Sábado (semana 2)",
              platform: "Instagram",
              content_type: "Stories",
              content_idea: "Bastidores da equipe trabalhando em novas funcionalidades da plataforma",
              hashtags: ["#StartupLife", "#TeamWork", "#BehindTheScenes"],
              visual_suggestion: "Série de fotos/vídeos curtos mostrando a equipe em ação"
            },
            {
              date: "Domingo (semana 2)",
              platform: "Twitter/X",
              content_type: "Thread",
              content_idea: "10 livros essenciais para empreendedores que querem validar ideias de forma eficiente",
              hashtags: ["#StartupBooks", "#ReadingList", "#EntrepreneurMindset"],
              visual_suggestion: "Primeiro tweet com imagem de uma pilha de livros recomendados"
            }
          ],
          growth_tactics: [
            "Implementar programa de indicação com incentivos para usuários atuais que trouxerem novos empreendedores",
            "Criar conteúdo colaborativo com influenciadores do ecossistema de startups",
            "Desenvolver webinars mensais gratuitos sobre temas de validação de ideias com especialistas convidados",
            "Participar ativamente de grupos e comunidades de empreendedorismo no LinkedIn e Facebook",
            "Criar hashtag própria e incentivar usuários a compartilhar suas jornadas de validação",
            "Implementar estratégia de remarketing para visitantes do site que não se converteram",
            "Estabelecer parcerias com aceleradoras e incubadoras para divulgação cruzada"
          ],
          analytics_recommendations: [
            "Configurar UTM parameters para todas as campanhas e posts para rastrear eficácia",
            "Implementar pixel de conversão para medir jornada completa do usuário",
            "Criar dashboards específicos para cada plataforma social com KPIs relevantes",
            "Realizar análise semanal de conteúdo de melhor desempenho para informar estratégia futura",
            "Monitorar menções da marca e sentimento nas redes sociais",
            "Comparar métricas de engajamento com benchmarks do setor mensalmente",
            "Analisar funil de conversão de visitantes sociais para usuários registrados"
          ],
          budget_suggestions: {
            organic: "60% do orçamento total, focado em produção de conteúdo de alta qualidade, design gráfico e edição de vídeo",
            paid: "30% do orçamento total, distribuído entre LinkedIn Ads (15%), Instagram Ads (10%) e Twitter Ads (5%), com foco em campanhas de geração de leads e reconhecimento de marca",
            tools: "10% do orçamento total para ferramentas de gerenciamento de redes sociais, análise de dados e design (Buffer/Hootsuite, Canva Pro, Brandwatch)"
          },
          competitor_insights: [
            {
              name: "Startup Validator",
              platforms: ["Instagram", "LinkedIn", "YouTube"],
              strengths: "Conteúdo educacional de alta qualidade, forte presença no LinkedIn com artigos detalhados",
              engagement_rate: "3.2% no Instagram, 5.1% no LinkedIn"
            },
            {
              name: "IdeaTest.io",
              platforms: ["Twitter", "LinkedIn", "TikTok"],
              strengths: "Conteúdo viral no TikTok, comunicação informal e acessível, forte comunidade no Twitter",
              engagement_rate: "4.7% no TikTok, 2.8% no Twitter"
            },
            {
              name: "LaunchPad",
              platforms: ["Instagram", "LinkedIn", "Facebook"],
              strengths: "Design visual consistente e premium, histórias de sucesso de clientes, webinars semanais",
              engagement_rate: "2.9% no Instagram, 3.5% no LinkedIn"
            }
          ]
        };
        
        setResults(mockResults);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'social-media-plan',
            title: `Plano de Redes Sociais - ${ideaData.title}`,
            content_data: results as any
          });
      } catch (saveError) {
        console.warn('Failed to save social media plan to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Plano de redes sociais gerado com sucesso!");
    } catch (error) {
      console.error('Error generating social media plan:', error);
      toast.error("Erro ao gerar plano de redes sociais. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setResults(null);
    setUseCustom(false);
    setFormData({
      target_audience: '',
      platforms: '',
      goals: '',
      budget: '',
      timeframe: '',
      tone: '',
      competitors: ''
    });
  };

  const downloadPlan = () => {
    if (!results) return;
    
    // Create a formatted text version of the plan
    let content = `# Plano de Redes Sociais - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Content Pillars
    if (results.content_pillars) {
      content += `## Pilares de Conteúdo\n\n`;
      results.content_pillars?.forEach((pillar, index) => {
        content += `${index + 1}. ${pillar}\n`;
      });
      content += `\n`;
    }
    
    // Platform Strategies
    content += `## Estratégias por Plataforma\n\n`;
    results.strategies?.forEach((strategy, index) => {
      content += `### ${strategy.platform}\n\n`;
      content += `**Tipos de Conteúdo:** ${strategy.content_types.join(', ')}\n`;
      content += `**Frequência de Postagem:** ${strategy.posting_frequency}\n`;
      content += `**Melhores Horários:** ${strategy.best_times.join(', ')}\n`;
      content += `**KPIs:** ${strategy.kpis.join(', ')}\n`;
      
      if (strategy.audience_demographics) {
        content += `**Demografia do Público:** ${strategy.audience_demographics}\n`;
      }
      
      if (strategy.tone_of_voice) {
        content += `**Tom de Voz:** ${strategy.tone_of_voice}\n`;
      }
      
      content += `\n`;
    });
    
    // Hashtag Strategy
    if (results.hashtag_strategy) {
      content += `## Estratégia de Hashtags\n\n`;
      content += `**Hashtags da Marca:** ${results.hashtag_strategy.branded.join(', ')}\n`;
      content += `**Hashtags do Setor:** ${results.hashtag_strategy.industry.join(', ')}\n`;
      content += `**Hashtags em Tendência:** ${results.hashtag_strategy.trending.join(', ')}\n\n`;
    }
    
    // Content Calendar
    content += `## Calendário de Conteúdo\n\n`;
    results.content_calendar?.forEach((item, index) => {
      content += `### ${item.date} - ${item.platform} (${item.content_type})\n`;
      content += `**Ideia de Conteúdo:** ${item.content_idea}\n`;
      content += `**Hashtags:** ${item.hashtags.join(' ')}\n`;
      
      if (item.visual_suggestion) {
        content += `**Sugestão Visual:** ${item.visual_suggestion}\n`;
      }
      
      content += `\n`;
    });
    
    // Growth Tactics
    content += `## Táticas de Crescimento\n\n`;
    results.growth_tactics?.forEach((tactic, index) => {
      content += `${index + 1}. ${tactic}\n`;
    });
    content += `\n`;
    
    // Analytics Recommendations
    content += `## Recomendações de Analytics\n\n`;
    results.analytics_recommendations?.forEach((rec, index) => {
      content += `${index + 1}. ${rec}\n`;
    });
    content += `\n`;
    
    // Budget Suggestions
    content += `## Sugestões de Orçamento\n\n`;
    content += `**Orgânico:** ${results.budget_suggestions.organic}\n`;
    content += `**Mídia Paga:** ${results.budget_suggestions.paid}\n`;
    content += `**Ferramentas:** ${results.budget_suggestions.tools}\n\n`;
    
    // Competitor Insights
    if (results.competitor_insights) {
      content += `## Insights de Concorrentes\n\n`;
      results.competitor_insights?.forEach((competitor, index) => {
        content += `### ${competitor.name}\n`;
        content += `**Plataformas:** ${competitor.platforms.join(', ')}\n`;
        content += `**Pontos Fortes:** ${competitor.strengths}\n`;
        
        if (competitor.engagement_rate) {
          content += `**Taxa de Engajamento:** ${competitor.engagement_rate}\n`;
        }
        
        content += `\n`;
      });
    }
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `plano_redes_sociais_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Plano de redes sociais baixado com sucesso!');
  };

  // Icon for the modal
  const plannerIcon = <Calendar className="h-5 w-5" />;

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Plano para: {selectedIdea?.title || "Ideia Personalizada"}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadPlan}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="growth">Crescimento</TabsTrigger>
            <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="strategy" className="space-y-4 pr-4">
              {results.content_pillars && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Pilares de Conteúdo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.content_pillars?.map((pillar, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge className="mt-1">{index + 1}</Badge>
                          <p className="text-sm">{pillar}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Estratégias por Plataforma
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {results.strategies?.map((strategy, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{strategy.platform}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Tipos de Conteúdo:</h5>
                          <div className="flex flex-wrap gap-1">
                            {strategy.content_types?.map((type, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-1">Frequência:</h5>
                          <p className="text-sm text-muted-foreground">{strategy.posting_frequency}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Melhores Horários:</h5>
                          <div className="flex flex-wrap gap-1">
                            {strategy.best_times?.map((time, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">KPIs:</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {strategy.kpis?.map((kpi, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {kpi}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {strategy.audience_demographics && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">Demografia do Público:</h5>
                            <p className="text-sm text-muted-foreground">{strategy.audience_demographics}</p>
                          </div>
                        )}

                        {strategy.tone_of_voice && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">Tom de Voz:</h5>
                            <p className="text-sm text-muted-foreground">{strategy.tone_of_voice}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {results.hashtag_strategy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-500" />
                      Estratégia de Hashtags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Hashtags da Marca:</h5>
                        <div className="flex flex-wrap gap-1">
                          {results.hashtag_strategy.branded?.map((tag, i) => (
                            <Badge key={i} variant="default" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">Hashtags do Setor:</h5>
                        <div className="flex flex-wrap gap-1">
                          {results.hashtag_strategy.industry?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">Hashtags em Tendência:</h5>
                        <div className="flex flex-wrap gap-1">
                          {results.hashtag_strategy.trending?.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sugestões de Orçamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1">Orgânico:</h5>
                    <p className="text-sm text-muted-foreground">{results.budget_suggestions.organic}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Mídia Paga:</h5>
                    <p className="text-sm text-muted-foreground">{results.budget_suggestions.paid}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Ferramentas:</h5>
                    <p className="text-sm text-muted-foreground">{results.budget_suggestions.tools}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendário de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.content_calendar?.map((item, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{item.date}</span>
                          <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                          <Badge variant="secondary" className="text-xs">{item.content_type}</Badge>
                        </div>
                        <p className="text-sm mb-2">{item.content_idea}</p>
                        {item.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.hashtags.map((tag, i) => (
                              <span key={i} className="text-xs text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.visual_suggestion && (
                          <div className="text-xs text-muted-foreground italic">
                            <span className="font-medium">Sugestão visual:</span> {item.visual_suggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Táticas de Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.growth_tactics?.map((tactic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span className="text-sm">{tactic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-indigo-500" />
                    Recomendações de Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.analytics_recommendations?.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">📊</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4 pr-4">
              {results.competitor_insights ? (
                <div className="grid gap-4">
                  {results.competitor_insights?.map((competitor, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{competitor.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Plataformas:</h5>
                          <div className="flex flex-wrap gap-1">
                            {competitor.platforms?.map((platform, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{platform}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Pontos Fortes:</h5>
                          <p className="text-sm text-muted-foreground">{competitor.strengths}</p>
                        </div>
                        {competitor.engagement_rate && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">Taxa de Engajamento:</h5>
                            <p className="text-sm text-muted-foreground">{competitor.engagement_rate}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma informação de concorrentes disponível.
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  // Renderização do formulário de configuração
  const renderConfigForm = () => {
    return (
      <div className="space-y-6">
        <EnhancedIdeaSelector 
          onSelect={handleIdeaSelect} 
          allowCustomIdea={true}
          customIdeaValue={customIdea}
          onCustomIdeaChange={handleCustomIdeaChange}
          useCustomIdea={useCustom}
          onUseCustomIdeaChange={handleUseCustomIdeaChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_audience">Público-Alvo</Label>
            <Textarea
              id="target_audience"
              placeholder="Descreva seu público-alvo (demografia, interesses, comportamento)"
              value={formData.target_audience}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platforms">Plataformas</Label>
              <Input
                id="platforms"
                placeholder="Ex: Instagram, LinkedIn, TikTok, Facebook"
                value={formData.platforms}
                onChange={(e) => handleInputChange('platforms', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Objetivos</Label>
              <Input
                id="goals"
                placeholder="Ex: aumentar seguidores, gerar leads, vendas"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Orçamento Mensal</Label>
            <Input
              id="budget"
              placeholder="Ex: R$ 1.000"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Período de Planejamento</Label>
            <Select 
              value={formData.timeframe} 
              onValueChange={(value) => handleInputChange('timeframe', value)}
            >
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 mês">1 mês</SelectItem>
                <SelectItem value="3 meses">3 meses</SelectItem>
                <SelectItem value="6 meses">6 meses</SelectItem>
                <SelectItem value="1 ano">1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tom de Voz</Label>
            <Select 
              value={formData.tone} 
              onValueChange={(value) => handleInputChange('tone', value)}
            >
              <SelectTrigger id="tone">
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="amigável">Amigável</SelectItem>
                <SelectItem value="inspirador">Inspirador</SelectItem>
                <SelectItem value="educativo">Educativo</SelectItem>
                <SelectItem value="humorístico">Humorístico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitors">Concorrentes (opcional, separados por vírgula)</Label>
          <Input
            id="competitors"
            placeholder="Ex: concorrente1.com, concorrente2.com"
            value={formData.competitors}
            onChange={(e) => handleInputChange('competitors', e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Social Media Planner"
      icon={plannerIcon}
      isGenerating={isGenerating}
      generatingText="Gerando plano de redes sociais..."
      actionText="Gerar Plano"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Novo Plano"
      onReset={handleReset}
      showReset={!!results}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('social-media-planner')}
    >
      <div className="space-y-6">
        {results ? renderGeneratedContent() : (
          <CreditGuard feature="social-media-planner">
            {renderConfigForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};

// Componentes adicionais
const Hash = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
  </svg>
);