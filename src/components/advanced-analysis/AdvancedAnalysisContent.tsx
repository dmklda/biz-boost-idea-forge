
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useTranslation } from "react-i18next";
import { MindMap } from "./MindMap";

interface AdvancedAnalysisContentProps {
  analysis: any;
}

export function AdvancedAnalysisContent({ analysis }: AdvancedAnalysisContentProps) {
  const { t } = useTranslation();

  // If analysis is not ready yet, show a message
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-xl font-semibold mb-2">
          {t('advancedAnalysis.notReady', "Análise ainda não está pronta")}
        </h3>
        <p className="text-muted-foreground">
          {t('advancedAnalysis.pleaseWait', "Por favor, aguarde enquanto processamos sua análise")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{analysis.businessName?.name || analysis.title}</h2>
        {analysis.businessName?.slogan && (
          <p className="text-xl text-muted-foreground italic">
            "{analysis.businessName.slogan}"
          </p>
        )}
      </div>

      {/* Branding Section with Logo */}
      {analysis.logoUrl && (
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-xl font-semibold mb-3">{t('advancedAnalysis.branding', "Identidade Visual")}</h3>
            <p className="text-muted-foreground mb-4">{analysis.businessName?.justification}</p>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="w-full max-w-[240px] mx-auto">
                <AspectRatio ratio={1/1}>
                  <img 
                    src={analysis.logoUrl} 
                    alt={`${analysis.businessName?.name} logo`}
                    className="rounded-md object-contain"
                  />
                </AspectRatio>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
          <TabsTrigger value="summary">{t('common.summary', "Resumo")}</TabsTrigger>
          <TabsTrigger value="market">{t('advancedAnalysis.market', "Mercado")}</TabsTrigger>
          <TabsTrigger value="business-model">{t('advancedAnalysis.businessModel', "Modelo de Negócio")}</TabsTrigger>
          <TabsTrigger value="competitors">{t('advancedAnalysis.competitors', "Concorrentes")}</TabsTrigger>
          <TabsTrigger value="plan">{t('advancedAnalysis.plan', "Plano de Ação")}</TabsTrigger>
          <TabsTrigger value="mindmap">{t('advancedAnalysis.mindmap', "Mapa Mental")}</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('advancedAnalysis.strategicSummary', "Resumo Estratégico")}</h3>
              <div className="prose max-w-none">
                <p>{analysis.summary?.description}</p>
              </div>

              <h4 className="text-lg font-medium mt-6 mb-3">{t('advancedAnalysis.keyDifferentials', "Diferenciais Principais")}</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.differentials?.map((diff: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/30">
                    {diff}
                  </Badge>
                ))}
              </div>

              <h4 className="text-lg font-medium mt-6 mb-3">{t('advancedAnalysis.pitchTitle', "Pitch de 1 Minuto")}</h4>
              <Card className="bg-muted/50 border">
                <CardContent className="p-4">
                  <p className="italic">{analysis.pitch}</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('advancedAnalysis.marketAnalysis', "Análise de Mercado")}</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.marketSize', "Tamanho do Mercado")}</h4>
                  <p className="text-muted-foreground">{analysis.marketAnalysis?.size}</p>
                  
                  <h4 className="text-lg font-medium mt-6 mb-3">{t('advancedAnalysis.trends', "Tendências")}</h4>
                  <ul className="space-y-2">
                    {analysis.marketAnalysis?.trends?.map((trend: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.targetAudience', "Público-Alvo")}</h4>
                  <p className="text-muted-foreground mb-4">{analysis.marketAnalysis?.targetAudience}</p>
                  
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.personas', "Personas")}</h4>
                  <div className="space-y-3">
                    {analysis.personas?.map((persona: any, index: number) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-3">
                          <h5 className="font-medium">{persona.name}</h5>
                          <p className="text-sm text-muted-foreground">{persona.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-model" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('advancedAnalysis.businessModels', "Modelos de Negócio")}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.monetization', "Monetização")}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.monetization?.models?.map((model: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-1">{model.name}</h5>
                          <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                          {model.revenue && (
                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                              {t('advancedAnalysis.estimatedRevenue', "Receita estimada")}: {model.revenue}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.channels', "Canais de Aquisição")}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analysis.channels?.map((channel: any, index: number) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-3">
                          <h5 className="font-medium">{channel.name}</h5>
                          <p className="text-xs text-muted-foreground">{channel.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.recommendedTools', "Ferramentas Recomendadas")}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {analysis.tools?.map((tool: any, index: number) => (
                      <Card key={index} className="bg-brand-blue/5 border border-brand-blue/20">
                        <CardContent className="p-3">
                          <h5 className="font-medium">{tool.name}</h5>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('advancedAnalysis.competitors', "Análise Competitiva")}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.competitiveMatrix', "Matriz Competitiva")}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">{t('common.name', "Nome")}</th>
                          <th className="p-2 text-left font-medium">{t('common.strengths', "Forças")}</th>
                          <th className="p-2 text-left font-medium">{t('common.weaknesses', "Fraquezas")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {analysis.competitors?.map((competitor: any, index: number) => (
                          <tr key={index}>
                            <td className="p-2 font-medium">{competitor.name}</td>
                            <td className="p-2">
                              <ul className="list-disc list-inside text-sm">
                                {competitor.strengths?.map((strength: string, i: number) => (
                                  <li key={i}>{strength}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="p-2">
                              <ul className="list-disc list-inside text-sm">
                                {competitor.weaknesses?.map((weakness: string, i: number) => (
                                  <li key={i}>{weakness}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.swot', "Análise SWOT")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-green-700 mb-2">{t('advancedAnalysis.strengths', "Forças")}</h5>
                        <ul className="space-y-1 text-sm">
                          {analysis.swot?.strengths?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-red-700 mb-2">{t('advancedAnalysis.weaknesses', "Fraquezas")}</h5>
                        <ul className="space-y-1 text-sm">
                          {analysis.swot?.weaknesses?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-blue-700 mb-2">{t('advancedAnalysis.opportunities', "Oportunidades")}</h5>
                        <ul className="space-y-1 text-sm">
                          {analysis.swot?.opportunities?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-amber-700 mb-2">{t('advancedAnalysis.threats', "Ameaças")}</h5>
                        <ul className="space-y-1 text-sm">
                          {analysis.swot?.threats?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.riskMatrix', "Matriz de Riscos")}</h4>
                  <div className="space-y-3">
                    {analysis.risks?.map((risk: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium">{risk.name}</h5>
                            <Badge 
                              variant={risk.level === 'Alto' ? 'destructive' : 
                                     risk.level === 'Médio' ? 'warning' : 'outline'}
                            >
                              {risk.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                          <div className="mt-2">
                            <h6 className="text-sm font-medium">{t('advancedAnalysis.mitigation', "Mitigação")}:</h6>
                            <p className="text-sm">{risk.mitigation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('advancedAnalysis.actionPlan', "Plano de Ação")}</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-medium mb-4">{t('advancedAnalysis.firstSteps', "Primeiros Passos")}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysis.firstSteps?.map((step: any, index: number) => (
                      <Card key={index} className="bg-brand-light">
                        <CardContent className="p-4 text-center">
                          <div className="bg-brand-blue text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                            {step.icon || (index + 1)}
                          </div>
                          <h5 className="font-medium text-sm">{step.name}</h5>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.plan30Days', "Plano de 30 Dias")}</h4>
                  <div className="space-y-3">
                    {analysis.plan?.thirtyDays?.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="bg-brand-blue/10 text-brand-blue font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.plan60Days', "Plano de 60 Dias")}</h4>
                  <div className="space-y-3">
                    {analysis.plan?.sixtyDays?.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="bg-brand-purple/10 text-brand-purple font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-3">{t('advancedAnalysis.plan90Days', "Plano de 90 Dias")}</h4>
                  <div className="space-y-3">
                    {analysis.plan?.ninetyDays?.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="bg-brand-green/10 text-brand-green font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mindmap" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('advancedAnalysis.mindmap', "Mapa Mental do Negócio")}</h3>
              <div className="w-full h-[500px] bg-muted/50 rounded-lg overflow-hidden">
                {analysis.mindmap && <MindMap data={analysis.mindmap} />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
