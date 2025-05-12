
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
  
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsAnalyzing(true);
    setIsAnalysisComplete(false);
    
    try {
      // If user is authenticated, process with Supabase
      if (authState.isAuthenticated && authState.user) {
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
                language: currentLanguage
              },
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
        
        // Log successful response for debugging
        console.log("Analysis completed successfully:", analysisData);
        
        // Success! Navigate to results page
        toast.success(t('ideaForm.analysisSuccess', "Análise concluída com sucesso!"));
        
        // Mark analysis as complete
        setIsAnalysisComplete(true);
        
        // Reset the form to close it
        resetForm();
        
        // Always navigate to the results page in the dashboard
        if (analysisData && analysisData.ideaId) {
          navigate(`/dashboard/resultados?id=${analysisData.ideaId}`);
        } else {
          console.error("Missing ideaId in response:", analysisData);
          toast.error(t('ideaForm.missingData', "Dados da análise incompletos. Entre em contato com o suporte."));
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

  return { handleSubmit, isAnalysisComplete };
};
