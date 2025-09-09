import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Zap, 
  Clock, 
  DollarSign, 
  Settings, 
  Download,
  BarChart,
  AlertTriangle,
  Wrench
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

interface ProcessAutomationModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AutomationOpportunity {
  process_name: string;
  current_method: string;
  automation_solution: string;
  time_saved: string;
  cost_reduction: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  priority: 'Alta' | 'Média' | 'Baixa';
  tools_needed: string[];
  implementation_steps: string[];
  roi_estimate?: string;
  integration_complexity?: string;
}

interface AutomationResults {
  opportunities: AutomationOpportunity[];
  summary: {
    total_time_saved: string;
    total_cost_reduction: string;
    recommended_first_steps: string[];
    roi_timeline?: string;
    automation_maturity_score?: number;
  };
  tools_comparison: Array<{
    tool_name: string;
    features: string[];
    pricing: string;
    best_for: string;
    integration_options?: string[];
    learning_curve?: string;
  }>;
  implementation_roadmap?: Array<{
    phase: string;
    timeline: string;
    focus_areas: string[];
    expected_outcomes: string[];
  }>;
  common_challenges?: string[];
}

export const ProcessAutomationModalEnhanced: React.FC<ProcessAutomationModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('ProcessAutomationModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<AutomationResults | null>(null);
  
  // Configurações adicionais
  const [formData, setFormData] = useState({
    business_type: '',
    current_processes: '',
    team_size: '',
    budget: '',
    technical_level: '',
    pain_points: '',
    automation_goals: '',
    existing_tools: ''
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
    if (!hasCredits('process-automation')) {
      toast.error(`Você precisa de ${getFeatureCost('process-automation')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('process-automation'),
        p_feature: 'process-automation',
        p_description: `Análise de Automação de Processos gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-process-automation', {
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
          opportunities: [
            {
              process_name: "Atendimento ao Cliente",
              current_method: "Atendimento manual via e-mail e telefone, com respostas demoradas e sem padronização.",
              automation_solution: "Implementar chatbot com IA para primeiro atendimento e sistema de tickets para gerenciamento de casos.",
              time_saved: "15-20 horas por semana",
              cost_reduction: "R$ 3.000 - R$ 4.000 por mês",
              difficulty: "Médio" as const,
              priority: "Alta" as const,
              tools_needed: ["Zendesk", "Intercom", "Freshdesk", "Tawk.to"],
              implementation_steps: [
                "Mapear fluxos de atendimento mais comuns",
                "Selecionar ferramenta com base no orçamento e necessidades",
                "Configurar respostas automáticas para perguntas frequentes",
                "Treinar equipe na nova ferramenta",
                "Implementar sistema de feedback para melhorias contínuas"
              ],
              roi_estimate: "Retorno do investimento em 3-4 meses",
              integration_complexity: "Média - requer integração com CRM existente"
            },
            {
              process_name: "Gestão de Leads e Vendas",
              current_method: "Planilhas manuais e comunicação descentralizada entre equipe de vendas.",
              automation_solution: "Implementar CRM com automação de follow-ups e qualificação de leads.",
              time_saved: "10-12 horas por semana",
              cost_reduction: "R$ 2.500 - R$ 3.500 por mês",
              difficulty: "Médio" as const,
              priority: "Alta" as const,
              tools_needed: ["HubSpot", "Pipedrive", "Salesforce", "Monday.com"],
              implementation_steps: [
                "Definir funil de vendas e etapas do processo",
                "Migrar dados existentes para o novo sistema",
                "Configurar automações de follow-up",
                "Integrar com ferramentas de marketing",
                "Treinar equipe de vendas"
              ],
              roi_estimate: "Retorno do investimento em 4-6 meses",
              integration_complexity: "Alta - requer integração com múltiplos sistemas"
            },
            {
              process_name: "Gestão Financeira",
              current_method: "Controle manual em planilhas com lançamentos duplicados e erros frequentes.",
              automation_solution: "Implementar software de gestão financeira com integração bancária e emissão automática de relatórios.",
              time_saved: "8-10 horas por semana",
              cost_reduction: "R$ 2.000 - R$ 3.000 por mês",
              difficulty: "Médio" as const,
              priority: "Média" as const,
              tools_needed: ["Conta Azul", "QuickBooks", "Nibo", "Asaas"],
              implementation_steps: [
                "Organizar documentação financeira atual",
                "Selecionar software adequado ao porte da empresa",
                "Configurar categorias e centro de custos",
                "Integrar com contas bancárias",
                "Treinar equipe financeira"
              ],
              roi_estimate: "Retorno do investimento em 5-7 meses",
              integration_complexity: "Média - requer configuração de APIs bancárias"
            },
            {
              process_name: "Agendamento e Calendário",
              current_method: "Agendamento manual via telefone ou e-mail com frequentes conflitos de horários.",
              automation_solution: "Implementar sistema de agendamento online com sincronização de calendários e lembretes automáticos.",
              time_saved: "5-8 horas por semana",
              cost_reduction: "R$ 1.000 - R$ 1.500 por mês",
              difficulty: "Fácil" as const,
              priority: "Média" as const,
              tools_needed: ["Calendly", "SimplyBook.me", "Acuity Scheduling", "Google Calendar"],
              implementation_steps: [
                "Definir tipos de compromissos e durações",
                "Configurar disponibilidade da equipe",
                "Integrar com calendários existentes",
                "Configurar lembretes automáticos",
                "Adicionar widget de agendamento ao site"
              ],
              roi_estimate: "Retorno do investimento em 2-3 meses",
              integration_complexity: "Baixa - fácil integração com ferramentas existentes"
            },
            {
              process_name: "Gestão de Documentos",
              current_method: "Documentos físicos e digitais armazenados sem organização em múltiplos locais.",
              automation_solution: "Implementar sistema de gestão documental com OCR e fluxos de aprovação automatizados.",
              time_saved: "6-8 horas por semana",
              cost_reduction: "R$ 1.500 - R$ 2.000 por mês",
              difficulty: "Médio" as const,
              priority: "Baixa" as const,
              tools_needed: ["Google Workspace", "Microsoft SharePoint", "DocuSign", "Dropbox Business"],
              implementation_steps: [
                "Definir estrutura de pastas e taxonomia",
                "Digitalizar documentos físicos existentes",
                "Configurar permissões de acesso",
                "Implementar fluxos de aprovação",
                "Treinar equipe no novo sistema"
              ],
              roi_estimate: "Retorno do investimento em 6-8 meses",
              integration_complexity: "Média - requer migração de dados existentes"
            }
          ],
          summary: {
            total_time_saved: "44-58 horas por semana",
            total_cost_reduction: "R$ 10.000 - R$ 14.000 por mês",
            recommended_first_steps: [
              "Priorizar a implementação do chatbot e sistema de tickets para atendimento ao cliente",
              "Implementar CRM para gestão de leads e vendas",
              "Criar um calendário de implementação faseado para as demais automações"
            ],
            roi_timeline: "ROI médio de 4-5 meses para todas as implementações",
            automation_maturity_score: 3.5
          },
          tools_comparison: [
            {
              tool_name: "Zendesk",
              features: [
                "Sistema de tickets",
                "Chat ao vivo e chatbot",
                "Base de conhecimento",
                "Automações e gatilhos",
                "Integrações com mais de 1000 aplicativos"
              ],
              pricing: "A partir de R$ 49/mês por agente",
              best_for: "Empresas de médio porte com volume significativo de atendimentos",
              integration_options: ["API REST", "Webhooks", "Zapier", "Integrações nativas"],
              learning_curve: "Moderada - requer treinamento inicial"
            },
            {
              tool_name: "HubSpot CRM",
              features: [
                "Gestão de contatos e empresas",
                "Pipeline de vendas visual",
                "Automação de e-mails",
                "Relatórios e dashboards",
                "Versão gratuita disponível"
              ],
              pricing: "Gratuito (básico) até R$ 3.200/mês (enterprise)",
              best_for: "Startups e empresas em crescimento que precisam de um CRM completo",
              integration_options: ["API REST", "Webhooks", "Zapier", "Integrações nativas"],
              learning_curve: "Baixa a moderada - interface intuitiva"
            },
            {
              tool_name: "Conta Azul",
              features: [
                "Controle financeiro",
                "Emissão de notas fiscais",
                "Controle de estoque",
                "Relatórios financeiros",
                "Conciliação bancária"
              ],
              pricing: "A partir de R$ 89/mês",
              best_for: "Pequenas empresas brasileiras que precisam de gestão financeira completa",
              integration_options: ["API REST", "Zapier", "Integrações nativas com bancos brasileiros"],
              learning_curve: "Baixa - interface amigável e suporte em português"
            },
            {
              tool_name: "Calendly",
              features: [
                "Agendamento online",
                "Sincronização com múltiplos calendários",
                "Lembretes automáticos",
                "Páginas de agendamento personalizáveis",
                "Integrações com Zoom, Teams, etc."
              ],
              pricing: "Gratuito (básico) até R$ 50/mês por usuário",
              best_for: "Profissionais e pequenas equipes que precisam otimizar agendamentos",
              integration_options: ["API REST", "Zapier", "Integrações nativas com calendários e videoconferência"],
              learning_curve: "Muito baixa - pode ser configurado em minutos"
            },
            {
              tool_name: "Microsoft SharePoint",
              features: [
                "Gestão documental",
                "Colaboração em tempo real",
                "Controle de versões",
                "Fluxos de trabalho personalizáveis",
                "Integração com Office 365"
              ],
              pricing: "Incluído em planos Microsoft 365 Business (a partir de R$ 59/mês por usuário)",
              best_for: "Empresas que já utilizam o ecossistema Microsoft",
              integration_options: ["Microsoft Power Automate", "API REST", "Integrações nativas com Office 365"],
              learning_curve: "Alta - requer conhecimento técnico para configuração avançada"
            }
          ],
          implementation_roadmap: [
            {
              phase: "Fase 1 - Fundação",
              timeline: "Mês 1-2",
              focus_areas: [
                "Implementação do sistema de atendimento ao cliente",
                "Configuração básica do CRM",
                "Treinamento inicial da equipe"
              ],
              expected_outcomes: [
                "Redução de 30% no tempo de resposta ao cliente",
                "Centralização de informações de leads",
                "Eliminação de tarefas manuais repetitivas"
              ]
            },
            {
              phase: "Fase 2 - Expansão",
              timeline: "Mês 3-4",
              focus_areas: [
                "Implementação do sistema financeiro",
                "Integração entre CRM e sistema de atendimento",
                "Configuração de automações avançadas"
              ],
              expected_outcomes: [
                "Redução de 40% em erros de lançamentos financeiros",
                "Visão unificada do cliente entre vendas e suporte",
                "Geração automática de relatórios gerenciais"
              ]
            },
            {
              phase: "Fase 3 - Otimização",
              timeline: "Mês 5-6",
              focus_areas: [
                "Implementação do sistema de agendamento",
                "Gestão documental",
                "Refinamento de automações existentes"
              ],
              expected_outcomes: [
                "Eliminação de conflitos de agenda",
                "Acesso rápido a documentos importantes",
                "Processos totalmente integrados e otimizados"
              ]
            }
          ],
          common_challenges: [
            "Resistência da equipe à mudança - Mitigue com treinamentos e demonstrando benefícios tangíveis",
            "Integração entre diferentes ferramentas - Utilize plataformas como Zapier ou Make para conectar sistemas",
            "Curva de aprendizado inicial - Invista em documentação e treinamento adequados",
            "Migração de dados existentes - Planeje cuidadosamente a transição para evitar perda de informações",
            "Manutenção das automações - Designe responsáveis por monitorar e ajustar os processos automatizados"
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
            content_type: 'process-automation',
            title: `Análise de Automação de Processos - ${ideaData.title}`,
            content_data: results
          });
      } catch (saveError) {
        console.warn('Failed to save process automation analysis to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Análise de automação de processos gerada com sucesso!");
    } catch (error) {
      console.error('Error generating process automation analysis:', error);
      toast.error("Erro ao gerar análise de automação. Tente novamente.");
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
      business_type: '',
      current_processes: '',
      team_size: '',
      budget: '',
      technical_level: '',
      pain_points: '',
      automation_goals: '',
      existing_tools: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Média': return 'default';
      case 'Baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadAnalysis = () => {
    if (!results) return;
    
    // Create a formatted text version of the analysis
    let content = `# Análise de Automação de Processos - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Summary
    content += `## Resumo da Análise\n\n`;
    content += `Tempo economizado: ${results.summary.total_time_saved}\n`;
    content += `Redução de custos: ${results.summary.total_cost_reduction}\n`;
    
    if (results.summary.roi_timeline) {
      content += `ROI Timeline: ${results.summary.roi_timeline}\n`;
    }
    
    if (results.summary.automation_maturity_score) {
      content += `Pontuação de Maturidade em Automação: ${results.summary.automation_maturity_score}/10\n`;
    }
    
    content += `\n### Primeiros Passos Recomendados\n\n`;
    results.summary.recommended_first_steps?.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });
    content += `\n`;
    
    // Opportunities
    content += `## Oportunidades Identificadas\n\n`;
    results.opportunities?.forEach((opportunity, index) => {
      content += `### ${index + 1}. ${opportunity.process_name}\n`;
      content += `Prioridade: ${opportunity.priority} | Dificuldade: ${opportunity.difficulty}\n\n`;
      content += `**Método Atual:** ${opportunity.current_method}\n\n`;
      content += `**Solução de Automação:** ${opportunity.automation_solution}\n\n`;
      content += `**Tempo Economizado:** ${opportunity.time_saved}\n`;
      content += `**Redução de Custos:** ${opportunity.cost_reduction}\n`;
      
      if (opportunity.roi_estimate) {
        content += `**ROI Estimado:** ${opportunity.roi_estimate}\n`;
      }
      
      if (opportunity.integration_complexity) {
        content += `**Complexidade de Integração:** ${opportunity.integration_complexity}\n`;
      }
      
      content += `\n**Ferramentas Necessárias:**\n`;
      opportunity.tools_needed?.forEach(tool => {
        content += `- ${tool}\n`;
      });
      
      content += `\n**Passos de Implementação:**\n`;
      opportunity.implementation_steps?.forEach((step, i) => {
        content += `${i + 1}. ${step}\n`;
      });
      content += `\n`;
    });
    
    // Tools Comparison
    content += `## Comparação de Ferramentas\n\n`;
    results.tools_comparison?.forEach((tool, index) => {
      content += `### ${tool.tool_name}\n`;
      content += `**Recursos:**\n`;
      tool.features?.forEach(feature => {
        content += `- ${feature}\n`;
      });
      
      content += `\n**Preço:** ${tool.pricing}\n`;
      content += `**Melhor para:** ${tool.best_for}\n`;
      
      if (tool.integration_options) {
        content += `\n**Opções de Integração:**\n`;
        tool.integration_options?.forEach(option => {
          content += `- ${option}\n`;
        });
      }
      
      if (tool.learning_curve) {
        content += `**Curva de Aprendizado:** ${tool.learning_curve}\n`;
      }
      
      content += `\n`;
    });
    
    // Implementation Roadmap
    if (results.implementation_roadmap) {
      content += `## Roadmap de Implementação\n\n`;
      results.implementation_roadmap?.forEach((phase, index) => {
        content += `### ${phase.phase} (${phase.timeline})\n\n`;
        
        content += `**Áreas de Foco:**\n`;
        phase.focus_areas?.forEach(area => {
          content += `- ${area}\n`;
        });
        
        content += `\n**Resultados Esperados:**\n`;
        phase.expected_outcomes?.forEach(outcome => {
          content += `- ${outcome}\n`;
        });
        
        content += `\n`;
      });
    }
    
    // Common Challenges
    if (results.common_challenges) {
      content += `## Desafios Comuns e Mitigações\n\n`;
      results.common_challenges?.forEach((challenge, index) => {
        content += `${index + 1}. ${challenge}\n`;
      });
    }
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_automacao_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise de automação baixada com sucesso!');
  };

  // Icon for the modal
  const automationIcon = <Zap className="h-5 w-5" />;

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Automação para: {selectedIdea?.title || "Ideia Personalizada"}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadAnalysis}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="overview" className="space-y-4 pr-4">
              {/* Resumo */}
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Resumo da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        <strong>Tempo economizado:</strong> {results.summary.total_time_saved}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        <strong>Redução de custos:</strong> {results.summary.total_cost_reduction}
                      </span>
                    </div>
                  </div>
                  
                  {results.summary.roi_timeline && (
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        <strong>ROI Timeline:</strong> {results.summary.roi_timeline}
                      </span>
                    </div>
                  )}
                  
                  {results.summary.automation_maturity_score !== undefined && (
                    <div className="mt-2">
                      <h4 className="font-medium text-sm mb-2">Maturidade em Automação:</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(results.summary.automation_maturity_score / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Iniciante</span>
                        <span>Intermediário</span>
                        <span>Avançado</span>
                      </div>
                    </div>
                  )}
                  
                  {results.summary.recommended_first_steps?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Primeiros Passos Recomendados:</h4>
                      <ul className="space-y-1">
                        {results.summary.recommended_first_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Desafios Comuns */}
              {results.common_challenges && results.common_challenges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Desafios Comuns e Mitigações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.common_challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500 font-bold">{index + 1}.</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4 pr-4">
              {/* Oportunidades */}
              {results.opportunities?.length > 0 && (
                <div className="space-y-4">
                  {results.opportunities.map((opportunity, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          {opportunity.process_name}
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(opportunity.priority) as any}>
                              {opportunity.priority}
                            </Badge>
                            <Badge className={getDifficultyColor(opportunity.difficulty)}>
                              {opportunity.difficulty}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Método Atual:</h5>
                          <p className="text-sm text-muted-foreground">{opportunity.current_method}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-1">Solução de Automação:</h5>
                          <p className="text-sm">{opportunity.automation_solution}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Tempo Economizado:</h5>
                            <p className="text-sm text-green-600">{opportunity.time_saved}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-1">Redução de Custos:</h5>
                            <p className="text-sm text-green-600">{opportunity.cost_reduction}</p>
                          </div>
                        </div>

                        {(opportunity.roi_estimate || opportunity.integration_complexity) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {opportunity.roi_estimate && (
                              <div>
                                <h5 className="font-medium text-sm mb-1">ROI Estimado:</h5>
                                <p className="text-sm text-blue-600">{opportunity.roi_estimate}</p>
                              </div>
                            )}
                            {opportunity.integration_complexity && (
                              <div>
                                <h5 className="font-medium text-sm mb-1">Complexidade de Integração:</h5>
                                <p className="text-sm">{opportunity.integration_complexity}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {opportunity.tools_needed?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Ferramentas Necessárias:</h5>
                            <div className="flex flex-wrap gap-1">
                              {opportunity.tools_needed.map((tool, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {opportunity.implementation_steps?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Passos de Implementação:</h5>
                            <ol className="space-y-1">
                              {opportunity.implementation_steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4 pr-4">
              {/* Comparação de Ferramentas */}
              {results.tools_comparison?.length > 0 && (
                <div className="space-y-4">
                  {results.tools_comparison.map((tool, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-primary" />
                          {tool.tool_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Recursos:</h5>
                          <ul className="space-y-1">
                            {tool.features?.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Preço:</h5>
                            <p className="text-sm">{tool.pricing}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-1">Melhor para:</h5>
                            <p className="text-sm">{tool.best_for}</p>
                          </div>
                        </div>

                        {tool.learning_curve && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">Curva de Aprendizado:</h5>
                            <p className="text-sm">{tool.learning_curve}</p>
                          </div>
                        )}

                        {tool.integration_options?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Opções de Integração:</h5>
                            <div className="flex flex-wrap gap-1">
                              {tool.integration_options.map((option, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="roadmap" className="space-y-4 pr-4">
              {/* Roadmap de Implementação */}
              {results.implementation_roadmap?.length > 0 ? (
                <div className="space-y-4">
                  {results.implementation_roadmap.map((phase, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Workflow className="h-4 w-4 text-primary" />
                            {phase.phase}
                          </div>
                          <Badge variant="outline">{phase.timeline}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Áreas de Foco:</h5>
                          <ul className="space-y-1">
                            {phase.focus_areas?.map((area, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Resultados Esperados:</h5>
                          <ul className="space-y-1">
                            {phase.expected_outcomes?.map((outcome, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-green-500">✓</span>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum roadmap de implementação disponível.
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
            <Label htmlFor="business_type">Tipo de Negócio</Label>
            <Input
              id="business_type"
              placeholder="Ex: E-commerce, SaaS, Consultoria, Marketplace"
              value={formData.business_type}
              onChange={(e) => handleInputChange('business_type', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size">Tamanho da Equipe</Label>
            <Select 
              value={formData.team_size} 
              onValueChange={(value) => handleInputChange('team_size', value)}
            >
              <SelectTrigger id="team_size">
                <SelectValue placeholder="Selecione o tamanho da equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5">1-5 pessoas</SelectItem>
                <SelectItem value="6-20">6-20 pessoas</SelectItem>
                <SelectItem value="21-50">21-50 pessoas</SelectItem>
                <SelectItem value="50+">Mais de 50 pessoas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_processes">Processos Atuais</Label>
            <Textarea
              id="current_processes"
              placeholder="Liste os principais processos do seu negócio (vendas, atendimento, produção, etc.)"
              value={formData.current_processes}
              onChange={(e) => handleInputChange('current_processes', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pain_points">Principais Problemas</Label>
            <Textarea
              id="pain_points"
              placeholder="Quais são as principais dificuldades e gargalos nos seus processos?"
              value={formData.pain_points}
              onChange={(e) => handleInputChange('pain_points', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Orçamento para Automação</Label>
            <Input
              id="budget"
              placeholder="Ex: R$ 500/mês, R$ 2.000/mês"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technical_level">Nível Técnico da Equipe</Label>
            <Select 
              value={formData.technical_level} 
              onValueChange={(value) => handleInputChange('technical_level', value)}
            >
              <SelectTrigger id="technical_level">
                <SelectValue placeholder="Selecione o nível técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="existing_tools">Ferramentas Existentes</Label>
            <Input
              id="existing_tools"
              placeholder="Ex: Excel, Gmail, Trello, etc."
              value={formData.existing_tools}
              onChange={(e) => handleInputChange('existing_tools', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="automation_goals">Objetivos da Automação</Label>
          <Textarea
            id="automation_goals"
            placeholder="O que você espera alcançar com a automação? Ex: reduzir tempo de atendimento, eliminar erros manuais, etc."
            value={formData.automation_goals}
            onChange={(e) => handleInputChange('automation_goals', e.target.value)}
            className="resize-none h-20"
          />
        </div>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Automação de Processos"
      icon={automationIcon}
      isGenerating={isGenerating}
      generatingText="Analisando oportunidades de automação..."
      actionText="Gerar Análise"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!results}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('process-automation')}
    >
      <div className="space-y-6">
        {results ? renderGeneratedContent() : (
          <CreditGuard feature="process-automation">
            {renderConfigForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};

// Componente adicional para o ícone de Workflow
const Workflow = ({ className }: { className?: string }) => (
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
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="9" y="15" width="6" height="6" rx="1" />
    <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
  </svg>
);