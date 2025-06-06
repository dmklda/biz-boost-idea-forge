
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
    fetchAchievements
  };
};
