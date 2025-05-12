
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
    setIsAnalyzing,
    resetForm 
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
        console.log("Sending form data:", formData);
        
        // Call the analyze-idea edge function
        const { data: analysisData, error: analysisError } = await supabase.functions
          .invoke('analyze-idea', {
            body: JSON.stringify({
              ideaData: formData,
              userId: authState.user.id,
              ideaId: editingIdeaId,
              isReanalyzing
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
        
        // Success! Navigate to results page
        toast.success(t('ideaForm.analysisSuccess', "Análise concluída com sucesso!"));
        
        // Reset the form to close it
        resetForm();
        
        // Sempre navegar para a página de resultados no dashboard
        navigate(`/dashboard/resultados?id=${analysisData.ideaId}`);
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
