
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "@/types/form";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  const COUNTRIES = [
    "Brazil", "United States", "Canada", "United Kingdom", 
    "Germany", "France", "Australia", "India", "China", "Other"
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="budget" className="text-base font-medium">
          {t('ideaForm.budget.title')}
        </Label>
        <Input 
          id="budget"
          type="number"
          placeholder={t('ideaForm.budget.placeholder')}
          className="mt-2"
          value={formData.budget}
          onChange={(e) => updateFormData("budget", Number(e.target.value))}
          min={0}
          required
        />
      </div>

      <div>
        <Label htmlFor="location" className="text-base font-medium">
          {t('ideaForm.location.title')}
        </Label>
        <Select 
          value={formData.location}
          onValueChange={(value) => updateFormData("location", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder={t('ideaForm.location.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {t(`countries.${country.toLowerCase().replace(' ', '')}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          {t('common.back')}
        </Button>
        <Button 
          type="submit"
          disabled={!formData.budget || !formData.location || isSubmitting}
          className="bg-brand-green hover:bg-brand-green/90"
        >
          {isSubmitting ? t('ideaForm.submitting') : t('ideaForm.submit')}
        </Button>
      </div>
    </div>
  );
};
