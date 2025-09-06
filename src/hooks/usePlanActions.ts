import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';

export const usePlanActions = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handlePlanSelection = (planType: 'free' | 'entrepreneur' | 'business') => {
    if (!authState.isAuthenticated) {
      // Redirect to login with return URL
      toast({
        title: t('auth.loginRequired') || 'Login Required',
        description: t('auth.loginToSubscribe') || 'Please login to select a plan',
      });
      navigate(`/login?returnUrl=/planos&plan=${planType}`);
      return;
    }

    // If user is authenticated, go to plans page with selected plan
    navigate(`/planos?plan=${planType}`);
  };

  return {
    handlePlanSelection
  };
};