
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { IdeaStep } from "./form-steps/IdeaStep";
import { AudienceStep } from "./form-steps/AudienceStep";
import { CompetitorsStep } from "./form-steps/CompetitorsStep";
import { BudgetLocationStep } from "./form-steps/BudgetLocationStep";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { SaveIcon } from "lucide-react";

interface IdeaFormProps {
  ideaId?: string;
  isReanalyzing?: boolean;
}

export const IdeaForm = ({ ideaId, isReanalyzing }: IdeaFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const {
    currentStep,
    formData,
    isSubmitting,
    isSavingDraft,
    editingIdeaId,
    setIsSubmitting,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm,
    saveAsDraft
  } = useIdeaForm(ideaId);
  
  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');
  
  // Add state for loading during analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        toast.success(t('ideaForm.analysisSuccess') || "Análise concluída com sucesso!");
        
        // If we're in the dashboard, navigate within the dashboard
        if (isDashboard) {
          navigate(`/dashboard/ideias?id=${analysisData.ideaId}`);
        } else {
          navigate(`/resultados?id=${analysisData.ideaId}`);
        }
      } else {
        // Not authenticated, redirect to login
        toast.info(t('ideaForm.loginRequired') || "É necessário fazer login para analisar ideias");
        navigate("/login");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t('ideaForm.analysisError') || "Erro ao analisar sua ideia. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };
  
  const handleSaveAsDraft = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      toast.error(t('auth.requiredForDraft', "É necessário estar logado para salvar rascunhos"));
      navigate("/login");
      return;
    }
    
    const saved = await saveAsDraft(authState.user.id);
    if (saved && isDashboard) {
      // Se salvou com sucesso e está no dashboard, oferece navegação para a página de rascunhos
      toast.success(
        t('ideaForm.draftSaved', "Rascunho salvo com sucesso!"), 
        {
          action: {
            label: t('ideaForm.viewDrafts', "Ver rascunhos"),
            onClick: () => navigate("/dashboard/rascunhos")
          }
        }
      );
    }
  };
  
  const wrapInCard = isDashboard === false;

  const formContent = (
    <form onSubmit={handleSubmit}>
      {currentStep === 1 && (
        <IdeaStep 
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNextStep}
        />
      )}

      {currentStep === 2 && (
        <AudienceStep 
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      )}

      {currentStep === 3 && (
        <CompetitorsStep 
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      )}

      {currentStep === 4 && (
        <BudgetLocationStep 
          formData={formData}
          updateFormData={updateFormData}
          onPrev={handlePrevStep}
          isSubmitting={isSubmitting || isAnalyzing}
          isAnalyzing={isAnalyzing}
        />
      )}
      
      {/* Botão de salvar como rascunho */}
      {authState.isAuthenticated && (
        <div className="mt-4 flex justify-center">
          <Button 
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSavingDraft || !formData.idea.trim() || isAnalyzing}
            className="flex items-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            {isSavingDraft
              ? t('ideaForm.savingDraft', "Salvando...")
              : t('ideaForm.saveAsDraft', "Salvar como rascunho")}
          </Button>
        </div>
      )}
    </form>
  );

  if (wrapInCard) {
    return (
      <section id="form" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-purple rounded-t-lg">
                <CardTitle className="text-white text-2xl font-poppins">
                  {isReanalyzing 
                    ? t('ideaForm.reanalyzeTitle', "Reanálise de Ideia") 
                    : t('ideaForm.title', "Análise de Negócio")}
                </CardTitle>
                <CardDescription className="text-white/80 font-inter">
                  {isReanalyzing 
                    ? t('ideaForm.reanalyzeSubtitle', "Refine sua ideia para uma nova análise")
                    : t('ideaForm.subtitle', "Vamos analisar sua ideia de negócio")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {formContent}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }
  
  return formContent;
};

export default IdeaForm;
