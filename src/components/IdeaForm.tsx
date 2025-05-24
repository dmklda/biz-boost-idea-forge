
import React, { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { IdeaFormProvider } from "@/contexts/IdeaFormContext";
import { IdeaFormHeader } from "./idea-form/IdeaFormHeader";
import { FormStepsContainer } from "./idea-form/FormStepsContainer";
import { SaveDraftButton } from "./idea-form/SaveDraftButton";
import { useFormSubmission } from "./idea-form/useFormSubmission";
import { CreditConfirmModal } from "./idea-form/CreditConfirmModal";
import { useLocation } from "react-router-dom";

interface IdeaFormProps {
  ideaId?: string;
  isReanalyzing?: boolean;
  onAnalysisComplete?: () => void;
}

export const IdeaForm = ({ ideaId, isReanalyzing, onAnalysisComplete }: IdeaFormProps) => {
  const location = useLocation();
  
  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');
  const wrapInCard = isDashboard === false;

  return (
    <IdeaFormProvider ideaId={ideaId}>
      <FormContainer 
        wrapInCard={wrapInCard} 
        isReanalyzing={isReanalyzing} 
        onAnalysisComplete={onAnalysisComplete} 
      />
    </IdeaFormProvider>
  );
};

// Separate component to access context
const FormContainer: React.FC<{
  wrapInCard: boolean;
  isReanalyzing?: boolean;
  onAnalysisComplete?: () => void;
}> = ({ wrapInCard, isReanalyzing, onAnalysisComplete }) => {
  const { 
    handleSubmit, 
    isAnalysisComplete, 
    showCreditConfirm, 
    setShowCreditConfirm, 
    handleCreditConfirm 
  } = useFormSubmission(isReanalyzing);
  
  // Use useEffect para chamar onAnalysisComplete quando a análise for concluída
  useEffect(() => {
    if (isAnalysisComplete && onAnalysisComplete) {
      onAnalysisComplete();
    }
  }, [isAnalysisComplete, onAnalysisComplete]);
  
  // Se a análise foi completada, não renderizar o formulário
  if (isAnalysisComplete) {
    return null;
  }
  
  const formContent = (
    <>
      <form onSubmit={handleSubmit}>
        <FormStepsContainer />
        <SaveDraftButton />
      </form>
      
      <CreditConfirmModal
        isOpen={showCreditConfirm}
        onClose={() => setShowCreditConfirm(false)}
        onConfirm={handleCreditConfirm}
        isReanalyzing={isReanalyzing}
      />
    </>
  );

  if (wrapInCard) {
    return (
      <section id="form" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <IdeaFormHeader isReanalyzing={isReanalyzing} />
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
