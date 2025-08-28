import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminNotification {
  id: string;
  type: 'early_adopter_request';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const useAdminNotifications = () => {
  const { authState } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = authState.user?.email === 'marcior631@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchNotifications();
    
    // Buscar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchNotifications = async () => {
    if (!isAdmin) return;

    try {
      // Buscar apenas a contagem de pedidos pendentes
      const { count, error } = await supabase
        .from('early_adopters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;

      const pendingCount = count || 0;
      
      // Criar notificações baseadas na contagem
      const newNotifications: AdminNotification[] = pendingCount > 0 ? [{
        id: 'pending-adopters',
        type: 'early_adopter_request' as const,
        title: 'Novos pedidos Early Adopter',
        message: `${pendingCount} pedido(s) aguardando aprovação`,
        created_at: new Date().toISOString(),
        read: false
      }] : [];

      setNotifications(newNotifications);
      setUnreadCount(pendingCount);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    isAdmin,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};