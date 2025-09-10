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
  marketingGoals: string[];
  targetSegments: string[];
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
    percentage: string;
  }>;
  timeline: Array<{
    period: string;
    focus: string;
    activities: string[];
  }>;
  campaigns: Array<{
    name: string;
    objective: string;
    channels: string[];
    timing: string;
    budget: string;
  }>;
  partnerships: string[];
  growthHacks: string[];
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
    if (!hasCredits('basic-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('basic-analysis')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('basic-analysis'),
        p_feature: 'basic-analysis',
        p_description: `Estratégia de Marketing gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Call the real function - no fallback
      const { data, error } = await supabase.functions.invoke('generate-marketing-strategy', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      // Use the real data from the function
      setStrategy(data.strategy);
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'marketing-strategy',
            title: `Estratégia de Marketing - ${ideaData.title}`,
            content_data: JSON.stringify(data.strategy) as any
          });
      } catch (saveError) {
        console.warn('Failed to save marketing strategy to database:', saveError);
        // Continue showing the content even if saving fails
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
      content += `### ${goal}\n\n`;
    });
    
    // Target Segments
    content += `## Segmentos de Mercado\n\n`;
    strategy.targetSegments?.forEach((segment, index) => {
      content += `### ${segment}\n\n`;
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
      content += `- ${allocation.channel}: ${allocation.percentage}\n`;
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
      content += `### ${campaign.name}\n\n`;
      content += `**Objetivo:** ${campaign.objective}\n`;
      content += `**Canais:** ${campaign.channels.join(', ')}\n`;
      content += `**Timing:** ${campaign.timing}\n`;
      content += `**Orçamento:** ${campaign.budget}\n\n`;
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

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Estratégia de Marketing"
      icon={<Megaphone className="h-6 w-6" />}
      isGenerating={isGenerating}
      generatingText="Gerando estratégia de marketing..."
      actionText="Gerar Estratégia"
      onAction={handleGenerate}
      onReset={handleReset}
      resetText="Nova Estratégia"
      downloadText="Baixar Estratégia"
      onDownload={downloadStrategy}
      showDownload={!!strategy}
    >
      <CreditGuard
        feature="basic-analysis" as any
        creditCost={getFeatureCost('basic-analysis')}
        description="Esta ferramenta gera uma estratégia de marketing completa baseada na sua ideia de negócio."
      >
        {!strategy ? (
          <EnhancedIdeaSelector
            selectedIdea={selectedIdea}
            customIdea={customIdea}
            useCustom={useCustom}
            onIdeaSelect={handleIdeaSelect}
            onCustomIdeaChange={handleCustomIdeaChange}
            onUseCustomChange={handleUseCustomIdeaChange}
            placeholder="Descreva sua ideia de negócio para criar uma estratégia de marketing personalizada..."
            emptyStateTitle="Estratégia de Marketing Personalizada"
            emptyStateDescription="Gere uma estratégia de marketing completa com objetivos, canais, orçamento e cronograma específicos para sua ideia de negócio."
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Estratégia de Marketing Gerada</h3>
              <Button onClick={downloadStrategy} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar Estratégia
              </Button>
            </div>

            <ScrollArea className="h-[500px]">
              <Tabs defaultValue="goals" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="goals">Objetivos</TabsTrigger>
                  <TabsTrigger value="channels">Canais</TabsTrigger>
                  <TabsTrigger value="timeline">Cronograma</TabsTrigger>
                  <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                  <TabsTrigger value="budget">Orçamento</TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Objetivos SMART
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {strategy.marketingGoals?.map((goal, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{goal}</p>
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
                      <div className="space-y-3">
                        {strategy.targetSegments?.map((segment, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{segment}</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {strategy.kpis?.map((kpi, index) => (
                          <Badge key={index} variant="secondary" className="justify-start">
                            {kpi}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="channels" className="space-y-4">
                  {strategy.channels?.map((channel, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{channel.name}</CardTitle>
                          <Badge variant={channel.priority === 'high' ? 'default' : 'secondary'}>
                            {channel.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Orçamento:</span> {channel.budget}
                          </div>
                          <div>
                            <span className="font-medium">ROI Esperado:</span> {channel.expectedROI}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Táticas:</h4>
                          <div className="space-y-1">
                            {channel.tactics?.map((tactic, tacticIndex) => (
                              <div key={tacticIndex} className="text-sm text-muted-foreground">
                                • {tactic}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  {strategy.timeline?.map((period, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {period.period} - {period.focus}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {period.activities?.map((activity, activityIndex) => (
                            <div key={activityIndex} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span>{activity}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4">
                  {strategy.campaigns?.map((campaign, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{campaign.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="font-medium">Objetivo:</span> {campaign.objective}
                        </div>
                        <div>
                          <span className="font-medium">Canais:</span> {campaign.channels.join(', ')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Duração:</span> {campaign.timing}
                          </div>
                          <div>
                            <span className="font-medium">Orçamento:</span> {campaign.budget}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
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
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">{allocation.channel}</span>
                            <Badge variant="outline">{allocation.percentage}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Parcerias Sugeridas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {strategy.partnerships?.map((partnership, index) => (
                          <Badge key={index} variant="secondary" className="justify-start">
                            {partnership}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Growth Hacks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {strategy.growthHacks?.map((hack, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{hack}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>
        )}
      </CreditGuard>
    </ToolModalBase>
  );
};