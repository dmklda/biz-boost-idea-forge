
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  points_awarded: number;
  icon: string;
  earned_at: string;
}

interface UserLevel {
  id: string;
  current_level: number;
  total_points: number;
  points_to_next_level: number;
  level_name: string;
}

export const useGamification = () => {
  const { authState } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserLevel = async () => {
    if (!authState.user) return;

    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', authState.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user level:', error);
        return;
      }

      if (data) {
        setUserLevel(data);
      } else {
        // Create initial level for new user
        const { data: newLevel, error: createError } = await supabase
          .from('user_levels')
          .insert({
            user_id: authState.user.id,
            current_level: 1,
            total_points: 0,
            points_to_next_level: 100,
            level_name: 'Iniciante'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user level:', createError);
        } else {
          setUserLevel(newLevel);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserLevel:', error);
    }
  };

  const fetchAchievements = async () => {
    if (!authState.user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
      } else {
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Error in fetchAchievements:', error);
    }
  };

  const addPoints = async (points: number, reason: string) => {
    if (!authState.user || !userLevel) return;

    try {
      const newTotalPoints = userLevel.total_points + points;
      let newLevel = userLevel.current_level;
      let newLevelName = userLevel.level_name;
      let pointsToNext = userLevel.points_to_next_level - points;

      // Level progression logic
      const levelThresholds = [
        { level: 1, name: 'Iniciante', threshold: 0 },
        { level: 2, name: 'Desenvolvedor', threshold: 100 },
        { level: 3, name: 'Analista', threshold: 300 },
        { level: 4, name: 'Expert', threshold: 600 },
        { level: 5, name: 'Visionário', threshold: 1000 },
        { level: 6, name: 'Guru', threshold: 1500 }
      ];

      for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (newTotalPoints >= levelThresholds[i].threshold) {
          newLevel = levelThresholds[i].level;
          newLevelName = levelThresholds[i].name;
          
          const nextThreshold = levelThresholds[i + 1];
          pointsToNext = nextThreshold ? nextThreshold.threshold - newTotalPoints : 0;
          break;
        }
      }

      const { error } = await supabase
        .from('user_levels')
        .update({
          total_points: newTotalPoints,
          current_level: newLevel,
          level_name: newLevelName,
          points_to_next_level: pointsToNext,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error updating user level:', error);
      } else {
        setUserLevel({
          ...userLevel,
          total_points: newTotalPoints,
          current_level: newLevel,
          level_name: newLevelName,
          points_to_next_level: pointsToNext
        });

        // Check if level up occurred
        if (newLevel > userLevel.current_level) {
          await addAchievement(
            'level_up',
            `Nível ${newLevel} Alcançado!`,
            `Parabéns! Você alcançou o nível ${newLevelName}`,
            50,
            'trophy'
          );
        }
      }
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const addAchievement = async (
    type: string,
    name: string,
    description: string,
    points: number,
    icon: string
  ) => {
    if (!authState.user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: authState.user.id,
          achievement_type: type,
          achievement_name: name,
          description,
          points_awarded: points,
          icon
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding achievement:', error);
      } else {
        setAchievements(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error in addAchievement:', error);
    }
  };

  // Função utilitária para checar e premiar conquistas
  const checkAndAwardAchievements = async (action: string, extra?: any) => {
    if (!authState.user) return;
    // Evita duplicidade
    const hasAchievement = (type: string) => achievements.some(a => a.achievement_type === type);

    // Primeira ideia criada
    if (action === 'create_idea' && !hasAchievement('first_idea')) {
      await addAchievement('first_idea', 'Primeira ideia criada', 'Você criou sua primeira ideia!', 10, 'star');
      toast.success('🏅 Conquista desbloqueada: Primeira ideia criada!');
    }
    // 10 ideias criadas
    if (action === 'create_idea' && extra?.totalIdeas === 10 && !hasAchievement('10_ideas')) {
      await addAchievement('10_ideas', '10 ideias criadas', 'Você criou 10 ideias!', 25, 'star');
      toast.success('🏅 Conquista desbloqueada: 10 ideias criadas!');
    }
    // Primeira análise avançada
    if (action === 'advanced_analysis' && !hasAchievement('first_advanced_analysis')) {
      await addAchievement('first_advanced_analysis', 'Primeira análise avançada', 'Você concluiu sua primeira análise avançada!', 15, 'zap');
      toast.success('🏆 Conquista desbloqueada: Primeira análise avançada!');
    }
    // 10 análises avançadas
    if (action === 'advanced_analysis' && extra?.totalAdvancedAnalyses === 10 && !hasAchievement('10_advanced_analyses')) {
      await addAchievement('10_advanced_analyses', '10 análises avançadas', 'Você concluiu 10 análises avançadas!', 30, 'zap');
      toast.success('🏆 Conquista desbloqueada: 10 análises avançadas!');
    }
    // Primeira comparação
    if (action === 'compare_ideas' && !hasAchievement('first_comparison')) {
      await addAchievement('first_comparison', 'Primeira comparação', 'Você comparou ideias pela primeira vez!', 10, 'target');
      toast.success('🎯 Conquista desbloqueada: Primeira comparação!');
    }
    // 10 comparações
    if (action === 'compare_ideas' && extra?.totalComparisons === 10 && !hasAchievement('10_comparisons')) {
      await addAchievement('10_comparisons', '10 comparações', 'Você comparou ideias 10 vezes!', 25, 'target');
      toast.success('🎯 Conquista desbloqueada: 10 comparações!');
    }
    // Perfil completo
    if (action === 'complete_profile' && !hasAchievement('profile_complete')) {
      await addAchievement('profile_complete', 'Perfil completo', 'Você completou seu perfil!', 20, 'award');
      toast.success('🎖️ Conquista desbloqueada: Perfil completo!');
    }
  };

  useEffect(() => {
    if (authState.user) {
      setIsLoading(true);
      Promise.all([fetchUserLevel(), fetchAchievements()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [authState.user]);

  return {
    achievements,
    userLevel,
    isLoading,
    addPoints,
    addAchievement,
    fetchUserLevel,
    fetchAchievements,
    checkAndAwardAchievements
  };
};
