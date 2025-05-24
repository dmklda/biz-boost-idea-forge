
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { useIdeaFormContext } from "@/contexts/IdeaFormContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentLanguage } from "@/i18n/config";

export const useFormSubmission = (isReanalyzing?: boolean) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const { 
    formData, 
    editingIdeaId, 
    setIsSubmitting, 
    setIsAnalyzing,
    resetForm 
  } = useIdeaFormContext();

  // State to track when the analysis is complete
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingAction(() => () => handleSubmit(e, true));
    setShowCreditConfirm(true);
  };

  const handleSubmit = async (e: React.FormEvent, confirmed = false) => {
    if (!confirmed) {
      setPendingAction(() => () => handleSubmit(e, true));
      setShowCreditConfirm(true);
      return;
    }
    e.preventDefault();
    setIsSubmitting(true);
    setIsAnalyzing(true);
    setIsAnalysisComplete(false); // Reset the state at the beginning of submission
    
    try {
      // If user is authenticated, process with Supabase
      if (authState.isAuthenticated && authState.user) {
        // Lógica de créditos
        if (isReanalyzing) {
          // Sempre deduz crédito para reanálise
          const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
            p_user_id: authState.user.id,
            p_amount: 1,
            p_feature: 'reanalyze',
            p_item_id: editingIdeaId,
            p_description: 'Reanálise de ideia'
          });
          if (creditError) {
            toast.error(t('ideaForm.insufficientCredits', "Créditos insuficientes para reanálise"));
            setIsSubmitting(false);
            setIsAnalyzing(false);
            return;
          }
        } else {
          // Análise básica
          if (!authState.user.first_analysis_done) {
            // Primeira análise grátis
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ first_analysis_done: true })
              .eq('id', authState.user.id);
            if (updateError) {
              toast.error(t('ideaForm.analysisError', "Erro ao registrar primeira análise grátis"));
              setIsSubmitting(false);
              setIsAnalyzing(false);
              return;
            }
          } else {
            // Deduz crédito para demais análises
            const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
              p_user_id: authState.user.id,
              p_amount: 1,
              p_feature: 'basic_analysis',
              p_item_id: editingIdeaId,
              p_description: 'Análise básica de ideia'
            });
            if (creditError) {
              toast.error(t('ideaForm.insufficientCredits', "Créditos insuficientes para análise"));
              setIsSubmitting(false);
              setIsAnalyzing(false);
              return;
            }
          }
        }
        
        console.log("Sending form data:", formData);
        
        // Get current language
        const currentLanguage = getCurrentLanguage();
        console.log("Current language for analysis:", currentLanguage);
        
        // Call the analyze-idea edge function with language included
        const { data: analysisData, error: analysisError } = await supabase.functions
          .invoke('analyze-idea', {
            body: JSON.stringify({
              ideaData: {
                ...formData,
                language: currentLanguage // Always include the language
              },
              userId: authState.user.id,
              ideaId: editingIdeaId,
              isReanalyzing,
              language: currentLanguage // Also include it at the top level for backward compatibility
            })
          });
          
        if (analysisError) {
          console.error("Analysis error:", analysisError);
          
          // Log the full error details
          if (typeof analysisError === 'object' && analysisError !== null) {
            console.error("Analysis error details:", JSON.stringify(analysisError, null, 2));
          }
          
          // Special handling for insufficient credits
          if (analysisError.message && analysisError.message.includes('INSUFFICIENT_CREDITS')) {
            toast.error(t('ideaForm.insufficientCredits', "Créditos insuficientes para análise"));
            
            if (isDashboard) {
              navigate("/dashboard/creditos");
            }
            return;
          }
          
          // Handle RLS policy violations
          if (analysisError.message && analysisError.message.includes('row-level security policy')) {
            toast.error(t('ideaForm.securityError', "Erro de segurança ao processar sua ideia"));
            console.error("Row-Level Security Policy violation. Check Supabase RLS policies.");
            return;
          }
          
          throw new Error(analysisError.message || "Erro ao analisar ideia");
        }
        
        // Log successful response for debugging
        console.log("Analysis completed successfully:", analysisData);
        
        // Success! Navigate to results page
        toast.success(t('ideaForm.analysisSuccess', "Análise concluída com sucesso!"));
        
        // Mark the analysis as complete before resetting the form and navigating
        setIsAnalysisComplete(true);
        
        // Clear any saved advanced analysis data
        if (analysisData && analysisData.ideaId) {
          // Delete any existing advanced analysis for this idea to ensure fresh data on next analysis
          try {
            const { error: deleteError } = await supabase
              .from('advanced_analyses')
              .delete()
              .eq('idea_id', analysisData.ideaId);
              
            if (!deleteError) {
              console.log("Successfully cleared previous advanced analysis data");
            }
          } catch (err) {
            console.log("No previous advanced analysis to clear or error:", err);
          }
        }
        
        // Reset the form to close it
        resetForm();
        
        // Small delay to ensure the modal is closed before navigation
        setTimeout(() => {
          // Always navigate to the results page in the dashboard
          if (analysisData && analysisData.ideaId) {
            // Dispatch custom event to notify dashboard of data change
            const analysisUpdateEvent = new CustomEvent('analysis-updated', { 
              detail: { ideaId: analysisData.ideaId }
            });
            window.dispatchEvent(analysisUpdateEvent);
            
            navigate(`/dashboard/resultados?id=${analysisData.ideaId}`);
          } else {
            console.error("Missing ideaId in response:", analysisData);
            toast.error(t('ideaForm.missingData', "Dados da análise incompletos. Entre em contato com o suporte."));
          }
        }, 100); // 100ms delay should be sufficient
      } else {
        // Not authenticated, redirect to login
        toast.info(t('ideaForm.loginRequired', "É necessário fazer login para analisar ideias"));
        navigate("/login");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t('ideaForm.analysisError', "Erro ao analisar sua ideia. Tente novamente."));
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  const handleCreditConfirm = () => {
    setShowCreditConfirm(false);
    if (pendingAction) {
      pendingAction();
    }
  };

  return { 
    handleSubmit: handleRequestSubmit, 
    isAnalysisComplete, 
    setIsAnalysisComplete,
    showCreditConfirm,
    setShowCreditConfirm,
    handleCreditConfirm,
    isReanalyzing
  };
};
