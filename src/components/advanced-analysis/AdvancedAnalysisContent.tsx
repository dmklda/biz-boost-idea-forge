
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MindMap } from "./MindMap";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface AdvancedAnalysisContentProps {
  analysis: any;
}

export function AdvancedAnalysisContent({ analysis }: AdvancedAnalysisContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (!analysis) {
    return <div>Nenhuma análise disponível</div>;
  }

  // Extract data from analysis
  const {
    executive_summary,
    market_analysis,
    customer_analysis,
    competitors_analysis,
    swot,
    financial_analysis,
    risk_analysis,
    implementation_plan,
    success_metrics,
    conclusion,
  } = analysis;

  // Prepare mind map data
  const mindMapData = {
    id: "root",
    label: analysis.name || "Análise da Ideia",
    children: [
      {
        id: "market",
        label: "Mercado",
        children: [
          { id: "market-size", label: `Tamanho: ${market_analysis?.market_size || "N/A"}` },
          { id: "market-growth", label: `Crescimento: ${market_analysis?.growth_rate || "N/A"}` },
          { id: "market-trends", label: "Tendências" },
        ]
      },
      {
        id: "customer",
        label: "Cliente",
        children: [
          { id: "persona", label: "Perfis" },
          { id: "needs", label: "Necessidades" },
          { id: "behavior", label: "Comportamento" },
        ]
      },
      {
        id: "competition",
        label: "Concorrência",
        children: [
          { id: "direct", label: "Direta" },
          { id: "indirect", label: "Indireta" },
          { id: "advantage", label: "Vantagem" },
        ]
      },
      {
        id: "financials",
        label: "Finanças",
        children: [
          { id: "revenue", label: "Receita" },
          { id: "costs", label: "Custos" },
          { id: "profit", label: "Lucro" },
        ]
      },
    ]
  };

  // Function to render stars based on rating (1-5)
  const renderRating = (rating: number) => {
    const stars = [];
    const maxRating = 5;
    for (let i = 1; i <= maxRating; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else {
        stars.push(
          <span key={i} className={isDarkMode ? "text-slate-700" : "text-slate-300"}>★</span>
        );
      }
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  // Get key success metrics
  const getSuccessScore = (area: string) => {
    if (!success_metrics || !success_metrics.key_indicators) return 0;
    
    const indicator = success_metrics.key_indicators.find((i: any) => i.area?.toLowerCase() === area.toLowerCase());
    return indicator ? indicator.score : 0;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className={cn(
        "rounded-lg p-6",
        isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-brand-blue/10 to-brand-purple/10"
      )}>
        <h1 className="text-2xl font-bold mb-2">{analysis.name || "Análise Avançada de Negócio"}</h1>
        <p className="text-muted-foreground mb-4">{executive_summary?.summary || "Análise detalhada da viabilidade do seu negócio."}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {market_analysis?.market_type && (
            <Badge variant="outline" className={cn(
              "bg-brand-blue/10 hover:bg-brand-blue/20 border-brand-blue/20",
              isDarkMode ? "text-blue-300" : "text-blue-700"
            )}>
              {market_analysis.market_type}
            </Badge>
          )}
          {financial_analysis?.investment_level && (
            <Badge variant="outline" className={cn(
              "bg-green-100 hover:bg-green-200 border-green-200",
              isDarkMode ? "bg-green-900/30 text-green-300 border-green-800" : "text-green-700"
            )}>
              Investimento: {financial_analysis.investment_level}
            </Badge>
          )}
          {risk_analysis?.overall_risk && (
            <Badge variant="outline" className={cn(
              risk_analysis.overall_risk.toLowerCase() === "baixo" ? "bg-green-100 border-green-200" : 
              risk_analysis.overall_risk.toLowerCase() === "médio" ? "bg-yellow-100 border-yellow-200" : 
              "bg-red-100 border-red-200",
              isDarkMode ? 
                risk_analysis.overall_risk.toLowerCase() === "baixo" ? "bg-green-900/30 text-green-300 border-green-800" : 
                risk_analysis.overall_risk.toLowerCase() === "médio" ? "bg-yellow-900/30 text-yellow-300 border-yellow-800" : 
                "bg-red-900/30 text-red-300 border-red-800" :
                risk_analysis.overall_risk.toLowerCase() === "baixo" ? "text-green-700" : 
                risk_analysis.overall_risk.toLowerCase() === "médio" ? "text-yellow-700" : 
                "text-red-700"
            )}>
              Risco: {risk_analysis.overall_risk}
            </Badge>
          )}
          {executive_summary?.timeframe && (
            <Badge variant="outline" className={cn(
              "bg-purple-100 hover:bg-purple-200 border-purple-200",
              isDarkMode ? "bg-purple-900/30 text-purple-300 border-purple-800" : "text-purple-700"
            )}>
              Prazo: {executive_summary.timeframe}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className={cn(
            "p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">Viabilidade</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {executive_summary?.viability_score || "N/A"}%
              </div>
              <Progress value={executive_summary?.viability_score || 0} className="w-1/2 h-2" />
            </div>
          </div>
          <div className={cn(
            "p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">Potencial de Mercado</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {getSuccessScore("market") || "N/A"}/5
              </div>
              {renderRating(getSuccessScore("market"))}
            </div>
          </div>
          <div className={cn(
            "p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">Diferenciação</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {getSuccessScore("differentiation") || "N/A"}/5
              </div>
              {renderRating(getSuccessScore("differentiation"))}
            </div>
          </div>
          <div className={cn(
            "p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">ROI Esperado</div>
            <div className="text-2xl font-bold">
              {financial_analysis?.roi_estimate || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Mind Map Overview */}
      <Card className={cn(
        "border",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <MindMap 
            data={mindMapData}
            className="min-h-[300px] overflow-x-auto py-4"
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className={cn(
          "overflow-x-auto pb-2",
          isDarkMode ? "scrollbar-thumb-slate-700 scrollbar-track-slate-800" : ""
        )}>
          <TabsList className={cn(
            "w-full justify-start",
            isDarkMode ? "bg-slate-800" : ""
          )}>
            <TabsTrigger value="overview">Resumo</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="customer">Cliente</TabsTrigger>
            <TabsTrigger value="competition">Concorrência</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="financial">Finanças</TabsTrigger>
            <TabsTrigger value="risk">Riscos</TabsTrigger>
            <TabsTrigger value="plan">Implementação</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Resumo Executivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Conceito do Negócio</h3>
                <p className="text-muted-foreground">{executive_summary?.business_concept || "Não especificado"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Proposta de Valor</h3>
                <p className="text-muted-foreground">{executive_summary?.value_proposition || "Não especificado"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Avaliação Geral</h3>
                <p className="text-muted-foreground">{executive_summary?.overall_assessment || "Não especificado"}</p>
              </div>

              {conclusion?.key_takeaways && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Principais Conclusões</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {conclusion.key_takeaways.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Análise de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tamanho do Mercado</h3>
                  <p className="text-muted-foreground">{market_analysis?.market_size || "Não especificado"}</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Taxa de Crescimento</h3>
                  <p className="text-muted-foreground">{market_analysis?.growth_rate || "Não especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tendências de Mercado</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {market_analysis?.trends?.map((trend: string, index: number) => (
                      <li key={index}>{trend}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Oportunidades</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {market_analysis?.opportunities?.map((opportunity: string, index: number) => (
                      <li key={index}>{opportunity}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Análise Regulatória</h3>
                <p className="text-muted-foreground mb-2">{market_analysis?.regulatory_analysis || "Não especificado"}</p>
                
                {market_analysis?.regulatory_considerations && (
                  <ul className="list-disc list-inside text-muted-foreground">
                    {market_analysis.regulatory_considerations.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Análise de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Persona do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer_analysis?.customer_personas?.map((persona: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                      )}
                    >
                      <h4 className="font-medium mb-2">{persona.name || `Persona ${index + 1}`}</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {persona.age && <li>Idade: {persona.age}</li>}
                        {persona.occupation && <li>Ocupação: {persona.occupation}</li>}
                        {persona.income && <li>Renda: {persona.income}</li>}
                        {persona.needs && <li>Necessidades: {persona.needs}</li>}
                        {persona.pain_points && <li>Pontos de Dor: {persona.pain_points}</li>}
                        {persona.goals && <li>Objetivos: {persona.goals}</li>}
                      </ul>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhuma persona definida</p>
                  )}
                </div>
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Necessidades do Cliente</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {customer_analysis?.customer_needs?.map((need: string, index: number) => (
                    <li key={index}>{need}</li>
                  )) || <li>Não especificado</li>}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Comportamento de Compra</h3>
                <p className="text-muted-foreground mb-2">{customer_analysis?.buying_behavior || "Não especificado"}</p>
                
                {customer_analysis?.decision_factors && (
                  <>
                    <h4 className="font-medium mt-4 mb-2">Fatores de Decisão</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {customer_analysis.decision_factors.map((factor: string, index: number) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competition" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Análise de Concorrentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Principais Concorrentes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {competitors_analysis?.key_competitors?.map((competitor: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                      )}
                    >
                      <h4 className="font-medium mb-2">{competitor.name || `Concorrente ${index + 1}`}</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {competitor.market_share && <li>Participação: {competitor.market_share}</li>}
                        {competitor.strengths && <li>Forças: {competitor.strengths}</li>}
                        {competitor.weaknesses && <li>Fraquezas: {competitor.weaknesses}</li>}
                        {competitor.strategy && <li>Estratégia: {competitor.strategy}</li>}
                      </ul>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhum concorrente específico identificado</p>
                  )}
                </div>
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Vantagem Competitiva</h3>
                <p className="text-muted-foreground mb-2">{competitors_analysis?.competitive_advantage || "Não especificado"}</p>
                
                {competitors_analysis?.differentiation_factors && (
                  <>
                    <h4 className="font-medium mt-4 mb-2">Fatores de Diferenciação</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {competitors_analysis.differentiation_factors.map((factor: string, index: number) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Posicionamento de Mercado</h3>
                <p className="text-muted-foreground">{competitors_analysis?.market_positioning || "Não especificado"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Análise SWOT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn(
                  "p-5 rounded-lg",
                  isDarkMode ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-100"
                )}>
                  <h3 className={cn(
                    "text-lg font-semibold mb-3",
                    isDarkMode ? "text-green-300" : "text-green-700"
                  )}>
                    Forças
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {swot?.strengths?.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div className={cn(
                  "p-5 rounded-lg",
                  isDarkMode ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-100"
                )}>
                  <h3 className={cn(
                    "text-lg font-semibold mb-3",
                    isDarkMode ? "text-red-300" : "text-red-700"
                  )}>
                    Fraquezas
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {swot?.weaknesses?.map((weakness: string, index: number) => (
                      <li key={index}>{weakness}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div className={cn(
                  "p-5 rounded-lg",
                  isDarkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-100"
                )}>
                  <h3 className={cn(
                    "text-lg font-semibold mb-3",
                    isDarkMode ? "text-blue-300" : "text-blue-700"
                  )}>
                    Oportunidades
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {swot?.opportunities?.map((opportunity: string, index: number) => (
                      <li key={index}>{opportunity}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div className={cn(
                  "p-5 rounded-lg",
                  isDarkMode ? "bg-amber-900/20 border border-amber-800" : "bg-amber-50 border border-amber-100"
                )}>
                  <h3 className={cn(
                    "text-lg font-semibold mb-3",
                    isDarkMode ? "text-amber-300" : "text-amber-700"
                  )}>
                    Ameaças
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {swot?.threats?.map((threat: string, index: number) => (
                      <li key={index}>{threat}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
              </div>
              
              {swot?.strategic_implications && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Implicações Estratégicas</h3>
                  <p className="text-muted-foreground">{swot.strategic_implications}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Investimento Inicial</h3>
                  <p className="text-muted-foreground">{financial_analysis?.initial_investment || "Não especificado"}</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Receitas Esperadas</h3>
                  <p className="text-muted-foreground">{financial_analysis?.revenue_projections || "Não especificado"}</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Estrutura de Custos</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {financial_analysis?.cost_structure?.map((cost: string, index: number) => (
                      <li key={index}>{cost}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estimativa de ROI</h3>
                  <p className="text-muted-foreground">{financial_analysis?.roi_estimate || "Não especificado"}</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Ponto de Equilíbrio</h3>
                  <p className="text-muted-foreground">{financial_analysis?.break_even_analysis || "Não especificado"}</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Opções de Financiamento</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {financial_analysis?.funding_options?.map((option: string, index: number) => (
                      <li key={index}>{option}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Análise de Sustentabilidade</h3>
                <p className="text-muted-foreground">{financial_analysis?.sustainability_analysis || "Não especificado"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Análise de Riscos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Riscos Identificados</h3>
                <div className="space-y-3">
                  {risk_analysis?.identified_risks?.map((risk: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{risk.name || `Risco ${index + 1}`}</h4>
                        <Badge className={cn(
                          risk.severity?.toLowerCase() === "baixo" ? "bg-green-100 text-green-800" : 
                          risk.severity?.toLowerCase() === "médio" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-800",
                          isDarkMode ? 
                            risk.severity?.toLowerCase() === "baixo" ? "bg-green-900/40 border-green-800 text-green-300" : 
                            risk.severity?.toLowerCase() === "médio" ? "bg-yellow-900/40 border-yellow-800 text-yellow-300" : 
                            "bg-red-900/40 border-red-800 text-red-300" : ""
                        )}>
                          {risk.severity || "N/A"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      {risk.mitigation && (
                        <div className="mt-2">
                          <span className="text-xs font-medium">Mitigação:</span>
                          <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                        </div>
                      )}
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhum risco específico identificado</p>
                  )}
                </div>
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Fatores Críticos de Sucesso</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {risk_analysis?.critical_success_factors?.map((factor: string, index: number) => (
                    <li key={index}>{factor}</li>
                  )) || <li>Não especificado</li>}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Plano de Contingência</h3>
                <p className="text-muted-foreground">{risk_analysis?.contingency_plan || "Não especificado"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="mt-4 space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader>
              <CardTitle>Plano de Implementação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Fases de Implementação</h3>
                <div className="space-y-3">
                  {implementation_plan?.phases?.map((phase: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                      )}
                    >
                      <h4 className="font-medium mb-2">{phase.name || `Fase ${index + 1}`}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {phase.timeline && (
                          <div>
                            <span className="font-medium">Timeline:</span>
                            <p className="text-muted-foreground">{phase.timeline}</p>
                          </div>
                        )}
                        {phase.resources && (
                          <div>
                            <span className="font-medium">Recursos:</span>
                            <p className="text-muted-foreground">{phase.resources}</p>
                          </div>
                        )}
                      </div>
                      {phase.key_activities && (
                        <div className="mt-3">
                          <span className="font-medium">Atividades Principais:</span>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                            {typeof phase.key_activities === 'string' 
                              ? <li>{phase.key_activities}</li> 
                              : phase.key_activities.map((activity: string, actIdx: number) => (
                                <li key={actIdx}>{activity}</li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhuma fase específica identificada</p>
                  )}
                </div>
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Recursos Necessários</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {implementation_plan?.required_resources?.map((resource: string, index: number) => (
                    <li key={index}>{resource}</li>
                  )) || <li>Não especificado</li>}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">KPIs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {implementation_plan?.kpis?.map((kpi: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200 shadow-sm"
                      )}
                    >
                      <h4 className="font-medium text-sm">{kpi.name || `KPI ${index + 1}`}</h4>
                      {kpi.target && <p className="text-xs text-muted-foreground mt-1">Meta: {kpi.target}</p>}
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhum KPI específico identificado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conclusion */}
      <Card className={cn(
        isDarkMode ? "bg-slate-800 border-slate-700" : ""
      )}>
        <CardHeader>
          <CardTitle>Conclusão e Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{conclusion?.summary || "Não especificado"}</p>
          
          {conclusion?.recommendations && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Recomendações</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {conclusion.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {conclusion?.next_steps && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Próximos Passos</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {conclusion.next_steps.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
