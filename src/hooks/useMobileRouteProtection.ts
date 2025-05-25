
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';

export const useMobileRouteProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isCompleted } = useOnboarding();
  const { authState } = useAuth();

  useEffect(() => {
    // Only protect mobile users trying to access the landing page
    if (!isMobile || location.pathname !== '/') {
      return;
    }

    // If onboarding is not completed, let IntelligentRedirect handle it
    if (!isCompleted) {
      return;
    }

    // If onboarding is completed, redirect based on auth state
    if (authState.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isMobile, location.pathname, isCompleted, authState.isAuthenticated, navigate]);
};
