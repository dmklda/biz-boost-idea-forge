
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormData } from "@/types/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface BudgetLocationStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onPrev: () => void;
  isSubmitting: boolean;
  isAnalyzing?: boolean;
}

export const BudgetLocationStep = ({ 
  formData, 
  updateFormData, 
  onPrev, 
  isSubmitting,
  isAnalyzing = false
}: BudgetLocationStepProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  
  const locations = [
    "Brasil",
    "Estados Unidos",
    "União Europeia",
    "Reino Unido",
    "Canadá",
    "Austrália",
    "Nova Zelândia",
    "Japão",
    "China",
    "Índia",
    "Global",
    "Outro"
  ];
  
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty strings to clear the field
    if (value === "") {
      updateFormData("budget", 0);
      setError("");
      return;
    }
    
    // Only allow numbers
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      setError(t('ideaForm.budget.error', "Por favor, insira um valor numérico"));
      return;
    }
    
    setError("");
    updateFormData("budget", numberValue);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="budget" className="text-base font-medium">
          {t('ideaForm.budget.title')}
        </Label>
        <div className="mt-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">R$</span>
            </div>
            <Input 
              id="budget"
              type="text"
              placeholder="0,00"
              className="pl-10"
              value={formData.budget > 0 ? formData.budget : ""}
              onChange={handleBudgetChange}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="location" className="text-base font-medium">
          {t('ideaForm.location.title')}
        </Label>
        <Select 
          value={formData.location} 
          onValueChange={(value) => updateFormData("location", value)}
        >
          <SelectTrigger id="location" className="mt-2">
            <SelectValue placeholder={t('ideaForm.location.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} disabled={isSubmitting}>
          {t('common.back', "Voltar")}
        </Button>
        
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('ideaForm.analyzing', "Analisando...")}
            </>
          ) : (
            isSubmitting ? t('common.submitting', "Enviando...") : t('ideaForm.analyze', "Analisar")
          )}
        </Button>
      </div>
    </div>
  );
};
