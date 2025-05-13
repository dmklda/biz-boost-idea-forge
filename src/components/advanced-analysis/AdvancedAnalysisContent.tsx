
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
} from "lucide-react";

interface AdvancedAnalysisContentProps {
  analysis: any;
}

export function AdvancedAnalysisContent({ analysis }: AdvancedAnalysisContentProps) {
  if (!analysis) {
    return (
      <div className="p-4 text-center">
        <p>Nenhuma análise encontrada</p>
      </div>
    );
  }

  // Extracting data from the analysis object
  const {
    name,
    slogan,
    logo,
    summary,
    market,
    competitors,
    personas,
    businessModel,
    swot,
    risks,
    channels,
    financials,
    actionPlan,
    tools,
    trends,
    pitch
  } = analysis;

  return (
    <div className="space-y-10 pb-10">
      {/* Header with Name, Logo and Slogan */}
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          <p className="text-xl italic text-muted-foreground">{slogan}</p>
          
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Resumo Executivo</h2>
            <p className="text-muted-foreground">{summary.executive}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          {logo && (
            <div className="w-64 h-64 overflow-hidden rounded-xl shadow-lg">
              <AspectRatio ratio={1/1}>
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          )}
        </div>
      </div>
      
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
              <CardTitle>Análise de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tamanho de Mercado</h3>
                <p className="text-muted-foreground">{market.size}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tendências Principais</h3>
                <ul className="space-y-2">
                  {trends && trends.map((trend: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <TrendingUp className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Competitor Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Competitiva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Principais Concorrentes</h3>
                  <ul className="space-y-2">
                    {competitors && competitors.main && competitors.main.map((competitor: any, idx: number) => (
                      <li key={idx} className="bg-muted p-3 rounded-md">
                        <div className="font-medium">{competitor.name}</div>
                        <div className="text-sm text-muted-foreground">{competitor.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Seus Diferenciais</h3>
                  <ul className="space-y-2">
                    {competitors && competitors.differentiators && competitors.differentiators.map((diff: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Competitive Matrix */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Matriz Competitiva</h3>
                {competitors && competitors.matrix && (
                  <div className="aspect-w-16 aspect-h-9 bg-muted rounded-md p-4">
                    <p className="text-center text-muted-foreground">
                      Visualização da matriz competitiva estará disponível em breve
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Personas */}
          <Card>
            <CardHeader>
              <CardTitle>Personas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {personas && personas.map((persona: any, idx: number) => (
                  <div key={idx} className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-brand-blue/20 p-2 rounded-full">
                        <Users className="h-5 w-5 text-brand-blue" />
                      </div>
                      <h3 className="font-semibold">{persona.name}, {persona.age}</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{persona.description}</p>
                    
                    <div className="space-y-2 mt-4">
                      <div>
                        <span className="text-xs font-medium">Necessidades:</span>
                        <p className="text-sm">{persona.needs}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium">Desafios:</span>
                        <p className="text-sm">{persona.challenges}</p>
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
              <CardTitle>Modelo de Negócio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Proposta de Valor</h3>
                  <p className="text-muted-foreground">{businessModel?.valueProposition}</p>
                  
                  <h3 className="font-semibold mt-4 mb-2">Segmentos de Clientes</h3>
                  <ul className="space-y-2">
                    {businessModel?.customerSegments && businessModel.customerSegments.map((segment: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <Users className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                        <span>{segment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Canais de Distribuição</h3>
                  <ul className="space-y-2">
                    {channels && channels.map((channel: any, idx: number) => (
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
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Canvas de Modelo de Negócio</h3>
                <div className="aspect-w-16 aspect-h-9 bg-muted rounded-md p-4">
                  <p className="text-center text-muted-foreground">
                    Canvas interativo estará disponível em breve
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle>Projeções Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Estrutura de Custos</h3>
                  <ul className="space-y-2">
                    {financials?.costs && financials.costs.map((cost: any, idx: number) => (
                      <li key={idx} className="flex justify-between border-b pb-1">
                        <span>{cost.description}</span>
                        <span className="font-medium">{cost.estimate}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Fontes de Receita</h3>
                  <ul className="space-y-2">
                    {financials?.revenues && financials.revenues.map((revenue: any, idx: number) => (
                      <li key={idx} className="flex justify-between border-b pb-1">
                        <span>{revenue.description}</span>
                        <span className="font-medium text-green-600">{revenue.estimate}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Previsão de Break-Even</h3>
                <p className="text-muted-foreground">{financials?.breakeven}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          {/* SWOT Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise SWOT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-3">Forças</h3>
                  <ul className="space-y-2">
                    {swot?.strengths && swot.strengths.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-700 mb-3">Fraquezas</h3>
                  <ul className="space-y-2">
                    {swot?.weaknesses && swot.weaknesses.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-3">Oportunidades</h3>
                  <ul className="space-y-2">
                    {swot?.opportunities && swot.opportunities.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-700 mb-3">Ameaças</h3>
                  <ul className="space-y-2">
                    {swot?.threats && swot.threats.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Risk Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks && risks.map((risk: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                        <div>
                          <h3 className="font-medium">{risk.name}</h3>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-50">
                        Impacto: {risk.impact}/5
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
              <CardTitle>Mapa Mental</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.mindMap ? (
                <div className="bg-muted p-4 rounded-lg h-96">
                  <MindMap data={analysis.mindMap} />
                </div>
              ) : (
                <p className="text-center text-muted-foreground p-6">
                  Mapa mental estará disponível em breve
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
              <CardTitle>Plano de Ação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {actionPlan && Object.entries(actionPlan).map(([period, actions]: [string, any], idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-lg mb-3">{period}</h3>
                    <div className="space-y-3">
                      {actions.map((action: any, actionIdx: number) => (
                        <div key={actionIdx} className="flex gap-3 items-start border-l-2 border-brand-blue pl-3 py-1">
                          <div className="bg-brand-blue/10 text-brand-blue rounded-full h-6 w-6 flex items-center justify-center text-sm shrink-0">
                            {actionIdx + 1}
                          </div>
                          <div>
                            <div className="font-medium">{action.task}</div>
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
          
          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Primeiros Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary?.checklist && summary.checklist.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center bg-muted p-3 rounded-md">
                    <div className="bg-white p-1 rounded">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recommended Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas Recomendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tools && tools.map((tool: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-sm text-muted-foreground flex-1">{tool.description}</div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer">
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
