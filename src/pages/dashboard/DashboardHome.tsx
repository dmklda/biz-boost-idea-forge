
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  PlusCircle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { IdeaForm } from "@/components/IdeaForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DashboardHome = () => {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [recentIdeas, setRecentIdeas] = useState<any[]>([]);
  const [ideaCount, setIdeaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [viabilityRate, setViabilityRate] = useState(0);
  const [viabilityTrend, setViabilityTrend] = useState(0);
  const [totalConsultations, setTotalConsultations] = useState(0);
  
  // Function to get month name from number
  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch total idea count
        const { count, error: countError } = await supabase
          .from('ideas')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (countError) throw countError;
        if (count !== null) setIdeaCount(count);
        
        // Fetch recent ideas
        const { data: recentIdeasData, error: recentIdeasError } = await supabase
          .from('ideas')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (recentIdeasError) throw recentIdeasError;
        setRecentIdeas(recentIdeasData || []);
        
        // Fetch idea analyses for viability rate calculation
        const { data: analysesData, error: analysesError } = await supabase
          .from('idea_analyses')
          .select('score, created_at')
          .eq('user_id', user.id);
          
        if (analysesError) throw analysesError;
        
        // Calculate viability rate from analyses scores
        if (analysesData && analysesData.length > 0) {
          // Calculate average score (viability rate)
          const totalScore = analysesData.reduce((sum, analysis) => sum + analysis.score, 0);
          const avgScore = Math.round(totalScore / analysesData.length);
          setViabilityRate(avgScore);
          
          // Calculate trend (mock for now, but could be compared to last month)
          setViabilityTrend(5); // Example: 5% increase
          
          // Count total consultations
          setTotalConsultations(analysesData.length);
          
          // Generate performance data by month
          const monthlyData: {[key: string]: {analyses: number, consultations: number}} = {};
          
          // Get current month and 5 months before
          const today = new Date();
          for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
            monthlyData[monthKey] = { analyses: 0, consultations: 0 };
          }
          
          // Populate with actual data
          analysesData.forEach(analysis => {
            const date = new Date(analysis.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].analyses += 1;
              monthlyData[monthKey].consultations += 1;
            }
          });
          
          // Convert to array format for charts
          const performanceArray = Object.entries(monthlyData).map(([key, value]) => {
            const [year, month] = key.split('-');
            return {
              name: getMonthName(parseInt(month)),
              análises: value.analyses,
              consultas: value.consultations
            };
          });
          
          setPerformanceData(performanceArray);
        } else {
          // If no analyses data, set default viability and use empty performance data
          setViabilityRate(0);
          setViabilityTrend(0);
          
          // Create empty performance data for the last 6 months
          const emptyPerformanceData = [];
          const today = new Date();
          for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            emptyPerformanceData.push({
              name: getMonthName(monthDate.getMonth() + 1),
              análises: 0,
              consultas: 0
            });
          }
          
          setPerformanceData(emptyPerformanceData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const addCredits = () => {
    // In a real app, this would redirect to a payment gateway
    // For demo purposes, we'll just add credits directly
    if (user) {
      updateUserCredits(user.credits + 5);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-purple hover:bg-brand-purple/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('dashboard.newAnalysis')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('ideaForm.title')}</DialogTitle>
              <DialogDescription>
                {t('ideaForm.subtitle')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <IdeaForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Cards with Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.statistics.totalAnalyses')}
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideaCount}</div>
            {ideaCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('dashboard.statistics.totalAnalysesDescription')}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.statistics.viabilityRate')}
            </CardTitle>
            {viabilityTrend > 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : viabilityTrend < 0 ? (
              <ArrowDown className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viabilityRate}%</div>
            <p className="text-xs text-muted-foreground">
              {viabilityTrend > 0 ? `+${viabilityTrend}%` : viabilityTrend < 0 ? `${viabilityTrend}%` : "0%"} {t('dashboard.statistics.compared')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.statistics.availableCredits')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.credits || 0}</div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-brand-purple" onClick={addCredits}>
              {t('dashboard.statistics.addCredits')}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.statistics.yourPlan')}
            </CardTitle>
            <Badge variant={user?.plan === "free" ? "outline" : "default"} className={user?.plan === "free" ? "" : "bg-brand-purple"}>
              {user?.plan === "free" ? t('dashboard.statistics.free') : t('dashboard.statistics.premium')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.plan === "free" ? t('dashboard.statistics.free') : t('dashboard.statistics.premium')}
            </div>
            {user?.plan === "free" && (
              <Link to="/planos">
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-brand-purple">
                  {t('dashboard.statistics.upgrade')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.insights.title') || "Insights"}</CardTitle>
          <CardDescription>
            {t('dashboard.insights.description') || "Análise inteligente da sua atividade recente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
              <div className="bg-brand-purple/10 rounded-full p-2 mt-1">
                <TrendingUp className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{t('dashboard.insights.activityTrend') || "Tendência de Atividade"}</h3>
                <p className="text-muted-foreground text-xs mt-1">
                  {idealCount > 3 
                    ? t('dashboard.insights.highActivity') || "Sua atividade está acima da média dos usuários."
                    : t('dashboard.insights.lowActivity') || "Crie mais análises para obter insights completos."}
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
              <div className="bg-blue-500/10 rounded-full p-2 mt-1">
                <BarChartIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{t('dashboard.insights.successRate') || "Taxa de Sucesso"}</h3>
                <p className="text-muted-foreground text-xs mt-1">
                  {viabilityRate > 60
                    ? t('dashboard.insights.goodSuccessRate') || "Suas ideias têm boa viabilidade de mercado."
                    : t('dashboard.insights.improvementNeeded') || "Considere refinar suas ideias para melhor viabilidade."}
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
              <div className="bg-green-500/10 rounded-full p-2 mt-1">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{t('dashboard.insights.nextSteps') || "Próximos Passos"}</h3>
                <p className="text-muted-foreground text-xs mt-1">
                  {user?.credits > 0 
                    ? t('dashboard.insights.hasCredits') || "Você tem créditos disponíveis para novas análises."
                    : t('dashboard.insights.needsCredits') || "Adicione créditos para continuar analisando ideias."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.tabs.analytics')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t('dashboard.charts.performanceTitle')}</CardTitle>
                <CardDescription>
                  {t('dashboard.charts.performanceDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer 
                  config={{
                    análises: {
                      label: "Análises",
                      theme: {
                        light: "#9b87f5",
                        dark: "#a48bff"
                      }
                    },
                    consultas: {
                      label: "Consultas",
                      theme: {
                        light: "#7E69AB",
                        dark: "#9182C2"
                      }
                    }
                  }}
                  className="aspect-[4/3]"
                >
                  <BarChart data={performanceData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar dataKey="análises" fill="var(--color-análises, #9b87f5)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="consultas" fill="var(--color-consultas, #7E69AB)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t('dashboard.recentIdeas.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.recentIdeas.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-4 w-4 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
                    </div>
                  ) : recentIdeas.length > 0 ? (
                    recentIdeas.map((idea) => (
                      <div key={idea.id} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {idea.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {new Date(idea.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>{t('ideas.emptyState.title')}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="mt-2">
                            {t('ideas.emptyState.button')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{t('ideaForm.title')}</DialogTitle>
                            <DialogDescription>
                              {t('ideaForm.subtitle')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <IdeaForm />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/ideias">
                  <Button variant="outline" size="sm">
                    {t('dashboard.recentIdeas.viewAll')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.progressTitle')}</CardTitle>
              <CardDescription>
                {t('dashboard.charts.progressDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer 
                config={{
                  análises: {
                    label: "Análises",
                    theme: {
                      light: "#9b87f5",
                      dark: "#a48bff"
                    }
                  }
                }}
                className="aspect-[4/3]"
              >
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="análises" stroke="var(--color-análises, #9b87f5)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;
