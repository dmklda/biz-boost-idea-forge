import React, { useState, useEffect } from "react";
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
import { Save } from "lucide-react";

export const IdeaForm = ({ draftId }: { draftId?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const {
    currentStep,
    formData,
    isSubmitting,
    isSavingDraft,
    setIsSubmitting,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm,
    saveAsDraft,
    loadDraft
  } = useIdeaForm();
  
  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  // Efeito para carregar rascunho se um ID for fornecido
  useEffect(() => {
    if (draftId && authState.isAuthenticated) {
      loadDraft(draftId).catch(error => {
        console.error("Failed to load draft:", error);
        toast.error(t('ideaForm.errors.loadDraft') || "Erro ao carregar rascunho");
      });
    }
  }, [draftId, authState.isAuthenticated, loadDraft, t]);

  const wrapInCard = isDashboard === false;

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
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
      </div>
      
      {/* Botão "Salvar como rascunho" disponível em todas as etapas */}
      <div className="flex justify-center mb-4">
        <Button 
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleSaveAsDraft}
          disabled={isSavingDraft || isSubmitting || !formData.idea.trim()}
        >
          <Save className="h-4 w-4" />
          {isSavingDraft 
            ? (t('ideaForm.savingDraft') || "Salvando...") 
            : (t('ideaForm.saveAsDraft') || "Salvar como rascunho")
          }
        </Button>
      </div>
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
                  {t('ideaForm.title')}
                </CardTitle>
                <CardDescription className="text-white/80 font-inter">
                  {t('ideaForm.subtitle')}
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
  
  // Função handleSubmit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Se o usuário está autenticado, salvar no Supabase
      if (authState.isAuthenticated && authState.user) {
        // Dados para inserção/atualização
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

        // Se estamos editando um rascunho, atualizar
        let response;
        if (draftId) {
          response = supabase
            .from('ideas')
            .update(ideaData)
            .eq('id', draftId)
            .select('id')
            .single();
        } else {
          // Inserir a ideia no banco de dados
          response = supabase
            .from('ideas')
            .insert(ideaData)
            .select('id')
            .single();
        }

        response.then(({ data, error }) => {
          if (error) {
            console.error("Error saving idea:", error);
            throw new Error("Erro ao salvar ideia");
          }

          // Limpar dados do rascunho do localStorage após envio completo
          resetForm();

          // Redirecionar para a página de resultados
          toast.success(t('ideaForm.success') || "Ideia registrada com sucesso!");
          
          // If we're in the dashboard, navigate within the dashboard
          if (isDashboard) {
            navigate(`/dashboard/ideias?id=${data.id}`);
          } else {
            navigate(`/resultados?id=${data.id}`);
          }
        }).catch((error) => {
          console.error("Form submission error:", error);
          toast.error(t('ideaForm.error') || "Erro ao processar sua solicitação");
        }).finally(() => {
          setIsSubmitting(false);
        });
      } else {
        // Se não está autenticado, redirecionar para login
        // O formData já está salvo no localStorage pelo useIdeaForm hook
        toast.success(t('ideaForm.success') || "Ideia registrada com sucesso!");
        navigate("/login");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t('ideaForm.error') || "Erro ao processar sua solicitação");
      setIsSubmitting(false);
    }
  }

  // Função handleSaveAsDraft
  function handleSaveAsDraft() {
    try {
      if (authState.isAuthenticated && authState.user) {
        saveAsDraft(authState.user.id).then(savedDraftId => {
          toast.success(t('ideaForm.draftSaved') || "Rascunho salvo com sucesso!");
          
          // Se estiver no dashboard, redirecionar para a lista de rascunhos
          if (isDashboard) {
            navigate('/dashboard/rascunhos');
          }
        }).catch(error => {
          console.error("Error saving draft:", error);
          toast.error(t('ideaForm.draftSaveError') || "Erro ao salvar rascunho");
        });
      } else {
        // Se não estiver autenticado, redirecionar para login
        toast.info(t('ideaForm.loginToSaveDraft') || "Faça login para salvar rascunho");
        // Salvar dados no localStorage e redirecionar
        navigate('/login');
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(t('ideaForm.draftSaveError') || "Erro ao salvar rascunho");
    }
  }
};

export default IdeaForm;
