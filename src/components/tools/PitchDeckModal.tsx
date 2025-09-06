import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Presentation, RefreshCw, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-blue-500" />
            Gerador de Pitch Deck
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
                <Presentation className="h-4 w-4" />
              )}
              {isGenerating ? "Gerando..." : "Gerar Pitch Deck"}
            </Button>
            
            {slides.length > 0 && (
              <Button variant="outline" onClick={handleReset}>
                Novo Pitch Deck
              </Button>
            )}
          </div>

          {slides.length > 0 && (
            <div className="space-y-4">
              {/* Slide Navigation */}
              <div className="flex items-center justify-between">
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
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {slides.map((slide, index) => (
                  <Button
                    key={index}
                    variant={currentSlide === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSlide(index)}
                    className="h-16 text-xs p-2"
                  >
                    <div className="text-center">
                      <div className="font-semibold">{index + 1}</div>
                      <div className="truncate">{slide.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};