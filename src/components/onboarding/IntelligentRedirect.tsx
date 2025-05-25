
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

  useEffect(() => {
    // Only handle mobile users on landing page
    if (!isMobile || location.pathname !== '/') {
      return;
    }

    // If onboarding is completed, redirect immediately
    if (isCompleted) {
      if (authState.isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isMobile, location.pathname, isCompleted, authState.isAuthenticated, navigate]);

  // Check if we should show onboarding (mobile, not completed, on landing page)
  const shouldShowOnboarding = isMobile && !isCompleted && location.pathname === '/';

  const handleOnboardingComplete = () => {
    // After onboarding, redirect based on auth state
    if (authState.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  // If we should show onboarding, render it
  if (shouldShowOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  // For mobile users on landing page with completed onboarding, show nothing (redirect will happen)
  if (isMobile && location.pathname === '/' && isCompleted) {
    return null;
  }

  // Otherwise, render the normal app
  return <>{children}</>;
};
