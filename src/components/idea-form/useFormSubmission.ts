
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { useIdeaFormContext } from "@/contexts/IdeaFormContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useFormSubmission = (isReanalyzing?: boolean) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const { 
    formData, 
    editingIdeaId, 
    setIsSubmitting, 
    setIsAnalyzing 
  } = useIdeaFormContext();

  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsAnalyzing(true);
    
    try {
      // If user is authenticated, process with Supabase
      if (authState.isAuthenticated && authState.user) {
        
        // Call the analyze-idea edge function
        const { data: analysisData, error: analysisError } = await supabase.functions
          .invoke('analyze-idea', {
            body: {
              ideaData: formData,
              userId: authState.user.id,
              ideaId: editingIdeaId,
              isReanalyzing
            }
          });
          
        if (analysisError) {
          console.error("Analysis error:", analysisError);
          
          // Special handling for insufficient credits
          if (analysisError.message && analysisError.message.includes('INSUFFICIENT_CREDITS')) {
            toast.error(t('ideaForm.insufficientCredits', "Créditos insuficientes para análise"));
            
            if (isDashboard) {
              navigate("/dashboard/creditos");
            }
            return;
          }
          
          throw new Error(analysisError.message || "Erro ao analisar ideia");
        }
        
        // Success! Navigate to results page
        toast.success(t('ideaForm.analysisSuccess', "Análise concluída com sucesso!"));
        
        // If we're in the dashboard, navigate within the dashboard
        if (isDashboard) {
          // If coming from drafts, redirect back to drafts with analyzed parameter
          if (location.pathname.includes('editar') && editingIdeaId) {
            navigate(`/dashboard/rascunhos?analyzed=${analysisData.ideaId}`);
          } else {
            navigate(`/dashboard/ideias?id=${analysisData.ideaId}`);
          }
        } else {
          navigate(`/resultados?id=${analysisData.ideaId}`);
        }
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

  return { handleSubmit };
};
