
import { useState, useEffect } from "react";
import { FormData, FormStep } from "@/types/form";

const FORM_DATA_KEY = "savedIdeaFormData";

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
  // Try to load saved data from localStorage on initialization
  const getSavedFormData = (): FormData => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(FORM_DATA_KEY);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error("Failed to parse saved form data:", e);
        }
      }
    }
    return initialFormData;
  };

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>(getSavedFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

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
    localStorage.removeItem(FORM_DATA_KEY);
  };

  const getSavedIdeaData = (): FormData | null => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved form data:", e);
      }
    }
    return null;
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    setIsSubmitting,
    updateFormData,
    handleNextStep,
    handlePrevStep,
    resetForm,
    getSavedIdeaData
  };
};
