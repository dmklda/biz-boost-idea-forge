import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';

interface AdopterStats {
  rating: number;
  total_points: number;
  completed_validations: number;
  status: string;
}

export default function EarlyAdopterDashboard() {
  const { authState } = useAuth();
  const { validationRequests, myResponses, isLoading } = useMarketplace();
  const [adopterStats, setAdopterStats] = useState<AdopterStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (authState.user) {
      fetchAdopterStats();
    }
  }, [authState.user]);

  const fetchAdopterStats = async () => {
    if (!authState.user) return;

    try {
      const { data, error } = await supabase
        .from('early_adopters')
        .select('rating, total_points, completed_validations, status')
        .eq('user_id', authState.user.id)
        .single();

      if (error) throw error;
      setAdopterStats(data);
    } catch (error) {
      console.error('Error fetching adopter stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const getNextLevelPoints = (currentPoints: number) => {
    const levels = [0, 100, 250, 500, 1000, 2000, 5000];
    const currentLevel = levels.findIndex(points => currentPoints < points);
    return currentLevel === -1 ? 10000 : levels[currentLevel];
  };

  const getCurrentLevel = (points: number) => {
    if (points >= 5000) return 6;
    if (points >= 2000) return 5;
    if (points >= 1000) return 4;
    if (points >= 500) return 3;
    if (points >= 250) return 2;
    if (points >= 100) return 1;
    return 0;
  };

  if (statsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!adopterStats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Não é Early Adopter</h3>
              <p className="text-muted-foreground">
                Você ainda não é um Early Adopter aprovado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adopterStats.status !== 'approved') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-lg font-semibold mb-2">Aguardando Aprovação</h3>
              <p className="text-muted-foreground">
                Seu pedido para ser Early Adopter está sendo analisado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLevel = getCurrentLevel(adopterStats.total_points);
  const nextLevelPoints = getNextLevelPoints(adopterStats.total_points);
  const progressToNext = ((adopterStats.total_points % nextLevelPoints) / nextLevelPoints) * 100;

  const availableValidations = validationRequests.filter(v => 
    !myResponses.some(r => r.validation_request_id === v.id)
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={authState.user?.photo_url} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Early Adopter</h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {authState.user?.name}!
            </p>
          </div>
          <Badge variant="default" className="ml-auto">
            Early Adopter
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nível {currentLevel}</div>
            <Progress value={progressToNext} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {adopterStats.total_points}/{nextLevelPoints} pontos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adopterStats.total_points}</div>
            <p className="text-xs text-muted-foreground">
              Pontos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validações Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adopterStats.completed_validations}</div>
            <p className="text-xs text-muted-foreground">
              Validações aprovadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adopterStats.rating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= adopterStats.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">
            Validações Disponíveis ({availableValidations.length})
          </TabsTrigger>
          <TabsTrigger value="responses">
            Minhas Respostas ({myResponses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Validações Disponíveis</CardTitle>
              <CardDescription>
                Participe de validações e ganhe pontos por suas contribuições
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableValidations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma validação disponível no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableValidations.slice(0, 5).map((validation) => (
                    <Card key={validation.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{validation.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {validation.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary">{validation.category}</Badge>
                              <Badge variant="outline">{validation.validation_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {validation.reward_points} pontos
                              </span>
                            </div>
                          </div>
                          <Button size="sm">
                            Participar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Respostas</CardTitle>
              <CardDescription>
                Acompanhe o status das suas participações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myResponses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não participou de nenhuma validação</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myResponses.map((response) => (
                    <Card key={response.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">Resposta enviada</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {response.feedback}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge 
                                variant={
                                  response.status === 'approved' ? 'default' : 
                                  response.status === 'rejected' ? 'destructive' : 'secondary'
                                }
                              >
                                {response.status === 'approved' ? 'Aprovada' : 
                                 response.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                              </Badge>
                              {response.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{response.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}