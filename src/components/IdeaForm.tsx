
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

export const IdeaForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const {
    currentStep,
    formData,
    isSubmitting,
    setIsSubmitting,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm
  } = useIdeaForm();
  
  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Se o usuário está autenticado, salvar no Supabase
      if (authState.isAuthenticated && authState.user) {
        // Inserir a ideia no banco de dados
        const { data: idea, error: ideaError } = await supabase
          .from('ideas')
          .insert({
            user_id: authState.user.id,
            title: formData.idea,
            description: formData.idea,
            audience: formData.audience,
            problem: formData.problem,
            has_competitors: formData.hasCompetitors,
            monetization: formData.monetization,
            budget: formData.budget,
            location: formData.location
          })
          .select('id')
          .single();

        if (ideaError) {
          console.error("Error saving idea:", ideaError);
          throw new Error("Erro ao salvar ideia");
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
};

export default IdeaForm;
