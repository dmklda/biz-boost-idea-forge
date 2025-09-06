import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Briefcase, Download, Maximize, Minimize } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BusinessModelCanvasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CanvasSection {
  title: string;
  content: string;
  key: string;
  description: string;
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
  const { authState } = useAuth();
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

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      const { data, error } = await supabase.functions.invoke('generate-business-model-canvas', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      setCanvas(data.canvas);
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

  // Canvas sections configuration
  const canvasSections: CanvasSection[] = [
    {
      title: "Parcerias Principais",
      key: "keyPartners",
      content: canvas?.keyPartners || "",
      description: "Quem são seus parceiros e fornecedores essenciais?"
    },
    {
      title: "Atividades Principais",
      key: "keyActivities",
      content: canvas?.keyActivities || "",
      description: "Quais atividades são essenciais para entregar sua proposta de valor?"
    },
    {
      title: "Recursos Principais",
      key: "keyResources",
      content: canvas?.keyResources || "",
      description: "Quais recursos são necessários para criar valor para seus clientes?"
    },
    {
      title: "Proposta de Valor",
      key: "valuePropositions",
      content: canvas?.valuePropositions || "",
      description: "Que valor você entrega ao cliente? Que problema você resolve?"
    },
    {
      title: "Relacionamento com Clientes",
      key: "customerRelationships",
      content: canvas?.customerRelationships || "",
      description: "Que tipo de relacionamento cada segmento de cliente espera?"
    },
    {
      title: "Canais",
      key: "channels",
      content: canvas?.channels || "",
      description: "Como você alcança seus clientes e entrega sua proposta de valor?"
    },
    {
      title: "Segmentos de Clientes",
      key: "customerSegments",
      content: canvas?.customerSegments || "",
      description: "Para quem você está criando valor? Quem são seus clientes mais importantes?"
    },
    {
      title: "Estrutura de Custos",
      key: "costStructure",
      content: canvas?.costStructure || "",
      description: "Quais são os custos mais importantes do seu modelo de negócio?"
    },
    {
      title: "Fontes de Receita",
      key: "revenueStreams",
      content: canvas?.revenueStreams || "",
      description: "Como você gera receita? Qual o valor que os clientes estão dispostos a pagar?"
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
      showCreditWarning={false}
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
                <TabsList className="grid grid-cols-3 mb-4">
                  {canvasSections.map((section) => (
                    <TabsTrigger 
                      key={section.key} 
                      value={section.key}
                      className="text-xs"
                    >
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {canvasSections.map((section) => (
                  <TabsContent key={section.key} value={section.key}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{section.description}</p>
                        <div className="whitespace-pre-line text-sm">{section.content}</div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Desktop View - Grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-3 gap-3">
                {/* Top Row */}
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Parcerias Principais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">{canvas.keyPartners}</div>
                  </CardContent>
                </Card>

                <div className="col-span-1 space-y-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Atividades Principais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line text-sm">{canvas.keyActivities}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recursos Principais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line text-sm">{canvas.keyResources}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="col-span-1 bg-blue-50 dark:bg-blue-950">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Proposta de Valor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">{canvas.valuePropositions}</div>
                  </CardContent>
                </Card>

                {/* Middle Row */}
                <div className="col-span-3 grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Relacionamento com Clientes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-line text-sm">{canvas.customerRelationships}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="col-span-1 space-y-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Canais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-line text-sm">{canvas.channels}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Segmentos de Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line text-sm">{canvas.customerSegments}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row */}
                <Card className="col-span-3/2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Estrutura de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">{canvas.costStructure}</div>
                  </CardContent>
                </Card>

                <Card className="col-span-3/2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Fontes de Receita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">{canvas.revenueStreams}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <EnhancedIdeaSelector 
            onSelect={handleIdeaSelect} 
            allowCustomIdea={true}
            customIdeaValue={customIdea}
            onCustomIdeaChange={handleCustomIdeaChange}
            useCustomIdea={useCustom}
            onUseCustomIdeaChange={handleUseCustomIdeaChange}
          />
        )}
      </div>
    </ToolModalBase>
  );
};