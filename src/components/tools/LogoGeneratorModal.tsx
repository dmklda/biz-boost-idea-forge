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
        const trimmedName = generatedName.trim();
        setCustomName(trimmedName);
        setNameSource("custom");
        console.log('🎯 Nome definido como personalizado:', trimmedName);
        
        toast({
          title: t("logoGenerator.toast.nameGeneratedSuccess", "Nome gerado com sucesso!"),
          description: t("logoGenerator.toast.nameGeneratedDescription", "\"{{name}}\" foi gerado e está pronto para uso.", { name: trimmedName }),
        });
      } else {
        console.error('❌ Nome gerado está vazio:', data);
        toast({
          title: t("logoGenerator.toast.error", "Erro"),
          description: t("logoGenerator.toast.nameGenerationFailed", "Não foi possível gerar um nome. Tente novamente."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao gerar nome:', error);
      toast({
        title: t("logoGenerator.toast.error", "Erro"),
        description: t("logoGenerator.toast.connectionError", "Erro ao gerar nome. Verifique sua conexão e tente novamente."),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingName(false);
    }
  };

  const handleGenerate = async () => {
    if (!authState.user) return;
    
    
    // Enhanced validation with better error messages
    if (mode === "idea" && !selectedIdea) {
      toast({
        title: t("logoGenerator.toast.error", "Erro"),
        description: t("logoGenerator.toast.selectIdea", "Selecione uma ideia para gerar o logo"),
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "idea" && nameSource === "custom" && !customName.trim()) {
      toast({
        title: t("logoGenerator.toast.error", "Erro"),
        description: t("logoGenerator.toast.enterCustomName", "Digite um nome personalizado para o logo"),
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "idea" && nameSource === "generated" && !selectedIdea?.generated_name) {
      toast({
        title: t("logoGenerator.toast.error", "Erro"),
        description: t("logoGenerator.toast.noGeneratedName", "Esta ideia não possui um nome gerado. Use outro tipo de nome ou gere um novo."),
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "free" && (!freeName || !freeDescription)) {
      toast({
        title: t("logoGenerator.toast.error", "Erro"),
        description: t("logoGenerator.toast.requiredFieldsFree", "Nome e descrição são obrigatórios para o modo livre"),
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
          p_amount: 10,
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
        title: t("logoGenerator.toast.success", "Sucesso!"),
        description: t("logoGenerator.toast.logoGenerated", "Logo gerado e salvo em 'Meus Conteúdos'!"),
      });
    } catch (error) {
      console.error('Error generating logo:', error);
      toast({
        title: t("logoGenerator.toast.error", "Erro"),
        description: t("logoGenerator.toast.logoGenerationError", "Erro ao gerar logo"),
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
      title={t("logoGenerator.title", "Gerador de Logotipos - GPT-Image-1")}
      icon={logoIcon}
      isGenerating={isGenerating}
      generatingText={t("logoGenerator.generating", "Gerando logo...")}
      actionText={t("logoGenerator.actions.generate", "Gerar Logo com GPT-Image-1 (10 créditos)")}
      onAction={handleGenerate}
      actionDisabled={!isFormValid || isGenerating || !authState.user || authState.user.credits < 10}
      resetText={t("logoGenerator.actions.new", "Gerar Novo Logo")}
      onReset={() => setGeneratedLogo("")}
      showReset={!!generatedLogo}
      creditCost={10}
      maxWidth="4xl"
    >
      {generatedLogo ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="border rounded-lg p-4 bg-background">
              <img
                src={generatedLogo}
                alt={t("logoGenerator.logoAlt", "Logo gerado")}
                className="max-w-full max-h-64 object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={downloadLogo} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {t("logoGenerator.actions.download", "Baixar Logo")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("logoGenerator.sections.creationMode", "Escolha o Modo de Criação")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(value) => setMode(value as "idea" | "free")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="idea" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t("logoGenerator.modes.ideaBased", "Baseado em Ideia")}
                  </TabsTrigger>
                  <TabsTrigger value="free" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    {t("logoGenerator.modes.freeCreation", "Criação Livre")}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="idea" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("logoGenerator.descriptions.ideaBased", "Crie um logo baseado em uma das suas ideias já analisadas.")}
                    </p>
                    <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
                  </div>
                </TabsContent>
                
                <TabsContent value="free" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("logoGenerator.descriptions.freeCreation", "Crie um logo completamente novo fornecendo as informações básicas.")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="freeName">{t("logoGenerator.fields.companyName", "Nome da Empresa/Projeto *")}</Label>
                        <Input
                          id="freeName"
                          placeholder={t("logoGenerator.placeholders.companyName", "Ex: TechStart, Café Aroma...")}
                          value={freeName}
                          onChange={(e) => setFreeName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeIndustry">{t("logoGenerator.fields.industry", "Setor/Indústria")}</Label>
                        <Input
                          id="freeIndustry"
                          placeholder={t("logoGenerator.placeholders.industry", "Ex: Tecnologia, Alimentação...")}
                          value={freeIndustry}
                          onChange={(e) => setFreeIndustry(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeDescription">{t("logoGenerator.fields.businessDescription", "Descrição do Negócio *")}</Label>
                      <Textarea
                        id="freeDescription"
                        placeholder={t("logoGenerator.placeholders.businessDescription", "Descreva o que sua empresa/projeto faz, seus valores, missão...")}
                        value={freeDescription}
                        onChange={(e) => setFreeDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeAudience">{t("logoGenerator.fields.targetAudience", "Público-Alvo")}</Label>
                      <Input
                        id="freeAudience"
                        placeholder={t("logoGenerator.placeholders.targetAudience", "Ex: Jovens profissionais, famílias...")}
                        value={freeAudience}
                        onChange={(e) => setFreeAudience(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {mode === "idea" && selectedIdea && (
            <div className="space-y-6">
              {/* Informações da Ideia - sempre visível */}
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {t("logoGenerator.sections.ideaInfo", "Informações da Ideia")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t("logoGenerator.fields.title", "Título")}</Label>
                      <p className="text-sm font-medium">{selectedIdea.title}</p>
                    </div>
                    {selectedIdea.audience && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">{t("logoGenerator.fields.targetAudience", "Público-alvo")}</Label>
                        <p className="text-sm">{selectedIdea.audience}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t("logoGenerator.fields.description", "Descrição")}</Label>
                    <p className="text-sm">{selectedIdea.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Opções de Nome - sempre visível */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    {t("logoGenerator.sections.nameOptions", "Opções de Nome para o Logo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label className="text-base font-medium">{t("logoGenerator.labels.chooseName", "Escolha o nome que será usado:")}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateNameFromIdea}
                        disabled={!selectedIdea || isGeneratingName}
                        className="text-xs"
                      >
                        {isGeneratingName ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                            {t("logoGenerator.actions.generating", "Gerando...")}
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t("logoGenerator.actions.generateName", "Gerar Nome")}
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Original name option */}
                      <div className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                        nameSource === "original" ? "bg-primary/10 border-primary/30" : "border-border"
                      }`}>
                        <input
                          type="radio"
                          id="original"
                          name="nameSource"
                          value="original"
                          checked={nameSource === "original"}
                          onChange={(e) => setNameSource(e.target.value as any)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor="original" className="cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{t("logoGenerator.nameOptions.original", "Usar nome original")}</span>
                              {nameSource === "original" && <span className="text-xs text-primary">{t("logoGenerator.labels.selected", "✓ Selecionado")}</span>}
                            </div>
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                              {selectedIdea.title}
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Generated name option */}
                      {selectedIdea.generated_name && (
                        <div className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                          nameSource === "generated" ? "bg-primary/10 border-primary/30" : "border-border"
                        }`}>
                          <input
                            type="radio"
                            id="generated"
                            name="nameSource"
                            value="generated"
                            checked={nameSource === "generated"}
                            onChange={(e) => setNameSource(e.target.value as any)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor="generated" className="cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{t("logoGenerator.nameOptions.generated", "Usar nome gerado anteriormente")}</span>
                                {nameSource === "generated" && <span className="text-xs text-primary">{t("logoGenerator.labels.selected", "✓ Selecionado")}</span>}
                              </div>
                              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                                {selectedIdea.generated_name}
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Custom name option */}
                      <div className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                        nameSource === "custom" ? "bg-primary/10 border-primary/30" : "border-border"
                      }`}>
                        <input
                          type="radio"
                          id="custom"
                          name="nameSource"
                          value="custom"
                          checked={nameSource === "custom"}
                          onChange={(e) => setNameSource(e.target.value as any)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor="custom" className="cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{t("logoGenerator.nameOptions.custom", "Usar nome personalizado")}</span>
                              {nameSource === "custom" && <span className="text-xs text-primary">{t("logoGenerator.labels.selected", "✓ Selecionado")}</span>}
                            </div>
                          </label>
                          <div className="mt-2">
                            <Input
                              id="customName"
                              placeholder={t("logoGenerator.placeholders.customName", "Digite um nome personalizado para o logo")}
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              className="w-full"
                            />
                            {nameSource === "custom" && !customName.trim() && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t("logoGenerator.validations.requiredField", "Campo obrigatório quando esta opção está selecionada")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isFormValid && (
            <div className="space-y-6">
              <Card className="border-muted-foreground/20">
                <CardHeader>
                  <CardTitle>{t("logoGenerator.sections.logoSettings", "Configurações do Logo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{t("logoGenerator.fields.logoType", "Tipo de Logo")}</Label>
                      <Select value={logoType} onValueChange={setLogoType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {logoTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("logoGenerator.fields.logoStyle", "Estilo do Logo")}</Label>
                      <Select value={logoStyle} onValueChange={setLogoStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {logoStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <div>
                                <div className="font-medium">{style.label}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("logoGenerator.fields.colorScheme", "Esquema de Cores")}</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorSchemes.map((scheme) => (
                            <SelectItem key={scheme.value} value={scheme.value}>
                              <div>
                                <div className="font-medium">{scheme.label}</div>
                                <div className="text-xs text-muted-foreground">{scheme.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("logoGenerator.fields.outputFormat", "Formato de Saída")}</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {outputFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              <div>
                                <div className="font-medium">{format.label}</div>
                                <div className="text-xs text-muted-foreground">{format.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("logoGenerator.fields.quality", "Qualidade")}</Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qualityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-muted-foreground">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>{t("logoGenerator.sections.advancedOptions", "Opções Avançadas")}</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={transparentBackground}
                          onCheckedChange={setTransparentBackground}
                        />
                        <Label className="text-sm">{t("logoGenerator.options.transparentBackground", "Fundo transparente")}</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customPrompt">{t("logoGenerator.fields.customPrompt", "Prompt Personalizado (Opcional)")}</Label>
                    <Textarea
                      id="customPrompt"
                      placeholder={t("logoGenerator.placeholders.customPrompt", "Adicione detalhes específicos sobre como quer que o logo seja...")}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </ToolModalBase>
  );
};