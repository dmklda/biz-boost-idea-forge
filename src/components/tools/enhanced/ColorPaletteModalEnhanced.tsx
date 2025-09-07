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
import { useTranslation } from "react-i18next";
import { usePlanAccess } from "@/hooks/usePlanAccess";

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
  const { t } = useTranslation();
  const { authState } = useAuth();
  const user = authState.user;
  const { getFeatureCost } = usePlanAccess();
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
      toast.error(t("colorPalette.errors.loginRequired", "Você precisa estar logado"));
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error(t("colorPalette.errors.selectIdea", "Selecione uma ideia ou digite uma descrição"));
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error(t("colorPalette.errors.enterDescription", "Digite uma descrição da sua ideia"));
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: t("colorPalette.customIdea", "Ideia personalizada"), description: customIdea }
        : selectedIdea;

      // Deduzir créditos
      const creditCost = 2; // Custo da ferramenta
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_feature: 'color-palette',
        p_description: t("colorPalette.creditDescription", "Paleta de cores para {{title}}", { title: ideaData.title })
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      const { data, error } = await supabase.functions.invoke('generate-color-palette', {
        body: { idea: ideaData, brandStyle: 'modern' }
      });

      if (error) throw error;
      
      setPalette(data.palette);
      toast.success(t("colorPalette.success.generated", "Paleta de cores gerada com sucesso!"));
    } catch (error) {
      console.error(t("colorPalette.console.error", "Error generating color palette:"), error);
      toast.error(t("colorPalette.errors.generation", "Erro ao gerar paleta. Tente novamente."));
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
    toast.success(t("colorPalette.success.colorCopied", "Cor {{color}} copiada!", { color }));
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
          title={t("colorPalette.tooltips.clickToCopy", "Clique para copiar: {{color}}", { color })}
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
      title={t("colorPalette.title", "Gerador de Paleta de Cores")}
      icon={paletteIcon}
      isGenerating={isGenerating}
      generatingText={t("colorPalette.generating", "Gerando paleta...")}
      actionText={t("colorPalette.actions.generate", "Gerar Paleta")}
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText={t("colorPalette.actions.new", "Nova Paleta")}
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
                <CardTitle className="text-base">{t("colorPalette.sections.primaryColors", "Cores Primárias")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ColorBox 
                    color={palette.primaryPalette.primary} 
                    label={t("colorPalette.colors.primary", "Primária")} 
                    size="lg"
                  />
                  <ColorBox 
                    color={palette.primaryPalette.primaryLight} 
                    label={t("colorPalette.colors.primaryLight", "Primária Clara")} 
                  />
                  <ColorBox 
                    color={palette.primaryPalette.primaryDark} 
                    label={t("colorPalette.colors.primaryDark", "Primária Escura")} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Secondary Palette */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("colorPalette.sections.secondaryColors", "Cores Secundárias")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ColorBox 
                    color={palette.secondaryPalette.secondary} 
                    label={t("colorPalette.colors.secondary", "Secundária")} 
                    size="lg"
                  />
                  <ColorBox 
                    color={palette.secondaryPalette.secondaryLight} 
                    label={t("colorPalette.colors.secondaryLight", "Secundária Clara")} 
                  />
                  <ColorBox 
                    color={palette.secondaryPalette.secondaryDark} 
                    label={t("colorPalette.colors.secondaryDark", "Secundária Escura")} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Neutral Palette */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("colorPalette.sections.neutralColors", "Cores Neutras")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <ColorBox color={palette.neutralPalette.white} label={t("colorPalette.colors.white", "Branco")} />
                  <ColorBox color={palette.neutralPalette.lightGray} label={t("colorPalette.colors.lightGray", "Cinza Claro")} />
                  <ColorBox color={palette.neutralPalette.mediumGray} label={t("colorPalette.colors.mediumGray", "Cinza Médio")} />
                  <ColorBox color={palette.neutralPalette.darkGray} label={t("colorPalette.colors.darkGray", "Cinza Escuro")} />
                  <ColorBox color={palette.neutralPalette.black} label={t("colorPalette.colors.black", "Preto")} />
                </div>
              </CardContent>
            </Card>

            {/* Accent Colors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("colorPalette.sections.accentColors", "Cores de Destaque")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {palette.accentColors?.map((color, index) => (
                    <ColorBox 
                      key={index}
                      color={color} 
                      label={t("colorPalette.colors.accent", "Destaque {{number}}", { number: index + 1 })} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gradients */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("colorPalette.sections.gradients", "Gradientes Sugeridos")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {palette.gradients?.map((gradient, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="h-12 w-full rounded-lg cursor-pointer border border-border hover:scale-105 transition-transform"
                        style={{ background: gradient }}
                        onClick={() => copyColor(gradient)}
                        title={t("colorPalette.tooltips.clickToCopy", "Clique para copiar: {{color}}", { color: gradient })}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs font-medium">{t("colorPalette.colors.gradient", "Gradiente {{number}}", { number: index + 1 })}</p>
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
                  <CardTitle className="text-base">{t("colorPalette.sections.colorMeaning", "Significado das Cores")}</CardTitle>
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
                  <CardTitle className="text-base">{t("colorPalette.sections.brandPersonality", "Personalidade da Marca")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{palette.brandPersonality}</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guidelines */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("colorPalette.sections.usageGuidelines", "Diretrizes de Uso")}</CardTitle>
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