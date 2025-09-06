import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, RefreshCw, Copy, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  colorMeaning: string;
  usageGuidelines: string[];
  brandPersonality: string;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
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
      sm: 'h-12 w-12',
      md: 'h-16 w-16',
      lg: 'h-20 w-20'
    };

    return (
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} rounded-lg cursor-pointer border border-border hover:scale-105 transition-transform mx-auto`}
          style={{ backgroundColor: color }}
          onClick={() => copyColor(color)}
        />
        <p className="text-xs font-medium mt-2">{label}</p>
        <p className="text-xs text-muted-foreground">{color}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Gerador de Paleta de Cores
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector 
            selectedIdea={selectedIdea}
            onSelectIdea={setSelectedIdea}
            customIdea={customIdea}
            onCustomIdeaChange={setCustomIdea}
            useCustom={useCustom}
            onUseCustomChange={setUseCustom}
            label="Selecione uma ideia para gerar paleta de cores"
            placeholder="Ex: App de delivery para pets que conecta donos com cuidadores locais..."
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Palette className="h-4 w-4" />
              )}
              {isGenerating ? "Gerando..." : "Gerar Paleta"}
            </Button>
            
            {palette && (
              <Button variant="outline" onClick={handleReset}>
                Nova Paleta
              </Button>
            )}
          </div>

          {palette && (
            <div className="space-y-6">
              {/* Primary Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cores Primárias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
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
                <CardHeader>
                  <CardTitle className="text-lg">Cores Secundárias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
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
                <CardHeader>
                  <CardTitle className="text-lg">Cores Neutras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
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
                <CardHeader>
                  <CardTitle className="text-lg">Cores de Destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
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
                <CardHeader>
                  <CardTitle className="text-lg">Gradientes Sugeridos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {palette.gradients?.map((gradient, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="h-16 w-full rounded-lg cursor-pointer border border-border hover:scale-105 transition-transform"
                          style={{ background: gradient }}
                          onClick={() => copyColor(gradient)}
                        />
                        <p className="text-xs font-medium mt-2">Gradiente {index + 1}</p>
                        <p className="text-xs text-muted-foreground">{gradient}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Color Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Significado das Cores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{palette.colorMeaning}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personalidade da Marca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{palette.brandPersonality}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Diretrizes de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {palette.usageGuidelines?.map((guideline, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">💡</Badge>
                        <span className="text-sm">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};