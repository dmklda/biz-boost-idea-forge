
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/form";
import { useTranslation } from "react-i18next";

interface IdeaStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onNext: () => void;
}

export const IdeaStep = ({ formData, updateFormData, onNext }: IdeaStepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="idea" className="text-base font-medium">
          {t('ideaForm.idea.title')} ({t('common.max')} 300 {t('common.characters')})
        </Label>
        <Textarea 
          id="idea"
          placeholder={t('ideaForm.idea.placeholder')}
          className="mt-2 resize-none border-gray-200 dark:border-gray-700 focus:border-brand-blue focus:ring-brand-blue/20"
          rows={4}
          maxLength={300}
          value={formData.idea}
          onChange={(e) => updateFormData("idea", e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.idea.length}/300 {t('common.characters')}
        </p>
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={onNext}
          disabled={formData.idea.trim().length < 10}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
