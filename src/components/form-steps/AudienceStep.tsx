
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/form";

interface AudienceStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AudienceStep = ({ formData, updateFormData, onNext, onPrev }: AudienceStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="audience" className="text-base font-medium">
          Quem seria seu público-alvo?
        </Label>
        <Textarea 
          id="audience"
          placeholder="Descreva os clientes ideais para seu negócio..."
          className="mt-2 resize-none"
          rows={3}
          value={formData.audience}
          onChange={(e) => updateFormData("audience", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="problem" className="text-base font-medium">
          Qual problema essa ideia resolve?
        </Label>
        <Textarea 
          id="problem"
          placeholder="Descreva o problema que seu negócio solucionaria..."
          className="mt-2 resize-none"
          rows={3}
          value={formData.problem}
          onChange={(e) => updateFormData("problem", e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
          disabled={formData.audience.trim().length < 5 || formData.problem.trim().length < 5}
          className="bg-brand-blue hover:bg-brand-blue/90"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};
