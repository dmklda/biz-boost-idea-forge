
import { useState } from "react";
import { FormData, FormStep } from "@/types/form";

const initialFormData: FormData = {
  idea: "",
  audience: "",
  problem: "",
  hasCompetitors: "",
  monetization: "",
  budget: 0,
  location: ""
};

export const useIdeaForm = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    setCurrentStep(prev => (prev + 1) as FormStep);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => (prev - 1) as FormStep);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    setIsSubmitting,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm
  };
};
