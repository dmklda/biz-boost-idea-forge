
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormData } from "@/types/form";
import { useTranslation } from "react-i18next";

interface CompetitorsStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const CompetitorsStep = ({ formData, updateFormData, onNext, onPrev }: CompetitorsStepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium block mb-3">
          {t('ideaForm.competitors.title')}
        </Label>
        <RadioGroup 
          value={formData.hasCompetitors}
          onValueChange={(value) => updateFormData("hasCompetitors", value)}
          className="flex flex-col space-y-2"
          aria-label={t('ideaForm.competitors.title')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="competitors-yes" />
            <Label htmlFor="competitors-yes">{t('ideaForm.competitors.yes')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="competitors-no" />
            <Label htmlFor="competitors-no">{t('ideaForm.competitors.no')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao-sei" id="competitors-unknown" />
            <Label htmlFor="competitors-unknown">{t('common.dontKnow')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="monetization" className="text-base font-medium">
          {t('ideaForm.monetization.title')}
        </Label>
        <Textarea 
          id="monetization"
          aria-label={t('ideaForm.monetization.title')}
          placeholder={t('ideaForm.monetization.placeholder')}
          className="mt-2 resize-none"
          rows={3}
          value={formData.monetization}
          onChange={(e) => updateFormData("monetization", e.target.value)}
          required
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          {t('common.back')}
        </Button>
        <Button 
          type="button"
          onClick={onNext}
          disabled={!formData.hasCompetitors || formData.monetization.trim().length < 5}
          className="bg-brand-green hover:bg-brand-green/90 text-white"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
