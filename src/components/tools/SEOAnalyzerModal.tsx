import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Target, TrendingUp, Calendar, Download, Loader2 } from "lucide-react";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface SEOAnalyzerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SEOAnalyzerModal = ({ open, onOpenChange }: SEOAnalyzerModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { authState } = useAuth();
  const { hasCredits, deductCredits } = usePlanAccess();

  const handleGenerate = async () => {
    if (!selectedIdea) {
      toast.error("Selecione uma ideia primeiro");
      return;
    }

    if (!hasCredits('seo-analyzer')) {
      toast.error("Créditos insuficientes");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo-analysis', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setSeoAnalysis(data.analysis);
      await deductCredits('seo-analyzer', selectedIdea.id);
      toast.success("Análise SEO gerada com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar análise SEO");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analyzer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          {selectedIdea && !seoAnalysis && (
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
                    Analisando SEO...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analisar SEO (5 créditos)
                  </>
                )}
              </Button>
            </div>
          )}

          {seoAnalysis && (
            <Tabs defaultValue="keywords" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="technical">Técnico</TabsTrigger>
                <TabsTrigger value="calendar">Calendário</TabsTrigger>
              </TabsList>

              <TabsContent value="keywords" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Palavras-chave Principais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {seoAnalysis.keywords?.primary?.map((keyword: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{keyword.term}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Vol: {keyword.volume}</Badge>
                              <Badge variant={keyword.difficulty === 'low' ? 'default' : 'secondary'}>
                                {keyword.difficulty}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Palavras-chave Secundárias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {seoAnalysis.keywords?.secondary?.map((keyword: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{keyword}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Concorrentes SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoAnalysis.competitorAnalysis?.map((competitor: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{competitor.name}</h4>
                            <Badge variant="outline">DA: {competitor.domainAuthority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{competitor.strengths}</p>
                          <div className="flex flex-wrap gap-1">
                            {competitor.topKeywords?.map((kw: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Estratégia de Conteúdo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {seoAnalysis.contentStrategy}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Otimizações On-Page</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoAnalysis.onPageOptimization?.map((optimization: any, index: number) => (
                        <div key={index} className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold">{optimization.element}</h4>
                          <p className="text-sm text-muted-foreground">{optimization.recommendation}</p>
                          <Badge variant="outline" className="mt-1">
                            Prioridade: {optimization.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estratégias de Link Building</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seoAnalysis.linkBuilding?.map((strategy: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Aspectos Técnicos de SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoAnalysis.technicalSeo?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-semibold">{item.aspect}</h5>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                            {item.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SEO Local</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {seoAnalysis.localSeo}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas para Acompanhar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      {seoAnalysis.metrics?.map((metric: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Calendário de Conteúdo SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {seoAnalysis.contentCalendar?.map((period: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{period.month}</h4>
                            <Badge variant="outline">{period.focus}</Badge>
                          </div>
                          <div className="space-y-2">
                            {period.content?.map((content: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span>{content.title}</span>
                                <div className="flex gap-1">
                                  {content.keywords?.map((kw: string, j: number) => (
                                    <Badge key={j} variant="secondary" className="text-xs">{kw}</Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações Prioritárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seoAnalysis.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-1">{index + 1}.</span>
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {seoAnalysis && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Análise SEO
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};