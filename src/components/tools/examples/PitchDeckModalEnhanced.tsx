import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Presentation, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PitchDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Slide {
  title: string;
  content: string;
  speakerNotes: string;
  slideNumber: number;
}

export const PitchDeckModalEnhanced: React.FC<PitchDeckModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

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

      const { data, error } = await supabase.functions.invoke('generate-pitch-deck', {
        body: { idea: ideaData }
      });

      if (error) throw error;
      
      setSlides(data.pitchDeck.slides || []);
      setCurrentSlide(0);
      toast.success("Pitch Deck gerado com sucesso!");
    } catch (error) {
      console.error('Error generating pitch deck:', error);
      toast.error("Erro ao gerar pitch deck. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setSlides([]);
    setCurrentSlide(0);
    setUseCustom(false);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Icon for the modal
  const pitchDeckIcon = <Presentation className="h-5 w-5 text-blue-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Pitch Deck"
      icon={pitchDeckIcon}
      isGenerating={isGenerating}
      generatingText="Gerando pitch deck..."
      actionText="Gerar Pitch Deck"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Novo Pitch Deck"
      onReset={handleReset}
      showReset={slides.length > 0}
      maxWidth="6xl"
      showCreditWarning={false}
    >
      <div className="space-y-6">
        {slides.length > 0 ? (
          <div className="space-y-6">
            {/* Slide Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Slide {currentSlide + 1} de {slides.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Badge variant="secondary">
                {slides[currentSlide]?.title}
              </Badge>
            </div>

            {/* Current Slide */}
            <Card className="min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-xl text-center">
                  {slides[currentSlide]?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {slides[currentSlide]?.content}
                  </div>
                </div>
                
                {slides[currentSlide]?.speakerNotes && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">💡 Notas do Apresentador:</h4>
                    <p className="text-sm text-muted-foreground">
                      {slides[currentSlide].speakerNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slide Thumbnails */}
            <ScrollArea className="h-20">
              <div className="flex gap-2 pb-2">
                {slides.map((slide, index) => (
                  <Button
                    key={index}
                    variant={currentSlide === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSlide(index)}
                    className="h-16 w-16 text-xs p-2 flex-shrink-0"
                  >
                    <div className="text-center">
                      <div className="font-semibold">{index + 1}</div>
                      <div className="truncate max-w-[50px]">{slide.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
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