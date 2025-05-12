
import React from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Se o usuário está autenticado, salvar no Supabase
      if (authState.isAuthenticated && authState.user) {
        let idea;
        
        if (isReanalyzing && editingIdeaId) {
          // Atualizar ideia existente se for reanálise
          const { data: updatedIdea, error: updateError } = await supabase
            .from('ideas')
            .update({
              title: formData.idea,
              description: formData.idea,
              audience: formData.audience,
              problem: formData.problem,
              has_competitors: formData.hasCompetitors,
              monetization: formData.monetization,
              budget: formData.budget,
              location: formData.location,
              is_draft: false,
              status: 'complete'
            })
            .eq('id', editingIdeaId)
            .select('id')
            .single();
            
          if (updateError) throw updateError;
          idea = updatedIdea;
          
          // Cobrar um crédito pela reanálise
          const { error: creditError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: authState.user.id,
              amount: -1,
              description: 'Reanálise de ideia'
            });
            
          if (creditError) {
            console.error("Error charging credit:", creditError);
            // Continue anyway, we'll handle credits separately
          }
          
        } else {
          // Inserir nova ideia ou atualizar rascunho
          const ideaData = {
            user_id: authState.user.id,
            title: formData.idea,
            description: formData.idea,
            audience: formData.audience,
            problem: formData.problem,
            has_competitors: formData.hasCompetitors,
            monetization: formData.monetization,
            budget: formData.budget,
            location: formData.location,
            is_draft: false,
            status: 'complete'
          };
          
          let response;
          
          if (editingIdeaId) {
            // Atualizar rascunho existente
            response = await supabase
              .from('ideas')
              .update(ideaData)
              .eq('id', editingIdeaId)
              .select('id')
              .single();
          } else {
            // Criar nova ideia
            response = await supabase
              .from('ideas')
              .insert(ideaData)
              .select('id')
              .single();
          }

          if (response.error) throw response.error;
          idea = response.data;
        }

        // Redirecionar para a página de resultados
        toast.success(t('ideaForm.success') || "Ideia registrada com sucesso!");
        
        // If we're in the dashboard, navigate within the dashboard
        if (isDashboard) {
          navigate(`/dashboard/ideias?id=${idea.id}`);
        } else {
          navigate(`/resultados?id=${idea.id}`);
        }
      } else {
        // Se não está autenticado, redirecionar para login
        // O formData já está salvo no localStorage pelo useIdeaForm hook
        toast.success(t('ideaForm.success') || "Ideia registrada com sucesso!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t('ideaForm.error') || "Erro ao processar sua solicitação");
    } finally {
      setIsSubmitting(false);
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
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Botão de salvar como rascunho */}
      {authState.isAuthenticated && (
        <div className="mt-4 flex justify-center">
          <Button 
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSavingDraft || !formData.idea.trim()}
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
