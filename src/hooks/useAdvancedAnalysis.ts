import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedAnalysis {
  id: string;
  idea_id: string;
  user_id: string;
  analysis_data: any;
  created_at: string;
}

interface IdeaData {
  id: string;
  title: string;
  description: string;
  problem?: string | null;
  audience?: string | null;
  has_competitors?: string | null;
  monetization?: string | null;
  budget?: number | null;
  location?: string | null;
  [key: string]: any;
}

export const useAdvancedAnalysis = (ideaId: string, savedAnalysisData?: any) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  const { addPoints, checkAndAwardAchievements } = useGamification();
  
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [analysisCheckCompleted, setAnalysisCheckCompleted] = useState(false);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  // Clear any active polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollInterval !== null) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  useEffect(() => {
    if (authState.isAuthenticated && ideaId) {
      fetchIdeaDetails();
      
      // Se temos dados salvos, use-os diretamente
      if (savedAnalysisData) {
        setAnalysis({
          id: 'saved-analysis',
          idea_id: ideaId,
          user_id: authState.user?.id || '',
          analysis_data: savedAnalysisData,
          created_at: new Date().toISOString()
        });
        setAnalysisCheckCompleted(true);
      } else {
        fetchExistingAnalysis();
      }
    }
  }, [ideaId, authState.isAuthenticated, savedAnalysisData]);

  // Gerar análise automaticamente APENAS quando verificação completa confirmar que não existe análise
  useEffect(() => {
    if (analysisCheckCompleted && !analysis && !loading && authState.isAuthenticated && ideaId && !savedAnalysisData) {
      console.log("Verificação completa - nenhuma análise existente. Gerando uma nova análise automaticamente.");
      generateNewAnalysis();
    }
  }, [analysisCheckCompleted, analysis, loading, savedAnalysisData]);

  const fetchIdeaDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", ideaId)
        .eq("user_id", authState.user?.id)
        .single();

      if (error) throw error;
      setIdea(data as IdeaData);
    } catch (error) {
      console.error("Error fetching idea details:", error);
    }
  };

  const fetchExistingAnalysis = async () => {
    setIsLoadingExisting(true);
    setAnalysisCheckCompleted(false);
    
    try {
      console.log("Verificando análises existentes para a ideia:", ideaId);
      const { data, error } = await supabase
        .from("advanced_analyses")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", authState.user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        console.log("Análise existente encontrada:", data);
        setAnalysis(data as AdvancedAnalysis);
      }
    } catch (error) {
      console.error("Erro ao buscar análise avançada existente:", error);
    } finally {
      setIsLoadingExisting(false);
      setAnalysisCheckCompleted(true);
    }
  };

  const generateNewAnalysis = async () => {
    setLoading(true);
    setProgress(2.5); // Progresso inicial para não ficar preso no 0%
    setAttempts(0);
    let visualProgress = 2.5;
    let pollingStopped = false;
    let visualInterval: number | null = null;

    // Função para animar progresso até um valor alvo, com passo e pausa
    const animateTo = (target: number, step = 1, delay = 50) => {
      return new Promise<void>((resolve) => {
        if (visualInterval) clearInterval(visualInterval);
        visualInterval = window.setInterval(() => {
          if (pollingStopped) {
            clearInterval(visualInterval!);
            resolve();
            return;
          }
          if (visualProgress < target) {
            visualProgress = Math.min(visualProgress + step, target);
            setProgress(visualProgress);
          } else {
            clearInterval(visualInterval!);
            resolve();
          }
        }, delay);
      });
    };

    // Progresso animado em etapas - mais lento e gradual
    const runVisualProgress = async () => {
      await animateTo(30, 0.3, 50); // lento até 30% (passos menores, mais tempo)
      await new Promise(res => setTimeout(res, 1000)); // pausa 1s
      await animateTo(55, 0.6, 60); // lento até 55% (ainda mais lento)
      await new Promise(res => setTimeout(res, 1200)); // pausa 1.2s
      await animateTo(75, 0.3, 70); // lento até 75% (muito gradual)
      await new Promise(res => setTimeout(res, 1000)); // pausa 1.5s
      // Depois disso, vai muito devagar até 85%
      visualInterval = window.setInterval(() => {
        if (pollingStopped) {
          clearInterval(visualInterval!);
          return;
        }
        if (visualProgress < 85) {
          visualProgress = Math.min(visualProgress + 0.2, 85);
          setProgress(visualProgress);
        }
      }, 150);
    };
    runVisualProgress();

    try {
      // Deduz créditos antes de iniciar a análise
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 2,
        p_feature: 'advanced_analysis',
        p_item_id: ideaId,
        p_description: 'Análise avançada da ideia'
      });
      if (creditError) {
        toast.error('Créditos insuficientes ou erro ao deduzir créditos.');
        setLoading(false);
        if (visualInterval) clearInterval(visualInterval);
        return;
      }
      
      console.log("Iniciando geração de nova análise avançada para a ideia:", ideaId);
      
      if (pollInterval !== null) {
        clearInterval(pollInterval);
      }
        
      try {
        console.log("Iniciando geração de análise avançada...");
        const response = await supabase.functions.invoke("advanced-analysis", {
          body: { ideaId }
        });

        if (response.error) {
          throw new Error(response.error.message || "Error starting analysis");
        }

        console.log("Analysis generation initiated:", response);
      } catch (error) {
        console.error("Error initiating advanced analysis:", error);
        toast.error(t('errors.fetchError') + ". " + t('errors.tryAgainLater'));
        setLoading(false);
        if (visualInterval) clearInterval(visualInterval);
        return;
      }
      
      // Start polling for results
      let attemptCount = 0;
      const maxAttempts = 10;
      
      const interval = window.setInterval(async () => {
        attemptCount += 1;
        setAttempts(attemptCount);
        
        try {
          const { data: pollData, error: pollError } = await supabase
            .from("advanced_analyses")
            .select("*")
            .eq("idea_id", ideaId)
            .eq("user_id", authState.user?.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (pollError) {
            console.error("Error polling for analysis:", pollError);
          }
          
          if (pollData) {
            console.log("Análise encontrada na tentativa", attemptCount, ":", pollData);
            pollingStopped = true;
            if (visualInterval) clearInterval(visualInterval);
            // Progresso visual até 100% em passos suaves
            let finish = Math.max(visualProgress, 85);
            const finishSteps = [finish + 3, finish + 6, finish + 9, 100];
            let idx = 0;
            const finishInterval = setInterval(() => {
              setProgress(Math.min(finishSteps[idx], 100));
              idx++;
              if (idx >= finishSteps.length) {
                clearInterval(finishInterval);
                setTimeout(async () => {
                  clearInterval(interval);
                  setPollInterval(null);
                  setAnalysis(pollData as AdvancedAnalysis);
                  setLoading(false);
                  // Gamificação: Pontuação ao concluir análise avançada
                  addPoints(15, 'Análise Avançada');
                  // Checagem de conquistas automáticas (badges)
                  try {
                    const { count: totalAdvancedAnalyses } = await supabase
                      .from('advanced_analyses')
                      .select('*', { count: 'exact', head: true })
                      .eq('user_id', authState.user.id);
                    await checkAndAwardAchievements('advanced_analysis', { totalAdvancedAnalyses });
                  } catch {}
                }, 800);
              }
            }, 180);
          } else if (attemptCount >= maxAttempts) {
            pollingStopped = true;
            if (visualInterval) clearInterval(visualInterval);
            clearInterval(interval);
            setPollInterval(null);
            toast.error(t('errors.analysisNotFound') + ". " + t('errors.startNewAnalysis'));
            setLoading(false);
            setProgress(0);
          } else {
            console.log(`Tentativa ${attemptCount}: Análise ainda não encontrada, continuando...`);
          }
        } catch (error) {
          pollingStopped = true;
          if (visualInterval) clearInterval(visualInterval);
          console.error("Erro durante polling:", error);
          if (attemptCount >= maxAttempts) {
            clearInterval(interval);
            setPollInterval(null);
            toast.error(t('errors.fetchError') + ". " + t('errors.tryAgainLater'));
            setLoading(false);
            setProgress(0);
          }
        }
      }, 4000);
      setPollInterval(interval);
    } catch (error) {
      setLoading(false);
      if (visualInterval) clearInterval(visualInterval);
      console.error("Error fetching advanced analysis:", error);
      toast.error(t('errors.fetchError') + ". " + t('errors.tryAgainLater'));
    }
  };

  const handleRequestAdvancedAnalysis = () => {
    setPendingAction(() => generateNewAnalysis);
    setShowCreditConfirm(true);
  };

  return {
    analysis,
    loading,
    progress,
    idea,
    isLoadingExisting,
    analysisCheckCompleted,
    showCreditConfirm,
    pendingAction,
    setShowCreditConfirm,
    setPendingAction,
    generateNewAnalysis,
    handleRequestAdvancedAnalysis
  };
}; 