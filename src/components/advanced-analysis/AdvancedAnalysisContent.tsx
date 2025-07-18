import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MindMap } from "./MindMap";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Check, X, TrendingUp, Target, DollarSign, CheckCircle, AlertCircle, Star, Users, BarChart3, Lightbulb, Shield, Zap, Calendar, Wrench, Rocket, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdvancedAnalysisContentProps {
  analysis: any;
}

// Componente de Progress Bar Circular
function CircularProgress({ value, size = 80, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - value / 100);

  const getColor = (value: number) => {
    if (value >= 80) return "#10b981"; // Green
    if (value >= 60) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
}

// Componente de Rating com Estrelas
function StarRating({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">{rating}/{maxRating}</span>
    </div>
  );
}

export function AdvancedAnalysisContent({ analysis }: AdvancedAnalysisContentProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [activeTab, setActiveTab] = useState("overview");

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t("common.noData", "Nenhum dado disponível")}</p>
        </div>
      </div>
    );
  }

  const {
    businessName,
    summary,
    differentials,
    pitch,
    marketAnalysis,
    personas,
    monetization,
    channels,
    competitors,
    swot,
    risks,
    tools,
    firstSteps,
    plan,
    mindmap
  } = analysis;

  const business_name = businessName?.name || "Nome do Negócio";
  const slogan = businessName?.slogan || "Slogan do Negócio";
  const concept = summary?.description || pitch || "Descrição do conceito";
  const viability_score = summary?.score || 75;
  const market_rating = 4; // Placeholder
  const differentiators_count = differentials?.length || 0;
  const estimated_roi = monetization?.projections?.roi?.replace(/\D/g, "") || "25";
  // Determina o status baseado no score de viabilidade
  const getStatusFromScore = (score: number) => {
    if (score >= 70) return "viable";
    if (score >= 40) return "moderate";
    return "unviable";
  };
  
  const status = getStatusFromScore(viability_score);
  const break_even_months = monetization?.projections?.breakEven?.replace(/\D/g, "") || "12";

  return (
    <div className="space-y-6">
      {/* Header Card com Gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-white to-blue-50 border border-purple-100 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
        <div className="relative p-4 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{business_name}</h1>
              <p className="text-base md:text-lg text-purple-600 italic mb-4">{slogan}</p>
              <p className="text-gray-600 leading-relaxed max-w-2xl">{concept}</p>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-6">
                <Badge 
                  variant={
                    status === "viable" ? "default" : 
                    status === "moderate" ? "secondary" : 
                    "destructive"
                  } 
                  className={cn(
                    "px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm",
                    status === "viable" ? "bg-green-500 hover:bg-green-600 text-white" :
                    status === "moderate" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                    "bg-red-500 hover:bg-red-600 text-white"
                  )}
                >
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  {t('results.status.label', 'Status')}: {t(`results.status.${status}`, status)}
                </Badge>
                <Badge variant="secondary" className="px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Break-even: {break_even_months} meses
                </Badge>
                <Badge variant="outline" className="px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm">
                  <Target className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Plano 30-90 dias
                </Badge>
              </div>
          </div>
          
            {/* Circular Progress */}
            <div className="flex justify-center lg:ml-8">
              <CircularProgress value={viability_score} size={80} />
            </div>
          </div>
        </div>
        </div>

      {/* Métricas Principais - Responsivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Viabilidade */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">VIABILIDADE</CardTitle>
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{viability_score}%</div>
            <Progress value={viability_score} className="h-2" />
          </CardContent>
        </Card>

        {/* Mercado */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">MERCADO</CardTitle>
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Target className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{market_rating}/5</div>
            <StarRating rating={market_rating} />
          </CardContent>
        </Card>

        {/* Diferenciais */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">DIFERENCIAIS</CardTitle>
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{differentiators_count}</div>
            <p className="text-xs md:text-sm text-gray-600">itens identificados</p>
          </CardContent>
        </Card>

        {/* ROI Estimado */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">ROI ESTIMADO</CardTitle>
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
          </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{estimated_roi}%</div>
            <p className="text-xs md:text-sm text-gray-600">retorno esperado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análise Detalhada */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 min-w-max">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="market" className="text-xs md:text-sm">Mercado</TabsTrigger>
            <TabsTrigger value="monetization" className="text-xs md:text-sm">Monetização</TabsTrigger>
            <TabsTrigger value="swot" className="text-xs md:text-sm">SWOT</TabsTrigger>
            <TabsTrigger value="competitors" className="text-xs md:text-sm">Concorrência</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs md:text-sm">Ferramentas</TabsTrigger>
            <TabsTrigger value="plan" className="text-xs md:text-sm">Plano de Ação</TabsTrigger>
            <TabsTrigger value="mindmap" className="text-xs md:text-sm">Mapa Mental</TabsTrigger>
          </TabsList>
        </div>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Pitch */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Elevator Pitch</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Apresentação concisa do negócio</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">{pitch}</p>
            </CardContent>
          </Card>

          {/* Diferenciais */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              <div>
                  <CardTitle className="text-lg md:text-xl">Diferenciais Competitivos</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">O que torna seu negócio único</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {differentials?.map((diff: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm md:text-base">{diff}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personas */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              <div>
                  <CardTitle className="text-lg md:text-xl">Personas do Cliente</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Perfis dos clientes ideais</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {personas?.map((persona: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{persona.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{persona.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div><strong>Ocupação:</strong> {persona.occupation}</div>
                      <div><strong>Comportamento:</strong> {persona.behavior}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Primeiros Passos */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Rocket className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Primeiros Passos</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Ações iniciais para começar</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {firstSteps?.map((step: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg border text-center flex flex-col items-center bg-orange-50">
                    <div className="text-2xl mb-2">{step.icon}</div>
                    <div className="text-xs md:text-sm font-medium text-gray-700">{step.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Mercado */}
        <TabsContent value="market" className="space-y-6 mt-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Análise de Mercado</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Tamanho, público-alvo e tendências</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Tamanho do Mercado</h4>
                <p className="text-gray-700 text-sm md:text-base">{marketAnalysis?.size}</p>
              </div>
              
                <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Público-Alvo</h4>
                <p className="text-gray-700 text-sm md:text-base">{marketAnalysis?.targetAudience}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Tendências de Mercado</h4>
                <div className="grid gap-2">
                  {marketAnalysis?.trends?.map((trend: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                      <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{trend}</span>
                    </div>
                  ))}
                </div>
                </div>
                
                <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Barreiras de Entrada</h4>
                <div className="grid gap-2">
                  {marketAnalysis?.barriers?.map((barrier: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{barrier}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canais de Aquisição */}
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Canais de Aquisição</h4>
                <div className="grid gap-3">
                  {channels?.map((channel: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{channel.name}</h5>
                      <p className="text-xs md:text-sm text-gray-600">{channel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Monetização */}
        <TabsContent value="monetization" className="space-y-6 mt-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Modelos de Monetização</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Estratégias de geração de receita</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {monetization?.models?.map((model: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{model.name}</h4>
                    <p className="text-gray-600 mb-2 text-sm md:text-base">{model.description}</p>
                    <div className="text-sm font-medium text-green-600">
                      Receita: {model.revenue}
                    </div>
                </div>
                ))}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-4 text-sm md:text-base">Projeções Financeiras</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">
                      {monetization?.projections?.firstYear}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Receita no 1º ano</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">
                      {monetization?.projections?.thirdYear}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Receita no 3º ano</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-yellow-600 mb-1">
                      {monetization?.projections?.breakEven}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Break-even</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">
                      {monetization?.projections?.roi}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">ROI esperado</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise SWOT */}
        <TabsContent value="swot" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-green-700">Forças</CardTitle>
                    <p className="text-xs md:text-sm text-gray-600">Pontos fortes internos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {swot?.strengths?.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-red-700">Fraquezas</CardTitle>
                    <p className="text-xs md:text-sm text-gray-600">Pontos fracos internos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {swot?.weaknesses?.map((weakness: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                      <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-blue-700">Oportunidades</CardTitle>
                    <p className="text-xs md:text-sm text-gray-600">Fatores externos favoráveis</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {swot?.opportunities?.map((opportunity: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-orange-700">Ameaças</CardTitle>
                    <p className="text-xs md:text-sm text-gray-600">Fatores externos desfavoráveis</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {swot?.threats?.map((threat: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{threat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Concorrência */}
        <TabsContent value="competitors" className="space-y-6 mt-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Análise da Concorrência</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Principais competidores e posicionamento</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitors?.map((competitor: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">{competitor.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2 text-sm md:text-base">Pontos Fortes</h5>
                        <ul className="space-y-1">
                          {competitor.strengths?.map((strength: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs md:text-sm">
                              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-2 text-sm md:text-base">Pontos Fracos</h5>
                        <ul className="space-y-1">
                          {competitor.weaknesses?.map((weakness: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs md:text-sm">
                              <X className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ferramentas */}
        <TabsContent value="tools" className="space-y-6 mt-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Wrench className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Ferramentas Recomendadas</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Ferramentas essenciais para o negócio</p>
                </div>
                </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools?.map((tool: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-indigo-50">
                    <div className="text-xs uppercase text-indigo-600 mb-1 font-medium">{tool.category}</div>
                    <div className="font-medium text-sm md:text-base mb-1 text-gray-900">{tool.name}</div>
                    <div className="text-xs md:text-sm text-gray-600">{tool.description}</div>
                </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plano de Ação */}
        <TabsContent value="plan" className="space-y-6 mt-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Plano de Implementação</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Cronograma de ações para os próximos 90 dias</p>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 30 Dias */}
              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Primeiros 30 Dias
                </h4>
                <div className="grid gap-3">
                  {plan?.thirtyDays?.map((item: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-blue-50">
                      <h5 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{item.name}</h5>
                      <p className="text-xs md:text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                    </div>
                  </div>
                  
              {/* 60 Dias */}
              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  60 Dias
                </h4>
                <div className="grid gap-3">
                  {plan?.sixtyDays?.map((item: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                      <h5 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{item.name}</h5>
                      <p className="text-xs md:text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 90 Dias */}
              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  90 Dias
                </h4>
                <div className="grid gap-3">
                  {plan?.ninetyDays?.map((item: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-green-50">
                      <h5 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{item.name}</h5>
                      <p className="text-xs md:text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mapa Mental */}
        <TabsContent value="mindmap" className="space-y-6 mt-6">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Target className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">Mapa Mental</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Visualize a estrutura do seu negócio</p>
                      </div>
                  </div>
            </CardHeader>
            <CardContent>
              {mindmap ? (
                <div className="overflow-x-auto">
                  <MindMap data={mindmap} />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Mapa Mental</p>
                    <p className="text-sm text-gray-400">Visualização interativa em desenvolvimento</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
