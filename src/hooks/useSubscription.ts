import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const { authState } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!authState.isAuthenticated || !authState.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar o status da assinatura",
          variant: "destructive"
        });
        return;
      }

      setSubscriptionData(data);
    } catch (error) {
      console.error('Subscription check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (planType: string, paymentType: 'subscription' | 'credits') => {
    console.log('createCheckoutSession called with:', { planType, paymentType });
    console.log('authState.isAuthenticated:', authState.isAuthenticated);
    
    if (!authState.isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingCheckout(true);
    try {
      console.log('Invoking create-checkout function...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType, paymentType }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a sessão de pagamento",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecionando...",
          description: "Você será redirecionado para o checkout",
        });
      } else {
        console.error('No URL returned from checkout session');
        toast({
          title: "Erro",
          description: "Nenhuma URL de checkout retornada",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Checkout creation failed:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar sessão de checkout",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const createCustomerPortalSession = async () => {
    if (!authState.isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para gerenciar sua assinatura",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Error creating portal session:', error);
        toast({
          title: "Erro", 
          description: "Não foi possível acessar o portal do cliente",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal creation failed:', error);
    }
  };

  // Check subscription on auth state change
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      checkSubscription();
    } else {
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Auto-refresh subscription status periodically
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(checkSubscription, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  return {
    ...subscriptionData,
    isLoading,
    isCreatingCheckout,
    checkSubscription,
    createCheckoutSession,
    createCustomerPortalSession
  };
};