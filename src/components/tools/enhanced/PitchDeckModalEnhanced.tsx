import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Presentation, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Lightbulb,
  Target,
  Users,
  BarChart,
  DollarSign,
  TrendingUp,
  Rocket
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PitchDeckModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Slide {
  title: string;
  content: string;
  speakerNotes: string;
  slideNumber: number;
}

export const PitchDeckModalEnhanced: React.FC<PitchDeckModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('PitchDeckModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
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

    // Check credits
    if (!hasCredits('prd-mvp')) { // Using prd-mvp as a placeholder, should be updated if there's a specific feature type for pitch deck
      toast.error(`Você precisa de ${getFeatureCost('prd-mvp')} créditos para usar esta ferramenta`);
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
        p_amount: 10, // Cost for pitch deck generation
        p_feature: 'pitch-deck',
        p_description: `Pitch Deck gerado para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-pitch-deck', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        if (data?.pitchDeck?.slides) {
          setSlides(data.pitchDeck.slides);
        } else {
          throw new Error('Dados inválidos recebidos da API');
        }
      } catch (invokeError) {
        console.error('Erro ao invocar função do Supabase:', invokeError);
        throw invokeError;
      }
      
      // Slides já foram definidos no bloco try/catch acima
      setCurrentSlide(0);
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'pitch-deck',
            title: `Pitch Deck - ${ideaData.title}`,
            content_data: JSON.parse(JSON.stringify({ slides }))
          });
      } catch (saveError) {
        console.warn('Failed to save pitch deck to database:', saveError);
        // Continue showing the content even if saving fails
      }
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

  const downloadPitchDeck = async () => {
    if (slides.length === 0) return;
    
    try {
      // Import the PPTX generator
      const { generatePptxFromSlides } = await import('@/utils/pptxGenerator');
      await generatePptxFromSlides(slides, 'Pitch Deck');
      toast.success("Arquivo PowerPoint baixado com sucesso!");
    } catch (error) {
      console.error('Error downloading PPTX:', error);
      // Fallback to text download
      let content = `# Pitch Deck - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
      
      slides.forEach((slide, index) => {
        content += `## Slide ${index + 1}: ${slide.title}\n\n`;
        content += `${slide.content}\n\n`;
        if (slide.speakerNotes) {
          content += `### Notas do Apresentador:\n${slide.speakerNotes}\n\n`;
        }
      });
      
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `pitch_deck_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
      
      toast.error("Erro ao gerar PowerPoint. Arquivo de texto baixado como alternativa.");
    }
  };

  // Get slide icon based on title
  const getSlideIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('problema') || lowerTitle.includes('desafio')) {
      return <Target className="h-5 w-5 text-red-500" />;
    } else if (lowerTitle.includes('solução')) {
      return <Lightbulb className="h-5 w-5 text-amber-500" />;
    } else if (lowerTitle.includes('mercado')) {
      return <BarChart className="h-5 w-5 text-blue-500" />;
    } else if (lowerTitle.includes('modelo') || lowerTitle.includes('negócio')) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (lowerTitle.includes('financeiro') || lowerTitle.includes('receita')) {
      return <DollarSign className="h-5 w-5 text-emerald-500" />;
    } else if (lowerTitle.includes('equipe')) {
      return <Users className="h-5 w-5 text-indigo-500" />;
    } else if (lowerTitle.includes('roadmap') || lowerTitle.includes('próximos passos')) {
      return <Rocket className="h-5 w-5 text-purple-500" />;
    } else {
      return <Presentation className="h-5 w-5 text-gray-500" />;
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
      showCreditWarning={true}
      creditCost={10} // Cost for pitch deck generation
    >
      <div className="space-y-6">
        {slides.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Pitch Deck para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadPitchDeck}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar PowerPoint</span>
              </Button>
            </div>

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
                <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                  {getSlideIcon(slides[currentSlide]?.title)}
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
            <ScrollArea className="pb-4">
              <div className="flex gap-2 pb-2">
                {slides.map((slide, index) => (
                  <Button
                    key={index}
                    variant={currentSlide === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSlide(index)}
                    className="h-16 w-24 text-xs p-2 flex-shrink-0"
                  >
                    <div className="text-center">
                      <div className="font-semibold">{index + 1}</div>
                      <div className="truncate text-[10px]">{slide.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <CreditGuard feature="prd-mvp"> {/* Using prd-mvp as a placeholder */}
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