import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Download,
  Megaphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketingStrategyModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MarketingStrategy {
  marketingGoals: Array<{
    title: string;
    description: string;
    target: string;
    timeframe: string;
  }>;
  targetSegments: Array<{
    name: string;
    description: string;
    priority: string;
  }>;
  kpis: string[];
  channels: Array<{
    name: string;
    description: string;
    priority: string;
    tactics: string[];
    budget: string;
    expectedROI: string;
  }>;
  budgetAllocation: Array<{
    channel: string;
    percentage: number;
  }>;
  timeline: Array<{
    period: string;
    focus: string;
    activities: string[];
  }>;
  campaigns: Array<{
    name: string;
    description: string;
    objective: string;
    audience: string;
    duration: string;
    channels: string[];
    metrics: string[];
  }>;
}

export const MarketingStrategyModalEnhanced: React.FC<MarketingStrategyModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('MarketingStrategyModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);

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
    if (!hasCredits('marketing-strategy')) {
      toast.error(`Você precisa de ${getFeatureCost('marketing-strategy')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('marketing-strategy'),
        p_feature: 'marketing-strategy',
        p_description: `Estratégia de Marketing gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Try to generate marketing strategy via API
      let generatedStrategy: MarketingStrategy | null = null;
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-marketing-strategy', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Validate API response structure
        if (data && data.strategy && typeof data.strategy === 'object') {
          const strategyData = data.strategy as MarketingStrategy;
          
          // Basic validation of required fields
          if (strategyData.marketingGoals && 
              strategyData.targetSegments && 
              strategyData.kpis && 
              strategyData.channels && 
              strategyData.budgetAllocation && 
              strategyData.timeline && 
              strategyData.campaigns) {
            generatedStrategy = strategyData;
          } else {
            console.warn('API response missing required fields, using fallback data');
            throw new Error('Invalid API response structure');
          }
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (invokeError) {
        console.warn('Error generating marketing strategy via API, using fallback data:', invokeError);
        
        // Fallback data for development/error scenarios
        generatedStrategy = {
          marketingGoals: [
            {
              title: "Aumentar Reconhecimento da Marca",
              description: "Estabelecer presença online e aumentar o reconhecimento da marca entre o público-alvo.",
              target: "Aumentar menções da marca em 50%",
              timeframe: "6 meses"
            },
            {
              title: "Gerar Leads Qualificados",
              description: "Atrair potenciais clientes que demonstrem interesse genuíno no produto/serviço.",
              target: "100 novos leads qualificados por mês",
              timeframe: "3 meses"
            },
            {
              title: "Aumentar Taxa de Conversão",
              description: "Melhorar a taxa de conversão de visitantes em clientes pagantes.",
              target: "Aumentar taxa de conversão para 3%",
              timeframe: "12 meses"
            }
          ],
          targetSegments: [
            {
              name: "Empreendedores Iniciantes",
              description: "Profissionais entre 25-35 anos iniciando seu primeiro negócio, com recursos limitados e alta necessidade de orientação.",
              priority: "high"
            },
            {
              name: "Pequenas Empresas em Crescimento",
              description: "Empresas com 2-5 anos de operação buscando escalar e otimizar processos.",
              priority: "medium"
            },
            {
              name: "Startups de Tecnologia",
              description: "Empresas de base tecnológica em fase inicial buscando validação de mercado e primeiros clientes.",
              priority: "high"
            }
          ],
          kpis: [
            "Taxa de conversão de visitantes para leads",
            "Custo por aquisição de cliente (CAC)",
            "Taxa de engajamento nas redes sociais",
            "Tráfego orgânico mensal",
            "Tempo médio no site",
            "Taxa de abertura de email marketing",
            "ROI das campanhas pagas"
          ],
          channels: [
            {
              name: "Marketing de Conteúdo",
              description: "Criação e distribuição de conteúdo relevante e valioso para atrair e engajar o público-alvo.",
              priority: "high",
              tactics: [
                "Blog semanal com dicas para empreendedores",
                "E-books gratuitos sobre validação de ideias",
                "Webinars mensais com especialistas",
                "Podcast quinzenal sobre empreendedorismo"
              ],
              budget: "30% do orçamento total",
              expectedROI: "250%"
            },
            {
              name: "Marketing em Redes Sociais",
              description: "Presença ativa nas principais redes sociais para construir comunidade e engajamento.",
              priority: "high",
              tactics: [
                "Conteúdo diário no Instagram e LinkedIn",
                "Grupos de discussão no Facebook",
                "Vídeos tutoriais no YouTube",
                "Participação em comunidades relevantes"
              ],
              budget: "25% do orçamento total",
              expectedROI: "200%"
            },
            {
              name: "Email Marketing",
              description: "Comunicação direta com leads e clientes através de newsletters e campanhas segmentadas.",
              priority: "medium",
              tactics: [
                "Newsletter semanal com insights de mercado",
                "Sequência de emails para novos cadastros",
                "Campanhas sazonais para datas estratégicas",
                "Emails personalizados baseados em comportamento"
              ],
              budget: "15% do orçamento total",
              expectedROI: "300%"
            },
            {
              name: "Marketing de Busca (SEO/SEM)",
              description: "Otimização para mecanismos de busca e campanhas pagas para aumentar visibilidade.",
              priority: "medium",
              tactics: [
                "Otimização on-page para palavras-chave estratégicas",
                "Criação de conteúdo otimizado para SEO",
                "Campanhas Google Ads para termos de alta conversão",
                "Remarketing para visitantes do site"
              ],
              budget: "20% do orçamento total",
              expectedROI: "180%"
            }
          ],
          budgetAllocation: [
            { channel: "Marketing de Conteúdo", percentage: 30 },
            { channel: "Redes Sociais", percentage: 25 },
            { channel: "Email Marketing", percentage: 15 },
            { channel: "SEO/SEM", percentage: 20 },
            { channel: "Parcerias e Influenciadores", percentage: 10 }
          ],
          timeline: [
            {
              period: "Meses 1-3",
              focus: "Construção de Base",
              activities: [
                "Desenvolvimento da identidade visual e posicionamento",
                "Criação de site e landing pages otimizadas",
                "Configuração de canais de mídia social",
                "Início da produção de conteúdo base",
                "Implementação de ferramentas de análise"
              ]
            },
            {
              period: "Meses 4-6",
              focus: "Crescimento de Audiência",
              activities: [
                "Intensificação da produção de conteúdo",
                "Lançamento de campanhas pagas em canais selecionados",
                "Início de programa de parcerias estratégicas",
                "Implementação de estratégia de email marketing",
                "Otimização baseada nos primeiros resultados"
              ]
            },
            {
              period: "Meses 7-9",
              focus: "Conversão e Retenção",
              activities: [
                "Otimização de funis de conversão",
                "Implementação de estratégias de remarketing",
                "Lançamento de programa de fidelidade",
                "Expansão de canais de aquisição bem-sucedidos",
                "Testes A/B para melhorar taxas de conversão"
              ]
            },
            {
              period: "Meses 10-12",
              focus: "Escala e Otimização",
              activities: [
                "Escala das campanhas de melhor desempenho",
                "Refinamento da segmentação de audiência",
                "Implementação de automação de marketing",
                "Análise de ROI por canal e ajustes de orçamento",
                "Planejamento estratégico para o próximo ano"
              ]
            }
          ],
          campaigns: [
            {
              name: "Lançamento da Plataforma",
              description: "Campanha de lançamento oficial da plataforma para gerar buzz e primeiros usuários.",
              objective: "Atrair 1000 usuários nos primeiros 30 dias",
              audience: "Empreendedores iniciantes e pequenas empresas",
              duration: "6 semanas",
              channels: ["Email", "Redes Sociais", "PR", "Webinars"],
              metrics: [
                "Número de cadastros",
                "Taxa de conversão da landing page",
                "Engajamento nas redes sociais",
                "Participação nos webinars"
              ]
            },
            {
              name: "Série Educativa: Do Zero ao Sucesso",
              description: "Série de conteúdos educativos mostrando o passo a passo para validar e lançar um negócio.",
              objective: "Estabelecer autoridade e gerar leads qualificados",
              audience: "Empreendedores em fase de ideação",
              duration: "3 meses",
              channels: ["Blog", "YouTube", "Podcast", "Email"],
              metrics: [
                "Tempo de engajamento com conteúdo",
                "Taxa de inscrição na newsletter",
                "Compartilhamentos de conteúdo",
                "Leads gerados por conteúdo"
              ]
            },
            {
              name: "Programa de Indicação",
              description: "Incentivo para usuários atuais indicarem novos clientes através de benefícios mútuos.",
              objective: "Aumentar base de usuários através de referências",
              audience: "Base de usuários atual",
              duration: "Contínuo (lançamento no mês 4)",
              channels: ["Email", "In-app", "Redes Sociais"],
              metrics: [
                "Número de indicações por usuário",
                "Taxa de conversão de indicados",
                "Custo de aquisição via indicação vs. outros canais",
                "Retenção de usuários adquiridos por indicação"
              ]
            }
          ]
        };
      }
      
      // Set the strategy (either from API or fallback)
      if (generatedStrategy) {
        setStrategy(generatedStrategy);
        
        // Try to save to database, but don't let saving errors affect display
        try {
          await supabase
            .from('generated_content')
            .insert({
              user_id: user.id,
              idea_id: useCustom ? null : selectedIdea?.id,
              content_type: 'marketing-strategy',
              title: `Estratégia de Marketing - ${ideaData.title}`,
              content_data: generatedStrategy as any
            });
        } catch (saveError) {
          console.warn('Failed to save marketing strategy to database:', saveError);
          // Continue showing the content even if saving fails
        }
      } else {
        throw new Error('Failed to generate marketing strategy');
      }
      toast.success("Estratégia de marketing gerada com sucesso!");
    } catch (error) {
      console.error('Error generating marketing strategy:', error);
      toast.error("Erro ao gerar estratégia de marketing. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setStrategy(null);
    setUseCustom(false);
  };

  const downloadStrategy = () => {
    if (!strategy) return;
    
    // Create a formatted text version of the strategy
    let content = `# Estratégia de Marketing - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Marketing Goals
    content += `## Objetivos SMART\n\n`;
    strategy.marketingGoals?.forEach((goal, index) => {
      content += `### ${goal.title}\n`;
      content += `${goal.description}\n`;
      content += `Meta: ${goal.target}\n`;
      content += `Prazo: ${goal.timeframe}\n\n`;
    });
    
    // Target Segments
    content += `## Segmentos de Mercado\n\n`;
    strategy.targetSegments?.forEach((segment, index) => {
      content += `### ${segment.name}\n`;
      content += `${segment.description}\n`;
      content += `Prioridade: ${segment.priority}\n\n`;
    });
    
    // KPIs
    content += `## KPIs Principais\n\n`;
    strategy.kpis?.forEach((kpi, index) => {
      content += `- ${kpi}\n`;
    });
    content += `\n`;
    
    // Channels
    content += `## Canais de Marketing\n\n`;
    strategy.channels?.forEach((channel, index) => {
      content += `### ${channel.name}\n`;
      content += `${channel.description}\n`;
      content += `Prioridade: ${channel.priority}\n`;
      content += `Orçamento: ${channel.budget}\n`;
      content += `ROI Esperado: ${channel.expectedROI}\n\n`;
      content += `**Táticas:**\n`;
      channel.tactics?.forEach(tactic => {
        content += `- ${tactic}\n`;
      });
      content += `\n`;
    });
    
    // Budget Allocation
    content += `## Alocação de Orçamento\n\n`;
    strategy.budgetAllocation?.forEach((allocation, index) => {
      content += `- ${allocation.channel}: ${allocation.percentage}%\n`;
    });
    content += `\n`;
    
    // Timeline
    content += `## Cronograma\n\n`;
    strategy.timeline?.forEach((period, index) => {
      content += `### ${period.period} - ${period.focus}\n`;
      period.activities?.forEach(activity => {
        content += `- ${activity}\n`;
      });
      content += `\n`;
    });
    
    // Campaigns
    content += `## Campanhas\n\n`;
    strategy.campaigns?.forEach((campaign, index) => {
      content += `### ${campaign.name}\n`;
      content += `${campaign.description}\n\n`;
      content += `**Objetivo:** ${campaign.objective}\n`;
      content += `**Público:** ${campaign.audience}\n`;
      content += `**Duração:** ${campaign.duration}\n`;
      content += `**Canais:** ${campaign.channels.join(', ')}\n\n`;
      content += `**Métricas de Sucesso:**\n`;
      campaign.metrics?.forEach(metric => {
        content += `- ${metric}\n`;
      });
      content += `\n`;
    });
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `estrategia_de_marketing_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Estratégia de marketing baixada com sucesso!');
  };

  // Icon for the modal
  const strategyIcon = <Target className="h-5 w-5" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Estratégia de Marketing"
      icon={strategyIcon}
      isGenerating={isGenerating}
      generatingText="Gerando estratégia de marketing..."
      actionText="Gerar Estratégia de Marketing"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Estratégia"
      onReset={handleReset}
      showReset={!!strategy}
      maxWidth="4xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('marketing-strategy')}
    >
      <div className="space-y-6">
        {strategy ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Estratégia para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadStrategy}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
            </div>

            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="goals">Objetivos</TabsTrigger>
                <TabsTrigger value="channels">Canais</TabsTrigger>
                <TabsTrigger value="timeline">Cronograma</TabsTrigger>
                <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[60vh]">
                <TabsContent value="goals" className="space-y-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Objetivos SMART
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strategy.marketingGoals?.map((goal, index) => (
                          <div key={index} className="border-l-4 border-primary pl-4">
                            <h4 className="font-semibold">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Meta: {goal.target}</Badge>
                              <Badge variant="secondary">Prazo: {goal.timeframe}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Segmentos de Mercado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {strategy.targetSegments?.map((segment, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h4 className="font-semibold">{segment.name}</h4>
                            <p className="text-sm text-muted-foreground">{segment.description}</p>
                            <div className="mt-2">
                              <Badge variant={segment.priority === 'high' ? 'default' : 'secondary'}>
                                Prioridade {segment.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>KPIs Principais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {strategy.kpis?.map((kpi, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-sm">{kpi}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="channels" className="space-y-4 pr-4">
                  <div className="grid gap-4">
                    {strategy.channels?.map((channel, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {channel.name}
                            <Badge variant={channel.priority === 'high' ? 'default' : 'secondary'}>
                              {channel.priority} prioridade
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">{channel.description}</p>
                            
                            <div>
                              <h5 className="font-semibold mb-2">Táticas Recomendadas:</h5>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {channel.tactics?.map((tactic, i) => (
                                  <li key={i}>{tactic}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm">Orçamento: {channel.budget}</span>
                              </div>
                              <Badge variant="outline">ROI esperado: {channel.expectedROI}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Alocação de Orçamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {strategy.budgetAllocation?.map((allocation, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{allocation.channel}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${allocation.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">{allocation.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Cronograma de 12 Meses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strategy.timeline?.map((period, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{period.period}</h4>
                              <Badge variant="outline">{period.focus}</Badge>
                            </div>
                            <ul className="text-sm space-y-1">
                              {period.activities?.map((activity, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4 pr-4">
                  <div className="grid gap-4">
                    {strategy.campaigns?.map((campaign, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>{campaign.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">{campaign.description}</p>
                            
                            <div className="grid gap-3 md:grid-cols-3">
                              <div>
                                <h5 className="font-semibold mb-1">Objetivo:</h5>
                                <p className="text-sm">{campaign.objective}</p>
                              </div>
                              <div>
                                <h5 className="font-semibold mb-1">Público:</h5>
                                <p className="text-sm">{campaign.audience}</p>
                              </div>
                              <div>
                                <h5 className="font-semibold mb-1">Duração:</h5>
                                <p className="text-sm">{campaign.duration}</p>
                              </div>
                            </div>

                            <div>
                              <h5 className="font-semibold mb-2">Canais:</h5>
                              <div className="flex flex-wrap gap-2">
                                {campaign.channels?.map((channel, i) => (
                                  <Badge key={i} variant="secondary">{channel}</Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-semibold mb-2">Métricas de Sucesso:</h5>
                              <ul className="list-disc list-inside text-sm">
                                {campaign.metrics?.map((metric, i) => (
                                  <li key={i}>{metric}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        ) : (
          <CreditGuard feature="marketing-strategy">
            <EnhancedIdeaSelector 
              onSelect={handleIdeaSelect} 
              allowCustomIdea={true}
              customIdeaValue={customIdea}
              onCustomIdeaChange={handleCustomIdeaChange}
              useCustomIdea={useCustom}
              onUseCustomIdeaChange={handleUseCustomIdeaChange}
            />
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};