import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Code, Palette, Smartphone, Download, Copy, FileCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LandingPageGeneratorModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LandingPageGeneratorModalEnhanced = ({ open, onOpenChange }: LandingPageGeneratorModalEnhancedProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [landingPage, setLandingPage] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCustomIdea, setUseCustomIdea] = useState(false);
  const [customIdeaDetails, setCustomIdeaDetails] = useState({
    title: "",
    description: "",
    targetAudience: "",
    uniqueSellingPoints: "",
    callToAction: ""
  });
  const [pageStyle, setPageStyle] = useState("modern");
  const [colorScheme, setColorScheme] = useState("auto");
  
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleGenerate = async () => {
    if (!useCustomIdea && !selectedIdea) {
      toast.error("Selecione uma ideia ou crie uma personalizada");
      return;
    }

    if (!hasCredits('landing-page-generator')) {
      toast.error(`Você precisa de ${getFeatureCost('landing-page-generator')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    try {
      // Preparar a ideia a ser usada
      let ideaToUse;
      let descriptionText;

      if (useCustomIdea) {
        // Validar campos obrigatórios da ideia personalizada
        if (!customIdeaDetails.title || !customIdeaDetails.description) {
          toast.error("Preencha pelo menos o título e a descrição da sua ideia");
          setIsGenerating(false);
          return;
        }

        ideaToUse = {
          title: customIdeaDetails.title,
          description: customIdeaDetails.description,
          audience: customIdeaDetails.targetAudience,
          uniqueSellingPoints: customIdeaDetails.uniqueSellingPoints,
          callToAction: customIdeaDetails.callToAction
        };
        descriptionText = `Landing page para ${customIdeaDetails.title}`;
      } else {
        ideaToUse = selectedIdea;
        descriptionText = `Landing page para ${selectedIdea.title}`;
      }

      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('landing-page-generator'),
        p_feature: 'landing-page-generator',
        p_description: descriptionText
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar landing page
      const { data, error } = await supabase.functions.invoke('generate-landing-page', {
        body: { 
          idea: ideaToUse,
          style: pageStyle,
          colorScheme: colorScheme
        }
      });

      if (error) throw error;

      setLandingPage(data.page);
      toast.success("Landing page gerada com sucesso!");
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao gerar landing page");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setLandingPage(null);
    setSelectedIdea(null);
    setUseCustomIdea(false);
    setCustomIdeaDetails({
      title: "",
      description: "",
      targetAudience: "",
      uniqueSellingPoints: "",
      callToAction: ""
    });
    setPageStyle("modern");
    setColorScheme("auto");
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Código ${type} copiado para o clipboard!`);
  };

  const downloadFullCode = () => {
    if (landingPage) {
      const fullHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${useCustomIdea ? customIdeaDetails.title : selectedIdea?.title}</title>
  <style>
${landingPage.cssCode}
  </style>
</head>
<body>
${landingPage.htmlCode}
  <script>
${landingPage.jsCode}
  </script>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `landing-page-${useCustomIdea ? customIdeaDetails.title.toLowerCase().replace(/\s+/g, '-') : selectedIdea?.title.toLowerCase().replace(/\s+/g, '-')}.html`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Código completo baixado com sucesso!");
    }
  };

  // Icon for the modal
  const landingPageIcon = <Globe className="h-5 w-5 text-blue-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Landing Page"
      icon={landingPageIcon}
      isGenerating={isGenerating}
      generatingText="Gerando landing page..."
      actionText="Gerar Landing Page"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!selectedIdea && !useCustomIdea) || (useCustomIdea && (!customIdeaDetails.title || !customIdeaDetails.description)) || !hasCredits('landing-page-generator')}
      resetText="Nova Landing Page"
      onReset={handleReset}
      showReset={!!landingPage}
      creditCost={getFeatureCost('landing-page-generator')}
      maxWidth={landingPage ? "6xl" : "2xl"}
    >
      {landingPage ? (
        <div className="space-y-4">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[70vh]">
              <TabsContent value="preview" className="space-y-4 pr-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Preview da Landing Page
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={`
                          <html>
                            <head>
                              <style>${landingPage.cssCode}</style>
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            </head>
                            <body>
                              ${landingPage.htmlCode}
                              <script>${landingPage.jsCode}</script>
                            </body>
                          </html>
                        `}
                        className="w-full h-[600px] border-0"
                        title="Landing Page Preview"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Seções da Página
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {landingPage.sections?.map((section: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm">{section}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Otimizações Mobile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {landingPage.mobileOptimization?.map((optimization: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm">{optimization}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>CTAs e Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {landingPage.callToActions?.map((cta: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{cta.title}</h4>
                            <Badge variant="outline">{cta.position}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{cta.text}</p>
                          <div className="mt-2">
                            <Badge variant="secondary">Cor: {cta.color}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="html" className="space-y-4 pr-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Código HTML
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(landingPage.htmlCode, 'HTML')}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
                        <code>{landingPage.htmlCode}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="css" className="space-y-4 pr-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Código CSS
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(landingPage.cssCode, 'CSS')}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
                        <code>{landingPage.cssCode}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="js" className="space-y-4 pr-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Código JavaScript
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(landingPage.jsCode, 'JavaScript')}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
                        <code>{landingPage.jsCode}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 pr-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Elementos SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {landingPage.seoElements?.map((element: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-semibold">{element.tag}</h4>
                          <p className="text-sm text-muted-foreground">{element.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Recomendado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-sm">
                        <code>{landingPage.analytics}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dicas de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {landingPage.conversionTips?.map((tip: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-1">{index + 1}.</span>
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" className="gap-2" onClick={downloadFullCode}>
              <Download className="h-4 w-4" />
              Download Código Completo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="saved" onValueChange={(value) => setUseCustomIdea(value === "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Usar Ideia Existente
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                Criar Landing Page Personalizada
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="page-title" className="text-base font-medium">Título da Página</Label>
                  <Input
                    id="page-title"
                    placeholder="Digite o título da sua landing page"
                    value={customIdeaDetails.title}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, title: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="page-description" className="text-base font-medium">Descrição do Produto/Serviço</Label>
                  <Textarea
                    id="page-description"
                    placeholder="Descreva seu produto ou serviço em detalhes..."
                    value={customIdeaDetails.description}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, description: e.target.value})}
                    className="mt-2 min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="target-audience" className="text-base font-medium">Público-Alvo</Label>
                  <Textarea
                    id="target-audience"
                    placeholder="Descreva seu público-alvo"
                    value={customIdeaDetails.targetAudience}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, targetAudience: e.target.value})}
                    className="mt-2 min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="unique-selling-points" className="text-base font-medium">Diferenciais Competitivos</Label>
                  <Textarea
                    id="unique-selling-points"
                    placeholder="Quais são os diferenciais do seu produto/serviço?"
                    value={customIdeaDetails.uniqueSellingPoints}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, uniqueSellingPoints: e.target.value})}
                    className="mt-2 min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="call-to-action" className="text-base font-medium">Chamada para Ação (CTA)</Label>
                  <Input
                    id="call-to-action"
                    placeholder="Ex: Comece Agora, Experimente Grátis, Saiba Mais"
                    value={customIdeaDetails.callToAction}
                    onChange={(e) => setCustomIdeaDetails({...customIdeaDetails, callToAction: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page-style" className="text-sm font-medium mb-2 block">Estilo da Página</Label>
              <Select value={pageStyle} onValueChange={setPageStyle}>
                <SelectTrigger id="page-style">
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Moderno</SelectItem>
                  <SelectItem value="minimalist">Minimalista</SelectItem>
                  <SelectItem value="bold">Arrojado</SelectItem>
                  <SelectItem value="corporate">Corporativo</SelectItem>
                  <SelectItem value="creative">Criativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color-scheme" className="text-sm font-medium mb-2 block">Esquema de Cores</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger id="color-scheme">
                  <SelectValue placeholder="Selecione o esquema de cores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automático (baseado na ideia)</SelectItem>
                  <SelectItem value="blue">Azul</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="purple">Roxo</SelectItem>
                  <SelectItem value="orange">Laranja</SelectItem>
                  <SelectItem value="red">Vermelho</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </ToolModalBase>
  );
};