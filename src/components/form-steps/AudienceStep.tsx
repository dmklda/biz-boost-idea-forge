
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/form";
import { useTranslation } from "react-i18next";

interface AudienceStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AudienceStep = ({ formData, updateFormData, onNext, onPrev }: AudienceStepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="audience" className="text-base font-medium">
          {t('ideaForm.audience.title', 'Quem seria seu público-alvo?')}
        </Label>
        <Textarea 
          id="audience"
          aria-label={t('ideaForm.audience.title', 'Quem seria seu público-alvo?')}
          placeholder={t('ideaForm.audience.placeholder', 'Descreva os clientes ideais para seu negócio...')}
          className="mt-2 resize-none transition-all duration-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
          rows={3}
          value={formData.audience}
          onChange={(e) => updateFormData("audience", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="problem" className="text-base font-medium">
          {t('ideaForm.problem.title', 'Qual problema essa ideia resolve?')}
        </Label>
        <Textarea 
          id="problem"
          aria-label={t('ideaForm.problem.title', 'Qual problema essa ideia resolve?')}
          placeholder={t('ideaForm.problem.placeholder', 'Descreva o problema que seu negócio solucionaria...')}
          className="mt-2 resize-none transition-all duration-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
          rows={3}
          value={formData.problem}
          onChange={(e) => updateFormData("problem", e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} className="transition-all duration-200 hover:scale-105">
          {t('common.back', 'Voltar')}
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
          disabled={formData.audience.trim().length < 5 || formData.problem.trim().length < 5}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
        >
          {t('common.next', 'Próximo')}
        </Button>
      </div>
    </div>
  );
};
