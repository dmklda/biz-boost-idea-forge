
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2, Palette, Download, RefreshCw, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Idea {
  id: string;
  title: string;
  description: string;
  audience?: string;
  problem?: string;
  generated_name?: string;
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
  const [customName, setCustomName] = useState("");
  const [useCustomName, setUseCustomName] = useState(false);
  const [nameSource, setNameSource] = useState<"original" | "generated" | "custom">("original");
  
  // New gpt-image-1 specific options
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [quality, setQuality] = useState<string>("high");
  
  const [isGeneratingName, setIsGeneratingName] = useState(false);
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
        .select('id, title, description, audience, problem, generated_name')
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

  const generateNameFromIdea = async () => {
    if (!selectedIdeaId) return;

    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (!selectedIdea) return;

    setIsGeneratingName(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-name', {
        body: {
          idea: selectedIdea
        }
      });

      if (error) throw error;

      const generatedName = data.name;
      setCustomName(generatedName);
      setNameSource("custom");
      toast.success('Nome gerado com sucesso!');
    } catch (error) {
      console.error('Error generating name:', error);
      toast.error('Erro ao gerar nome');
    } finally {
      setIsGeneratingName(false);
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
          p_description: `Geração de logo para: ${nameSource === "generated" && selectedIdea.generated_name ? selectedIdea.generated_name : nameSource === "custom" && customName ? customName : selectedIdea.title}`
        }
      );

      if (creditsError) throw creditsError;

      // Determine the name to use based on user selection
      let nameToUse = selectedIdea.title;
      if (nameSource === "generated" && selectedIdea.generated_name) {
        nameToUse = selectedIdea.generated_name;
      } else if (nameSource === "custom" && customName) {
        nameToUse = customName;
      }

      // Prepare idea with selected name
      const ideaForLogo = {
        ...selectedIdea,
        title: nameToUse
      };

      // Generate logo with new gpt-image-1 options
      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: {
          idea: ideaForLogo,
          logoStyle,
          colorScheme,
          logoType,
          customPrompt,
          background: transparentBackground ? 'transparent' : 'opaque',
          outputFormat,
          quality
        }
      });

      if (error) throw error;

      setGeneratedLogo(data.logoUrl);
      toast.success('Logo gerado e salvo em "Meus Conteúdos"!');
    } catch (error) {
      console.error('Error generating logo:', error);
      toast.error('Erro ao gerar logo');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = () => {
    if (!generatedLogo) return;
    
    const selectedIdea = ideas.find(i => i.id === selectedIdeaId);
    let fileName = selectedIdea?.title || 'logo';
    if (nameSource === "generated" && selectedIdea?.generated_name) {
      fileName = selectedIdea.generated_name;
    } else if (nameSource === "custom" && customName) {
      fileName = customName;
    }
    const fileExtension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const link = document.createElement('a');
    link.href = generatedLogo;
    link.download = `logo_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
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

  const outputFormats = [
    { value: "png", label: "PNG", description: "Melhor qualidade, ideal para transparência" },
    { value: "webp", label: "WebP", description: "Menor tamanho, boa qualidade" },
    { value: "jpeg", label: "JPEG", description: "Compatibilidade universal, sem transparência" }
  ];

  const qualityLevels = [
    { value: "high", label: "Alta", description: "Máxima qualidade" },
    { value: "medium", label: "Média", description: "Boa qualidade, menor tamanho" },
    { value: "low", label: "Baixa", description: "Menor qualidade, arquivo pequeno" }
  ];

  if (generatedLogo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Logo Gerado com GPT-Image-1
            </DialogTitle>
            <DialogDescription>
              Seu logo foi gerado com sucesso usando o modelo mais avançado da OpenAI!
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

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={downloadLogo} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Baixar Logo
              </Button>
              <Button onClick={() => setGeneratedLogo("")} variant="outline" className="w-full sm:w-auto">
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Gerador de Logotipos - GPT-Image-1
          </DialogTitle>
          <DialogDescription>
            Crie logotipos únicos e profissionais com o modelo mais avançado da OpenAI.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Main Settings */}
          <div className="space-y-4">
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

            {/* Name Selection Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Nome para o Logo</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateNameFromIdea}
                  disabled={!selectedIdeaId || isGeneratingName}
                  className="text-xs"
                >
                  {isGeneratingName ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Gerar Nome
                </Button>
              </div>
              
              <div className="space-y-3">
                {/* Original name option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="name-original"
                    name="nameSource"
                    value="original"
                    checked={nameSource === "original"}
                    onChange={(e) => setNameSource(e.target.value as "original")}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="name-original" className="text-sm flex-1">
                    Usar nome original da ideia
                    {selectedIdeaId && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        "{ideas.find(i => i.id === selectedIdeaId)?.title}"
                      </span>
                    )}
                  </Label>
                </div>

                {/* Generated name option */}
                {selectedIdeaId && ideas.find(i => i.id === selectedIdeaId)?.generated_name && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="name-generated"
                      name="nameSource"
                      value="generated"
                      checked={nameSource === "generated"}
                      onChange={(e) => setNameSource(e.target.value as "generated")}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="name-generated" className="text-sm flex-1">
                      Usar nome gerado automaticamente
                      <span className="block text-xs text-muted-foreground mt-1">
                        "{ideas.find(i => i.id === selectedIdeaId)?.generated_name}"
                      </span>
                    </Label>
                  </div>
                )}

                {/* Custom name option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="name-custom"
                    name="nameSource"
                    value="custom"
                    checked={nameSource === "custom"}
                    onChange={(e) => setNameSource(e.target.value as "custom")}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="name-custom" className="text-sm">
                    Usar nome personalizado
                  </Label>
                </div>

                {nameSource === "custom" && (
                  <Input
                    placeholder="Digite o nome para aparecer no logo"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="ml-6"
                  />
                )}
              </div>
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
          </div>

          {/* Right Column - Style & Advanced Settings */}
          <div className="space-y-4">
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

            {/* Advanced Options - New for GPT-Image-1 */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700">Opções Avançadas (GPT-Image-1)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Transparent Background */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Fundo Transparente</Label>
                    <p className="text-xs text-muted-foreground">Ideal para logos profissionais</p>
                  </div>
                  <Switch
                    checked={transparentBackground}
                    onCheckedChange={setTransparentBackground}
                  />
                </div>

                {/* Output Format */}
                <div className="space-y-2">
                  <Label className="text-sm">Formato de Saída</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outputFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{format.label}</span>
                            <span className="text-xs text-muted-foreground">{format.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label className="text-sm">Qualidade</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{level.label}</span>
                            <span className="text-xs text-muted-foreground">{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="space-y-4">
          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Instruções Personalizadas</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Descreva elementos específicos, inspirações visuais..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="resize-none"
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
                Esta ferramenta consome <strong>3 créditos</strong> por logo gerado com GPT-Image-1.
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
                Gerando Logo com GPT-Image-1...
              </>
            ) : (
              "Gerar Logo com GPT-Image-1 (3 créditos)"
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
