import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MindMap } from "./MindMap";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

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
    businessName,
    summary,
    differentials,
    pitch,
    marketAnalysis,
    personas,
    monetization,
    competitors,
    swot,
    risks,
    channels,
    tools,
    firstSteps,
    plan,
    mindmap
  } = analysis;

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

  // Function to get color based on risk level
  const getRiskColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('baixo')) {
      return isDarkMode ? "text-green-400" : "text-green-600";
    } else if (lowerLevel.includes('médio')) {
      return isDarkMode ? "text-yellow-400" : "text-yellow-600";
    }
    return isDarkMode ? "text-red-400" : "text-red-600";
  };

  // Function to get badge color based on risk level
  const getRiskBadgeColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('baixo')) {
      return isDarkMode 
        ? "bg-green-900/30 text-green-300 border-green-800" 
        : "bg-green-100 text-green-700 border-green-200";
    } else if (lowerLevel.includes('médio')) {
      return isDarkMode 
        ? "bg-yellow-900/30 text-yellow-300 border-yellow-800" 
        : "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return isDarkMode 
      ? "bg-red-900/30 text-red-300 border-red-800" 
      : "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className={cn(
        "rounded-lg p-4 sm:p-6",
        isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-brand-blue/10 to-brand-purple/10"
      )}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold">{businessName?.name || "Análise de Negócio"}</h1>
            {businessName?.slogan && (
              <p className="text-sm sm:text-base italic text-muted-foreground">{businessName.slogan}</p>
            )}
            <p className="text-sm sm:text-base text-muted-foreground">{summary?.description || pitch || "Análise detalhada da viabilidade do seu negócio."}</p>
          </div>
          
          {summary?.score && (
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full border-4 shrink-0",
              summary.score >= 80 ? 
                (isDarkMode ? "border-green-500 text-green-400" : "border-green-500 text-green-600") :
                summary.score >= 60 ? 
                  (isDarkMode ? "border-yellow-500 text-yellow-400" : "border-yellow-500 text-yellow-600") :
                  (isDarkMode ? "border-red-500 text-red-400" : "border-red-500 text-red-600")
            )}>
              <span className="text-3xl font-bold">{summary.score}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 my-4">
          {summary?.status && (
            <Badge variant="outline" className={cn(
              "bg-brand-blue/10 hover:bg-brand-blue/20 border-brand-blue/20",
              isDarkMode ? "text-blue-300" : "text-blue-700"
            )}>
              Status: {summary.status}
            </Badge>
          )}
          {monetization?.projections?.breakEven && (
            <Badge variant="outline" className={cn(
              "bg-green-100 hover:bg-green-200 border-green-200",
              isDarkMode ? "bg-green-900/30 text-green-300 border-green-800" : "text-green-700"
            )}>
              Break-even: {monetization.projections.breakEven}
            </Badge>
          )}
          {plan?.thirtyDays && (
            <Badge variant="outline" className={cn(
              "bg-purple-100 hover:bg-purple-200 border-purple-200",
              isDarkMode ? "bg-purple-900/30 text-purple-300 border-purple-800" : "text-purple-700"
            )}>
              Plano 30-90 dias
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4">
          <div className={cn(
            "p-3 sm:p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">Viabilidade</div>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-2xl font-bold">
                {summary?.score || 85}%
              </div>
              <Progress value={summary?.score || 85} className="w-12 sm:w-20 h-2" />
            </div>
          </div>
          
          <div className={cn(
            "p-3 sm:p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">Mercado</div>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-2xl font-bold">
                4/5
              </div>
              {renderRating(4)}
            </div>
          </div>
          
          <div className={cn(
            "p-3 sm:p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">Diferenciais</div>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-2xl font-bold">
                {differentials?.length || 5}
              </div>
              <div className="text-xs text-muted-foreground">itens</div>
            </div>
          </div>
          
          <div className={cn(
            "p-3 sm:p-4 rounded-lg flex flex-col justify-between",
            isDarkMode ? "bg-slate-700" : "bg-white shadow-sm"
          )}>
            <div className="text-xs uppercase text-muted-foreground mb-1">ROI Estimado</div>
            <div className="text-lg sm:text-2xl font-bold">
              {monetization?.projections?.roi || "120%"}
            </div>
          </div>
        </div>
      </div>

      {/* Mind Map Overview */}
      <Card className={cn(
        "border",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Visão Geral do Negócio</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
          <MindMap 
            data={mindmap || {
              id: "root",
              label: businessName?.name || "Sua Ideia",
              children: [
                {
                  id: "market",
                  label: "Mercado",
                  children: [
                    { id: "audience", label: "Público-Alvo" },
                    { id: "trends", label: "Tendências" },
                    { id: "competitors", label: "Concorrência" }
                  ]
                },
                {
                  id: "product",
                  label: "Produto",
                  children: [
                    { id: "features", label: "Funcionalidades" },
                    { id: "diff", label: "Diferenciais" },
                    { id: "tech", label: "Tecnologia" }
                  ]
                },
                {
                  id: "business",
                  label: "Negócio",
                  children: [
                    { id: "model", label: "Modelo de Receita" },
                    { id: "growth", label: "Crescimento" },
                    { id: "finance", label: "Finanças" }
                  ]
                }
              ]
            }}
            className="min-h-[250px] sm:min-h-[300px] overflow-x-auto py-4"
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
          "overflow-x-auto pb-2 hide-scrollbar",
          isDarkMode ? "scrollbar-thumb-slate-700 scrollbar-track-slate-800" : ""
        )}>
          <TabsList className={cn(
            "w-full justify-start px-2",
            isDarkMode ? "bg-slate-800" : ""
          )}>
            <TabsTrigger value="overview" className="px-3 py-1.5 text-sm">Resumo</TabsTrigger>
            <TabsTrigger value="market" className="px-3 py-1.5 text-sm">Mercado</TabsTrigger>
            <TabsTrigger value="customer" className="px-3 py-1.5 text-sm">Cliente</TabsTrigger>
            <TabsTrigger value="competition" className="px-3 py-1.5 text-sm">Concorrência</TabsTrigger>
            <TabsTrigger value="swot" className="px-3 py-1.5 text-sm">SWOT</TabsTrigger>
            <TabsTrigger value="monetization" className="px-3 py-1.5 text-sm">Monetização</TabsTrigger>
            <TabsTrigger value="risk" className="px-3 py-1.5 text-sm">Riscos</TabsTrigger>
            <TabsTrigger value="plan" className="px-3 py-1.5 text-sm">Implementação</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Resumo Executivo</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Conceito do Negócio</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{pitch || "Não especificado"}</p>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Diferenciais</h3>
                <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1">
                  {differentials?.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  )) || <li>Não especificado</li>}
                </ul>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Primeiros Passos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                  {firstSteps?.map((step: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-3 rounded-lg border text-center flex flex-col items-center",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div className="text-2xl mb-2">{step.icon}</div>
                      <div className="text-xs sm:text-sm font-medium">{step.name}</div>
                    </div>
                  )) || <div className="col-span-5 text-muted-foreground">Não especificado</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Análise de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Tamanho do Mercado</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{marketAnalysis?.size || "Não especificado"}</p>
                  
                  <h3 className="text-base sm:text-lg font-semibold mt-4 mb-2">Público-Alvo</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{marketAnalysis?.targetAudience || "Não especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Tendências de Mercado</h3>
                  <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1">
                    {marketAnalysis?.trends?.map((trend: string, index: number) => (
                      <li key={index}>{trend}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                  
                  <h3 className="text-base sm:text-lg font-semibold mt-4 mb-2">Barreiras de Entrada</h3>
                  <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1">
                    {marketAnalysis?.barriers?.map((barrier: string, index: number) => (
                      <li key={index}>{barrier}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Análise de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Personas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personas?.map((persona: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                      )}
                    >
                      <h4 className="font-medium mb-2">{persona.name || `Persona ${index + 1}`}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{persona.description}</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {persona.occupation && <div><strong>Ocupação:</strong> {persona.occupation}</div>}
                        {persona.behavior && <div><strong>Comportamento:</strong> {persona.behavior}</div>}
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhuma persona definida</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Canais de Aquisição</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {channels?.map((channel: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                      )}
                    >
                      <h4 className="font-medium text-sm">{channel.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhum canal específico identificado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competition" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Análise de Concorrentes</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-6">
              <div className="space-y-4">
                {competitors?.map((competitor: any, index: number) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-4 rounded-lg border",
                      isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                    )}
                  >
                    <h4 className="font-medium mb-3">{competitor.name || `Concorrente ${index + 1}`}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center">
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Pontos Fortes
                        </h5>
                        <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1">
                          {competitor.strengths?.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          )) || <li>Não especificado</li>}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center">
                          <X className="h-4 w-4 mr-1 text-red-500" />
                          Pontos Fracos
                        </h5>
                        <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1">
                          {competitor.weaknesses?.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          )) || <li>Não especificado</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Nenhum concorrente específico identificado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Análise SWOT</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className={cn(
                  "p-4 rounded-lg",
                  isDarkMode ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-100"
                )}>
                  <h3 className={cn(
                    "text-base sm:text-lg font-semibold mb-3",
                    isDarkMode ? "text-green-300" : "text-green-700"
                  )}>
                    Forças
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {swot?.strengths?.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div className={cn(
                  "p-4 rounded-lg",
                  isDarkMode ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-100"
                )}>
                  <h3 className={cn(
                    "text-base sm:text-lg font-semibold mb-3",
                    isDarkMode ? "text-red-300" : "text-red-700"
                  )}>
                    Fraquezas
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {swot?.weaknesses?.map((weakness: string, index: number) => (
                      <li key={index}>{weakness}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div className={cn(
                  "p-4 rounded-lg",
                  isDarkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-100"
                )}>
                  <h3 className={cn(
                    "text-base sm:text-lg font-semibold mb-3",
                    isDarkMode ? "text-blue-300" : "text-blue-700"
                  )}>
                    Oportunidades
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {swot?.opportunities?.map((opportunity: string, index: number) => (
                      <li key={index}>{opportunity}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
                
                <div className={cn(
                  "p-4 rounded-lg",
                  isDarkMode ? "bg-amber-900/20 border border-amber-800" : "bg-amber-50 border border-amber-100"
                )}>
                  <h3 className={cn(
                    "text-base sm:text-lg font-semibold mb-3",
                    isDarkMode ? "text-amber-300" : "text-amber-700"
                  )}>
                    Ameaças
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {swot?.threats?.map((threat: string, index: number) => (
                      <li key={index}>{threat}</li>
                    )) || <li>Não especificado</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetization" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Modelos de Monetização</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {monetization?.models?.map((model: any, index: number) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-4 rounded-lg border",
                      isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white shadow-sm"
                    )}
                  >
                    <h4 className="font-medium mb-2">{model.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                    <div className="text-sm font-medium mt-2">
                      {model.revenue && (
                        <div className={isDarkMode ? "text-green-300" : "text-green-600"}>
                          {model.revenue}
                        </div>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Nenhum modelo específico identificado</p>
                )}
              </div>
              
              <Separator className={isDarkMode ? "bg-slate-700" : ""} />
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Projeções Financeiras</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={cn(
                    "p-3 rounded-lg border",
                    isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white shadow-sm"
                  )}>
                    <div className="text-xs uppercase text-muted-foreground mb-1">Primeiro Ano</div>
                    <div className="text-base font-medium">
                      {monetization?.projections?.firstYear || "$ 250,000 - $ 500,000"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white shadow-sm"
                  )}>
                    <div className="text-xs uppercase text-muted-foreground mb-1">Terceiro Ano</div>
                    <div className="text-base font-medium">
                      {monetization?.projections?.thirdYear || "$ 2 million - $ 5 million"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white shadow-sm"
                  )}>
                    <div className="text-xs uppercase text-muted-foreground mb-1">Break Even</div>
                    <div className="text-base font-medium">
                      {monetization?.projections?.breakEven || "18-24 meses"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white shadow-sm"
                  )}>
                    <div className="text-xs uppercase text-muted-foreground mb-1">ROI Esperado</div>
                    <div className="text-base font-medium">
                      {monetization?.projections?.roi || "120% após 3 anos"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Análise de Riscos</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Riscos Identificados</h3>
                <div className="space-y-3">
                  {risks?.map((risk: any, index: number) => (
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
                          "border",
                          getRiskBadgeColor(risk.level || "Médio")
                        )}>
                          {risk.level || "Médio"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      {risk.mitigation && (
                        <div className="mt-3 p-2 rounded bg-slate-900/20">
                          <span className="text-xs font-medium">Estratégia de Mitigação:</span>
                          <p className="text-xs text-muted-foreground mt-1">{risk.mitigation}</p>
                        </div>
                      )}
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhum risco específico identificado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="mt-4 space-y-4 sm:space-y-6">
          <Card className={cn(
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          )}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Plano de Implementação</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Primeiros 30 Dias</h3>
                  <div className="space-y-3">
                    {plan?.thirtyDays?.map((item: any, index: number) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-3 rounded-lg border",
                          isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                        )}
                      >
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Nenhuma fase específica identificada</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">60 Dias</h3>
                  <div className="space-y-3">
                    {plan?.sixtyDays?.map((item: any, index: number) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-3 rounded-lg border",
                          isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                        )}
                      >
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Nenhuma fase específica identificada</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">90 Dias</h3>
                  <div className="space-y-3">
                    {plan?.ninetyDays?.map((item: any, index: number) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-3 rounded-lg border",
                          isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50"
                        )}
                      >
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Nenhuma fase específica identificada</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tools Section */}
      <Card className={cn(
        isDarkMode ? "bg-slate-800 border-slate-700" : ""
      )}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Ferramentas Recomendadas</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {tools?.map((tool: any, index: number) => (
              <div 
                key={index} 
                className={cn(
                  "p-3 rounded-lg border text-center flex flex-col items-center",
                  isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200 shadow-sm"
                )}
              >
                <div className="text-xs uppercase text-muted-foreground mb-1">{tool.category}</div>
                <div className="font-medium text-sm mb-1">{tool.name}</div>
                <div className="text-xs text-muted-foreground">{tool.description}</div>
              </div>
            )) || (
              <p className="text-muted-foreground col-span-6">Nenhuma ferramenta específica identificada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
