
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2, Palette, Download, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Idea {
  id: string;
  title: string;
  description: string;
  audience?: string;
  problem?: string;
}

interface LogoGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogoGeneratorModal = ({ open, onOpenChange }: LogoGeneratorModalProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [logoStyle, setLogoStyle] = useState<string>("modern");
  const [colorScheme, setColorScheme] = useState<string>("brand");
  const [logoType, setLogoType] = useState<string>("text_and_icon");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string>("");

  useEffect(() => {
    if (open && authState.user) {
      fetchUserIdeas();
    }
  }, [open, authState.user]);

  const fetchUserIdeas = async () => {
    if (!authState.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, description, audience, problem')
        .eq('user_id', authState.user.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Erro ao carregar ideias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedIdeaId || !authState.user) return;

    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (!selectedIdea) return;

    setIsGenerating(true);
    try {
      // Deduct credits first
      const { data: creditsData, error: creditsError } = await supabase.rpc(
        'deduct_credits_and_log',
        {
          p_user_id: authState.user.id,
          p_amount: 3,
          p_feature: 'logo_generation',
          p_item_id: selectedIdea.id,
          p_description: `Geração de logo para: ${selectedIdea.title}`
        }
      );

      if (creditsError) throw creditsError;

      // Generate logo
      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: {
          idea: selectedIdea,
          logoStyle,
          colorScheme,
          logoType,
          customPrompt
        }
      });

      if (error) throw error;

      setGeneratedLogo(data.logoUrl);
      toast.success('Logo gerado com sucesso!');
    } catch (error) {
      console.error('Error generating logo:', error);
      toast.error('Erro ao gerar logo');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = () => {
    if (!generatedLogo) return;
    
    const link = document.createElement('a');
    link.href = generatedLogo;
    link.download = `logo_${ideas.find(i => i.id === selectedIdeaId)?.title || 'logo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const logoStyles = [
    { value: "modern", label: "Moderno", description: "Clean, minimalista e contemporâneo" },
    { value: "classic", label: "Clássico", description: "Tradicional e atemporal" },
    { value: "playful", label: "Divertido", description: "Alegre e criativo" },
    { value: "corporate", label: "Corporativo", description: "Profissional e sério" },
    { value: "tech", label: "Tecnológico", description: "Futurista e inovador" }
  ];

  const colorSchemes = [
    { value: "brand", label: "Cores da Marca", description: "Baseado na ideia do negócio" },
    { value: "monochrome", label: "Monocromático", description: "Preto, branco e cinza" },
    { value: "vibrant", label: "Vibrante", description: "Cores brilhantes e energéticas" },
    { value: "pastel", label: "Pastel", description: "Cores suaves e delicadas" },
    { value: "earth", label: "Terra", description: "Tons naturais e orgânicos" }
  ];

  const logoTypes = [
    { value: "text_only", label: "Apenas Texto", description: "Logotipo tipográfico" },
    { value: "icon_only", label: "Apenas Ícone", description: "Símbolo sem texto" },
    { value: "text_and_icon", label: "Texto + Ícone", description: "Combinação completa" }
  ];

  if (generatedLogo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Logo Gerado
            </DialogTitle>
            <DialogDescription>
              Seu logo foi gerado com sucesso! Você pode baixar ou gerar uma nova versão.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="border rounded-lg p-4 bg-white">
                <img
                  src={generatedLogo}
                  alt="Logo gerado"
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={downloadLogo} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Logo
              </Button>
              <Button onClick={() => setGeneratedLogo("")} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Novo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Gerador de Logotipos
          </DialogTitle>
          <DialogDescription>
            Crie logotipos únicos e profissionais com IA baseados nas suas ideias existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Idea Selection */}
          <div className="space-y-2">
            <Label htmlFor="idea-select">Selecionar Ideia</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select value={selectedIdeaId} onValueChange={setSelectedIdeaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma ideia para gerar o logo" />
                </SelectTrigger>
                <SelectContent>
                  {ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{idea.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-60">
                          {idea.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Logo Style */}
          <div className="space-y-2">
            <Label>Estilo do Logo</Label>
            <Select value={logoStyle} onValueChange={setLogoStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {logoStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>Esquema de Cores</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map((scheme) => (
                  <SelectItem key={scheme.value} value={scheme.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{scheme.label}</span>
                      <span className="text-xs text-muted-foreground">{scheme.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Logo Type */}
          <div className="space-y-2">
            <Label>Tipo de Logo</Label>
            <Select value={logoType} onValueChange={setLogoType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {logoTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Instruções Personalizadas (Opcional)</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Descreva elementos específicos que gostaria no logo, inspirações visuais, ou direcionamentos especiais..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing Info */}
          <Card className="border-brand-purple/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-brand-purple">💳</span>
                Custo da Geração
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Esta ferramenta consome <strong>3 créditos</strong> por logo gerado.
                Você possui <strong>{authState.user?.credits || 0} créditos</strong> disponíveis.
              </p>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedIdeaId || isGenerating || !authState.user || authState.user.credits < 3}
            className="w-full bg-brand-purple hover:bg-brand-purple/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando Logo...
              </>
            ) : (
              "Gerar Logo (3 créditos)"
            )}
          </Button>

          {(!authState.user || authState.user.credits < 3) && (
            <p className="text-sm text-destructive text-center">
              Créditos insuficientes. <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = "/dashboard/configuracoes?tab=credits"}>Comprar mais créditos</Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
