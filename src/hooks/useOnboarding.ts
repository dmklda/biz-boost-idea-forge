
import { useState, useEffect } from 'react';

export interface OnboardingData {
  goal: string;
  hasIdea: boolean;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preference: 'suggestions' | 'analysis';
}

export const useOnboarding = () => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [data, setData] = useState<OnboardingData>({
    goal: '',
    hasIdea: false,
    experienceLevel: 'beginner',
    preference: 'analysis'
  });

  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted');
    setIsCompleted(completed === 'true');
    
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
      }
    }
  }, []);

  const completeOnboarding = (onboardingData: OnboardingData) => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    setIsCompleted(true);
    setData(onboardingData);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('onboardingData');
    setIsCompleted(false);
    setData({
      goal: '',
      hasIdea: false,
      experienceLevel: 'beginner',
      preference: 'analysis'
    });
  };

  return {
    isCompleted,
    data,
    completeOnboarding,
    resetOnboarding
  };
};
