import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Code, Palette, Smartphone, Download, Loader2, Copy } from "lucide-react";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface LandingPageGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LandingPageGeneratorModal = ({ open, onOpenChange }: LandingPageGeneratorModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [landingPage, setLandingPage] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { authState } = useAuth();
  const { hasCredits, deductCredits } = usePlanAccess();

  const handleGenerate = async () => {
    if (!selectedIdea) {
      toast.error("Selecione uma ideia primeiro");
      return;
    }

    if (!hasCredits('landing-page-generator')) {
      toast.error("Créditos insuficientes");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-landing-page', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setLandingPage(data.page);
      await deductCredits('landing-page-generator', selectedIdea.id);
      toast.success("Landing page gerada com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar landing page");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Código ${type} copiado para o clipboard!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Gerador de Landing Page
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          {selectedIdea && !landingPage && (
            <div className="text-center py-8">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando landing page...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Gerar Landing Page (18 créditos)
                  </>
                )}
              </Button>
            </div>
          )}

          {landingPage && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
                <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
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

              <TabsContent value="html" className="space-y-4">
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

              <TabsContent value="css" className="space-y-4">
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

              <TabsContent value="js" className="space-y-4">
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

              <TabsContent value="seo" className="space-y-4">
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
            </Tabs>
          )}

          {landingPage && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Código Completo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};