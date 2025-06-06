
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Insight {
  type: string;
  title: string;
  description: string;
  recommendation: string;
  icon: string;
}

interface InsightsData {
  insights: Insight[];
}

export const useDailyInsights = () => {
  const { authState } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    if (!authState.user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Calling generate-daily-insights function...');
      
      const { data, error } = await supabase.functions.invoke('generate-daily-insights', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.insights?.insights) {
        setInsights(data.insights.insights);
        console.log('Insights loaded successfully:', data.insights.insights);
      } else {
        throw new Error('Invalid insights data received');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      
      // Fallback insights
      setInsights([
        {
          type: "fallback",
          title: "Continue Criando",
          description: "Sua jornada empreendedora está progredindo. Continue analisando suas ideias para obter insights valiosos.",
          recommendation: "Crie uma nova análise para obter recomendações personalizadas.",
          icon: "Lightbulb"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user) {
      generateInsights();
    }
  }, [authState.user]);

  return {
    insights,
    isLoading,
    error,
    refreshInsights: generateInsights
  };
};
