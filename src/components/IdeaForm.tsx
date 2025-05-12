
import React from "react";
import { Card, CardContent } from "./ui/card";
import { IdeaFormProvider } from "@/contexts/IdeaFormContext";
import { IdeaFormHeader } from "./idea-form/IdeaFormHeader";
import { FormStepsContainer } from "./idea-form/FormStepsContainer";
import { SaveDraftButton } from "./idea-form/SaveDraftButton";
import { useFormSubmission } from "./idea-form/useFormSubmission";
import { useLocation } from "react-router-dom";

interface IdeaFormProps {
  ideaId?: string;
  isReanalyzing?: boolean;
}

export const IdeaForm = ({ ideaId, isReanalyzing }: IdeaFormProps) => {
  const location = useLocation();
  
  // Check if we're in the dashboard
  const isDashboard = location.pathname.includes('/dashboard');
  const wrapInCard = isDashboard === false;

  return (
    <IdeaFormProvider ideaId={ideaId}>
      <FormContainer wrapInCard={wrapInCard} isReanalyzing={isReanalyzing} />
    </IdeaFormProvider>
  );
};

// Separate component to access context
const FormContainer: React.FC<{
  wrapInCard: boolean;
  isReanalyzing?: boolean;
}> = ({ wrapInCard, isReanalyzing }) => {
  const { handleSubmit } = useFormSubmission(isReanalyzing);
  
  const formContent = (
    <form onSubmit={handleSubmit}>
      <FormStepsContainer />
      <SaveDraftButton />
    </form>
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
