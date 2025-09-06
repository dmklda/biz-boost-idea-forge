import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Briefcase, RefreshCw, Users, DollarSign, Target, Truck, Heart, Zap, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BusinessModelCanvasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Canvas {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export const BusinessModelCanvasModal: React.FC<BusinessModelCanvasModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

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
      console.error('Error generating canvas:', error);
      toast.error("Erro ao gerar canvas. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setCanvas(null);
    setUseCustom(false);
  };

  const canvasBlocks = [
    {
      title: "Parceiros-Chave",
      icon: Building,
      data: canvas?.keyPartners,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Atividades-Chave",
      icon: Zap,
      data: canvas?.keyActivities,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Recursos-Chave",
      icon: Target,
      data: canvas?.keyResources,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Propostas de Valor",
      icon: Heart,
      data: canvas?.valuePropositions,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Relacionamento",
      icon: Users,
      data: canvas?.customerRelationships,
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Canais",
      icon: Truck,
      data: canvas?.channels,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Segmentos de Clientes",
      icon: Users,
      data: canvas?.customerSegments,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "Estrutura de Custos",
      icon: DollarSign,
      data: canvas?.costStructure,
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Fontes de Receita",
      icon: DollarSign,
      data: canvas?.revenueStreams,
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Business Model Canvas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Briefcase className="h-4 w-4" />
              )}
              {isGenerating ? "Gerando..." : "Gerar Canvas"}
            </Button>
            
            {canvas && (
              <Button variant="outline" onClick={handleReset}>
                Novo Canvas
              </Button>
            )}
          </div>

          {canvas && (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
              {canvasBlocks.map((block, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${block.color} opacity-5`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${block.color}`}>
                        <block.icon className="h-4 w-4 text-white" />
                      </div>
                      {block.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.isArray(block.data) ? (
                      block.data.map((item, itemIndex) => (
                        <div key={itemIndex} className="text-sm p-2 bg-muted/50 rounded text-foreground">
                          • {item}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm p-2 bg-muted/50 rounded text-foreground">
                        {block.data || "Não definido"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};