import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface EarlyAdopterStatus {
  isEarlyAdopter: boolean;
  status: 'pending' | 'approved' | 'rejected' | null;
  loading: boolean;
}

export const useEarlyAdopter = (): EarlyAdopterStatus => {
  const { authState } = useAuth();
  const [adopterStatus, setAdopterStatus] = useState<EarlyAdopterStatus>({
    isEarlyAdopter: false,
    status: null,
    loading: true,
  });

  useEffect(() => {
    const checkEarlyAdopterStatus = async () => {
      if (!authState.user) {
        setAdopterStatus({ isEarlyAdopter: false, status: null, loading: false });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('early_adopters')
          .select('status')
          .eq('user_id', authState.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setAdopterStatus({
            isEarlyAdopter: data.status === 'approved',
            status: data.status as 'pending' | 'approved' | 'rejected',
            loading: false,
          });
        } else {
          setAdopterStatus({
            isEarlyAdopter: false,
            status: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error checking early adopter status:', error);
        setAdopterStatus({ isEarlyAdopter: false, status: null, loading: false });
      }
    };

    checkEarlyAdopterStatus();
  }, [authState.user]);

  return adopterStatus;
};