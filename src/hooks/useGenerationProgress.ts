import { useState, useCallback } from 'react';

export interface ProgressStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
}

export const useGenerationProgress = () => {
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);

  const initializeSteps = useCallback((stepDefinitions: Omit<ProgressStep, 'status'>[]) => {
    const initialSteps = stepDefinitions.map(step => ({
      ...step,
      status: 'pending' as const
    }));
    setSteps(initialSteps);
    setCurrentStep(0);
    setOverallProgress(0);
  }, []);

  const updateStepStatus = useCallback((stepId: string, status: ProgressStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));

    if (status === 'completed') {
      setSteps(prev => {
        const stepIndex = prev.findIndex(s => s.id === stepId);
        const progress = ((stepIndex + 1) / prev.length) * 100;
        setOverallProgress(progress);
        
        // Activate next step
        if (stepIndex < prev.length - 1) {
          setCurrentStep(stepIndex + 1);
          return prev.map((step, index) => 
            index === stepIndex + 1 ? { ...step, status: 'active' } : step
          );
        }
        return prev;
      });
    } else if (status === 'active') {
      setCurrentStep(prev => {
        const stepIndex = steps.findIndex(s => s.id === stepId);
        return stepIndex !== -1 ? stepIndex : prev;
      });
    }
  }, [steps]);

  const resetProgress = useCallback(() => {
    setSteps([]);
    setCurrentStep(0);
    setOverallProgress(0);
  }, []);

  return {
    steps,
    currentStep,
    overallProgress,
    initializeSteps,
    updateStepStatus,
    resetProgress
  };
};