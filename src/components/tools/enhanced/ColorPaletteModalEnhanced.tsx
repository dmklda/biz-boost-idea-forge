import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColorPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ColorPalette {
  primaryPalette: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
  };
  secondaryPalette: {
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
  };
  neutralPalette: {
    white: string;
    lightGray: string;
    mediumGray: string;
    darkGray: string;
    black: string;
  };
  accentColors: string[];
  gradients: string[];
  colorMeaning: {
    [key: string]: string;
  };
  usageGuidelines: {
    [key: string]: string;
  };
  brandPersonality: string;
}

export const ColorPaletteModalEnhanced: React.FC<ColorPaletteModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [palette, setPalette] = useState<ColorPalette | null>(null);

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

      const { data, error } = await supabase.functions.invoke('generate-color-palette', {
        body: { idea: ideaData, brandStyle: 'modern' }
      });

      if (error) throw error;
      
      setPalette(data.palette);
      toast.success("Paleta de cores gerada com sucesso!");
    } catch (error) {
      console.error('Error generating color palette:', error);
      toast.error("Erro ao gerar paleta. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setPalette(null);
    setUseCustom(false);
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Cor ${color} copiada!`);
  };

  const ColorBox: React.FC<{ color: string; label: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
    color, 
    label, 
    size = 'md' 
  }) => {
    const sizeClasses = {
      sm: 'h-10 w-10',
      md: 'h-14 w-14',
      lg: 'h-16 w-16'
    };

    return (
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} rounded-lg cursor-pointer border border-border hover:scale-105 transition-transform mx-auto`}
          style={{ backgroundColor: color }}
          onClick={() => copyColor(color)}
          title={`Clique para copiar: ${color}`}
        />
        <p className="text-xs font-medium mt-1 truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{color}</p>
      </div>
    );
  };

  // Icon for the modal
  const paletteIcon = <Palette className="h-5 w-5 text-purple-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Paleta de Cores"
      icon={paletteIcon}
      isGenerating={isGenerating}
      generatingText="Gerando paleta..."
      actionText="Gerar Paleta"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Paleta"
      onReset={handleReset}
      showReset={!!palette}
      maxWidth="5xl"
      creditCost={2}
      showCreditWarning={true}
    >
      {palette ? (
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Primary Palette */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cores Primárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ColorBox 
                    color={palette.primaryPalette.primary} 
                    label="Primária" 
                    size="lg"
                  />
                  <ColorBox 
                    color={palette.primaryPalette.primaryLight} 
                    label="Primária Clara" 
                  />
                  <ColorBox 
                    color={palette.primaryPalette.primaryDark} 
                    label="Primária Escura" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Secondary Palette */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cores Secundárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ColorBox 
                    color={palette.secondaryPalette.secondary} 
                    label="Secundária" 
                    size="lg"
                  />
                  <ColorBox 
                    color={palette.secondaryPalette.secondaryLight} 
                    label="Secundária Clara" 
                  />
                  <ColorBox 
                    color={palette.secondaryPalette.secondaryDark} 
                    label="Secundária Escura" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Neutral Palette */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cores Neutras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <ColorBox color={palette.neutralPalette.white} label="Branco" />
                  <ColorBox color={palette.neutralPalette.lightGray} label="Cinza Claro" />
                  <ColorBox color={palette.neutralPalette.mediumGray} label="Cinza Médio" />
                  <ColorBox color={palette.neutralPalette.darkGray} label="Cinza Escuro" />
                  <ColorBox color={palette.neutralPalette.black} label="Preto" />
                </div>
              </CardContent>
            </Card>

            {/* Accent Colors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cores de Destaque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {palette.accentColors?.map((color, index) => (
                    <ColorBox 
                      key={index}
                      color={color} 
                      label={`Destaque ${index + 1}`} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gradients */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gradientes Sugeridos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {palette.gradients?.map((gradient, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="h-12 w-full rounded-lg cursor-pointer border border-border hover:scale-105 transition-transform"
                        style={{ background: gradient }}
                        onClick={() => copyColor(gradient)}
                        title={`Clique para copiar: ${gradient}`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs font-medium">Gradiente {index + 1}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{gradient}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Significado das Cores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(palette.colorMeaning || {}).map(([color, meaning]) => (
                      <div key={color} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5 shrink-0 capitalize">{color}</Badge>
                        <span className="text-sm">{meaning}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Personalidade da Marca</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{palette.brandPersonality}</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guidelines */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Diretrizes de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(palette.usageGuidelines || {}).map(([category, guideline]) => (
                    <div key={category} className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5 shrink-0">💡</Badge>
                      <div>
                        <span className="text-sm font-medium capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <p className="text-sm text-muted-foreground mt-1">{guideline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ) : (
        <div className="space-y-6">
          <EnhancedIdeaSelector 
            onSelect={handleIdeaSelect} 
            allowCustomIdea={true}
            customIdeaValue={customIdea}
            onCustomIdeaChange={handleCustomIdeaChange}
            useCustomIdea={useCustom}
            onUseCustomIdeaChange={handleUseCustomIdeaChange}
          />
        </div>
      )}
    </ToolModalBase>
  );
};