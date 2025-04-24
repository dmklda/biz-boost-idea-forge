
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/form";

interface IdeaStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onNext: () => void;
}

export const IdeaStep = ({ formData, updateFormData, onNext }: IdeaStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="idea" className="text-base font-medium">
          Qual é sua ideia de negócio? (máx. 300 caracteres)
        </Label>
        <Textarea 
          id="idea"
          placeholder="Descreva sua ideia brevemente..."
          className="mt-2 resize-none"
          rows={4}
          maxLength={300}
          value={formData.idea}
          onChange={(e) => updateFormData("idea", e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.idea.length}/300 caracteres
        </p>
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={onNext}
          disabled={formData.idea.trim().length < 10}
          className="bg-brand-blue hover:bg-brand-blue/90"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};
