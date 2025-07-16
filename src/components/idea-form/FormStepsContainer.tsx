
import React from "react";
import { IdeaStep } from "@/components/form-steps/IdeaStep";
import { AudienceStep } from "@/components/form-steps/AudienceStep";
import { CompetitorsStep } from "@/components/form-steps/CompetitorsStep";
import { BudgetLocationStep } from "@/components/form-steps/BudgetLocationStep";
import { useIdeaFormContext } from "@/contexts/IdeaFormContext";
import { useTranslation } from "react-i18next";

export const FormStepsContainer: React.FC = () => {
  const { 
    currentStep, 
    formData, 
    updateFormData, 
    handleNextStep, 
    handlePrevStep, 
    isSubmitting,
    isAnalyzing
  } = useIdeaFormContext();

  const { t } = useTranslation();

  return (
    <>
      {currentStep === 1 && (
        <>
          <div className="mb-4 text-lg font-semibold text-brand-purple">
            {t('ideaForm.step.idea', 'Descreva sua ideia')}
          </div>
          <IdeaStep 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
          />
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="mb-4 text-lg font-semibold text-brand-purple">
            {t('ideaForm.step.audience', 'Público-alvo e mercado')}
          </div>
          <AudienceStep 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="mb-4 text-lg font-semibold text-brand-purple">
            {t('ideaForm.step.competitors', 'Concorrentes e diferenciais')}
          </div>
          <CompetitorsStep 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        </>
      )}

      {currentStep === 4 && (
        <>
          <div className="mb-4 text-lg font-semibold text-brand-purple">
            {t('ideaForm.step.budgetLocation', 'Orçamento e localização')}
          </div>
          <BudgetLocationStep 
            formData={formData}
            updateFormData={updateFormData}
            onPrev={handlePrevStep}
            isSubmitting={isSubmitting || isAnalyzing}
            isAnalyzing={isAnalyzing}
          />
        </>
      )}
    </>
  );
};
