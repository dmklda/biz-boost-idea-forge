
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Target, Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboarding, OnboardingData } from '@/hooks/useOnboarding';
import { Link } from 'react-router-dom';

interface OnboardingPageProps {
  onComplete?: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    goal: '',
    hasIdea: false,
    experienceLevel: 'beginner',
    preference: 'analysis'
  });
  const { completeOnboarding } = useOnboarding();

  const steps = [
    {
      title: 'Bem-vindo!',
      subtitle: 'Vamos personalizar sua experiência',
      content: 'welcome'
    },
    {
      title: 'Qual seu objetivo?',
      subtitle: 'Como podemos te ajudar?',
      content: 'goal'
    },
    {
      title: 'Você já tem uma ideia?',
      subtitle: 'Vamos entender seu ponto de partida',
      content: 'idea'
    },
    {
      title: 'Seu nível de experiência',
      subtitle: 'Para personalizar as recomendações',
      content: 'experience'
    },
    {
      title: 'Sua preferência',
      subtitle: 'Como prefere usar a plataforma?',
      content: 'preference'
    },
    {
      title: 'Tudo pronto!',
      subtitle: 'Pronto para começar? Crie sua conta ou entre.',
      content: 'completion'
    }
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    completeOnboarding(formData);
    onComplete?.();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.content) {
      case 'welcome':
        return (
          <motion.div 
            className="text-center space-y-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-purple to-indigo-600 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-white" />
            </div>
            <p className="text-muted-foreground text-lg">
              Vamos configurar a plataforma do jeito que você precisa
            </p>
          </motion.div>
        );

      case 'goal':
        return (
          <div className="space-y-4">
            {[
              { id: 'validate', label: 'Validar uma ideia específica', icon: CheckCircle },
              { id: 'explore', label: 'Explorar novas oportunidades', icon: Lightbulb },
              { id: 'improve', label: 'Melhorar um negócio existente', icon: TrendingUp },
              { id: 'learn', label: 'Aprender sobre empreendedorismo', icon: Target }
            ].map((option) => (
              <Card 
                key={option.id}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  formData.goal === option.id 
                    ? 'border-brand-purple bg-brand-purple/10' 
                    : 'border-border hover:border-brand-purple/50'
                }`}
                onClick={() => setFormData({ ...formData, goal: option.id })}
              >
                <div className="flex items-center gap-3">
                  <option.icon className="w-6 h-6 text-brand-purple" />
                  <span>{option.label}</span>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'idea':
        return (
          <div className="space-y-4">
            {[
              { value: true, label: 'Sim, já tenho uma ideia definida', desc: 'Quero validar e analisar minha ideia' },
              { value: false, label: 'Não, ainda estou buscando', desc: 'Preciso de inspiração e sugestões' }
            ].map((option) => (
              <Card 
                key={option.value.toString()}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  formData.hasIdea === option.value 
                    ? 'border-brand-purple bg-brand-purple/10' 
                    : 'border-border hover:border-brand-purple/50'
                }`}
                onClick={() => setFormData({ ...formData, hasIdea: option.value })}
              >
                <div className="space-y-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {[
              { value: 'beginner', label: 'Iniciante', desc: 'Estou começando agora' },
              { value: 'intermediate', label: 'Intermediário', desc: 'Tenho alguma experiência' },
              { value: 'advanced', label: 'Avançado', desc: 'Já empreendi antes' }
            ].map((option) => (
              <Card 
                key={option.value}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  formData.experienceLevel === option.value 
                    ? 'border-brand-purple bg-brand-purple/10' 
                    : 'border-border hover:border-brand-purple/50'
                }`}
                onClick={() => setFormData({ ...formData, experienceLevel: option.value as any })}
              >
                <div className="space-y-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'preference':
        return (
          <div className="space-y-4">
            {[
              { value: 'analysis', label: 'Analisar minhas ideias', desc: 'Quero validar ideias que já tenho' },
              { value: 'suggestions', label: 'Receber sugestões', desc: 'Quero descobrir novas oportunidades' }
            ].map((option) => (
              <Card 
                key={option.value}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  formData.preference === option.value 
                    ? 'border-brand-purple bg-brand-purple/10' 
                    : 'border-border hover:border-brand-purple/50'
                }`}
                onClick={() => setFormData({ ...formData, preference: option.value as any })}
              >
                <div className="space-y-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'completion':
        return (
          <motion.div 
            className="text-center space-y-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <p className="text-muted-foreground">
              Configuração concluída! Agora você pode aproveitar ao máximo a plataforma.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="btn-premium">
                <Link to="/register" onClick={handleComplete}>
                  Criar conta
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login" onClick={handleComplete}>
                  Já tenho conta
                </Link>
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png" 
            alt="Startup Ideia Logo" 
            className="h-8 mx-auto mb-4" 
          />
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step content */}
        <div className="mb-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h1>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
            
            {renderStepContent()}
          </motion.div>
        </div>

        {/* Navigation buttons */}
        {currentStep < totalSteps - 1 && (
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            
            <Button
              onClick={nextStep}
              className="flex-1 btn-premium"
              disabled={
                (currentStep === 1 && !formData.goal) ||
                (currentStep === 3 && !formData.experienceLevel)
              }
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
