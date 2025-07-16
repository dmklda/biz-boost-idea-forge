
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
        <Label htmlFor="idea" className="font-semibold">
          {t('ideaForm.idea.title', 'Sua ideia')}
        </Label>
        <Textarea
          id="idea"
          aria-label={t('ideaForm.idea.title', 'Sua ideia')}
          value={formData.idea}
          onChange={(e) => updateFormData("idea", e.target.value)}
          placeholder={t('ideaForm.idea.placeholder', 'Descreva sua ideia aqui...')}
          className="resize-none min-h-[100px]"
          maxLength={300}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>
            {t('ideaForm.idea.max', 'Máximo')} 300 {t('ideaForm.idea.characters', 'caracteres')}
          </span>
          <span>{formData.idea.length}/300</span>
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={onNext}
          disabled={formData.idea.trim().length < 10}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white"
        >
          {t('common.next', 'Próximo')}
        </Button>
      </div>
    </div>
  );
};
