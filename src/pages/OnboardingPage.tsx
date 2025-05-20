
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding, UserPreferences } from "@/hooks/use-onboarding";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    objective: "",
    hasBusinessIdea: false,
    experienceLevel: "beginner",
    preferenceType: "analysis"
  });
  
  const totalSteps = 5; // Initial welcome + 4 preference questions
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const finishOnboarding = () => {
    completeOnboarding(preferences);
    navigate("/login");
  };
  
  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo header */}
      <header className="p-4 flex justify-center border-b">
        <img 
          src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png" 
          alt="Startup Ideia" 
          className="h-8 w-auto"
        />
      </header>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted">
        <div 
          className="h-full bg-brand-purple transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      
      <div className="flex-1 flex flex-col p-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {currentStep === 0 && (
              <WelcomeScreen handleNext={handleNext} />
            )}
            
            {currentStep === 1 && (
              <ObjectiveScreen 
                value={preferences.objective}
                onChange={(value) => updatePreference("objective", value)}
              />
            )}
            
            {currentStep === 2 && (
              <BusinessIdeaScreen 
                value={preferences.hasBusinessIdea}
                onChange={(value) => updatePreference("hasBusinessIdea", value)}
              />
            )}
            
            {currentStep === 3 && (
              <ExperienceLevelScreen 
                value={preferences.experienceLevel}
                onChange={(value) => updatePreference("experienceLevel", value)}
              />
            )}
            
            {currentStep === 4 && (
              <PreferenceTypeScreen 
                value={preferences.preferenceType}
                onChange={(value) => updatePreference("preferenceType", value)}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {currentStep > 0 ? "Voltar" : ""}
          </Button>
          
          <Button 
            onClick={handleNext} 
            className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-1"
          >
            {currentStep < totalSteps - 1 ? "Próximo" : "Começar Agora"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ handleNext }: { handleNext: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="w-32 h-32 bg-gradient-to-br from-brand-purple to-indigo-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    </motion.div>
    
    <h1 className="text-2xl font-bold mb-4">Bem-vindo ao StartupIdeia</h1>
    <p className="text-muted-foreground mb-6">
      Vamos personalizar a sua experiência para ajudar a avaliar e desenvolver suas ideias de negócio.
    </p>
  </div>
);

const ObjectiveScreen = ({ 
  value, 
  onChange 
}: { 
  value: string;
  onChange: (value: string) => void 
}) => {
  const objectives = [
    { id: "validate", label: "Validar minhas ideias" },
    { id: "discover", label: "Descobrir novas oportunidades" },
    { id: "learn", label: "Aprender sobre empreendedorismo" },
    { id: "analyze", label: "Analisar o mercado" }
  ];
  
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Qual seu principal objetivo?</h2>
      
      <div className="space-y-3">
        {objectives.map((objective) => (
          <button
            key={objective.id}
            className={`w-full p-4 rounded-lg border ${
              value === objective.id 
                ? "border-brand-purple bg-brand-purple/10" 
                : "border-border hover:border-brand-purple/40"
            } text-left transition-colors`}
            onClick={() => onChange(objective.id)}
          >
            {objective.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const BusinessIdeaScreen = ({ 
  value, 
  onChange 
}: { 
  value: boolean;
  onChange: (value: boolean) => void 
}) => (
  <div className="flex-1 flex flex-col">
    <h2 className="text-xl font-semibold mb-6">Você já tem uma ideia de negócio?</h2>
    
    <div className="grid grid-cols-2 gap-4 mt-6">
      <button
        className={`p-6 rounded-lg border ${
          value === true
            ? "border-brand-purple bg-brand-purple/10" 
            : "border-border hover:border-brand-purple/40"
        } flex flex-col items-center justify-center gap-2 transition-colors`}
        onClick={() => onChange(true)}
      >
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <span>Sim</span>
      </button>
      
      <button
        className={`p-6 rounded-lg border ${
          value === false
            ? "border-brand-purple bg-brand-purple/10" 
            : "border-border hover:border-brand-purple/40"
        } flex flex-col items-center justify-center gap-2 transition-colors`}
        onClick={() => onChange(false)}
      >
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </div>
        <span>Não</span>
      </button>
    </div>
  </div>
);

const ExperienceLevelScreen = ({ 
  value, 
  onChange 
}: { 
  value: "beginner" | "intermediate" | "advanced";
  onChange: (value: "beginner" | "intermediate" | "advanced") => void 
}) => {
  const levels = [
    { id: "beginner", label: "Iniciante", description: "Estou começando agora" },
    { id: "intermediate", label: "Intermediário", description: "Já tenho alguma experiência" },
    { id: "advanced", label: "Avançado", description: "Já empreendi antes" }
  ];
  
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Qual seu nível de experiência com negócios?</h2>
      
      <div className="space-y-3">
        {levels.map((level) => (
          <button
            key={level.id}
            className={`w-full p-4 rounded-lg border ${
              value === level.id 
                ? "border-brand-purple bg-brand-purple/10" 
                : "border-border hover:border-brand-purple/40"
            } text-left transition-colors`}
            onClick={() => onChange(level.id as typeof value)}
          >
            <div className="font-medium">{level.label}</div>
            <div className="text-sm text-muted-foreground">{level.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const PreferenceTypeScreen = ({ 
  value, 
  onChange 
}: { 
  value: "suggestions" | "analysis";
  onChange: (value: "suggestions" | "analysis") => void 
}) => (
  <div className="flex-1 flex flex-col">
    <h2 className="text-xl font-semibold mb-6">O que você prefere?</h2>
    
    <div className="grid grid-cols-1 gap-4 mt-2">
      <button
        className={`p-6 rounded-lg border ${
          value === "suggestions"
            ? "border-brand-purple bg-brand-purple/10" 
            : "border-border hover:border-brand-purple/40"
        } flex items-center gap-4 transition-colors`}
        onClick={() => onChange("suggestions")}
      >
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="font-medium">Receber sugestões de ideias</div>
          <div className="text-sm text-muted-foreground">Quero inspiração para novos negócios</div>
        </div>
      </button>
      
      <button
        className={`p-6 rounded-lg border ${
          value === "analysis"
            ? "border-brand-purple bg-brand-purple/10" 
            : "border-border hover:border-brand-purple/40"
        } flex items-center gap-4 transition-colors`}
        onClick={() => onChange("analysis")}
      >
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="font-medium">Analisar minhas ideias</div>
          <div className="text-sm text-muted-foreground">Já tenho ideias e quero validá-las</div>
        </div>
      </button>
    </div>
  </div>
);

export default OnboardingPage;
