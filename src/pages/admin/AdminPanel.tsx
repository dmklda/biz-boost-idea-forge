import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PendingAdopter {
  id: string;
  user_id: string;
  bio: string;
  expertise_areas: string[];
  interests: string[];
  hourly_rate: number;
  portfolio_url?: string;
  linkedin_url?: string;
  created_at: string;
  status: string;
  profiles: {
    name: string;
    email: string;
    photo_url?: string;
  };
}

export default function AdminPanel() {
  const { authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingAdopters, setPendingAdopters] = useState<PendingAdopter[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Verificar se é admin
    if (!authState.user || authState.user.email !== 'marcior631@gmail.com') {
      navigate('/dashboard');
      return;
    }
    
    fetchPendingAdopters();
  }, [authState.user, navigate]);

  const fetchPendingAdopters = async () => {
    try {
      const { data, error } = await supabase
        .from('early_adopters')
        .select(`
          *,
          profiles (
            name,
            email,
            photo_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAdopters((data as any) || []);
    } catch (error) {
      console.error('Error fetching pending adopters:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos pendentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adopterId: string) => {
    if (!authState.user) return;
    
    setActionLoading(adopterId);
    try {
      const { error } = await supabase.rpc('approve_early_adopter', {
        adopter_id: adopterId,
        admin_user_id: authState.user.id,
        admin_email: authState.user.email
      });

      if (error) throw error;

      toast({
        title: "Aprovado!",
        description: "Early Adopter aprovado com sucesso.",
      });

      await fetchPendingAdopters();
    } catch (error) {
      console.error('Error approving adopter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o Early Adopter.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (adopterId: string) => {
    if (!authState.user) return;
    
    setActionLoading(adopterId);
    try {
      const { error } = await supabase.rpc('reject_early_adopter', {
        adopter_id: adopterId,
        admin_user_id: authState.user.id,
        admin_email: authState.user.email,
        reason: rejectionReasons[adopterId] || null
      });

      if (error) throw error;

      toast({
        title: "Rejeitado",
        description: "Early Adopter rejeitado.",
      });

      await fetchPendingAdopters();
      setRejectionReasons(prev => ({ ...prev, [adopterId]: '' }));
    } catch (error) {
      console.error('Error rejecting adopter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o Early Adopter.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie pedidos de Early Adopters pendentes
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pedidos Pendentes ({pendingAdopters.length})
            </CardTitle>
            <CardDescription>
              Early Adopters aguardando aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAdopters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido pendente no momento</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingAdopters.map((adopter) => (
                  <Card key={adopter.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={adopter.profiles?.photo_url} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{adopter.profiles?.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {adopter.profiles?.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(adopter.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Bio:</h4>
                            <p className="text-sm text-muted-foreground">{adopter.bio}</p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Áreas de Expertise:</h4>
                            <div className="flex flex-wrap gap-2">
                              {adopter.expertise_areas?.map((area, index) => (
                                <Badge key={index} variant="secondary">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Interesses:</h4>
                            <div className="flex flex-wrap gap-2">
                              {adopter.interests?.map((interest, index) => (
                                <Badge key={index} variant="outline">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {adopter.hourly_rate && (
                            <div>
                              <h4 className="font-medium">Taxa por Hora:</h4>
                              <p className="text-sm text-muted-foreground">
                                R$ {adopter.hourly_rate}/hora
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {adopter.portfolio_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={adopter.portfolio_url} target="_blank" rel="noopener noreferrer">
                                  Portfólio
                                </a>
                              </Button>
                            )}
                            {adopter.linkedin_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={adopter.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  LinkedIn
                                </a>
                              </Button>
                            )}
                          </div>

                          <div className="border-t pt-4">
                            <Textarea
                              placeholder="Motivo da rejeição (opcional)"
                              value={rejectionReasons[adopter.id] || ''}
                              onChange={(e) =>
                                setRejectionReasons(prev => ({
                                  ...prev,
                                  [adopter.id]: e.target.value
                                }))
                              }
                              className="mb-3"
                            />
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(adopter.id)}
                                disabled={actionLoading === adopter.id}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {actionLoading === adopter.id ? 'Aprovando...' : 'Aprovar'}
                              </Button>
                              
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(adopter.id)}
                                disabled={actionLoading === adopter.id}
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                {actionLoading === adopter.id ? 'Rejeitando...' : 'Rejeitar'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}