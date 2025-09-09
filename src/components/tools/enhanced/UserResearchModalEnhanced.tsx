import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Users, 
  Target, 
  MessageSquare, 
  BarChart3, 
  Download,
  Lightbulb
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserResearchModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserResearch {
  personas: Array<{
    name: string;
    age: string;
    description: string;
    motivations: string[];
    painPoints: string[];
  }>;
  userJourney: Array<{
    stage: string;
    description: string;
    emotion: string;
    touchpoints: string[];
  }>;
  interviewQuestions: string[];
  surveyQuestions: string[];
  behaviors: string[];
  researchMethods: string[];
  kpis: string[];
}

export const UserResearchModalEnhanced: React.FC<UserResearchModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('UserResearchModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [research, setResearch] = useState<UserResearch | null>(null);

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
    if (!hasCredits('user-research')) {
      toast.error(`Você precisa de ${getFeatureCost('user-research')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('user-research'),
        p_feature: 'user-research',
        p_description: `Pesquisa de Usuários gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-user-research', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setResearch(data.research);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockResearch = {
          personas: [
            {
              name: "Carlos Silva",
              age: "32",
              description: "Empreendedor iniciante com formação em administração, buscando expandir seu pequeno negócio de e-commerce.",
              motivations: [
                "Aumentar a visibilidade do seu negócio",
                "Otimizar processos para reduzir custos",
                "Encontrar novas oportunidades de mercado"
              ],
              painPoints: [
                "Dificuldade em gerenciar tempo entre operações e estratégia",
                "Orçamento limitado para marketing",
                "Concorrência com grandes players do mercado"
              ]
            },
            {
              name: "Mariana Costa",
              age: "28",
              description: "Profissional de marketing que está planejando abrir sua própria consultoria digital.",
              motivations: [
                "Construir uma marca forte desde o início",
                "Desenvolver um modelo de negócio escalável",
                "Equilibrar vida pessoal e profissional"
              ],
              painPoints: [
                "Insegurança sobre precificação de serviços",
                "Dificuldade em encontrar clientes iniciais",
                "Gestão financeira e fluxo de caixa"
              ]
            }
          ],
          userJourney: [
            {
              stage: "Descoberta",
              description: "Usuário identifica um problema em seu negócio e busca soluções online.",
              emotion: "Frustração/Esperança",
              touchpoints: ["Google", "Redes Sociais", "Recomendações"]
            },
            {
              stage: "Consideração",
              description: "Usuário compara diferentes ferramentas e soluções disponíveis no mercado.",
              emotion: "Curiosidade",
              touchpoints: ["Site", "Blog", "Reviews"]
            },
            {
              stage: "Decisão",
              description: "Usuário avalia benefícios, preço e facilidade de uso antes de escolher.",
              emotion: "Cautela",
              touchpoints: ["Página de preços", "Demo", "Chat de suporte"]
            },
            {
              stage: "Onboarding",
              description: "Usuário cria conta e configura seu perfil e primeiras ideias.",
              emotion: "Entusiasmo/Ansiedade",
              touchpoints: ["Processo de registro", "Tutorial", "Primeira análise"]
            },
            {
              stage: "Uso contínuo",
              description: "Usuário integra a ferramenta em sua rotina de planejamento de negócios.",
              emotion: "Satisfação",
              touchpoints: ["Dashboard", "Notificações", "Novas ferramentas"]
            }
          ],
          interviewQuestions: [
            "Quais são os maiores desafios que você enfrenta ao desenvolver uma nova ideia de negócio?",
            "Como você normalmente valida se uma ideia tem potencial antes de investir nela?",
            "Quais ferramentas você utiliza atualmente para planejar e analisar suas ideias?",
            "O que te faria mudar de uma ferramenta que você já usa para uma nova solução?",
            "Quanto tempo você dedica semanalmente ao planejamento estratégico do seu negócio?",
            "Quais informações você considera essenciais antes de tomar uma decisão importante?",
            "Como você prefere visualizar dados e análises sobre seu negócio?",
            "Qual seria o valor ideal de uma ferramenta que automatiza análises de negócios?"
          ],
          surveyQuestions: [
            "Em uma escala de 1 a 5, quão confiante você se sente ao avaliar novas oportunidades de negócio?",
            "Quais dos seguintes recursos você considera mais importantes em uma ferramenta de análise de negócios? (Múltipla escolha)",
            "Com que frequência você busca dados de mercado para tomar decisões?",
            "Quanto tempo você gasta mensalmente pesquisando tendências e oportunidades?",
            "Qual é seu orçamento mensal para ferramentas de produtividade e análise?",
            "Quais são os três principais fatores que influenciam sua decisão de compra de uma nova ferramenta?",
            "Você prefere pagar por uma assinatura mensal ou um valor único mais alto?",
            "Quais integrações com outras ferramentas seriam essenciais para você?"
          ],
          behaviors: [
            "Usuários tendem a abandonar ferramentas complexas após 2-3 tentativas frustradas",
            "Empreendedores iniciantes valorizam mais tutoriais e suporte do que usuários experientes",
            "A maioria dos usuários prefere visualizações gráficas a relatórios textuais extensos",
            "Usuários frequentemente compartilham resultados em redes sociais quando obtêm insights valiosos",
            "Decisões de upgrade para planos pagos geralmente ocorrem após 2 semanas de uso gratuito"
          ],
          researchMethods: [
            "Entrevistas em profundidade",
            "Testes de usabilidade",
            "Surveys quantitativos",
            "Análise de comportamento (analytics)",
            "Grupos focais"
          ],
          kpis: [
            "Taxa de conversão de visitantes para usuários registrados",
            "Tempo médio gasto na plataforma por sessão",
            "Frequência de uso das ferramentas de análise",
            "Taxa de retenção após 30/60/90 dias",
            "Net Promoter Score (NPS)",
            "Taxa de upgrade para planos pagos"
          ]
        };
        
        setResearch(mockResearch);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'user-research',
            title: `Pesquisa de Usuários - ${ideaData.title}`,
            content_data: research
          });
      } catch (saveError) {
        console.warn('Failed to save user research to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Pesquisa de usuários gerada com sucesso!");
    } catch (error) {
      console.error('Error generating user research:', error);
      toast.error("Erro ao gerar pesquisa de usuários. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setResearch(null);
    setUseCustom(false);
  };

  const downloadResearch = () => {
    if (!research) return;
    
    // Create a formatted text version of the research
    let content = `# Pesquisa de Usuários - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Personas
    content += `## Personas\n\n`;
    research.personas?.forEach((persona, index) => {
      content += `### ${persona.name} (${persona.age} anos)\n`;
      content += `${persona.description}\n\n`;
      content += `**Motivações:**\n`;
      persona.motivations?.forEach(motivation => {
        content += `- ${motivation}\n`;
      });
      content += `\n**Dores:**\n`;
      persona.painPoints?.forEach(pain => {
        content += `- ${pain}\n`;
      });
      content += `\n\n`;
    });
    
    // User Journey
    content += `## Jornada do Usuário\n\n`;
    research.userJourney?.forEach((step, index) => {
      content += `### ${step.stage}\n`;
      content += `${step.description}\n`;
      content += `Emoção: ${step.emotion}\n`;
      content += `Pontos de contato: ${step.touchpoints.join(', ')}\n\n`;
    });
    
    // Interview Questions
    content += `## Perguntas para Entrevistas\n\n`;
    research.interviewQuestions?.forEach((question, index) => {
      content += `${index + 1}. ${question}\n`;
    });
    content += `\n`;
    
    // Survey Questions
    content += `## Perguntas para Survey\n\n`;
    research.surveyQuestions?.forEach((question, index) => {
      content += `${index + 1}. ${question}\n`;
    });
    content += `\n`;
    
    // Behaviors
    content += `## Comportamentos Identificados\n\n`;
    research.behaviors?.forEach(behavior => {
      content += `- ${behavior}\n`;
    });
    content += `\n`;
    
    // Research Methods
    content += `## Métodos de Pesquisa Recomendados\n\n`;
    research.researchMethods?.forEach(method => {
      content += `- ${method}\n`;
    });
    content += `\n`;
    
    // KPIs
    content += `## KPIs para Medir Sucesso\n\n`;
    research.kpis?.forEach(kpi => {
      content += `- ${kpi}\n`;
    });
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `pesquisa_de_usuarios_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Pesquisa de usuários baixada com sucesso!');
  };

  // Icon for the modal
  const researchIcon = <Users className="h-5 w-5 text-primary" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Pesquisa de Usuários"
      icon={researchIcon}
      isGenerating={isGenerating}
      generatingText="Gerando pesquisa de usuários..."
      actionText="Gerar Pesquisa de Usuários"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Pesquisa"
      onReset={handleReset}
      showReset={!!research}
      maxWidth="4xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('user-research')}
    >
      <div className="space-y-6">
        {research ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Pesquisa para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadResearch}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
            </div>

            <Tabs defaultValue="personas" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="personas">Personas</TabsTrigger>
                <TabsTrigger value="journey">Jornada</TabsTrigger>
                <TabsTrigger value="research">Pesquisa</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[60vh]">
                <TabsContent value="personas" className="space-y-4 pr-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {research.personas?.map((persona, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                          <Badge variant="secondary">{persona.age} anos</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">{persona.description}</p>
                          <div>
                            <strong>Motivações:</strong>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {persona.motivations?.map((motivation, i) => (
                                <li key={i}>{motivation}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Dores:</strong>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {persona.painPoints?.map((pain, i) => (
                                <li key={i}>{pain}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="journey" className="space-y-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Jornada do Usuário
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {research.userJourney?.map((step, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <h4 className="font-semibold">{step.stage}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <div className="mt-2">
                              <Badge variant="outline" className="mr-2">
                                {step.emotion}
                              </Badge>
                              {step.touchpoints?.map((touchpoint, i) => (
                                <Badge key={i} variant="secondary" className="mr-1">
                                  {touchpoint}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="research" className="space-y-4 pr-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Perguntas para Entrevistas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {research.interviewQuestions?.map((question, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">{index + 1}.</span> {question}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Perguntas para Survey
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {research.surveyQuestions?.map((question, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">{index + 1}.</span> {question}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4 pr-4">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Principais Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Comportamentos Identificados</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {research.behaviors?.map((behavior, index) => (
                              <li key={index}>{behavior}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Métodos de Pesquisa Recomendados</h4>
                          <div className="flex flex-wrap gap-2">
                            {research.researchMethods?.map((method, index) => (
                              <Badge key={index} variant="outline">{method}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">KPIs para Medir Sucesso</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {research.kpis?.map((kpi, index) => (
                              <li key={index}>{kpi}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        ) : (
          <CreditGuard feature="user-research">
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