import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";
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
  Calendar,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GenerationProgress } from "@/components/ui/generation-progress";
import { withRetry, getErrorMessage } from "@/utils/retryHelper";
import { Badge } from "@/components/ui/badge";

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
  const { steps, overallProgress, currentStep, initializeSteps, updateStepStatus, resetProgress } = useGenerationProgress();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [activeTab, setActiveTab] = useState<string>("executive");
  const [retryCount, setRetryCount] = useState(0);

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
    if (!hasCredits('basic-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('basic-analysis')} créditos para usar esta ferramenta`);
      return;
    }

    // Initialize progress steps
    const progressSteps = [
      { id: 'validate', title: 'Validando dados da ideia' },
      { id: 'deduct', title: 'Processando créditos' },
      { id: 'generate', title: 'Gerando plano de negócios com IA' },
      { id: 'process', title: 'Processando seções do plano' },
      { id: 'save', title: 'Salvando resultado' }
    ];

    initializeSteps(progressSteps);
    setIsGenerating(true);
    setRetryCount(0);
    
    try {
      // Step 1: Validate
      updateStepStatus('validate', 'active');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;
      updateStepStatus('validate', 'completed');

      // Step 2: Deduct credits
      updateStepStatus('deduct', 'active');
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('basic-analysis'),
        p_feature: 'business-plan',
        p_description: `Plano de Negócios gerado para: ${ideaData.title}`
      });

      if (deductError) throw deductError;
      updateUserCredits(deductResult);
      updateStepStatus('deduct', 'completed');

      // Step 3: Generate with retry
      updateStepStatus('generate', 'active');
      
      const generateBusinessPlan = async () => {
        const { data, error } = await supabase.functions.invoke('generate-business-plan', {
          body: { idea: ideaData }
        });

        if (error) throw new Error(error.message || 'Erro ao gerar plano de negócios');
        if (data?.error) throw new Error(data.error);
        if (!data?.plan) throw new Error('Resposta inválida da API');
        
        return data;
      };

      const data = await withRetry(generateBusinessPlan, {
        maxAttempts: 3,
        delay: 2000,
        onRetry: (attempt, error) => {
          setRetryCount(attempt);
          toast.info(`Tentativa ${attempt + 1}/3: ${getErrorMessage(error)}`);
        }
      });

      updateStepStatus('generate', 'completed');

      // Step 4: Process plan
      updateStepStatus('process', 'active');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (data.plan) {
        setPlan(data.plan);
      } else {
        throw new Error('Dados do plano inválidos');
      }
      updateStepStatus('process', 'completed');

      // Step 5: Save to database
      updateStepStatus('save', 'active');
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'business-plan',
            title: `Plano de Negócios - ${ideaData.title}`,
            content_data: JSON.parse(JSON.stringify(data.plan))
          });
      } catch (saveError) {
        console.warn('Failed to save business plan to database:', saveError);
      }
      updateStepStatus('save', 'completed');

      toast.success("Plano de Negócios gerado com sucesso!");
    } catch (error) {
      console.error('Error generating business plan:', error);
      
      // Update current step status to error
      const currentActiveStep = steps.find(step => step.status === 'active');
      if (currentActiveStep) {
        updateStepStatus(currentActiveStep.id, 'error');
      }
      
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
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
    setRetryCount(0);
    resetProgress();
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
    element.download = `plano_de_negocios_${selectedIdea?.title?.replace(/\\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
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
      creditCost={getFeatureCost('basic-analysis')}
    >
      <div className="space-y-6">
        {plan ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Plano para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <div className="flex items-center gap-2">
                {retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {retryCount} tentativas
                  </Badge>
                )}
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
          <div className="space-y-4">
            {isGenerating && steps.length > 0 && (
              <GenerationProgress 
                steps={steps}
                overallProgress={overallProgress}
                currentStep={currentStep}
              />
            )}
            
            <CreditGuard feature="basic-analysis">
              <EnhancedIdeaSelector 
                onSelect={handleIdeaSelect} 
                allowCustomIdea={true}
                customIdeaValue={customIdea}
                onCustomIdeaChange={handleCustomIdeaChange}
                useCustomIdea={useCustom}
                onUseCustomIdeaChange={handleUseCustomIdeaChange}
              />
            </CreditGuard>
          </div>
        )}
      </div>
    </ToolModalBase>
  );
};