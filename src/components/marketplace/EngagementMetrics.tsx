import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Activity, 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Star, 
  Target, 
  Zap, 
  BarChart3, 
  RefreshCw,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Timer
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface EngagementMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  description: string;
}

interface ValidationEngagement {
  validation_id: string;
  title: string;
  views: number;
  applications: number;
  responses: number;
  avg_response_time: number;
  completion_rate: number;
  quality_score: number;
  engagement_score: number;
  created_at: string;
}

interface UserEngagement {
  user_id: string;
  name: string;
  total_validations: number;
  avg_response_time: number;
  quality_score: number;
  engagement_level: 'low' | 'medium' | 'high' | 'expert';
  last_activity: string;
  streak_days: number;
}

interface RealTimeMetrics {
  active_users: number;
  ongoing_validations: number;
  responses_today: number;
  avg_session_duration: number;
  bounce_rate: number;
  conversion_rate: number;
}

const EngagementMetrics = () => {
  const { authState } = useAuth();
  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [validationEngagement, setValidationEngagement] = useState<ValidationEngagement[]>([]);
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchEngagementData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchEngagementData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const fetchEngagementData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real-time metrics
      const realTimeData = await fetchRealTimeMetrics();
      setRealTimeMetrics(realTimeData);
      
      // Fetch validation engagement
      const validationData = await fetchValidationEngagement();
      setValidationEngagement(validationData);
      
      // Fetch user engagement
      const userData = await fetchUserEngagement();
      setUserEngagement(userData);
      
      // Calculate derived metrics
      const derivedMetrics = calculateDerivedMetrics(realTimeData, validationData, userData);
      setMetrics(derivedMetrics);
      
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      toast.error('Erro ao carregar métricas de engajamento');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealTimeMetrics = async (): Promise<RealTimeMetrics> => {
    // Simulate real-time data - in production, this would come from analytics service
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get active validations count
    const { count: activeValidations } = await supabase
      .from('validation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    // Get responses today
    const { count: responsesToday } = await supabase
      .from('validation_responses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());
    
    return {
      active_users: Math.floor(Math.random() * 50) + 20, // Simulated
      ongoing_validations: activeValidations || 0,
      responses_today: responsesToday || 0,
      avg_session_duration: Math.floor(Math.random() * 20) + 10, // Simulated
      bounce_rate: Math.random() * 30 + 20, // Simulated
      conversion_rate: Math.random() * 15 + 5 // Simulated
    };
  };

  const fetchValidationEngagement = async (): Promise<ValidationEngagement[]> => {
    const { data: validations, error } = await supabase
      .from('validation_requests')
      .select(`
        id,
        title,
        created_at,
        validation_responses(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return validations?.map(validation => ({
      validation_id: validation.id,
      title: validation.title,
      views: Math.floor(Math.random() * 100) + 20, // Simulated
      applications: Math.floor(Math.random() * 30) + 5, // Simulated
      responses: validation.validation_responses?.length || 0,
      avg_response_time: Math.floor(Math.random() * 48) + 2, // Simulated hours
      completion_rate: Math.random() * 40 + 60, // Simulated percentage
      quality_score: Math.random() * 2 + 3, // Simulated 3-5 scale
      engagement_score: Math.random() * 40 + 60, // Simulated percentage
      created_at: validation.created_at
    })) || [];
  };

  const fetchUserEngagement = async (): Promise<UserEngagement[]> => {
    const { data: adopters, error } = await supabase
      .from('early_adopters')
      .select(`
        user_id,
        completed_validations,
        rating,
        total_points,
        updated_at
      `)
      .order('completed_validations', { ascending: false })
      .limit(10);

    if (error) throw error;

    return adopters?.map(adopter => {
      const engagementLevel = getEngagementLevel(adopter.completed_validations, adopter.total_points);
      
      return {
        user_id: adopter.user_id,
        name: `Usuário ${adopter.user_id.slice(0, 8)}`, // Simulated name
        total_validations: adopter.completed_validations,
        avg_response_time: Math.floor(Math.random() * 24) + 1, // Simulated hours
        quality_score: adopter.rating,
        engagement_level: engagementLevel,
        last_activity: adopter.updated_at,
        streak_days: Math.floor(Math.random() * 30) + 1 // Simulated
      };
    }) || [];
  };

  const getEngagementLevel = (validations: number, points: number): 'low' | 'medium' | 'high' | 'expert' => {
    if (validations >= 20 && points >= 1000) return 'expert';
    if (validations >= 10 && points >= 500) return 'high';
    if (validations >= 5 && points >= 200) return 'medium';
    return 'low';
  };

  const calculateDerivedMetrics = (
    realTime: RealTimeMetrics,
    validations: ValidationEngagement[],
    users: UserEngagement[]
  ): EngagementMetric[] => {
    const avgEngagementScore = validations.reduce((sum, v) => sum + v.engagement_score, 0) / validations.length || 0;
    const avgQualityScore = users.reduce((sum, u) => sum + u.quality_score, 0) / users.length || 0;
    const avgResponseTime = validations.reduce((sum, v) => sum + v.avg_response_time, 0) / validations.length || 0;
    
    return [
      {
        id: 'active_users',
        name: 'Usuários Ativos',
        value: realTime.active_users,
        change: Math.random() * 20 - 10, // Simulated change
        trend: Math.random() > 0.5 ? 'up' : 'down',
        unit: 'usuários',
        description: 'Usuários ativos nos últimos 30 minutos'
      },
      {
        id: 'engagement_score',
        name: 'Score de Engajamento',
        value: avgEngagementScore,
        change: Math.random() * 10 - 5,
        trend: 'up',
        unit: '%',
        description: 'Média do engajamento em validações ativas'
      },
      {
        id: 'quality_score',
        name: 'Qualidade das Respostas',
        value: avgQualityScore,
        change: Math.random() * 5 - 2.5,
        trend: 'up',
        unit: '/5',
        description: 'Avaliação média da qualidade das respostas'
      },
      {
        id: 'response_time',
        name: 'Tempo Médio de Resposta',
        value: avgResponseTime,
        change: Math.random() * 10 - 5,
        trend: 'down',
        unit: 'horas',
        description: 'Tempo médio para receber primeira resposta'
      },
      {
        id: 'conversion_rate',
        name: 'Taxa de Conversão',
        value: realTime.conversion_rate,
        change: Math.random() * 5 - 2.5,
        trend: 'up',
        unit: '%',
        description: 'Visitantes que se tornam participantes'
      },
      {
        id: 'completion_rate',
        name: 'Taxa de Conclusão',
        value: validations.reduce((sum, v) => sum + v.completion_rate, 0) / validations.length || 0,
        change: Math.random() * 8 - 4,
        trend: 'stable',
        unit: '%',
        description: 'Validações concluídas com sucesso'
      }
    ];
  };

  const getMetricIcon = (metricId: string) => {
    const icons = {
      active_users: Users,
      engagement_score: Activity,
      quality_score: Star,
      response_time: Clock,
      conversion_rate: Target,
      completion_rate: CheckCircle
    };
    return icons[metricId as keyof typeof icons] || Activity;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getEngagementColor = (level: string) => {
    const colors = {
      low: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-blue-100 text-blue-800 border-blue-200',
      expert: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === '/5') return `${value.toFixed(1)}/5`;
    if (unit === 'horas') return `${value.toFixed(1)}h`;
    return `${Math.round(value)} ${unit}`;
  };

  // Prepare chart data
  const engagementTrendData = validationEngagement.map((validation, index) => ({
    name: `Val ${index + 1}`,
    engagement: validation.engagement_score,
    quality: validation.quality_score * 20, // Scale to percentage
    responses: validation.responses
  }));

  const userDistributionData = [
    { name: 'Expert', value: userEngagement.filter(u => u.engagement_level === 'expert').length, color: '#8B5CF6' },
    { name: 'Alto', value: userEngagement.filter(u => u.engagement_level === 'high').length, color: '#3B82F6' },
    { name: 'Médio', value: userEngagement.filter(u => u.engagement_level === 'medium').length, color: '#F59E0B' },
    { name: 'Baixo', value: userEngagement.filter(u => u.engagement_level === 'low').length, color: '#EF4444' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Métricas de Engajamento</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe o engajamento em tempo real no marketplace de validação
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[{ id: '24h', label: '24h' }, { id: '7d', label: '7d' }, { id: '30d', label: '30d' }].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === range.id
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Auto Refresh Toggle */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto
          </Button>
          
          {/* Manual Refresh */}
          <Button variant="outline" size="sm" onClick={fetchEngagementData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = getMetricIcon(metric.id);
          return (
            <Card key={metric.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</p>
                    <p className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ${
                        metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="validations">Validações</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tendência de Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="Engajamento (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribuição de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validations Tab */}
        <TabsContent value="validations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance das Validações</CardTitle>
              <CardDescription>
                Métricas detalhadas de engajamento por validação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationEngagement.map((validation, index) => (
                  <div key={validation.validation_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{validation.title}</h4>
                      <Badge className={`${
                        validation.engagement_score >= 80 ? 'bg-green-100 text-green-800' :
                        validation.engagement_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {validation.engagement_score.toFixed(1)}% engajamento
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Visualizações</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {validation.views}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Respostas</p>
                        <p className="font-semibold flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {validation.responses}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Tempo Médio</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {validation.avg_response_time.toFixed(1)}h
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Qualidade</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {validation.quality_score.toFixed(1)}/5
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Conclusão</span>
                        <span>{validation.completion_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={validation.completion_rate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engajamento dos Usuários</CardTitle>
              <CardDescription>
                Análise detalhada do comportamento dos early adopters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userEngagement.map((user, index) => (
                  <div key={user.user_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.total_validations} validações concluídas
                          </p>
                        </div>
                      </div>
                      <Badge className={getEngagementColor(user.engagement_level)}>
                        {user.engagement_level.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Tempo Médio</p>
                        <p className="font-semibold">{user.avg_response_time.toFixed(1)}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Qualidade</p>
                        <p className="font-semibold">{user.quality_score.toFixed(1)}/5</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Sequência</p>
                        <p className="font-semibold">{user.streak_days} dias</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Última Atividade</p>
                        <p className="font-semibold">
                          {new Date(user.last_activity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          {realTimeMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Atividade Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Usuários Online</span>
                      <span className="font-bold text-green-600">{realTimeMetrics.active_users}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Validações Ativas</span>
                      <span className="font-bold">{realTimeMetrics.ongoing_validations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Respostas Hoje</span>
                      <span className="font-bold text-blue-600">{realTimeMetrics.responses_today}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-blue-500" />
                    Sessão Média
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {realTimeMetrics.avg_session_duration.toFixed(1)}min
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Duração média das sessões
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Conversão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Conversão</span>
                        <span>{realTimeMetrics.conversion_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={realTimeMetrics.conversion_rate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Rejeição</span>
                        <span>{realTimeMetrics.bounce_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={realTimeMetrics.bounce_rate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EngagementMetrics;