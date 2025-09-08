import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Briefcase, 
  Download, 
  Maximize, 
  Minimize,
  Users,
  Zap,
  Target,
  Gem,
  Heart,
  Megaphone,
  UserCheck,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";

interface BusinessModelCanvasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CanvasSection {
  title: string;
  content: string;
  key: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface BusinessModelCanvas {
  keyPartners: string;
  keyActivities: string;
  keyResources: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

export const BusinessModelCanvasModalEnhanced: React.FC<BusinessModelCanvasModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState, updateUserCredits } = useAuth();
  const { canAccessFeature, hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canvas, setCanvas] = useState<BusinessModelCanvas | null>(null);
  const [activeSection, setActiveSection] = useState<string>("valuePropositions");
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    if (!hasCredits('business-model-canvas')) {
      toast.error(`Você precisa de ${getFeatureCost('business-model-canvas')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('business-model-canvas'),
        p_feature: 'business-model-canvas',
        p_description: `Business Model Canvas gerado para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      const { data, error } = await supabase.functions.invoke('generate-business-model-canvas', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      // Set canvas data immediately to display content
      setCanvas(data.canvas);
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'business-model-canvas',
            title: `Business Model Canvas - ${ideaData.title}`,
            content_data: data.canvas
          });
      } catch (saveError) {
        console.warn('Failed to save canvas to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Business Model Canvas gerado com sucesso!");
    } catch (error) {
      console.error('Error generating business model canvas:', error);
      toast.error("Erro ao gerar business model canvas. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setCanvas(null);
    setUseCustom(false);
    setActiveSection("valuePropositions");
  };

  const downloadCanvas = () => {
    if (!canvas) return;
    
    // Create a formatted text version of the canvas
    const content = `# Business Model Canvas - ${selectedIdea?.title || 'Ideia Personalizada'}

## Proposta de Valor
${canvas.valuePropositions}

## Segmentos de Clientes
${canvas.customerSegments}

## Canais
${canvas.channels}

## Relacionamento com Clientes
${canvas.customerRelationships}

## Fontes de Receita
${canvas.revenueStreams}

## Recursos Principais
${canvas.keyResources}

## Atividades Principais
${canvas.keyActivities}

## Parcerias Principais
${canvas.keyPartners}

## Estrutura de Custos
${canvas.costStructure}
`;
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `business_model_canvas_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Format content with bullet points
  const formatContent = (content: string | null | undefined) => {
    if (!content || typeof content !== 'string') return "";
    
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().startsWith('•') ? line : `• ${line.trim()}`)
      .join('\n');
  };

  // Canvas sections configuration
  const canvasSections: CanvasSection[] = [
    {
      title: "Parcerias Principais",
      key: "keyPartners",
      content: formatContent(canvas?.keyPartners || ""),
      description: "Quem são seus parceiros e fornecedores essenciais?",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Atividades Principais",
      key: "keyActivities",
      content: formatContent(canvas?.keyActivities || ""),
      description: "Quais atividades são essenciais para entregar sua proposta de valor?",
      icon: <Zap className="h-5 w-5" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800"
    },
    {
      title: "Recursos Principais",
      key: "keyResources",
      content: formatContent(canvas?.keyResources || ""),
      description: "Quais recursos são necessários para criar valor para seus clientes?",
      icon: <Target className="h-5 w-5" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800"
    },
    {
      title: "Proposta de Valor",
      key: "valuePropositions",
      content: formatContent(canvas?.valuePropositions || ""),
      description: "Que valor você entrega ao cliente? Que problema você resolve?",
      icon: <Gem className="h-5 w-5" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800"
    },
    {
      title: "Relacionamento com Clientes",
      key: "customerRelationships",
      content: formatContent(canvas?.customerRelationships || ""),
      description: "Que tipo de relacionamento cada segmento de cliente espera?",
      icon: <Heart className="h-5 w-5" />,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800"
    },
    {
      title: "Canais",
      key: "channels",
      content: formatContent(canvas?.channels || ""),
      description: "Como você alcança seus clientes e entrega sua proposta de valor?",
      icon: <Megaphone className="h-5 w-5" />,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800"
    },
    {
      title: "Segmentos de Clientes",
      key: "customerSegments",
      content: formatContent(canvas?.customerSegments || ""),
      description: "Para quem você está criando valor? Quem são seus clientes mais importantes?",
      icon: <UserCheck className="h-5 w-5" />,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800"
    },
    {
      title: "Estrutura de Custos",
      key: "costStructure",
      content: formatContent(canvas?.costStructure || ""),
      description: "Quais são os custos mais importantes do seu modelo de negócio?",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800"
    },
    {
      title: "Fontes de Receita",
      key: "revenueStreams",
      content: formatContent(canvas?.revenueStreams || ""),
      description: "Como você gera receita? Qual o valor que os clientes estão dispostos a pagar?",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
    }
  ];

  // Icon for the modal
  const canvasIcon = <Briefcase className="h-5 w-5 text-orange-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Business Model Canvas"
      icon={canvasIcon}
      isGenerating={isGenerating}
      generatingText="Gerando canvas..."
      actionText="Gerar Canvas"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Novo Canvas"
      onReset={handleReset}
      showReset={!!canvas}
      maxWidth={isFullscreen ? "7xl" : "6xl"}
      showCreditWarning={true}
      creditCost={getFeatureCost('business-model-canvas')}
    >
      <div className="space-y-6">
        {canvas ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Canvas para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="h-4 w-4" />
                      <span className="hidden sm:inline">Reduzir</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="h-4 w-4" />
                      <span className="hidden sm:inline">Expandir</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadCanvas}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Baixar</span>
                </Button>
              </div>
            </div>

            {/* Mobile View - Tabs */}
            <div className="block md:hidden">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid grid-cols-3 mb-4 bg-muted/50">
                  {canvasSections.slice(0, 9).map((section, index) => (
                    <TabsTrigger 
                      key={section.key} 
                      value={section.key}
                      className="text-xs flex items-center gap-1 data-[state=active]:bg-background"
                    >
                      <span className={section.color}>{section.icon}</span>
                      <span className="hidden sm:inline">{section.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {canvasSections.map((section) => (
                  <TabsContent key={section.key} value={section.key}>
                    <Card className={section.bgColor}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className={section.color}>{section.icon}</span>
                          {section.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-line text-sm leading-relaxed">{section.content}</div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Desktop View - Grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-5 gap-4 auto-rows-min">
                {/* Top Row */}
                <Card className={`row-span-2 ${canvasSections[0].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[0].color}>{canvasSections[0].icon}</span>
                      Parcerias Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.keyPartners)}</div>
                  </CardContent>
                </Card>

                <Card className={`${canvasSections[1].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[1].color}>{canvasSections[1].icon}</span>
                      Atividades Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.keyActivities)}</div>
                  </CardContent>
                </Card>

                <Card className={`row-span-2 ${canvasSections[3].bgColor} shadow-lg border-2 hover:shadow-xl transition-all`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 font-semibold">
                      <span className={canvasSections[3].color}>{canvasSections[3].icon}</span>
                      Proposta de Valor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed font-medium">{formatContent(canvas.valuePropositions)}</div>
                  </CardContent>
                </Card>

                <Card className={`${canvasSections[4].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[4].color}>{canvasSections[4].icon}</span>
                      Relacionamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.customerRelationships)}</div>
                  </CardContent>
                </Card>

                <Card className={`row-span-2 ${canvasSections[6].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[6].color}>{canvasSections[6].icon}</span>
                      Segmentos de Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.customerSegments)}</div>
                  </CardContent>
                </Card>

                <Card className={`${canvasSections[2].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[2].color}>{canvasSections[2].icon}</span>
                      Recursos Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.keyResources)}</div>
                  </CardContent>
                </Card>

                <Card className={`${canvasSections[5].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[5].color}>{canvasSections[5].icon}</span>
                      Canais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.channels)}</div>
                  </CardContent>
                </Card>

                {/* Bottom Row */}
                <Card className={`col-span-2 ${canvasSections[7].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[7].color}>{canvasSections[7].icon}</span>
                      Estrutura de Custos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.costStructure)}</div>
                  </CardContent>
                </Card>

                <Card className={`col-span-3 ${canvasSections[8].bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={canvasSections[8].color}>{canvasSections[8].icon}</span>
                      Fontes de Receita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{formatContent(canvas.revenueStreams)}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <CreditGuard feature="business-model-canvas">
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