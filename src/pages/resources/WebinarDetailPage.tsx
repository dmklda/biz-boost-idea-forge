import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, Calendar, User, ArrowLeft, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const WebinarDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinar();
  }, [id]);

  const fetchWebinar = async () => {
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('slug', id)
        .single();

      if (error) throw error;
      setWebinar(data);
    } catch (error) {
      console.error('Erro ao buscar webinar:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
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
          <p className="mt-4 text-muted-foreground">Carregando webinar...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Webinar não encontrado</h1>
            <Button onClick={() => navigate('/recursos/webinars')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Webinars
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <button 
              onClick={() => navigate('/recursos/webinars')}
              className="hover:text-foreground transition-colors"
            >
              Webinars
            </button>
            <span>/</span>
            <span className="text-foreground">{webinar.title}</span>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {webinar.featured && (
                <Badge variant="secondary" className="bg-brand-purple text-white">
                  Destaque
                </Badge>
              )}
              <Badge variant={getStatusColor(webinar.status)}>
                {getStatusLabel(webinar.status)}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{webinar.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(webinar.scheduled_date)} às {formatTime(webinar.scheduled_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{webinar.duration_minutes} minutos</span>
              </div>
              {webinar.max_attendees && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{webinar.current_attendees || 0}/{webinar.max_attendees} inscritos</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thumbnail/Video */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
                <div className="relative">
                  <img 
                    src={webinar.thumbnail_url || "https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?q=80&w=700&auto=format&fit=crop"} 
                    alt={webinar.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-brand-purple/90 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Sobre o Webinar</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {webinar.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Speaker Info */}
              {webinar.speaker_bio && (
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Sobre o Apresentador</h2>
                    <div className="flex items-start gap-4">
                      {webinar.speaker_photo_url && (
                        <img 
                          src={webinar.speaker_photo_url} 
                          alt={webinar.speaker_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{webinar.speaker_name}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {webinar.speaker_bio}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">
                      {webinar.status === 'completed' ? 'Assista Agora' : 
                       webinar.status === 'live' ? 'Entrar no Webinar' : 
                       'Inscrever-se'}
                    </h3>
                    
                    {webinar.status === 'completed' && webinar.recording_url ? (
                      <Button 
                        className="w-full"
                        onClick={() => window.open(webinar.recording_url, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Assistir Gravação
                      </Button>
                    ) : webinar.status === 'live' && webinar.registration_url ? (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => window.open(webinar.registration_url, '_blank')}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Entrar Agora
                      </Button>
                    ) : webinar.registration_url ? (
                      <Button 
                        className="w-full"
                        onClick={() => window.open(webinar.registration_url, '_blank')}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Inscrever-se
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                        Em Breve
                      </Button>
                    )}
                    
                    {webinar.status === 'completed' && !webinar.recording_url && (
                      <p className="text-sm text-muted-foreground">
                        Gravação será disponibilizada em breve
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Detalhes do Evento</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatDate(webinar.scheduled_date)}</div>
                        <div className="text-sm text-muted-foreground">{formatTime(webinar.scheduled_date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{webinar.duration_minutes} minutos</div>
                        <div className="text-sm text-muted-foreground">Duração estimada</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{webinar.speaker_name}</div>
                        <div className="text-sm text-muted-foreground">Apresentador</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/recursos/webinars')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Webinars
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WebinarDetailPage;