
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/form";
import { useTranslation } from "react-i18next";

interface MonetizationStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const MonetizationStep = ({ formData, updateFormData, onNext, onPrev }: MonetizationStepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="monetization" className="text-base font-medium">
          {t('ideaForm.monetization.title')}
        </Label>
        <Textarea 
          id="monetization"
          aria-label={t('ideaForm.monetization.title')}
          placeholder={t('ideaForm.monetization.placeholder')}
          className="mt-2 resize-none transition-all duration-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
          rows={3}
          value={formData.monetization}
          onChange={(e) => updateFormData("monetization", e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} className="transition-all duration-200 hover:scale-105">
          {t('common.back')}
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
          disabled={formData.monetization.trim().length < 5}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
