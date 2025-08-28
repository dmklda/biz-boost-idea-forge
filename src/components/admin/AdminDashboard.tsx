import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Star,
  BarChart3,
  Activity,
  AlertCircle,
  Trophy,
  Megaphone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
  total_users: number;
  active_users_today: number;
  new_users_this_week: number;
  total_ideas: number;
  ideas_this_month: number;
  total_analyses: number;
  early_adopters_pending: number;
  early_adopters_approved: number;
  total_blog_posts: number;
  total_success_cases: number;
  total_revenue_this_month: number;
  mrr: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      
      if (error) throw error;
      setStats(data as any);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Buscar atividades recentes dos últimos 7 dias
      const { data: ideas } = await supabase
        .from('ideas')
        .select(`
          id, 
          title, 
          created_at, 
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: analyses } = await supabase
        .from('idea_analyses')
        .select(`
          id, 
          created_at, 
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: adopters } = await supabase
        .from('early_adopters')
        .select(`
          id, 
          created_at, 
          status, 
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar nomes dos usuários separadamente
      const userIds = [
        ...(ideas?.map(i => i.user_id) || []),
        ...(analyses?.map(a => a.user_id) || []),
        ...(adopters?.map(a => a.user_id) || [])
      ].filter(Boolean);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      const getUserName = (userId: string) => {
        const profile = profiles?.find(p => p.id === userId);
        return profile?.name || 'Usuário';
      };

      const activities = [
        ...(ideas?.map(i => ({
          type: 'idea',
          title: `Nova ideia: ${i.title}`,
          user: getUserName(i.user_id),
          time: i.created_at,
          icon: 'lightbulb'
        })) || []),
        ...(analyses?.map(a => ({
          type: 'analysis',
          title: 'Nova análise realizada',
          user: getUserName(a.user_id),
          time: a.created_at,
          icon: 'chart'
        })) || []),
        ...(adopters?.map(a => ({
          type: 'adopter',
          title: `Early Adopter ${a.status === 'pending' ? 'pendente' : 'aprovado'}`,
          user: getUserName(a.user_id),
          time: a.created_at,
          icon: 'star'
        })) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const growthRate = stats ? Math.round(((stats.new_users_this_week / Math.max(stats.total_users - stats.new_users_this_week, 1)) * 100)) : 0;
  const ideaGrowthRate = stats ? Math.round(((stats.ideas_this_month / Math.max(stats.total_ideas - stats.ideas_this_month, 1)) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral completa do sistema e métricas em tempo real
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.new_users_this_week || 0} esta semana
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+{growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_users_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários online hoje
            </p>
            <Progress 
              value={(stats?.active_users_today || 0) / Math.max(stats?.total_users || 1, 1) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.total_revenue_this_month || 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR: R$ {(stats?.mrr || 0).toLocaleString('pt-BR')}
            </p>
            <Badge variant="outline" className="mt-2">
              Este mês
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ideias Criadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_ideas || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.ideas_this_month || 0} este mês
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+{ideaGrowthRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Early Adopters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.early_adopters_pending || 0}</Badge>
                {(stats?.early_adopters_pending || 0) > 0 && (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aprovados</span>
              <Badge variant="secondary">{stats?.early_adopters_approved || 0}</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/admin#early-adopters'}
            >
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posts do Blog</span>
              <Badge variant="secondary">{stats?.total_blog_posts || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Casos de Sucesso</span>
              <Badge variant="secondary">{stats?.total_success_cases || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Análises</span>
              <Badge variant="outline">{stats?.total_analyses || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium line-clamp-1">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} • {new Date(activity.time).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ver Todas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Novo Post</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Trophy className="h-5 w-5" />
              <span className="text-sm">Caso de Sucesso</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Megaphone className="h-5 w-5" />
              <span className="text-sm">Anúncio</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Relatório</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};