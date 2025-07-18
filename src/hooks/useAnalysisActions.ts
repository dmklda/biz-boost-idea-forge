import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisActionsProps {
  analysis: any;
  idea: any;
  ideaId: string;
}

export const useAnalysisActions = ({ analysis, idea, ideaId }: AnalysisActionsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check if analysis is already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (analysis && authState.isAuthenticated) {
        try {
          const { data } = await supabase
            .from('saved_analyses')
            .select('*')
            .eq('original_analysis_id', analysis.id)
            .eq('user_id', authState.user?.id)
            .maybeSingle();
          
          setIsSaved(!!data);
        } catch (error) {
          console.error("Error checking if analysis is saved:", error);
          setIsSaved(false);
        }
      }
    };
    
    checkIfSaved();
  }, [analysis, authState.isAuthenticated, authState.user?.id]);

  const handleShare = async () => {
    try {
      // Generate sharing URL
      const shareUrl = `${window.location.origin}/dashboard/ideas?id=${ideaId}&tab=advanced`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: idea?.title || t('advancedAnalysis.title'),
          text: t('share.advancedAnalysisText'),
          url: shareUrl
        });
        
        toast.success(t('common.shared') + ". " + t('share.linkShared'));
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        toast.success(t('common.copied') + ". " + t('share.linkCopied'));
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error(t('errors.shareError') + ". " + t('errors.tryAgain'));
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysis || !idea || !authState.isAuthenticated) {
      toast.error(t('errors.saveError') + ". " + t('errors.missingData'));
      return;
    }

    try {
      setIsSaving(true);

      // Check if already saved
      const { data: existingData, error: checkError } = await supabase
        .from('saved_analyses')
        .select('*')
        .eq('original_analysis_id', analysis.id)
        .eq('user_id', authState.user?.id);

      if (existingData && existingData.length > 0) {
        // Already saved - update the timestamp
        const { error: updateError } = await supabase
          .from('saved_analyses')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existingData[0].id);

        if (updateError) throw updateError;

        toast.success(t('common.updated') + ". " + t('analysis.alreadySaved'));
      } else {
        // Save new
        const { error: saveError } = await supabase
          .from('saved_analyses')
          .insert({
            user_id: authState.user?.id,
            idea_id: ideaId,
            idea_title: idea.title,
            original_analysis_id: analysis.id,
            analysis_data: analysis.analysis_data
          });

        if (saveError) throw saveError;

        toast.success(t('common.saved') + ". " + t('analysis.saveSuccess'));
      }

      setIsSaved(true);
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast.error(t('errors.saveError') + ". " + t('errors.tryAgainLater'));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isSaved,
    handleShare,
    handleSaveAnalysis
  };
}; 