
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
  PlusCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
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

// Mock data for charts - in a real application this would come from the API
const performanceData = [
  { name: 'Jan', análises: 4, consultas: 2 },
  { name: 'Fev', análises: 3, consultas: 5 },
  { name: 'Mar', análises: 2, consultas: 3 },
  { name: 'Abr', análises: 7, consultas: 4 },
  { name: 'Mai', análises: 5, consultas: 6 },
  { name: 'Jun', análises: 3, consultas: 4 },
];

const DashboardHome = () => {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [recentIdeas, setRecentIdeas] = useState<any[]>([]);
  const [ideaCount, setIdeaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserIdeas = async () => {
      if (!user) return;
      
      try {
        // Fetch total idea count
        const { count, error: countError } = await supabase
          .from('ideas')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (countError) throw countError;
        if (count !== null) setIdeaCount(count);
        
        // Fetch recent ideas
        const { data, error } = await supabase
          .from('ideas')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setRecentIdeas(data || []);
      } catch (error) {
        console.error('Error fetching user ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserIdeas();
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
        <Link to="/">
          <Button className="bg-brand-purple hover:bg-brand-purple/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('dashboard.newAnalysis')}
          </Button>
        </Link>
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
            <p className="text-xs text-muted-foreground">
              +2 {t('dashboard.statistics.compared')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.statistics.viabilityRate')}
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">
              +5% {t('dashboard.statistics.compared')}
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
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="análises" fill="#9b87f5" />
                    <Bar dataKey="consultas" fill="#7E69AB" />
                  </BarChart>
                </ResponsiveContainer>
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
                      <Link to="/">
                        <Button variant="link" className="mt-2">
                          {t('ideas.emptyState.button')}
                        </Button>
                      </Link>
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
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="análises" stroke="#9b87f5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;
