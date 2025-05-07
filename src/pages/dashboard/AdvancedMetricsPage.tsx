
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Download, ArrowRight, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

// Interface for metrics data
interface MetricsData {
  monthly: {
    labels: string[];
    analyses: number[];
    averageScore: number[];
  };
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  radarData: {
    category: string;
    score: number;
  }[];
}

// Interface for chart filtering
interface ChartFilters {
  timeRange: "7days" | "30days" | "90days" | "1year" | "all";
  granularity: "daily" | "weekly" | "monthly";
}

const COLORS = ["#9b87f5", "#7E69AB", "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9"];

const AdvancedMetricsPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [filters, setFilters] = useState<ChartFilters>({
    timeRange: "30days",
    granularity: "weekly"
  });
  
  // Fetch metrics data
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!authState.user?.id) return;
      
      setLoading(true);
      
      try {
        // In a real application, you would fetch this data from your API
        // Here we're simulating the API response with mock data
        setTimeout(() => {
          // Mock data for metrics
          const mockMetricsData: MetricsData = {
            monthly: {
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              analyses: [4, 6, 8, 10, 7, 12],
              averageScore: [62, 58, 65, 70, 68, 75]
            },
            categoryDistribution: [
              { name: "SaaS", value: 35, color: "#9b87f5" },
              { name: "E-commerce", value: 25, color: "#7E69AB" },
              { name: "Mobile App", value: 20, color: "#8B5CF6" },
              { name: "Marketplace", value: 15, color: "#D946EF" },
              { name: "Other", value: 5, color: "#F97316" }
            ],
            scoreDistribution: [
              { range: "0-20%", count: 2 },
              { range: "21-40%", count: 5 },
              { range: "41-60%", count: 10 },
              { range: "61-80%", count: 15 },
              { range: "81-100%", count: 8 }
            ],
            radarData: [
              { category: "Market Fit", score: 80 },
              { category: "Innovation", score: 65 },
              { category: "Scalability", score: 75 },
              { category: "Monetization", score: 60 },
              { category: "Competition", score: 50 },
              { category: "Team Fit", score: 90 }
            ]
          };
          
          setMetricsData(mockMetricsData);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error fetching metrics data:", error);
        toast.error(t('errors.fetchingMetrics') || "Erro ao buscar métricas");
        setLoading(false);
      }
    };
    
    fetchMetricsData();
  }, [authState.user?.id, t, filters]);
  
  // Format data for trend chart
  const getTrendChartData = () => {
    if (!metricsData) return [];
    
    return metricsData.monthly.labels.map((month, index) => ({
      name: month,
      analyses: metricsData.monthly.analyses[index],
      score: metricsData.monthly.averageScore[index]
    }));
  };
  
  // Format data for score distribution chart
  const getScoreDistributionData = () => {
    if (!metricsData) return [];
    
    return metricsData.scoreDistribution;
  };
  
  // Format data for category distribution chart
  const getCategoryDistributionData = () => {
    if (!metricsData) return [];
    
    return metricsData.categoryDistribution;
  };
  
  // Format data for radar chart
  const getRadarChartData = () => {
    if (!metricsData) return [];
    
    return metricsData.radarData;
  };
  
  // Handle exporting data
  const handleExportData = () => {
    toast.success(t('metrics.exportSuccess') || "Dados exportados com sucesso");
  };
  
  // Render metric cards for overview
  const renderMetricCards = () => {
    if (!metricsData) return null;
    
    const totalAnalyses = metricsData.monthly.analyses.reduce((sum, val) => sum + val, 0);
    const avgScore = metricsData.monthly.averageScore.reduce((sum, val) => sum + val, 0) / metricsData.monthly.averageScore.length;
    const trend = 12; // Mock trend percentage
    
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {t('metrics.totalAnalyses') || "Total de Análises"}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold">{totalAnalyses}</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  +{trend}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {t('metrics.averageScore') || "Pontuação Média"}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold">{Math.round(avgScore)}%</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  +5%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {t('metrics.topCategory') || "Categoria Principal"}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold">{metricsData.categoryDistribution[0].name}</span>
                <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple">
                  {metricsData.categoryDistribution[0].value}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {t('metrics.viableIdeas') || "Ideias Viáveis"}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold">
                  {metricsData.scoreDistribution
                    .filter(item => item.range === "61-80%" || item.range === "81-100%")
                    .reduce((sum, item) => sum + item.count, 0)}
                </span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  +3
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t('metrics.title') || "Métricas Avançadas"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('metrics.subtitle') || "Análise detalhada e insights sobre suas ideias"}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleExportData}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {t('metrics.exportData') || "Exportar Dados"}
        </Button>
      </div>
      
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-2 flex-1">
          <Label htmlFor="time-range">{t('metrics.timeRange') || "Período"}</Label>
          <Select
            value={filters.timeRange}
            onValueChange={(value: any) => setFilters({ ...filters, timeRange: value })}
          >
            <SelectTrigger id="time-range">
              <SelectValue placeholder={t('metrics.selectTimeRange') || "Selecione um período"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('metrics.last7Days') || "Últimos 7 dias"}</SelectItem>
              <SelectItem value="30days">{t('metrics.last30Days') || "Últimos 30 dias"}</SelectItem>
              <SelectItem value="90days">{t('metrics.last90Days') || "Últimos 90 dias"}</SelectItem>
              <SelectItem value="1year">{t('metrics.lastYear') || "Último ano"}</SelectItem>
              <SelectItem value="all">{t('metrics.allTime') || "Todo o período"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 flex-1">
          <Label htmlFor="granularity">{t('metrics.granularity') || "Granularidade"}</Label>
          <Select
            value={filters.granularity}
            onValueChange={(value: any) => setFilters({ ...filters, granularity: value })}
          >
            <SelectTrigger id="granularity">
              <SelectValue placeholder={t('metrics.selectGranularity') || "Selecione a granularidade"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{t('metrics.daily') || "Diária"}</SelectItem>
              <SelectItem value="weekly">{t('metrics.weekly') || "Semanal"}</SelectItem>
              <SelectItem value="monthly">{t('metrics.monthly') || "Mensal"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Overview metrics */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        renderMetricCards()
      )}
      
      {/* Chart tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {t('metrics.trends') || "Tendências"}
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-1">
            <span className="inline-block h-4 w-4 rounded-full bg-brand-purple"></span>
            {t('metrics.distribution') || "Distribuição"}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <span className="inline-block h-4 w-4">
              <span className="block h-1 w-4 bg-brand-purple mb-0.5"></span>
              <span className="block h-1 w-3 bg-brand-purple mb-0.5"></span>
              <span className="block h-1 w-2 bg-brand-purple"></span>
            </span>
            {t('metrics.performance') || "Desempenho"}
          </TabsTrigger>
        </TabsList>
        
        {/* Trends tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>{t('metrics.analysisAndScoreTrend') || "Tendência de Análises e Pontuações"}</CardTitle>
              <CardDescription>
                {t('metrics.analysisAndScoreTrendDesc') || "Evolução do número de análises e pontuação média ao longo do tempo"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              {loading ? (
                <div className="h-80 w-full bg-muted/30 rounded-lg animate-pulse"></div>
              ) : (
                <div className="h-80">
                  <ChartContainer
                    config={{
                      analyses: {
                        label: t('metrics.analyses') || "Análises",
                        theme: {
                          light: "#9b87f5",
                          dark: "#a48bff"
                        }
                      },
                      score: {
                        label: t('metrics.averageScore') || "Pontuação Média",
                        theme: {
                          light: "#7E69AB",
                          dark: "#9182C2"
                        }
                      }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTrendChartData()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend content={<ChartLegendContent />} />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="analyses" 
                          stroke="var(--color-analyses, #9b87f5)" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="score" 
                          stroke="var(--color-score, #7E69AB)" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>{t('metrics.scoreDistribution') || "Distribuição de Pontuações"}</CardTitle>
                <CardDescription>
                  {t('metrics.scoreDistributionDesc') || "Distribuição das pontuações por faixas"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                {loading ? (
                  <div className="h-60 w-full bg-muted/30 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="h-60">
                    <ChartContainer
                      config={{
                        count: {
                          label: t('metrics.ideaCount') || "Quantidade de Ideias",
                          theme: {
                            light: "#9b87f5",
                            dark: "#a48bff"
                          }
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getScoreDistributionData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count, #9b87f5)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>{t('metrics.ideaRadar') || "Radar de Ideias"}</CardTitle>
                <CardDescription>
                  {t('metrics.ideaRadarDesc') || "Desempenho em diferentes dimensões de análise"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                {loading ? (
                  <div className="h-60 w-full bg-muted/30 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarChartData()}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar 
                          name="Score" 
                          dataKey="score" 
                          stroke="#9b87f5" 
                          fill="#9b87f5" 
                          fillOpacity={0.6} 
                        />
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Distribution tab */}
        <TabsContent value="distribution" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>{t('metrics.categoryDistribution') || "Distribuição por Categoria"}</CardTitle>
              <CardDescription>
                {t('metrics.categoryDistributionDesc') || "Distribuição percentual das ideias por categoria"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 w-full bg-muted/30 rounded-lg animate-pulse"></div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryDistributionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCategoryDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        formatter={(value, entry, index) => {
                          const item = getCategoryDistributionData()[index];
                          return <span style={{ color: "var(--foreground)" }}>{value}: {item.value}%</span>;
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, ""]}
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--border)",
                          borderRadius: "var(--radius)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>{t('metrics.performanceInsights') || "Insights de Desempenho"}</CardTitle>
              <CardDescription>
                {t('metrics.performanceInsightsDesc') || "Análise de desempenho das suas ideias"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      {t('metrics.topPerforming') || "Melhor Desempenho"}
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">SaaS para Gestão de Tarefas</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Plataforma para equipes remotas gerenciarem tarefas
                          </p>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500">
                          92%
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Pontuação</span>
                          <span>92/100</span>
                        </div>
                        <div className="h-2 w-full bg-secondary mt-1 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "92%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      {t('metrics.improvementNeeded') || "Precisa de Melhoria"}
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">App de Entrega de Alimentos</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Serviço de entrega de comida para pequenos restaurantes
                          </p>
                        </div>
                        <Badge className="bg-red-500/10 text-red-600 border-red-500">
                          38%
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Pontuação</span>
                          <span>38/100</span>
                        </div>
                        <div className="h-2 w-full bg-secondary mt-1 rounded-full">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: "38%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">
                    {t('metrics.recommendations') || "Recomendações"}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-brand-purple shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">Foque em soluções SaaS</span>: 
                        {" "}Suas ideias de software como serviço têm desempenho consistentemente acima da média.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-brand-purple shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">Revise estratégias de monetização</span>: 
                        {" "}Esse é o ponto mais fraco na maioria das ideias analisadas.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-brand-purple shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">Considere parcerias estratégicas</span>: 
                        {" "}Ideias com foco em parcerias têm 25% mais chance de serem viáveis.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Custom label for pie chart
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default AdvancedMetricsPage;
