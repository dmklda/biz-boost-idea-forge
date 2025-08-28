import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Zap, 
  Gift, 
  Crown, 
  Medal,
  Coins,
  TrendingUp,
  Calendar,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserRewards {
  total_points: number;
  current_level: number;
  level_name: string;
  points_to_next_level: number;
  badges: Badge[];
  recent_rewards: Reward[];
  streak_days: number;
  rank_position: number;
  total_users: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
  progress?: number;
  max_progress?: number;
}

interface Reward {
  id: string;
  points_awarded: number;
  reward_type: string;
  description: string;
  created_at: string;
}

interface RewardLevel {
  level: number;
  name: string;
  min_points: number;
  max_points: number;
  benefits: string[];
  badge_icon: string;
  color: string;
}

const REWARD_LEVELS: RewardLevel[] = [
  {
    level: 1,
    name: "Novato",
    min_points: 0,
    max_points: 99,
    benefits: ["Acesso básico ao marketplace", "1 validação por dia"],
    badge_icon: "🌱",
    color: "bg-gray-500"
  },
  {
    level: 2,
    name: "Explorador",
    min_points: 100,
    max_points: 299,
    benefits: ["3 validações por dia", "Acesso a validações premium"],
    badge_icon: "🔍",
    color: "bg-green-500"
  },
  {
    level: 3,
    name: "Especialista",
    min_points: 300,
    max_points: 699,
    benefits: ["5 validações por dia", "Prioridade em matching", "Bônus de 10% em pontos"],
    badge_icon: "⭐",
    color: "bg-blue-500"
  },
  {
    level: 4,
    name: "Mentor",
    min_points: 700,
    max_points: 1499,
    benefits: ["Validações ilimitadas", "Acesso a beta features", "Bônus de 20% em pontos"],
    badge_icon: "🎯",
    color: "bg-purple-500"
  },
  {
    level: 5,
    name: "Guru",
    min_points: 1500,
    max_points: 9999999,
    benefits: ["Status VIP", "Acesso direto a empreendedores", "Bônus de 50% em pontos", "Recompensas exclusivas"],
    badge_icon: "👑",
    color: "bg-yellow-500"
  }
];

const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_validation",
    name: "Primeira Validação",
    description: "Complete sua primeira validação",
    icon: "🎉",
    rarity: "common"
  },
  {
    id: "speed_demon",
    name: "Demônio da Velocidade",
    description: "Complete 5 validações em menos de 24 horas",
    icon: "⚡",
    rarity: "rare"
  },
  {
    id: "quality_expert",
    name: "Especialista em Qualidade",
    description: "Mantenha uma média de 4.8+ estrelas em 10 validações",
    icon: "💎",
    rarity: "epic"
  },
  {
    id: "streak_master",
    name: "Mestre da Sequência",
    description: "Complete validações por 7 dias consecutivos",
    icon: "🔥",
    rarity: "rare"
  },
  {
    id: "feedback_guru",
    name: "Guru do Feedback",
    description: "Forneça feedback detalhado em 50 validações",
    icon: "📝",
    rarity: "epic"
  },
  {
    id: "innovation_hunter",
    name: "Caçador de Inovação",
    description: "Participe de validações em 5 categorias diferentes",
    icon: "🚀",
    rarity: "legendary"
  }
];

const RewardsSystem = () => {
  const { authState } = useAuth();
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (authState.user) {
      fetchUserRewards();
    }
  }, [authState.user]);

  const fetchUserRewards = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's early adopter profile
      const { data: adopter, error: adopterError } = await supabase
        .from('early_adopters')
        .select('*')
        .eq('user_id', authState.user!.id)
        .single();

      if (adopterError && adopterError.code !== 'PGRST116') {
        throw adopterError;
      }

      // Fetch recent rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('marketplace_rewards')
        .select('*')
        .eq('user_id', authState.user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (rewardsError) throw rewardsError;

      const totalPoints = adopter?.total_points || 0;
      const currentLevel = getCurrentLevel(totalPoints);
      const nextLevel = REWARD_LEVELS.find(l => l.level === currentLevel.level + 1);
      
      setUserRewards({
        total_points: totalPoints,
        current_level: currentLevel.level,
        level_name: currentLevel.name,
        points_to_next_level: nextLevel ? nextLevel.min_points - totalPoints : 0,
        badges: [], // TODO: Implement badge system
        recent_rewards: rewards || [],
        streak_days: 0, // TODO: Calculate streak
        rank_position: 1, // TODO: Calculate rank
        total_users: 100 // TODO: Get total users
      });
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      toast.error('Erro ao carregar recompensas');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLevel = (points: number): RewardLevel => {
    return REWARD_LEVELS.find(level => 
      points >= level.min_points && points <= level.max_points
    ) || REWARD_LEVELS[0];
  };

  const getNextLevel = (currentLevel: number): RewardLevel | null => {
    return REWARD_LEVELS.find(level => level.level === currentLevel + 1) || null;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRewardTypeLabel = (type: string) => {
    const labels = {
      'response_submitted': 'Resposta Enviada',
      'response_approved': 'Resposta Aprovada',
      'quality_bonus': 'Bônus de Qualidade',
      'speed_bonus': 'Bônus de Velocidade',
      'referral_bonus': 'Bônus de Indicação',
      'milestone_bonus': 'Bônus de Marco'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userRewards) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sistema de Recompensas</h3>
        <p className="text-gray-600 mb-4">
          Complete sua primeira validação para começar a ganhar pontos e badges!
        </p>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Explorar Validações
        </Button>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel(userRewards.total_points);
  const nextLevel = getNextLevel(currentLevel.level);
  const progressPercentage = nextLevel 
    ? ((userRewards.total_points - currentLevel.min_points) / (nextLevel.min_points - currentLevel.min_points)) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${currentLevel.color} flex items-center justify-center text-2xl`}>
                {currentLevel.badge_icon}
              </div>
              <div>
                <CardTitle className="text-2xl">{currentLevel.name}</CardTitle>
                <CardDescription className="text-lg">
                  Nível {currentLevel.level} • {userRewards.total_points} pontos
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Ranking</div>
              <div className="text-2xl font-bold text-yellow-600">
                #{userRewards.rank_position}
              </div>
              <div className="text-xs text-gray-500">
                de {userRewards.total_users}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para {nextLevel.name}</span>
                <span>{userRewards.points_to_next_level} pontos restantes</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sequência Atual</p>
                <p className="text-2xl font-bold text-orange-600">{userRewards.streak_days} dias</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges Conquistados</p>
                <p className="text-2xl font-bold text-purple-600">{userRewards.badges.length}</p>
              </div>
              <Medal className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pontos Este Mês</p>
                <p className="text-2xl font-bold text-green-600">+{userRewards.recent_rewards.reduce((sum, r) => sum + r.points_awarded, 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Benefits */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Benefícios do Nível {currentLevel.level}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentLevel.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Level Preview */}
            {nextLevel && (
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Próximo Nível: {nextLevel.name}
                  </CardTitle>
                  <CardDescription>
                    {userRewards.points_to_next_level} pontos para desbloquear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {nextLevel.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_BADGES.map((badge) => {
              const isEarned = userRewards.badges.some(b => b.id === badge.id);
              return (
                <Card 
                  key={badge.id} 
                  className={`backdrop-blur-sm border-0 shadow-lg transition-all duration-300 ${
                    isEarned 
                      ? 'bg-white/70 dark:bg-slate-800/70 ring-2 ring-yellow-400' 
                      : 'bg-white/50 dark:bg-slate-800/50 opacity-60'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h3 className="font-semibold mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {badge.description}
                    </p>
                    <Badge className={getRarityColor(badge.rarity)}>
                      {badge.rarity}
                    </Badge>
                    {isEarned && (
                      <div className="mt-3">
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Conquistado
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Histórico de Recompensas</CardTitle>
              <CardDescription>
                Suas últimas atividades e pontos ganhos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRewards.recent_rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Coins className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{getRewardTypeLabel(reward.reward_type)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reward.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(reward.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{reward.points_awarded}</p>
                      <p className="text-xs text-gray-500">pontos</p>
                    </div>
                  </div>
                ))}
                
                {userRewards.recent_rewards.length === 0 && (
                  <div className="text-center py-8">
                    <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Nenhuma recompensa ainda. Complete validações para ganhar pontos!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardsSystem;