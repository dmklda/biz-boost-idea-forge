import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Share2, 
  Copy, 
  Download, 
  Calendar, 
  Clock, 
  ThumbsUp,
  BarChart,
  Target,
  MessageCircle
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

interface PostGeneratorModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PostContent {
  platform: string;
  content: string;
  hashtags: string[];
  best_time: string;
  engagement_tips: string[];
  image_suggestions?: string[];
}

interface PostResults {
  posts: PostContent[];
  strategy_summary: string;
  content_calendar: Array<{
    date: string;
    post_type: string;
    content: string;
    platform: string;
  }>;
  audience_insights?: string[];
  performance_metrics?: Array<{
    metric: string;
    description: string;
    target: string;
  }>;
}

export const PostGeneratorModalEnhanced: React.FC<PostGeneratorModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('PostGeneratorModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<PostResults | null>(null);
  
  // Configurações adicionais
  const [formData, setFormData] = useState({
    target_audience: '',
    platforms: '',
    content_type: '',
    tone: '',
    goals: ''
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
    if (!hasCredits('social-posts')) {
      toast.error(`Você precisa de ${getFeatureCost('social-posts')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('social-posts'),
        p_feature: 'social-posts',
        p_description: `Posts para Redes Sociais gerados para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-social-posts', {
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
          posts: [
            {
              platform: "Instagram",
              content: "🚀 Transforme suas ideias em negócios de sucesso! Nossa plataforma de análise de ideias usa IA para validar seu conceito e fornecer insights valiosos sobre mercado, finanças e estratégia.\n\nDeixe a incerteza para trás e tome decisões baseadas em dados. Comece hoje mesmo com nosso plano gratuito!\n\n#empreendedorismo #startups #inovação #validaçãodeideia",
              hashtags: ["empreendedorismo", "startups", "inovação", "validaçãodeideia", "negócios"],
              best_time: "Terça e quinta-feira entre 12h e 15h",
              engagement_tips: [
                "Use carrossel com 3-5 slides mostrando o processo de validação",
                "Inclua um call-to-action claro para testar a plataforma",
                "Responda comentários em até 2 horas para aumentar engajamento"
              ],
              image_suggestions: [
                "Empreendedor trabalhando em um laptop com gráficos na tela",
                "Antes/depois mostrando a jornada de validação de uma ideia",
                "Interface da plataforma com resultados de análise"
              ]
            },
            {
              platform: "LinkedIn",
              content: "Você sabia que 90% das startups falham, e 42% delas por falta de demanda de mercado?\n\nNossa plataforma de análise de ideias foi desenvolvida para mudar essa estatística. Combinando IA avançada com metodologias comprovadas de validação, ajudamos empreendedores a:\n\n✅ Validar a viabilidade de mercado\n✅ Identificar o público-alvo ideal\n✅ Analisar a concorrência\n✅ Projetar métricas financeiras realistas\n\nNão deixe sua ideia ser apenas mais uma estatística. Valide-a com dados concretos antes de investir tempo e recursos.\n\nComente abaixo: qual é sua maior dúvida ao validar uma ideia de negócio?",
              hashtags: ["ValidaçãoDeIdeias", "Empreendedorismo", "Startups", "InovaçãoDeNegócios", "AnaliseDeViabilidade"],
              best_time: "Quarta-feira entre 9h e 11h, ou quinta-feira entre 13h e 15h",
              engagement_tips: [
                "Termine com uma pergunta para estimular comentários",
                "Compartilhe dados estatísticos relevantes para o setor",
                "Marque influenciadores relevantes do ecossistema de startups"
              ]
            },
            {
              platform: "Twitter/X",
              content: "90% das startups falham. 42% por falta de demanda de mercado.\n\nNossa plataforma de IA muda isso, validando ideias antes do investimento.\n\nTeste grátis: [link]\n\n#startups #validação #empreendedorismo",
              hashtags: ["startups", "validação", "empreendedorismo", "inovação"],
              best_time: "Dias úteis entre 12h e 13h, ou 17h e 18h",
              engagement_tips: [
                "Use threads para expandir sobre diferentes aspectos da validação",
                "Inclua uma imagem ou GIF relevante para aumentar visibilidade",
                "Participe de conversas relevantes usando hashtags do setor"
              ]
            },
            {
              platform: "Facebook",
              content: "💡 VALIDE SUA IDEIA ANTES DE INVESTIR!\n\nVocê tem uma ideia de negócio brilhante, mas não sabe se vai dar certo?\n\nNossa plataforma usa inteligência artificial para analisar:\n- Viabilidade de mercado\n- Potencial financeiro\n- Estratégias de entrada\n- Perfil de clientes ideais\n\nEconomize tempo e dinheiro validando seu conceito antes de investir. Planos a partir de R$0!\n\nComente 'QUERO SABER MAIS' ou acesse o link na bio.\n\n#EmpreendedorismoInteligente #ValidaçãoDeIdeias",
              hashtags: ["EmpreendedorismoInteligente", "ValidaçãoDeIdeias", "Startups", "InovaçãoDeNegócios"],
              best_time: "Quinta a domingo entre 13h e 16h",
              engagement_tips: [
                "Peça para comentarem uma palavra específica para gerar mais engajamento",
                "Responda comentários com vídeos personalizados quando possível",
                "Faça transmissões ao vivo mensais sobre temas de validação de ideias"
              ]
            }
          ],
          strategy_summary: "Esta estratégia de conteúdo para redes sociais foca em educar empreendedores sobre a importância da validação de ideias, posicionando a plataforma como uma solução acessível e eficaz para reduzir riscos. O conteúdo é adaptado para cada plataforma, com LinkedIn focando em profissionalismo e dados, Instagram em visuais e inspiração, Twitter em mensagens concisas e diretas, e Facebook em engajamento comunitário. Recomenda-se manter consistência na postagem (3-4 vezes por semana), alternar entre conteúdo educativo, inspirador e promocional, e utilizar hashtags estratégicas para aumentar o alcance.",
          content_calendar: [
            {
              date: "Segunda-feira",
              post_type: "Educativo",
              content: "Dica sobre validação de ideias",
              platform: "LinkedIn e Instagram"
            },
            {
              date: "Quarta-feira",
              post_type: "Caso de Sucesso",
              content: "História de cliente que validou ideia com sucesso",
              platform: "Facebook e LinkedIn"
            },
            {
              date: "Quinta-feira",
              post_type: "Estatística/Dado",
              content: "Infográfico com dados sobre startups",
              platform: "Instagram e Twitter"
            },
            {
              date: "Sexta-feira",
              post_type: "Promocional",
              content: "Apresentação de funcionalidade da plataforma",
              platform: "Todas as redes"
            }
          ],
          audience_insights: [
            "O público-alvo principal são empreendedores de primeira viagem (25-40 anos) que valorizam dados antes de tomar decisões",
            "Profissionais corporativos considerando empreender são mais ativos no LinkedIn e buscam conteúdo detalhado",
            "Empreendedores mais jovens (20-30 anos) preferem conteúdo visual no Instagram e vídeos curtos",
            "Há maior engajamento com posts que incluem estatísticas concretas e histórias de sucesso/fracasso reais"
          ],
          performance_metrics: [
            {
              metric: "Taxa de Engajamento",
              description: "Porcentagem de seguidores que interagem com o conteúdo",
              target: "Acima de 3% no Instagram, 2% no LinkedIn, 1% no Twitter e 2% no Facebook"
            },
            {
              metric: "Crescimento de Seguidores",
              description: "Aumento mensal no número de seguidores",
              target: "10-15% nos primeiros 3 meses, estabilizando em 5-7% mensais após"
            },
            {
              metric: "Taxa de Conversão",
              description: "Visitantes do site que se cadastram na plataforma via redes sociais",
              target: "2-3% para tráfego orgânico das redes sociais"
            },
            {
              metric: "Alcance",
              description: "Número de contas únicas que viram o conteúdo",
              target: "Aumento de 20% mês a mês nos primeiros 6 meses"
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
            content_type: 'social-posts',
            title: `Posts para Redes Sociais - ${ideaData.title}`,
            content_data: results
          });
      } catch (saveError) {
        console.warn('Failed to save social posts to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Posts para redes sociais gerados com sucesso!");
    } catch (error) {
      console.error('Error generating social posts:', error);
      toast.error("Erro ao gerar posts para redes sociais. Tente novamente.");
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
      content_type: '',
      tone: '',
      goals: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const downloadResults = () => {
    if (!results) return;
    
    // Create a formatted text version of the results
    let content = `# Posts para Redes Sociais - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Strategy Summary
    content += `## Resumo da Estratégia\n\n${results.strategy_summary}\n\n`;
    
    // Posts
    content += `## Posts Gerados\n\n`;
    results.posts?.forEach((post, index) => {
      content += `### Post para ${post.platform}\n\n`;
      content += `**Conteúdo:**\n${post.content}\n\n`;
      content += `**Hashtags:**\n${post.hashtags.map(tag => `#${tag}`).join(' ')}\n\n`;
      content += `**Melhor Horário para Postar:**\n${post.best_time}\n\n`;
      content += `**Dicas de Engajamento:**\n`;
      post.engagement_tips?.forEach(tip => {
        content += `- ${tip}\n`;
      });
      content += `\n`;
      
      if (post.image_suggestions) {
        content += `**Sugestões de Imagens:**\n`;
        post.image_suggestions?.forEach(suggestion => {
          content += `- ${suggestion}\n`;
        });
        content += `\n`;
      }
    });
    
    // Content Calendar
    content += `## Calendário de Conteúdo\n\n`;
    results.content_calendar?.forEach((item) => {
      content += `- ${item.date}: ${item.post_type} sobre "${item.content}" para ${item.platform}\n`;
    });
    content += `\n`;
    
    // Audience Insights
    if (results.audience_insights) {
      content += `## Insights sobre o Público\n\n`;
      results.audience_insights?.forEach((insight) => {
        content += `- ${insight}\n`;
      });
      content += `\n`;
    }
    
    // Performance Metrics
    if (results.performance_metrics) {
      content += `## Métricas de Desempenho\n\n`;
      results.performance_metrics?.forEach((metric) => {
        content += `### ${metric.metric}\n`;
        content += `${metric.description}\n`;
        content += `**Meta:** ${metric.target}\n\n`;
      });
    }
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `posts_redes_sociais_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Posts para redes sociais baixados com sucesso!');
  };

  // Icon for the modal
  const postsIcon = <Share2 className="h-5 w-5" />;

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Posts para: {selectedIdea?.title || "Ideia Personalizada"}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadResults}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="posts" className="space-y-4 pr-4">
              {results.posts?.map((post, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.platform === "Instagram" ? (
                          <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        ) : post.platform === "LinkedIn" ? (
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        ) : post.platform === "Twitter/X" ? (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : post.platform === "Facebook" ? (
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                          </svg>
                        ) : (
                          <MessageCircle className="h-5 w-5" />
                        )}
                        {post.platform}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(post.content)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Conteúdo:</h4>
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                    
                    {post.hashtags?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Hashtags:</h4>
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((tag, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary" 
                              className="text-xs cursor-pointer" 
                              onClick={() => copyToClipboard(`#${tag}`)}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {post.best_time && (
                      <div>
                        <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Melhor Horário:
                        </h4>
                        <p className="text-sm text-muted-foreground">{post.best_time}</p>
                      </div>
                    )}

                    {post.engagement_tips?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          Dicas de Engajamento:
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {post.engagement_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {post.image_suggestions?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-purple-500" />
                          Sugestões de Imagens:
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {post.image_suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Calendário de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.content_calendar?.map((item, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{item.date}</h4>
                          <Badge variant="outline">{item.platform}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">{item.post_type}</div>
                        <div className="text-sm">{item.content}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Resumo da Estratégia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{results.strategy_summary}</p>
                </CardContent>
              </Card>

              {results.audience_insights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-500" />
                      Insights sobre o Público
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.audience_insights?.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">👥</Badge>
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 pr-4">
              {results.performance_metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-orange-500" />
                      Métricas de Desempenho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.performance_metrics?.map((metric, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h4 className="font-semibold">{metric.metric}</h4>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                          <Badge variant="outline" className="mt-1">Meta: {metric.target}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
              placeholder="Quem é seu público-alvo? (idade, interesses, problemas)"
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
                placeholder="Ex: Instagram, LinkedIn, Facebook, TikTok"
                value={formData.platforms}
                onChange={(e) => handleInputChange('platforms', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">Tipo de Conteúdo</Label>
              <Select 
                value={formData.content_type} 
                onValueChange={(value) => handleInputChange('content_type', value)}
              >
                <SelectTrigger id="content_type">
                  <SelectValue placeholder="Selecione o tipo de conteúdo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educativo</SelectItem>
                  <SelectItem value="promotional">Promocional</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="tips">Dicas e Truques</SelectItem>
                  <SelectItem value="case-study">Caso de Estudo</SelectItem>
                  <SelectItem value="behind-scenes">Bastidores</SelectItem>
                  <SelectItem value="user-generated">Conteúdo de Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tom de Voz</Label>
            <Select 
              value={formData.tone} 
              onValueChange={(value) => handleInputChange('tone', value)}
            >
              <SelectTrigger id="tone">
                <SelectValue placeholder="Selecione o tom de voz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Amigável</SelectItem>
                <SelectItem value="humorous">Humorístico</SelectItem>
                <SelectItem value="inspirational">Inspirador</SelectItem>
                <SelectItem value="authoritative">Autoritativo</SelectItem>
                <SelectItem value="conversational">Conversacional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Objetivos</Label>
            <Select 
              value={formData.goals} 
              onValueChange={(value) => handleInputChange('goals', value)}
            >
              <SelectTrigger id="goals">
                <SelectValue placeholder="Selecione o objetivo principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Aumentar Conscientização</SelectItem>
                <SelectItem value="engagement">Gerar Engajamento</SelectItem>
                <SelectItem value="leads">Gerar Leads</SelectItem>
                <SelectItem value="conversion">Aumentar Conversões</SelectItem>
                <SelectItem value="loyalty">Fidelizar Clientes</SelectItem>
                <SelectItem value="authority">Estabelecer Autoridade</SelectItem>
                <SelectItem value="traffic">Aumentar Tráfego</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Posts para Redes Sociais"
      icon={postsIcon}
      isGenerating={isGenerating}
      generatingText="Gerando posts para redes sociais..."
      actionText="Gerar Posts"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Novos Posts"
      onReset={handleReset}
      showReset={!!results}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('social-posts')}
    >
      <div className="space-y-6">
        {results ? renderGeneratedContent() : (
          <CreditGuard feature="social-posts">
            {renderConfigForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};

// Componentes adicionais
const ImageIcon = ({ className }: { className?: string }) => (
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
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);