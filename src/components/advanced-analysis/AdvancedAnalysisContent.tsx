
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MindMap } from "./MindMap";
import {
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  CalendarDays,
  ChartPieIcon,
  BarChart,
  DollarSign,
  TargetIcon,
  GlobeIcon,
  Clock,
  LightbulbIcon,
  PercentIcon,
  AwardIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdvancedAnalysisContentProps {
  analysis: any;
}

export function AdvancedAnalysisContent({ analysis }: AdvancedAnalysisContentProps) {
  const { t } = useTranslation();
  
  if (!analysis) {
    return (
      <div className="p-4 text-center">
        <p>{t('analysis.noData', "Nenhuma análise encontrada")}</p>
      </div>
    );
  }

  // Extract data from analysis with default fallbacks
  const businessName = analysis.businessName || {};
  const summary = analysis.summary || {};
  const differentials = analysis.differentials || [];
  const pitch = analysis.pitch || "";
  const marketAnalysis = analysis.marketAnalysis || {};
  const personas = analysis.personas || [];
  const monetization = analysis.monetization || {};
  const channels = analysis.channels || [];
  const competitors = analysis.competitors || [];
  const swot = analysis.swot || {};
  const risks = analysis.risks || [];
  const tools = analysis.tools || [];
  const firstSteps = analysis.firstSteps || [];
  const plan = analysis.plan || {};
  const mindMap = analysis.mindmap || null;

  return (
    <div className="space-y-10 pb-10">
      {/* Header with Name, Logo and Slogan */}
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{businessName.name || "Seu Negócio"}</h1>
          <p className="text-xl italic text-muted-foreground">{businessName.slogan || "Inovação que transforma"}</p>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge className="bg-brand-blue text-white">{summary.score || 0}%</Badge>
              <span className="font-medium">{summary.status || "Análise"}</span>
            </div>
            
            <h2 className="text-xl font-semibold">Resumo Executivo</h2>
            <p className="text-muted-foreground">{summary.description || "Descrição não fornecida"}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          {analysis.logoUrl ? (
            <div className="w-64 h-64 overflow-hidden rounded-xl shadow-lg">
              <AspectRatio ratio={1/1}>
                <img
                  src={analysis.logoUrl}
                  alt="Logo do negócio"
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          ) : (
            <div className="w-64 h-64 bg-gradient-to-br from-brand-blue to-brand-purple rounded-xl flex items-center justify-center shadow-lg">
              <LightbulbIcon className="w-24 h-24 text-white opacity-80" />
            </div>
          )}
        </div>
      </div>
      
      {/* KPI Section - NEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <TargetIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('analysis.marketPotential', "Potencial de Mercado")}</p>
                <h3 className="text-2xl font-bold">Alto</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <PercentIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('analysis.successRate', "Taxa de Sucesso")}</p>
                <h3 className="text-2xl font-bold">{summary.score || 75}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('analysis.breakEven', "Break-Even")}</p>
                <h3 className="text-2xl font-bold">{monetization?.projections?.breakEven || "18-24 meses"}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <AwardIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('analysis.innovationLevel', "Nível de Inovação")}</p>
                <h3 className="text-2xl font-bold">Médio-Alto</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Key Differentials - NEW */}
      <Card className="border-2 border-brand-blue/20">
        <CardHeader className="bg-brand-blue/5">
          <CardTitle>Diferenciais Competitivos</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {differentials.map((differential: string, idx: number) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="bg-brand-blue/10 p-2 rounded-full mt-1">
                  <Star className="h-5 w-5 text-brand-blue" />
                </div>
                <p>{differential}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Pitch */}
      <Card className="border-2 border-brand-blue/20">
        <CardHeader className="bg-brand-blue/5">
          <CardTitle>Pitch de 1 Minuto</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-4 bg-muted rounded-lg italic">
            "{pitch}"
          </div>
        </CardContent>
      </Card>

      {/* Tabs for the rest of the content */}
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="business">Negócio</TabsTrigger>
          <TabsTrigger value="strategy">Estratégia</TabsTrigger>
          <TabsTrigger value="action">Plano de Ação</TabsTrigger>
        </TabsList>
        
        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-6">
          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GlobeIcon className="mr-2 h-5 w-5" />
                Análise de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tamanho de Mercado</h3>
                <p className="text-muted-foreground">{marketAnalysis.size || "Não especificado"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tendências Principais</h3>
                <ul className="space-y-2">
                  {marketAnalysis.trends && marketAnalysis.trends.map((trend: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <TrendingUp className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* NEW: Market Barriers */}
              <div>
                <h3 className="font-semibold mb-2">Barreiras de Entrada</h3>
                <ul className="space-y-2">
                  {marketAnalysis.barriers && marketAnalysis.barriers.map((barrier: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Competitor Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartPieIcon className="mr-2 h-5 w-5" />
                Análise Competitiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Principais Concorrentes</h3>
                  <ul className="space-y-2">
                    {competitors.map((competitor: any, idx: number) => (
                      <li key={idx} className="bg-muted p-3 rounded-md">
                        <div className="font-medium">{competitor.name}</div>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <p className="text-xs font-medium text-green-600 mb-1">Pontos Fortes:</p>
                            <ul className="text-sm space-y-1">
                              {competitor.strengths && competitor.strengths.map((strength: string, i: number) => (
                                <li key={i} className="text-muted-foreground">- {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-red-600 mb-1">Pontos Fracos:</p>
                            <ul className="text-sm space-y-1">
                              {competitor.weaknesses && competitor.weaknesses.map((weakness: string, i: number) => (
                                <li key={i} className="text-muted-foreground">- {weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Seus Diferenciais</h3>
                  <ul className="space-y-2">
                    {differentials.map((diff: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Personas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Personas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {personas.map((persona: any, idx: number) => (
                  <div key={idx} className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-brand-blue/20 p-2 rounded-full">
                        <Users className="h-5 w-5 text-brand-blue" />
                      </div>
                      <h3 className="font-semibold">{persona.name}</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{persona.description}</p>
                    
                    <div className="space-y-2 mt-4">
                      <div>
                        <span className="text-xs font-medium">Características:</span>
                        <ul className="text-sm space-y-1 mt-1">
                          <li>Idade: {persona.name.split(',')[1] || "N/A"}</li>
                          <li>Ocupação: {persona.occupation || "Diversas"}</li>
                          <li>Comportamento: {persona.behavior || "Não especificado"}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Business Model Tab */}
        <TabsContent value="business" className="space-y-6">
          {/* Business Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Modelo de Negócio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Proposta de Valor</h3>
                  <p className="text-muted-foreground mb-4">
                    {summary.description || "A proposta de valor deste negócio é entregar uma solução inovadora que resolve problemas reais do mercado alvo."}
                  </p>
                  
                  <h3 className="font-semibold mt-4 mb-2">Segmentos de Clientes</h3>
                  <ul className="space-y-2">
                    {personas.map((persona: any, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <Users className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                        <span>{persona.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Canais de Distribuição</h3>
                  <ul className="space-y-2">
                    {channels.map((channel: any, idx: number) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <div className="bg-brand-blue/10 p-1 rounded-full mt-0.5">
                          <ChevronRight className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-sm text-muted-foreground">{channel.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Monetization Models - Updated */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Modelos de Monetização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {monetization.models && monetization.models.map((model: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{model.name}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        {model.revenue}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{model.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Projeções Financeiras</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Primeiro Ano</div>
                    <div className="font-semibold text-blue-700">
                      {monetization.projections?.firstYear || "R$ 250K - R$ 500K"}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Terceiro Ano</div>
                    <div className="font-semibold text-purple-700">
                      {monetization.projections?.thirdYear || "R$ 2M - R$ 5M"}  
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Break-Even</div>
                    <div className="font-semibold text-green-700">
                      {monetization.projections?.breakEven || "18-24 meses"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          {/* SWOT Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartPieIcon className="mr-2 h-5 w-5" />
                Análise SWOT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-3">Forças</h3>
                  <ul className="space-y-2">
                    {swot?.strengths && swot.strengths.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-700 mb-3">Fraquezas</h3>
                  <ul className="space-y-2">
                    {swot?.weaknesses && swot.weaknesses.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-3">Oportunidades</h3>
                  <ul className="space-y-2">
                    {swot?.opportunities && swot.opportunities.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-700 mb-3">Ameaças</h3>
                  <ul className="space-y-2">
                    {swot?.threats && swot.threats.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Risk Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Matriz de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks.map((risk: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                        <div>
                          <h3 className="font-medium">{risk.name}</h3>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${
                        risk.level === "Alto" ? "bg-red-50 text-red-700" :
                        risk.level === "Médio" ? "bg-amber-50 text-amber-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        Nível: {risk.level || "Médio"}
                      </Badge>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-1">Estratégia de Mitigação:</h4>
                      <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Mind Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LightbulbIcon className="mr-2 h-5 w-5" />
                Mapa Mental
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mindMap ? (
                <div className="bg-muted p-4 rounded-lg h-96">
                  <MindMap data={mindMap} />
                </div>
              ) : (
                <p className="text-center text-muted-foreground p-6">
                  Mapa mental não disponível
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Action Plan Tab */}
        <TabsContent value="action" className="space-y-6">
          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Plano de Ação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {plan && Object.entries(plan).map(([period, actions]: [string, any], idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-lg mb-3">
                      {period === "thirtyDays" ? "Primeiros 30 Dias" : 
                       period === "sixtyDays" ? "60 Dias" : 
                       period === "ninetyDays" ? "90 Dias" : period}
                    </h3>
                    <div className="space-y-3">
                      {actions && actions.map((action: any, actionIdx: number) => (
                        <div key={actionIdx} className="flex gap-3 items-start border-l-2 border-brand-blue pl-3 py-1">
                          <div className="bg-brand-blue/10 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-sm shrink-0">
                            {actionIdx + 1}
                          </div>
                          <div>
                            <div className="font-medium">{action.name || action.task}</div>
                            <div className="text-sm text-muted-foreground">{action.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* First Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Primeiros Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {firstSteps.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center bg-muted p-3 rounded-md">
                    <div className="bg-white p-1 rounded text-2xl">
                      {step.icon}
                    </div>
                    <span>{step.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recommended Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="mr-2 h-5 w-5" />
                Ferramentas Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tools.map((tool: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      <Badge variant="outline" className="mt-1">{tool.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex-1">
                      {tool.description || `Ferramenta recomendada para ${tool.category.toLowerCase()}`}
                    </div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={tool.url || "#"} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Acessar
                        </a>
                      </Button>
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
