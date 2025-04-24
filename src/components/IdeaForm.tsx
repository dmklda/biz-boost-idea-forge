
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface FormData {
  idea: string;
  audience: string;
  problem: string;
  hasCompetitors: string;
  monetization: string;
  budget: number;
  location: string;
}

const COUNTRIES = [
  "Brazil", "United States", "Canada", "United Kingdom", 
  "Germany", "France", "Australia", "India", "China", "Other"
];

const IdeaForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    idea: "",
    audience: "",
    problem: "",
    hasCompetitors: "",
    monetization: "",
    budget: 0,
    location: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      
      window.location.href = "/resultados";
      
      setFormData({
        idea: "",
        audience: "",
        problem: "",
        hasCompetitors: "",
        monetization: "",
        budget: 0,
        location: ""
      });
      setCurrentStep(1);
    }, 2000);
  };

  return (
    <section id="form" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-purple rounded-t-lg">
              <CardTitle className="text-white text-2xl">Compartilhe sua ideia</CardTitle>
              <CardDescription className="text-white/80">
                Nossa IA fornecerá uma análise detalhada do potencial de negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
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
                        onClick={handleNextStep}
                        disabled={formData.idea.trim().length < 10}
                        className="bg-brand-blue hover:bg-brand-blue/90"
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePrevStep}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleNextStep}
                        disabled={formData.audience.trim().length < 5 || formData.problem.trim().length < 5}
                        className="bg-brand-blue hover:bg-brand-blue/90"
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium block mb-3">
                        Existem concorrentes ou soluções parecidas no mercado?
                      </Label>
                      <RadioGroup 
                        value={formData.hasCompetitors}
                        onValueChange={(value) => updateFormData("hasCompetitors", value)}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sim" id="competitors-yes" />
                          <Label htmlFor="competitors-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao" id="competitors-no" />
                          <Label htmlFor="competitors-no">Não</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao-sei" id="competitors-unknown" />
                          <Label htmlFor="competitors-unknown">Não sei</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="monetization" className="text-base font-medium">
                        Como você pretende ganhar dinheiro com essa ideia?
                      </Label>
                      <Textarea 
                        id="monetization"
                        placeholder="Descreva seus planos de monetização..."
                        className="mt-2 resize-none"
                        rows={3}
                        value={formData.monetization}
                        onChange={(e) => updateFormData("monetization", e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePrevStep}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleNextStep}
                        disabled={!formData.hasCompetitors || formData.monetization.trim().length < 5}
                        className="bg-brand-green hover:bg-brand-green/90"
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePrevStep}
                      >
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
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default IdeaForm;

