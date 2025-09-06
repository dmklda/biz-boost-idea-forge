import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Palette, Download, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  // Mode selection: "idea" or "free"
  const [mode, setMode] = useState<"idea" | "free">("idea");
  
  // For idea-based mode
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [nameSource, setNameSource] = useState<"original" | "generated" | "custom">("original");
  const [customName, setCustomName] = useState("");
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  
  // For free mode
  const [freeName, setFreeName] = useState("");
  const [freeDescription, setFreeDescription] = useState("");
  const [freeAudience, setFreeAudience] = useState("");
  const [freeIndustry, setFreeIndustry] = useState("");
  
  // Common settings
  const [logoStyle, setLogoStyle] = useState<string>("modern");
  const [colorScheme, setColorScheme] = useState<string>("brand");
  const [logoType, setLogoType] = useState<string>("text_and_icon");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // GPT-Image-1 specific options
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [quality, setQuality] = useState<string>("high");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string>("");

  const handleIdeaSelect = (idea: Idea | null) => {
    setSelectedIdea(idea);
    setNameSource("original");
    setCustomName("");
  };
  
  const handleReset = () => {
    setSelectedIdea(null);
    setCustomName("");
    setNameSource("original");
    setFreeName("");
    setFreeDescription("");
    setFreeAudience("");
    setFreeIndustry("");
    setCustomPrompt("");
    setGeneratedLogo("");
  };

  const generateNameFromIdea = async () => {
    if (!selectedIdea || !authState.user) return;
    
    console.log('🔄 Iniciando geração de nome para:', selectedIdea.title);
    setIsGeneratingName(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-name', {
        body: { idea: selectedIdea }
      });

      if (error) {
        console.error('❌ Erro na função:', error);
        throw error;
      }

      const generatedName = data?.name;
      console.log('✅ Nome gerado recebido:', generatedName);
      
      if (generatedName && generatedName.trim()) {
        // Automaticamente mudar para nome personalizado e preencher o campo
        setCustomName(generatedName.trim());
        setNameSource("custom");
        console.log('🎯 Mudando para nome personalizado:', generatedName.trim());
        toast({
          title: "Nome gerado com sucesso!",
          description: `"${generatedName}". Clique em "Usar nome personalizado" para editar se necessário.`,
        });
      } else {
        console.error('❌ Nome gerado está vazio:', data);
        toast({
          title: "Erro",
          description: "Nome gerado está vazio. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao gerar nome:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar nome. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingName(false);
    }
  };

  // Use effect to auto-focus the custom name field after generation
  useEffect(() => {
    if (nameSource === "custom" && customName) {
      console.log('🎯 Nome personalizado ativo:', customName);
      // Find and focus the custom name input
      setTimeout(() => {
        const customInput = document.getElementById('customName');
        if (customInput) {
          customInput.focus();
          console.log('✅ Focando campo de nome personalizado');
        }
      }, 100);
    }
  }, [nameSource, customName]);

  const handleGenerate = async () => {
    if (!authState.user) return;
    
    
    // Enhanced validation with better error messages
    if (mode === "idea" && !selectedIdea) {
      toast({
        title: "Erro",
        description: "Selecione uma ideia para gerar o logo",
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "idea" && nameSource === "custom" && !customName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome personalizado para o logo",
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "idea" && nameSource === "generated" && !selectedIdea?.generated_name) {
      toast({
        title: "Erro",
        description: "Esta ideia não possui um nome gerado. Use outro tipo de nome ou gere um novo.",
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "free" && (!freeName || !freeDescription)) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios para o modo livre",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      let ideaForLogo;
      let itemId = null;
      let description = "";

      if (mode === "idea" && selectedIdea) {
        let nameToUse = selectedIdea.title;
        if (nameSource === "generated" && selectedIdea.generated_name) {
          nameToUse = selectedIdea.generated_name;
        } else if (nameSource === "custom" && customName) {
          nameToUse = customName;
        }

        ideaForLogo = {
          ...selectedIdea,
          title: nameToUse
        };
        itemId = selectedIdea.id;
        description = `Geração de logo para: ${nameToUse}`;
      } else {
        ideaForLogo = {
          id: 'free-logo',
          title: freeName,
          description: freeDescription,
          audience: freeAudience || undefined,
          industry: freeIndustry || undefined
        };
        description = `Geração de logo livre para: ${freeName}`;
      }

      const { data: creditsData, error: creditsError } = await supabase.rpc(
        'deduct_credits_and_log',
        {
          p_user_id: authState.user.id,
          p_amount: 3,
          p_feature: 'logo_generation',
          p_item_id: itemId,
          p_description: description
        }
      );

      if (creditsError) throw creditsError;

      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: {
          idea: ideaForLogo,
          logoStyle,
          colorScheme,
          logoType,
          customPrompt,
          background: transparentBackground ? 'transparent' : 'opaque',
          outputFormat,
          quality,
          mode
        }
      });

      if (error) throw error;

      setGeneratedLogo(data.logoUrl);
      toast({
        title: "Sucesso!",
        description: "Logo gerado e salvo em 'Meus Conteúdos'!",
      });
    } catch (error) {
      console.error('Error generating logo:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar logo",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = () => {
    if (!generatedLogo) return;
    
    let fileName = 'logo';
    if (mode === "idea" && selectedIdea) {
      fileName = selectedIdea.title || 'logo';
      if (nameSource === "generated" && selectedIdea.generated_name) {
        fileName = selectedIdea.generated_name;
      } else if (nameSource === "custom" && customName) {
        fileName = customName;
      }
    } else if (mode === "free") {
      fileName = freeName || 'logo';
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

  const logoIcon = <Palette className="h-5 w-5" />;
  
  // Improved form validation logic
  const isFormValid = (() => {
    if (mode === "idea") {
      if (!selectedIdea) return false;
      
      // If using custom name, ensure it's not empty
      if (nameSource === "custom") {
        return customName.trim().length > 0;
      }
      
      // For other name sources, check if they have valid names
      if (nameSource === "generated") {
        return !!selectedIdea.generated_name;
      }
      
      // For original name source, always valid if idea exists
      return true;
    } else {
      // Free mode validation
      return !!(freeName && freeDescription);
    }
  })();

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Logotipos - GPT-Image-1"
      icon={logoIcon}
      isGenerating={isGenerating}
      generatingText="Gerando logo com GPT-Image-1..."
      actionText="Gerar Logo com GPT-Image-1 (3 créditos)"
      onAction={handleGenerate}
      actionDisabled={!isFormValid || isGenerating || !authState.user || authState.user.credits < 3}
      resetText="Gerar Novo Logo"
      onReset={() => setGeneratedLogo("")}
      showReset={!!generatedLogo}
      creditCost={3}
      maxWidth="4xl"
    >
      {generatedLogo ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="border rounded-lg p-4 bg-background">
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
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Escolha o Modo de Criação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(value) => setMode(value as "idea" | "free")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="idea" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Baseado em Ideia
                  </TabsTrigger>
                  <TabsTrigger value="free" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Criação Livre
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="idea" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Crie um logo baseado em uma das suas ideias já analisadas.
                    </p>
                    <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
                  </div>
                </TabsContent>
                
                <TabsContent value="free" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Crie um logo completamente novo fornecendo as informações básicas.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="freeName">Nome da Empresa/Projeto *</Label>
                        <Input
                          id="freeName"
                          placeholder="Ex: TechStart, Café Aroma..."
                          value={freeName}
                          onChange={(e) => setFreeName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeIndustry">Setor/Indústria</Label>
                        <Input
                          id="freeIndustry"
                          placeholder="Ex: Tecnologia, Alimentação..."
                          value={freeIndustry}
                          onChange={(e) => setFreeIndustry(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeDescription">Descrição do Negócio *</Label>
                      <Textarea
                        id="freeDescription"
                        placeholder="Descreva o que sua empresa/projeto faz, seus valores, missão..."
                        value={freeDescription}
                        onChange={(e) => setFreeDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeAudience">Público-Alvo</Label>
                      <Input
                        id="freeAudience"
                        placeholder="Ex: Jovens profissionais, famílias..."
                        value={freeAudience}
                        onChange={(e) => setFreeAudience(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {isFormValid && (
            <div className="space-y-6">
              {mode === "idea" && selectedIdea && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Label className="text-base font-medium">Nome para o Logo</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateNameFromIdea}
                          disabled={!selectedIdea || isGeneratingName}
                          className="text-xs"
                        >
                          {isGeneratingName ? (
                            <span className="animate-pulse">Gerando...</span>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Gerar Nome
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-3 bg-muted/50 p-3 rounded-md">
                        {/* Nome Original - sempre visível */}
                        <div className={`p-3 rounded border transition-all ${
                          nameSource === "original" 
                            ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                            : "bg-background border-border hover:border-primary/50"
                        }`}>
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
                            <Label htmlFor="name-original" className="text-sm flex-1 cursor-pointer">
                              <span className="font-medium">Usar nome original da ideia</span>
                              <span className="block text-xs text-muted-foreground mt-1">
                                📝 "{selectedIdea.title}"
                              </span>
                              {nameSource === "original" && (
                                <span className="block text-xs text-primary mt-1">
                                  ✓ Este nome será usado no logo
                                </span>
                              )}
                            </Label>
                          </div>
                        </div>

                        {/* Nome Gerado (se existir) - sempre visível se disponível */}
                        {selectedIdea.generated_name && (
                          <div className={`p-3 rounded border transition-all ${
                            nameSource === "generated" 
                              ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                              : "bg-background border-border hover:border-primary/50"
                          }`}>
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
                              <Label htmlFor="name-generated" className="text-sm flex-1 cursor-pointer">
                                <span className="font-medium">Usar nome gerado automaticamente</span>
                                <span className="block text-xs text-muted-foreground mt-1">
                                  🤖 "{selectedIdea.generated_name}"
                                </span>
                                {nameSource === "generated" && (
                                  <span className="block text-xs text-primary mt-1">
                                    ✓ Este nome será usado no logo
                                  </span>
                                )}
                              </Label>
                            </div>
                          </div>
                        )}

                        {/* Nome Personalizado - sempre visível */}
                        <div className={`p-3 rounded border transition-all ${
                          nameSource === "custom" 
                            ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                            : "bg-background border-border hover:border-primary/50"
                        }`}>
                          <div className="space-y-3">
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
                              <Label htmlFor="name-custom" className="text-sm cursor-pointer">
                                <span className="font-medium">Usar nome personalizado</span>
                                {nameSource === "custom" && customName.trim() && (
                                  <span className="block text-xs text-primary mt-1">
                                    ✓ Este nome será usado no logo: "{customName}"
                                  </span>
                                )}
                                {nameSource === "custom" && !customName.trim() && (
                                  <span className="block text-xs text-amber-600 mt-1">
                                    ⚠️ Digite um nome para usar esta opção
                                  </span>
                                )}
                              </Label>
                            </div>
                            
                            {/* Campo sempre visível quando nome personalizado está selecionado */}
                            {nameSource === "custom" && (
                              <div className="ml-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <Input
                                  id="customName"
                                  placeholder="Digite o nome para aparecer no logo"
                                  value={customName}
                                  onChange={(e) => setCustomName(e.target.value)}
                                  className={`transition-colors ${
                                    customName.trim() 
                                      ? "border-green-500 focus:border-green-600" 
                                      : "border-amber-400 focus:border-amber-500"
                                  }`}
                                  autoFocus
                                />
                                {!customName.trim() && (
                                  <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>Digite um nome para continuar</span>
                                  </p>
                                )}
                                {customName.trim() && (
                                  <p className="text-xs text-green-600 flex items-center gap-1">
                                    <span>✓</span>
                                    <span>Nome válido! Este será usado no logo.</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Informações da Ideia</Label>
                      <div className="bg-muted/50 p-3 rounded-md space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Título:</span> {selectedIdea.title}
                        </div>
                        <div>
                          <span className="font-medium">Descrição:</span> {selectedIdea.description}
                        </div>
                        {selectedIdea.audience && (
                          <div>
                            <span className="font-medium">Público:</span> {selectedIdea.audience}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Configurações Avançadas</Label>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="transparent-bg" className="text-sm">
                        Fundo Transparente
                      </Label>
                      <Switch
                        id="transparent-bg"
                        checked={transparentBackground}
                        onCheckedChange={setTransparentBackground}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Formato de Saída</Label>
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

                    <div className="space-y-2">
                      <Label>Qualidade</Label>
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
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrompt">Prompt Personalizado (Opcional)</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="Adicione instruções específicas para o design do logo..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </ToolModalBase>
  );
};