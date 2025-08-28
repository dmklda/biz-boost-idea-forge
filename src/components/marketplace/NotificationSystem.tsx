import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  Clock, 
  Target, 
  Users, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  X,
  Filter,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface NotificationPreference {
  id: string;
  type: 'new_validation' | 'matching_opportunity' | 'response_received' | 'deadline_reminder' | 'reward_earned';
  name: string;
  description: string;
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  filters: {
    sectors: string[];
    minReward: number;
    maxDistance: number; // for location-based
  };
}

interface Notification {
  id: string;
  type: 'new_validation' | 'matching_opportunity' | 'response_received' | 'deadline_reminder' | 'reward_earned';
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
}

const NotificationSystem = () => {
  const { authState } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (authState.user) {
      loadNotifications();
      loadPreferences();
      setupRealtimeSubscription();
    }
  }, [authState.user]);

  const loadNotifications = async () => {
    try {
      // Simulate loading notifications - in production, this would come from Supabase
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'new_validation',
          title: 'Nova Validação Disponível',
          message: 'App de Delivery Sustentável precisa de feedback sobre UX',
          data: { validationId: 'val_123', reward: 75 },
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          priority: 'high',
          actionUrl: '/marketplace/validation/val_123',
          actionLabel: 'Ver Validação'
        },
        {
          id: '2',
          type: 'matching_opportunity',
          title: 'Oportunidade Perfeita para Você!',
          message: 'FinTech de investimentos - 95% de compatibilidade',
          data: { validationId: 'val_124', matchScore: 95 },
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
          priority: 'high',
          actionUrl: '/marketplace/validation/val_124',
          actionLabel: 'Participar'
        },
        {
          id: '3',
          type: 'response_received',
          title: 'Resposta Recebida',
          message: 'Sua validação "App de Fitness" recebeu uma nova resposta',
          data: { validationId: 'val_125', responseId: 'resp_456' },
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
          priority: 'medium',
          actionUrl: '/dashboard/validations/val_125',
          actionLabel: 'Ver Resposta'
        },
        {
          id: '4',
          type: 'deadline_reminder',
          title: 'Prazo se Aproximando',
          message: 'Validação "E-commerce B2B" expira em 2 dias',
          data: { validationId: 'val_126', daysLeft: 2 },
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
          priority: 'medium',
          actionUrl: '/marketplace/validation/val_126',
          actionLabel: 'Participar Agora'
        },
        {
          id: '5',
          type: 'reward_earned',
          title: 'Recompensa Conquistada! 🎉',
          message: 'Você ganhou 50 pontos pela resposta aprovada',
          data: { points: 50, validationId: 'val_127' },
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h ago
          priority: 'low',
          actionUrl: '/dashboard/rewards',
          actionLabel: 'Ver Recompensas'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const defaultPreferences: NotificationPreference[] = [
        {
          id: 'new_validation',
          type: 'new_validation',
          name: 'Novas Validações',
          description: 'Notificar quando novas validações estiverem disponíveis',
          enabled: true,
          channels: { inApp: true, email: true, push: true },
          frequency: 'immediate',
          filters: { sectors: [], minReward: 0, maxDistance: 50 }
        },
        {
          id: 'matching_opportunity',
          type: 'matching_opportunity',
          name: 'Oportunidades de Match',
          description: 'Notificar sobre validações com alta compatibilidade',
          enabled: true,
          channels: { inApp: true, email: false, push: true },
          frequency: 'immediate',
          filters: { sectors: [], minReward: 25, maxDistance: 100 }
        },
        {
          id: 'response_received',
          type: 'response_received',
          name: 'Respostas Recebidas',
          description: 'Notificar quando suas validações receberem respostas',
          enabled: true,
          channels: { inApp: true, email: true, push: false },
          frequency: 'immediate',
          filters: { sectors: [], minReward: 0, maxDistance: 0 }
        },
        {
          id: 'deadline_reminder',
          type: 'deadline_reminder',
          name: 'Lembretes de Prazo',
          description: 'Lembrar sobre validações que estão expirando',
          enabled: true,
          channels: { inApp: true, email: true, push: true },
          frequency: 'daily',
          filters: { sectors: [], minReward: 0, maxDistance: 0 }
        },
        {
          id: 'reward_earned',
          type: 'reward_earned',
          name: 'Recompensas Conquistadas',
          description: 'Notificar quando ganhar pontos ou badges',
          enabled: true,
          channels: { inApp: true, email: false, push: true },
          frequency: 'immediate',
          filters: { sectors: [], minReward: 0, maxDistance: 0 }
        }
      ];
      
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    // Setup real-time subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${authState.user?.id}`
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        
        // Play sound if enabled
        if (soundEnabled) {
          playNotificationSound();
        }
        
        // Show toast notification
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: newNotification.actionUrl ? {
            label: newNotification.actionLabel || 'Ver',
            onClick: () => window.location.href = newNotification.actionUrl!
          } : undefined
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const playNotificationSound = () => {
    // Create and play notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore errors (user might not have interacted with page yet)
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      // In production, update in Supabase
      // await supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updatePreference = (preferenceId: string, updates: Partial<NotificationPreference>) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === preferenceId 
          ? { ...pref, ...updates }
          : pref
      )
    );
    toast.success('Preferências atualizadas');
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      new_validation: Target,
      matching_opportunity: Star,
      response_received: Mail,
      deadline_reminder: Clock,
      reward_earned: CheckCircle
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-500';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'high') return notif.priority === 'high' || notif.priority === 'urgent';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificações
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas notificações e preferências
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Marcar Todas como Lidas
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filtrar:</Label>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não Lidas</SelectItem>
                <SelectItem value="high">Alta Prioridade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filter === 'unread' 
                      ? 'Todas as notificações foram lidas!' 
                      : 'Você não tem notificações no momento.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-all duration-200 hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${getPriorityColor(notification.priority)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{getTimeAgo(notification.createdAt)}</span>
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                markAsRead(notification.id);
                                window.location.href = notification.actionUrl!;
                              }}
                            >
                              {notification.actionLabel || 'Ver'}
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences.map((preference) => (
                <div key={preference.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{preference.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {preference.description}
                      </p>
                    </div>
                    <Switch
                      checked={preference.enabled}
                      onCheckedChange={(enabled) => 
                        updatePreference(preference.id, { enabled })
                      }
                    />
                  </div>
                  
                  {preference.enabled && (
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {/* Channels */}
                      <div>
                        <Label className="text-sm font-medium">Canais de Notificação</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={preference.channels.inApp}
                              onCheckedChange={(inApp) => 
                                updatePreference(preference.id, {
                                  channels: { ...preference.channels, inApp }
                                })
                              }
                            />
                            <Bell className="h-4 w-4" />
                            <span className="text-sm">App</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={preference.channels.email}
                              onCheckedChange={(email) => 
                                updatePreference(preference.id, {
                                  channels: { ...preference.channels, email }
                                })
                              }
                            />
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">Email</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={preference.channels.push}
                              onCheckedChange={(push) => 
                                updatePreference(preference.id, {
                                  channels: { ...preference.channels, push }
                                })
                              }
                            />
                            <Smartphone className="h-4 w-4" />
                            <span className="text-sm">Push</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Frequency */}
                      <div>
                        <Label className="text-sm font-medium">Frequência</Label>
                        <Select 
                          value={preference.frequency} 
                          onValueChange={(frequency: any) => 
                            updatePreference(preference.id, { frequency })
                          }
                        >
                          <SelectTrigger className="w-40 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Imediato</SelectItem>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSystem;