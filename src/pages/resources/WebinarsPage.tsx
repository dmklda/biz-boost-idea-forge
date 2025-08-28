
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Video, Clock, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Webinar {
  id: string;
  title: string;
  slug: string;
  description: string;
  speaker_name: string;
  speaker_bio?: string;
  speaker_photo_url?: string;
  scheduled_date: string;
  duration_minutes: number;
  registration_url?: string;
  recording_url?: string;
  thumbnail_url?: string;
  max_attendees?: number;
  current_attendees?: number;
  status: string;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

const WebinarsPage = () => {
  const { t } = useTranslation();
  const [pastWebinars, setPastWebinars] = useState<Webinar[]>([]);
  const [upcomingWebinars, setUpcomingWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .in('status', ['scheduled', 'live', 'completed'])
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      const now = new Date();
      const past = data?.filter(webinar => {
        const webinarDate = new Date(webinar.scheduled_date);
        return webinarDate < now || webinar.status === 'completed';
      }) || [];
      
      const upcoming = data?.filter(webinar => {
        const webinarDate = new Date(webinar.scheduled_date);
        return webinarDate >= now && ['scheduled', 'live'].includes(webinar.status);
      }) || [];

      setPastWebinars(past);
      setUpcomingWebinars(upcoming);
      
      console.log('Total webinars:', data?.length);
      console.log('Past webinars:', past.length);
      console.log('Upcoming webinars:', upcoming.length);
    } catch (error) {
      console.error('Erro ao buscar webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'live': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'live': return 'Ao vivo';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-muted-foreground">Carregando webinars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("webinars.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("webinars.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("webinars.subtitle")}</p>
        </div>
        
        {pastWebinars.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Webinars Anteriores</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastWebinars.map((webinar) => (
                <Card key={webinar.id} className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={webinar.thumbnail_url || "https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?q=80&w=700&auto=format&fit=crop"} 
                      alt={webinar.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-brand-purple/90 flex items-center justify-center">
                        <Video className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {webinar.duration_minutes} min
                    </div>
                    {webinar.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-brand-purple text-white">
                          Destaque
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(webinar.scheduled_date)}
                      </span>
                      <Badge variant={getStatusColor(webinar.status)}>
                        {getStatusLabel(webinar.status)}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{webinar.title}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{webinar.description}</p>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Apresentador: <span className="font-medium text-foreground">{webinar.speaker_name}</span></span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => webinar.recording_url && window.open(webinar.recording_url, '_blank')}
                      disabled={!webinar.recording_url}
                    >
                      {webinar.recording_url ? 'Assistir Agora' : 'Em Breve'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {upcomingWebinars.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Próximos Webinars</h2>
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="space-y-6">
                {upcomingWebinars.map((webinar) => (
                  <div key={webinar.id} className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="mb-4 md:mb-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{webinar.title}</h3>
                        {webinar.featured && (
                          <Badge variant="secondary" className="bg-brand-purple text-white">
                            Destaque
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(webinar.status)}>
                          {getStatusLabel(webinar.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2 line-clamp-2">{webinar.description}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        <span>Apresentador: {webinar.speaker_name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(webinar.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(webinar.scheduled_date)}</span>
                        </div>
                        <span>{webinar.duration_minutes} min</span>
                        {webinar.max_attendees && (
                          <span>{webinar.current_attendees || 0}/{webinar.max_attendees} inscritos</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => webinar.registration_url && window.open(webinar.registration_url, '_blank')}
                        disabled={!webinar.registration_url}
                      >
                        {webinar.status === 'live' ? 'Entrar Agora' : 'Inscrever-se'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {pastWebinars.length === 0 && upcomingWebinars.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum webinar disponível</h3>
              <p className="text-muted-foreground">
                Novos webinars serão adicionados em breve. Fique atento!
              </p>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">{t("webinars.cta.title")}</h3>
          <p className="text-muted-foreground mb-6">{t("webinars.cta.subtitle")}</p>
          <Button className="btn-premium">{t("webinars.cta.button")}</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WebinarsPage;
