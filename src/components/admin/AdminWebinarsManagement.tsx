import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Eye, Video, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Webinar {
  id: string;
  title: string;
  slug: string;
  description: string;
  speaker_name: string;
  speaker_bio: string;
  speaker_photo_url: string;
  scheduled_date: string;
  duration_minutes: number;
  registration_url: string;
  recording_url: string;
  thumbnail_url: string;
  max_attendees: number;
  current_attendees: number;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminWebinarsManagement = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    speaker_name: '',
    speaker_bio: '',
    speaker_photo_url: '',
    scheduled_date: '',
    duration_minutes: 60,
    registration_url: '',
    recording_url: '',
    thumbnail_url: '',
    max_attendees: 100,
    current_attendees: 0,
    status: 'scheduled',
    featured: false
  });

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setWebinars(data || []);
    } catch (error) {
      console.error('Erro ao buscar webinars:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os webinars",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingWebinar) {
        const { error } = await supabase
          .from('webinars')
          .update(formData)
          .eq('id', editingWebinar.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Webinar atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('webinars')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Webinar criado com sucesso!"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchWebinars();
    } catch (error) {
      console.error('Erro ao salvar webinar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o webinar",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este webinar?')) return;

    try {
      const { error } = await supabase
        .from('webinars')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webinar excluído com sucesso!"
      });
      
      fetchWebinars();
    } catch (error) {
      console.error('Erro ao excluir webinar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o webinar",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      speaker_name: '',
      speaker_bio: '',
      speaker_photo_url: '',
      scheduled_date: '',
      duration_minutes: 60,
      registration_url: '',
      recording_url: '',
      thumbnail_url: '',
      max_attendees: 100,
      current_attendees: 0,
      status: 'scheduled',
      featured: false
    });
    setEditingWebinar(null);
  };

  const openEditDialog = (webinar: Webinar) => {
    setEditingWebinar(webinar);
    setFormData({
      title: webinar.title,
      slug: webinar.slug,
      description: webinar.description,
      speaker_name: webinar.speaker_name,
      speaker_bio: webinar.speaker_bio || '',
      speaker_photo_url: webinar.speaker_photo_url || '',
      scheduled_date: webinar.scheduled_date?.split('T')[0] || '',
      duration_minutes: webinar.duration_minutes,
      registration_url: webinar.registration_url || '',
      recording_url: webinar.recording_url || '',
      thumbnail_url: webinar.thumbnail_url || '',
      max_attendees: webinar.max_attendees || 100,
      current_attendees: webinar.current_attendees || 0,
      status: webinar.status,
      featured: webinar.featured
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'live': return 'destructive';
      case 'completed': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'live': return 'Ao Vivo';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Webinars</h1>
          <p className="text-muted-foreground">
            Crie e gerencie webinars educacionais
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Webinar
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWebinar ? 'Editar Webinar' : 'Criar Novo Webinar'}
              </DialogTitle>
              <DialogDescription>
                {editingWebinar ? 'Edite as informações do webinar' : 'Preencha as informações para criar um novo webinar'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="speaker_name">Nome do Palestrante</Label>
                  <Input
                    id="speaker_name"
                    value={formData.speaker_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, speaker_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="speaker_photo_url">Foto do Palestrante</Label>
                  <Input
                    id="speaker_photo_url"
                    value={formData.speaker_photo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, speaker_photo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="speaker_bio">Bio do Palestrante</Label>
                <Textarea
                  id="speaker_bio"
                  value={formData.speaker_bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, speaker_bio: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scheduled_date">Data Agendada</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duração (min)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    min="15"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_attendees">Máx. Participantes</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: parseInt(e.target.value) }))}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_url">URL de Inscrição</Label>
                  <Input
                    id="registration_url"
                    value={formData.registration_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="recording_url">URL da Gravação</Label>
                  <Input
                    id="recording_url"
                    value={formData.recording_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, recording_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <Label htmlFor="featured">Destacar webinar</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingWebinar ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webinars.map((webinar) => (
          <Card key={webinar.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4" />
                    <CardTitle className="text-lg">{webinar.title}</CardTitle>
                    {webinar.featured && (
                      <Badge variant="secondary">Destacado</Badge>
                    )}
                  </div>
                  <CardDescription>{webinar.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(webinar.scheduled_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{webinar.duration_minutes} min</span>
                    </div>
                    <span>Por: {webinar.speaker_name}</span>
                    <span>{webinar.current_attendees}/{webinar.max_attendees} inscritos</span>
                    <Badge variant={getStatusColor(webinar.status)}>
                      {getStatusLabel(webinar.status)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(webinar)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(webinar.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {webinars.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum webinar encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie seu primeiro webinar clicando no botão "Novo Webinar"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};