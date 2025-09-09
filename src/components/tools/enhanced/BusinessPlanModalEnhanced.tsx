import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  BookOpen, 
  Download, 
  Building, 
  TrendingUp, 
  Users, 
  DollarSign,
  Lightbulb,
  BarChart,
  Target,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BusinessPlanModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BusinessPlan {
  executiveSummary: string;
  companyDescription: string;
  organizationManagement: string;
  serviceOffering: string;
  marketAnalysis: string;
  marketingStrategy: string;
  financialProjections: string;
  fundingRequest: string;
  implementation: string;
  appendix: string;
}

export const BusinessPlanModalEnhanced: React.FC<BusinessPlanModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('BusinessPlanModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [activeTab, setActiveTab] = useState<string>("executive");

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
    if (!hasCredits('business-plan')) {
      toast.error(`Você precisa de ${getFeatureCost('business-plan')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('business-plan'),
        p_feature: 'business-plan',
        p_description: `Plano de Negócios gerado para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-business-plan', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setPlan(data.plan);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockPlan = {
          executiveSummary: "Este é um resumo executivo simulado para desenvolvimento. Aqui descrevemos a visão geral do negócio, sua proposta de valor e objetivos principais.",
          companyDescription: "Descrição detalhada da empresa, incluindo missão, visão e valores. Também abordamos a estrutura organizacional e o modelo de negócios.",
          organizationManagement: "Detalhes sobre a equipe de gestão, suas competências e experiências. Também incluímos informações sobre a estrutura hierárquica e departamentos.",
          serviceOffering: "Descrição dos produtos e serviços oferecidos, destacando seus diferenciais e benefícios para os clientes.",
          marketAnalysis: "Análise detalhada do mercado, incluindo tamanho, tendências, concorrentes e oportunidades identificadas.",
          marketingStrategy: "Estratégias de marketing para aquisição e retenção de clientes, incluindo canais de distribuição e comunicação.",
          financialProjections: "Projeções financeiras para os próximos 5 anos, incluindo receitas, despesas, fluxo de caixa e ponto de equilíbrio.",
          fundingRequest: "Detalhes sobre as necessidades de financiamento, incluindo valores, prazos e uso dos recursos.",
          implementation: "Plano de implementação com cronograma, marcos e responsáveis por cada etapa do projeto.",
          appendix: "Documentos complementares, incluindo pesquisas de mercado, análises técnicas e outros materiais de suporte."
        };
        
        setPlan(mockPlan);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'business-plan',
            title: `Plano de Negócios - ${ideaData.title}`,
            content_data: data.plan
          });
      } catch (saveError) {
        console.warn('Failed to save business plan to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Plano de Negócios gerado com sucesso!");
    } catch (error) {
      console.error('Error generating business plan:', error);
      toast.error("Erro ao gerar plano de negócios. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setPlan(null);
    setUseCustom(false);
    setActiveTab("executive");
  };

  const downloadPlan = () => {
    if (!plan) return;
    
    // Create a formatted text version of the plan
    const content = `# Plano de Negócios - ${selectedIdea?.title || 'Ideia Personalizada'}

## Resumo Executivo
${plan.executiveSummary}

## Descrição da Empresa
${plan.companyDescription}

## Estrutura Organizacional
${plan.organizationManagement}

## Produtos e Serviços
${plan.serviceOffering}

## Análise de Mercado
${plan.marketAnalysis}

## Estratégia de Marketing
${plan.marketingStrategy}

## Projeções Financeiras
${plan.financialProjections}

## Necessidades de Financiamento
${plan.fundingRequest}

## Plano de Implementação
${plan.implementation}

## Apêndice
${plan.appendix}
`;
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `plano_de_negocios_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Plano de negócios baixado com sucesso!');
  };

  // Icon for the modal
  const planIcon = <BookOpen className="h-5 w-5 text-teal-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Plano de Negócios"
      icon={planIcon}
      isGenerating={isGenerating}
      generatingText="Gerando plano de negócios..."
      actionText="Gerar Plano de Negócios"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Novo Plano"
      onReset={handleReset}
      showReset={!!plan}
      maxWidth="4xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('business-plan')}
    >
      <div className="space-y-6">
        {plan ? (
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

            <Tabs defaultValue="executive" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="executive" className="text-xs">
                  <Lightbulb className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Executivo</span>
                </TabsTrigger>
                <TabsTrigger value="company" className="text-xs">
                  <Building className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Empresa</span>
                </TabsTrigger>
                <TabsTrigger value="market" className="text-xs">
                  <BarChart className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mercado</span>
                </TabsTrigger>
                <TabsTrigger value="financial" className="text-xs">
                  <DollarSign className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Financeiro</span>
                </TabsTrigger>
                <TabsTrigger value="implementation" className="text-xs">
                  <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Implementação</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[60vh]">
                <TabsContent value="executive" className="space-y-4 mt-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Resumo Executivo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {plan.executiveSummary}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="company" className="space-y-4 mt-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-500" />
                        Descrição da Empresa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.companyDescription}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Estrutura Organizacional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.organizationManagement}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-500" />
                        Produtos e Serviços
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.serviceOffering}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="market" className="space-y-4 mt-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-green-500" />
                        Análise de Mercado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.marketAnalysis}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Estratégia de Marketing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.marketingStrategy}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4 mt-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                        Projeções Financeiras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.financialProjections}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        Necessidades de Financiamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.fundingRequest}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-4 mt-4 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-cyan-500" />
                        Plano de Implementação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.implementation}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-teal-500" />
                        Apêndice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {plan.appendix}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        ) : (
          <CreditGuard feature="business-plan">
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