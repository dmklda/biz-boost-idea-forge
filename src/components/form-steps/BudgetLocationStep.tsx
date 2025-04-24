
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "@/types/form";

const COUNTRIES = [
  "Brazil", "United States", "Canada", "United Kingdom", 
  "Germany", "France", "Australia", "India", "China", "Other"
];

interface BudgetLocationStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export const BudgetLocationStep = ({ 
  formData, 
  updateFormData, 
  onPrev,
  isSubmitting 
}: BudgetLocationStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="budget" className="text-base font-medium">
          Qual orçamento inicial está disponível para o negócio? (em R$)
        </Label>
        <Input 
          id="budget"
          type="number"
          placeholder="Digite o valor disponível para iniciar"
          className="mt-2"
          value={formData.budget}
          onChange={(e) => updateFormData("budget", Number(e.target.value))}
          min={0}
          required
        />
      </div>

      <div>
        <Label htmlFor="location" className="text-base font-medium">
          Em qual país será desenvolvido o negócio?
        </Label>
        <Select 
          value={formData.location}
          onValueChange={(value) => updateFormData("location", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button 
          type="submit"
          disabled={!formData.budget || !formData.location || isSubmitting}
          className="bg-brand-green hover:bg-brand-green/90"
        >
          {isSubmitting ? "Analisando..." : "Analisar Ideia"}
        </Button>
      </div>
    </div>
  );
};
