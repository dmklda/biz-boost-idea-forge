import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingPage } from './OnboardingPage';

export const IntelligentRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isCompleted } = useOnboarding();
  const { authState } = useAuth();

  // Check if we should show onboarding
  const shouldShowOnboarding = isMobile && !isCompleted && location.pathname === '/';

  const handleOnboardingComplete = () => {
    // After onboarding, redirect based on auth state
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // If we should show onboarding, render it
  if (shouldShowOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  // Otherwise, render the normal app
  return <>{children}</>;
};
