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
import { Trash2, Edit, Plus, Eye, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuccessCase {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo_url: string;
  founder_name: string;
  founder_photo_url: string;
  industry: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: any;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const AdminSuccessCasesManagement = () => {
  const [cases, setCases] = useState<SuccessCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<SuccessCase | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    company_name: '',
    company_logo_url: '',
    founder_name: '',
    founder_photo_url: '',
    industry: '',
    description: '',
    challenge: '',
    solution: '',
    results: '',
    metrics: {},
    featured: false,
    status: 'draft'
  });

  useEffect(() => {
    fetchSuccessCases();
  }, []);

  const fetchSuccessCases = async () => {
    try {
      const { data, error } = await supabase
        .from('success_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Erro ao buscar casos de sucesso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os casos de sucesso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCase) {
        const { error } = await supabase
          .from('success_cases')
          .update(formData)
          .eq('id', editingCase.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Caso de sucesso atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('success_cases')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Caso de sucesso criado com sucesso!"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSuccessCases();
    } catch (error) {
      console.error('Erro ao salvar caso de sucesso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o caso de sucesso",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este caso de sucesso?')) return;

    try {
      const { error } = await supabase
        .from('success_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Caso de sucesso excluído com sucesso!"
      });
      
      fetchSuccessCases();
    } catch (error) {
      console.error('Erro ao excluir caso de sucesso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o caso de sucesso",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      company_name: '',
      company_logo_url: '',
      founder_name: '',
      founder_photo_url: '',
      industry: '',
      description: '',
      challenge: '',
      solution: '',
      results: '',
      metrics: {},
      featured: false,
      status: 'draft'
    });
    setEditingCase(null);
  };

  const openEditDialog = (successCase: SuccessCase) => {
    setEditingCase(successCase);
    setFormData({
      title: successCase.title,
      slug: successCase.slug,
      company_name: successCase.company_name,
      company_logo_url: successCase.company_logo_url || '',
      founder_name: successCase.founder_name || '',
      founder_photo_url: successCase.founder_photo_url || '',
      industry: successCase.industry,
      description: successCase.description,
      challenge: successCase.challenge,
      solution: successCase.solution,
      results: successCase.results,
      metrics: successCase.metrics || {},
      featured: successCase.featured,
      status: successCase.status
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
          <h1 className="text-3xl font-bold">Gerenciamento de Casos de Sucesso</h1>
          <p className="text-muted-foreground">
            Crie e gerencie casos de sucesso inspiradores
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Caso de Sucesso
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCase ? 'Editar Caso de Sucesso' : 'Criar Novo Caso de Sucesso'}
              </DialogTitle>
              <DialogDescription>
                {editingCase ? 'Edite as informações do caso de sucesso' : 'Preencha as informações para criar um novo caso de sucesso'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Setor</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founder_name">Nome do Fundador</Label>
                  <Input
                    id="founder_name"
                    value={formData.founder_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, founder_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company_logo_url">URL do Logo da Empresa</Label>
                  <Input
                    id="company_logo_url"
                    value={formData.company_logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_logo_url: e.target.value }))}
                    placeholder="https://..."
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

              <div>
                <Label htmlFor="challenge">Desafio</Label>
                <Textarea
                  id="challenge"
                  value={formData.challenge}
                  onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="solution">Solução</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="results">Resultados</Label>
                <Textarea
                  id="results"
                  value={formData.results}
                  onChange={(e) => setFormData(prev => ({ ...prev, results: e.target.value }))}
                  rows={4}
                  required
                />
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
                  <Label htmlFor="featured">Destacar caso</Label>
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
                  {editingCase ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {cases.map((successCase) => (
          <Card key={successCase.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4" />
                    <CardTitle className="text-lg">{successCase.title}</CardTitle>
                    {successCase.featured && (
                      <Badge variant="secondary">Destacado</Badge>
                    )}
                  </div>
                  <CardDescription>{successCase.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Empresa: {successCase.company_name}</span>
                    <span>Setor: {successCase.industry}</span>
                    <Badge variant={
                      successCase.status === 'published' ? 'default' : 
                      successCase.status === 'draft' ? 'outline' : 'secondary'
                    }>
                      {successCase.status === 'published' ? 'Publicado' : 
                       successCase.status === 'draft' ? 'Rascunho' : 'Arquivado'}
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
                    onClick={() => openEditDialog(successCase)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(successCase.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {cases.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum caso de sucesso encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie seu primeiro caso de sucesso clicando no botão "Novo Caso de Sucesso"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};