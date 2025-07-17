
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
          {t('ideaForm.competitors.title', 'Existem concorrentes no mercado?')}
        </Label>
        <RadioGroup 
          value={formData.hasCompetitors}
          onValueChange={(value) => updateFormData("hasCompetitors", value)}
          className="flex flex-col space-y-2 transition-all duration-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
          aria-label={t('ideaForm.competitors.title', 'Existem concorrentes no mercado?')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="competitors-yes" />
            <Label htmlFor="competitors-yes">{t('ideaForm.competitors.yes', 'Sim, existem soluções similares')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="competitors-no" />
            <Label htmlFor="competitors-no">{t('ideaForm.competitors.no', 'Não, é uma solução inovadora')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao-sei" id="competitors-unknown" />
            <Label htmlFor="competitors-unknown">{t('common.dontKnow', 'Não sei')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="monetization" className="text-base font-medium">
          {t('ideaForm.monetization.title', 'Como pretende monetizar?')}
        </Label>
        <Textarea 
          id="monetization"
          aria-label={t('ideaForm.monetization.title', 'Como pretende monetizar?')}
          placeholder={t('ideaForm.monetization.placeholder', 'Descreva como seu negócio irá gerar receita...')}
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
          disabled={!formData.hasCompetitors || formData.monetization.trim().length < 5}
          className="bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
