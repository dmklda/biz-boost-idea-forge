
import React from "react";
import { IdeaStep } from "@/components/form-steps/IdeaStep";
import { AudienceStep } from "@/components/form-steps/AudienceStep";
import { CompetitorsStep } from "@/components/form-steps/CompetitorsStep";
import { BudgetLocationStep } from "@/components/form-steps/BudgetLocationStep";
import { useIdeaFormContext } from "@/contexts/IdeaFormContext";

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

  return (
    <>
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
    </>
  );
};
