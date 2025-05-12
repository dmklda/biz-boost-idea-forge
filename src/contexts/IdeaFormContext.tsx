
import React, { createContext, useContext, useState } from "react";
import { FormData, FormStep } from "@/types/form";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useAuth } from "@/hooks/useAuth";

type IdeaFormContextType = {
  currentStep: FormStep;
  formData: FormData;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  isAnalyzing: boolean;
  editingIdeaId?: string;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  setIsSubmitting: (value: boolean) => void;
  setIsAnalyzing: (value: boolean) => void;
  saveAsDraft: () => Promise<boolean>;
};

const IdeaFormContext = createContext<IdeaFormContextType | undefined>(undefined);

export const IdeaFormProvider: React.FC<{
  children: React.ReactNode;
  ideaId?: string;
}> = ({ children, ideaId }) => {
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
    saveAsDraft: saveAsDraftFn
  } = useIdeaForm(ideaId);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { authState } = useAuth();

  // Wrap saveAsDraft to include user ID from auth
  const saveAsDraft = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }
    return saveAsDraftFn(authState.user.id);
  };

  return (
    <IdeaFormContext.Provider
      value={{
        currentStep,
        formData,
        isSubmitting,
        isSavingDraft,
        isAnalyzing,
        editingIdeaId,
        updateFormData,
        handleNextStep,
        handlePrevStep,
        setIsSubmitting,
        setIsAnalyzing,
        saveAsDraft
      }}
    >
      {children}
    </IdeaFormContext.Provider>
  );
};

export const useIdeaFormContext = (): IdeaFormContextType => {
  const context = useContext(IdeaFormContext);
  if (context === undefined) {
    throw new Error("useIdeaFormContext must be used within an IdeaFormProvider");
  }
  return context;
};
