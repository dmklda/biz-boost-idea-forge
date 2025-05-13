
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target, 
  LineChart, 
  FilePlus2, 
  CheckSquare,
  Network,
  Lightbulb,
  Layers,
  FileText,
  Calendar,
  ListChecks,
  Cpu,
  Wrench
} from "lucide-react";
import { useTranslation } from "react-i18next";
import MindMap from "./MindMap";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdvancedAnalysisContentProps {
  analysis: any;
}

export function AdvancedAnalysisContent({ analysis }: AdvancedAnalysisContentProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("summary");
  
  if (!analysis) return null;
  
  return (
    <div className="space-y-8">
      {/* Brand suggestion with logo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-brand-purple" />
              {t('advancedAnalysis.strategicSummary', "Resumo Estratégico")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {analysis.strategicSummary}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-brand-purple" />
              {t('advancedAnalysis.brandSuggestion', "Sugestão de Marca")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.brandSuggestion.logoUrl && (
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-md p-2 flex items-center justify-center">
                  <img 
                    src={analysis.brandSuggestion.logoUrl} 
                    alt={`${analysis.brandSuggestion.name} logo`} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}
            <h3 className="text-xl font-bold text-center">{analysis.brandSuggestion.name}</h3>
            <p className="text-muted-foreground text-sm">
              {analysis.brandSuggestion.justification}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main tabs */}
      <Tabs defaultValue="summary" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 mb-8">
          <TabsTrigger value="summary">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.summary', "Resumo")}</span>
          </TabsTrigger>
          <TabsTrigger value="market">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.market', "Mercado")}</span>
          </TabsTrigger>
          <TabsTrigger value="personas">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.personas', "Personas")}</span>
          </TabsTrigger>
          <TabsTrigger value="business">
            <Briefcase className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.business', "Negócio")}</span>
          </TabsTrigger>
          <TabsTrigger value="strategy">
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.strategy', "Estratégia")}</span>
          </TabsTrigger>
          <TabsTrigger value="financials">
            <LineChart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.financials', "Financeiro")}</span>
          </TabsTrigger>
          <TabsTrigger value="plan">
            <FilePlus2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.plan', "Plano")}</span>
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('advancedAnalysis.tabs.tools', "Ferramentas")}</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Summary tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-brand-blue" />
                  {t('advancedAnalysis.pitchScript', "Pitch de 1 Minuto")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <p className="italic">"{analysis.pitchScript}"</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="h-5 w-5 mr-2 text-brand-green" />
                  {t('advancedAnalysis.mindMap', "Mapa Mental")}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] relative">
                {analysis.mindMap && (
                  <MindMap data={analysis.mindMap} />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-brand-purple" />
                  {t('advancedAnalysis.firstSteps', "Primeiros Passos")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.firstStepsChecklist.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-brand-purple/10 text-brand-purple rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-amber-500" />
                  {t('advancedAnalysis.competitiveMatrix', "Matriz Competitiva")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.competitors', "Concorrentes")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.competitiveMatrix.competitors.map((competitor: string, index: number) => (
                        <Badge key={index} variant="outline">{competitor}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.advantages', "Vantagens")}</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {analysis.competitiveMatrix.advantages.map((advantage: string, index: number) => (
                        <li key={index} className="text-green-600">{advantage}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.positioning', "Posicionamento")}</h4>
                    <p className="text-sm italic">"{analysis.competitiveMatrix.positioning}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Market tab */}
        <TabsContent value="market" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.marketAnalysis', "Análise de Mercado")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.marketSize', "Tamanho do Mercado")}</h3>
                  <p className="text-muted-foreground mb-4">{analysis.marketAnalysis.marketSize}</p>
                  
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.growthRate', "Taxa de Crescimento")}</h3>
                  <p className="text-muted-foreground">{analysis.marketAnalysis.growthRate}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.keyTrends', "Tendências Principais")}</h3>
                  <ul className="list-disc list-inside mb-4">
                    {analysis.marketAnalysis.keyTrends.map((trend: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{trend}</li>
                    ))}
                  </ul>
                  
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.targetSegments', "Segmentos-Alvo")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.marketAnalysis.targetSegments.map((segment: string, index: number) => (
                      <Badge key={index} variant="outline">{segment}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.techTrends', "Tendências Tecnológicas")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.techTrends.map((trend: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-brand-blue/10 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-xs mr-2 mt-0.5">
                      <Cpu className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">{trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.detailedSwot', "SWOT Detalhada")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">{t('results.swot.strengths', "Forças")}</h3>
                  <ul className="list-disc list-inside">
                    {analysis.detailedSwot.strengths.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">{t('results.swot.weaknesses', "Fraquezas")}</h3>
                  <ul className="list-disc list-inside">
                    {analysis.detailedSwot.weaknesses.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">{t('results.swot.opportunities', "Oportunidades")}</h3>
                  <ul className="list-disc list-inside">
                    {analysis.detailedSwot.opportunities.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">{t('results.swot.threats', "Ameaças")}</h3>
                  <ul className="list-disc list-inside">
                    {analysis.detailedSwot.threats.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Personas tab */}
        <TabsContent value="personas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.personas.map((persona: any, index: number) => (
              <Card key={index} className="shadow-sm">
                <CardHeader className={`bg-gradient-to-r ${
                  index % 3 === 0 ? "from-brand-blue/10 to-brand-purple/10" :
                  index % 3 === 1 ? "from-brand-green/10 to-brand-blue/10" :
                  "from-brand-purple/10 to-brand-green/10"
                }`}>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {persona.name}, {persona.age}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.occupation', "Ocupação")}</h4>
                    <p className="text-muted-foreground">{persona.occupation}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.goals', "Objetivos")}</h4>
                    <ul className="list-disc list-inside text-sm">
                      {persona.goals.map((goal: string, goalIndex: number) => (
                        <li key={goalIndex} className="text-muted-foreground">{goal}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.painPoints', "Pontos de Dor")}</h4>
                    <ul className="list-disc list-inside text-sm">
                      {persona.painPoints.map((pain: string, painIndex: number) => (
                        <li key={painIndex} className="text-muted-foreground">{pain}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('advancedAnalysis.behaviors', "Comportamentos")}</h4>
                    <ul className="list-disc list-inside text-sm">
                      {persona.behaviors.map((behavior: string, behaviorIndex: number) => (
                        <li key={behaviorIndex} className="text-muted-foreground">{behavior}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Business tab */}
        <TabsContent value="business" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.businessModels', "Modelos de Negócio")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.businessModels.map((model: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">{model.name}</h3>
                    <p className="text-muted-foreground mb-4">{model.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-green-600">{t('advancedAnalysis.pros', "Prós")}</h4>
                        <ul className="list-disc list-inside text-sm">
                          {model.pros.map((pro: string, proIndex: number) => (
                            <li key={proIndex} className="text-muted-foreground">{pro}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-red-600">{t('advancedAnalysis.cons', "Contras")}</h4>
                        <ul className="list-disc list-inside text-sm">
                          {model.cons.map((con: string, conIndex: number) => (
                            <li key={conIndex} className="text-muted-foreground">{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.acquisitionChannels', "Canais de Aquisição")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.acquisitionChannels.map((channel: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-brand-green/10 text-brand-green rounded-full h-6 w-6 flex items-center justify-center text-xs mr-2 mt-0.5">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">{channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.riskMatrix', "Matriz de Risco")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left">{t('advancedAnalysis.risk', "Risco")}</th>
                      <th className="px-4 py-2 text-center">{t('advancedAnalysis.impact', "Impacto")}</th>
                      <th className="px-4 py-2 text-center">{t('advancedAnalysis.probability', "Probabilidade")}</th>
                      <th className="px-4 py-2 text-left">{t('advancedAnalysis.mitigation', "Mitigação")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analysis.riskMatrix.map((risk: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3">{risk.risk}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={
                            risk.impact === "High" ? "destructive" : 
                            risk.impact === "Medium" ? "default" : "outline"
                          }>
                            {risk.impact}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={
                            risk.probability === "High" ? "destructive" : 
                            risk.probability === "Medium" ? "default" : "outline"
                          }>
                            {risk.probability}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{risk.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Strategy tab */}
        <TabsContent value="strategy" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {t('advancedAnalysis.competitiveMatrix', "Matriz Competitiva")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.competitors', "Concorrentes")}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {analysis.competitiveMatrix.competitors.map((competitor: string, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium">{competitor}</h4>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.advantages', "Vantagens")}</h3>
                    <ul className="list-disc list-inside">
                      {analysis.competitiveMatrix.advantages.map((advantage: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{advantage}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.disadvantages', "Desvantagens")}</h3>
                    <ul className="list-disc list-inside">
                      {analysis.competitiveMatrix.disadvantages.map((disadvantage: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{disadvantage}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.positioning', "Posicionamento")}</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="italic">"{analysis.competitiveMatrix.positioning}"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                {t('advancedAnalysis.mindMap', "Mapa Mental")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {analysis.mindMap && (
                <MindMap data={analysis.mindMap} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Financials tab */}
        <TabsContent value="financials" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('advancedAnalysis.financialOverview', "Visão Geral Financeira")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.initialInvestment', "Investimento Inicial")}</h3>
                  <p className="text-muted-foreground mb-4">{analysis.financials.initialInvestment}</p>
                  
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.breakEven', "Ponto de Equilíbrio")}</h3>
                  <p className="text-muted-foreground">{analysis.financials.breakEven}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.revenueStreams', "Fontes de Receita")}</h3>
                  <ul className="list-disc list-inside mb-4">
                    {analysis.financials.revenueStreams.map((stream: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{stream}</li>
                    ))}
                  </ul>
                  
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.costStructure', "Estrutura de Custos")}</h3>
                  <ul className="list-disc list-inside">
                    {analysis.financials.costStructure.map((cost: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{cost}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Plan tab */}
        <TabsContent value="plan" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {t('advancedAnalysis.actionPlan', "Plano de Ação")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.first30Days', "Primeiros 30 dias")}</h3>
                  <div className="border-l-2 border-brand-blue pl-4 space-y-2">
                    {analysis.actionPlan.first30Days.map((action: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.days31to60', "Dias 31 a 60")}</h3>
                  <div className="border-l-2 border-brand-purple pl-4 space-y-2">
                    {analysis.actionPlan.days31to60.map((action: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-brand-purple/10 text-brand-purple rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">{t('advancedAnalysis.days61to90', "Dias 61 a 90")}</h3>
                  <div className="border-l-2 border-brand-green pl-4 space-y-2">
                    {analysis.actionPlan.days61to90.map((action: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                {t('advancedAnalysis.firstStepsChecklist', "Checklist de Primeiros Passos")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.firstStepsChecklist.map((step: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      <CheckSquare className="h-3 w-3" />
                    </div>
                    <p className="text-muted-foreground flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tools tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                {t('advancedAnalysis.recommendedTools', "Ferramentas Recomendadas")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.recommendedTools.map((category: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-medium text-lg mb-2">{category.category}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {category.tools.map((tool: string, toolIndex: number) => (
                        <Badge key={toolIndex} variant="outline" className="py-1.5 justify-center">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListChecks className="h-5 w-5 mr-2" />
                {t('advancedAnalysis.techTrends', "Tendências Tecnológicas")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.techTrends.map((trend: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-brand-blue/10 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-xs mr-2 mt-0.5">
                      <Cpu className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">{trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
