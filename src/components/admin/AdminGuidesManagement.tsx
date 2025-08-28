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
import { Trash2, Edit, Plus, Eye, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Guide {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  level: string;
  reading_time: number;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const AdminGuidesManagement = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    level: 'beginner',
    reading_time: 5,
    featured: false,
    status: 'draft'
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Erro ao buscar guias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os guias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGuide) {
        const { error } = await supabase
          .from('guides')
          .update(formData)
          .eq('id', editingGuide.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Guia atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('guides')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Guia criado com sucesso!"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchGuides();
    } catch (error) {
      console.error('Erro ao salvar guia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o guia",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este guia?')) return;

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Guia excluído com sucesso!"
      });
      
      fetchGuides();
    } catch (error) {
      console.error('Erro ao excluir guia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o guia",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
      level: 'beginner',
      reading_time: 5,
      featured: false,
      status: 'draft'
    });
    setEditingGuide(null);
  };

  const openEditDialog = (guide: Guide) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      slug: guide.slug,
      description: guide.description,
      content: guide.content,
      category: guide.category,
      level: guide.level,
      reading_time: guide.reading_time,
      featured: guide.featured,
      status: guide.status
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
          <h1 className="text-3xl font-bold">Gerenciamento de Guias</h1>
          <p className="text-muted-foreground">
            Crie e gerencie guias práticos para os usuários
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Guia
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGuide ? 'Editar Guia' : 'Criar Novo Guia'}
              </DialogTitle>
              <DialogDescription>
                {editingGuide ? 'Edite as informações do guia' : 'Preencha as informações para criar um novo guia'}
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
                />
              </div>

              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Marketing, Finanças"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="level">Nível</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reading_time">Tempo de Leitura (min)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    value={formData.reading_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) }))}
                    min="1"
                    required
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
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
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
                  <Label htmlFor="featured">Destacar guia</Label>
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
                  {editingGuide ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {guides.map((guide) => (
          <Card key={guide.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4" />
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    {guide.featured && (
                      <Badge variant="secondary">Destacado</Badge>
                    )}
                  </div>
                  <CardDescription>{guide.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Categoria: {guide.category}</span>
                    <span>Nível: {guide.level}</span>
                    <span>{guide.reading_time} min de leitura</span>
                    <Badge variant={
                      guide.status === 'published' ? 'default' : 
                      guide.status === 'draft' ? 'outline' : 'secondary'
                    }>
                      {guide.status === 'published' ? 'Publicado' : 
                       guide.status === 'draft' ? 'Rascunho' : 'Arquivado'}
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
                    onClick={() => openEditDialog(guide)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(guide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {guides.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum guia encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie seu primeiro guia clicando no botão "Novo Guia"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};