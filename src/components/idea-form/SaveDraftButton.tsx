
import React from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIdeaFormContext } from "@/contexts/IdeaFormContext";
import { useAuth } from "@/hooks/useAuth";

export const SaveDraftButton: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { formData, isSavingDraft, isAnalyzing, saveAsDraft } = useIdeaFormContext();

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-center">
      <Button 
        type="button"
        variant="outline"
        onClick={saveAsDraft}
        disabled={isSavingDraft || !formData.idea.trim() || isAnalyzing}
        className="flex items-center gap-2"
        aria-label={isSavingDraft ? t('ideaForm.savingDraft', 'Salvando...') : t('ideaForm.saveAsDraft', 'Salvar como rascunho')}
      >
        <SaveIcon className="w-4 h-4" />
        {isSavingDraft
          ? t('ideaForm.savingDraft', "Salvando...")
          : t('ideaForm.saveAsDraft', "Salvar como rascunho")}
      </Button>
    </div>
  );
};
