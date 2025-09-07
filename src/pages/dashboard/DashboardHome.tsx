import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { toast } from "sonner";
import LoadingScreen from "@/components/ui/LoadingScreen";

const DashboardHome = () => {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [recentIdeas, setRecentIdeas] = useState<any[]>([]);
  const [ideaCount, setIdeaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [viabilityRate, setViabilityRate] = useState(0);
  const [viabilityTrend, setViabilityTrend] = useState(0);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const isMobile = useIsMobile();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to get month name from number
  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  // Handler para impedir fechar o modal durante análise
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (isAnalyzing && !open) return;
    setIsAnalysisDialogOpen(open);
  }, [isAnalyzing]);

  // Process payment success URLs
  useEffect(() => {
    const payment = searchParams.get('payment');
    const type = searchParams.get('type');
    
    if (payment === 'success') {
      if (type === 'credits') {
        toast.success('Créditos adquiridos com sucesso! 🎉');
      } else {
        toast.success('Plano atualizado com sucesso! 🎉');
      }
      
      // Clean up URL parameters
      setSearchParams(new URLSearchParams());
      
      // Refresh user data to show updated credits/plan
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else if (payment === 'cancelled') {
      toast.info('Pagamento cancelado.');
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, setSearchParams]);

  // Refactor fetchUserData into a function that can be called multiple times
  const fetchUserData = useCallback(async () => {
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
  }, [user]);
  
  // Use the refresh hook to update dashboard data when analysis is updated
  useRefreshAnalyses(fetchUserData, [fetchUserData]);
  
  useEffect(() => {
    fetchUserData();
    
    // Listen for analysis updates
    const handleAnalysisUpdate = () => {
      console.log("Analysis update detected, refreshing dashboard data");
      fetchUserData();
    };
    
    window.addEventListener('analysis-updated', handleAnalysisUpdate);
    
    return () => {
      window.removeEventListener('analysis-updated', handleAnalysisUpdate);
    };
  }, [fetchUserData]);
  
  const addCredits = () => {
    // Navigate to credits page for proper purchase flow
    navigate('/dashboard/creditos');
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      {isAnalyzing ? (
        <LoadingScreen />
      ) : (
        <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        {!isMobile && (
              <Dialog open={isAnalysisDialogOpen} onOpenChange={handleDialogOpenChange}>
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
                    <IdeaForm 
                      onAnalysisComplete={() => setIsAnalysisDialogOpen(false)}
                      onAnalysisStateChange={setIsAnalyzing}
                    />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {/* Cards with Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {t('dashboard.statistics.totalAnalyses')}
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{ideaCount}</div>
            {ideaCount > 0 && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {t('dashboard.statistics.totalAnalysesDescription')}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
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
            <div className="text-xl md:text-2xl font-bold">{viabilityRate}%</div>
            <p className="text-xs text-muted-foreground">
              {viabilityTrend > 0 ? `+${viabilityTrend}%` : viabilityTrend < 0 ? `${viabilityTrend}%` : "0%"} {t('dashboard.statistics.compared')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {t('dashboard.statistics.availableCredits')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{user?.credits || 0}</div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-brand-purple" onClick={addCredits}>
              {t('dashboard.statistics.addCredits')}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {t('dashboard.statistics.yourPlan')}
            </CardTitle>
            <Badge variant={user?.plan === "free" ? "outline" : "default"} className={user?.plan === "free" ? "" : "bg-brand-purple"}>
              {user?.plan === "free" ? 
                t('dashboard.statistics.free') : 
                user?.plan === "entrepreneur" ? 
                  t('dashboard.statistics.entrepreneur') : 
                  t('dashboard.statistics.business')
              }
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {user?.plan === "free" ? 
                t('dashboard.statistics.free') : 
                user?.plan === "entrepreneur" ? 
                  t('dashboard.statistics.entrepreneur') : 
                  t('dashboard.statistics.business')
              }
            </div>
            {user?.plan === "free" && (
              <Link to="/planos" onClick={() => toast.info("Faça upgrade para um plano pago e desbloqueie todos os recursos!")}> 
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-brand-purple">
                  {t('dashboard.statistics.upgrade')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* AI-Generated Insights Card */}
      <InsightsCard />
      
      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.tabs.analytics')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
            <Card className="col-span-1 md:col-span-4 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg md:text-xl">{t('dashboard.charts.performanceTitle')}</CardTitle>
                <CardDescription>
                  {t('dashboard.charts.performanceDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent 
                className="px-0 md:pl-2 overflow-x-auto" 
                ref={chartContainerRef}
              >
                <div className="min-w-[400px] sm:min-w-full">
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
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-3 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg md:text-xl">{t('dashboard.recentIdeas.title')}</CardTitle>
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
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">{t('dashboard.charts.progressTitle')}</CardTitle>
              <CardDescription>
                {t('dashboard.charts.progressDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 md:pl-2 overflow-x-auto">
              <div className="min-w-[400px] sm:min-w-full">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
