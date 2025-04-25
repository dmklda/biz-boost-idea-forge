
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

const IdeaForm = () => {
  const { t } = useTranslation();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      window.location.href = "/resultados";
      resetForm();
    }, 2000);
  };

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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default IdeaForm;
