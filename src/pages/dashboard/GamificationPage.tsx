
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Zap, Award, Crown } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  award: Award,
  crown: Crown,
};

const GamificationPage = () => {
  const { achievements, userLevel, isLoading } = useGamification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
          Carregando seu progresso...
        </div>
      </div>
    );
  }

  const progressPercentage = userLevel?.points_to_next_level 
    ? ((userLevel.total_points / (userLevel.total_points + userLevel.points_to_next_level)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sistema de Gamificação</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e conquistas</p>
      </div>

      {/* Level Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Nível Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{userLevel?.level_name}</h3>
                <p className="text-muted-foreground">Nível {userLevel?.current_level}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-purple">{userLevel?.total_points}</p>
                <p className="text-sm text-muted-foreground">pontos totais</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para o próximo nível</span>
                <span>{userLevel?.points_to_next_level} pontos restantes</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle>Como Ganhar Pontos</CardTitle>
          <CardDescription>Realize essas ações para subir de nível</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Criar uma ideia</p>
                <p className="text-sm text-muted-foreground">+10 pontos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Fazer análise completa</p>
                <p className="text-sm text-muted-foreground">+25 pontos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Usar ferramentas</p>
                <p className="text-sm text-muted-foreground">+15 pontos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Award className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Completar perfil</p>
                <p className="text-sm text-muted-foreground">+50 pontos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Conquistas ({achievements.length})
          </CardTitle>
          <CardDescription>Suas conquistas e badges desbloqueadas</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conquista ainda</p>
              <p className="text-sm">Comece criando sua primeira ideia!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement) => {
                const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
                  >
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                      <IconComponent className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{achievement.achievement_name}</h3>
                        <Badge variant="secondary">+{achievement.points_awarded}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Conquistado em {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationPage;
