import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Export placeholder components
export const AdminSuccessCasesManagement = () => <div>Success Cases Management - Em desenvolvimento</div>;
export const AdminFinancialDashboard = () => <div>Financial Dashboard - Em desenvolvimento</div>;
export const AdminUserManagement = () => <div>User Management - Em desenvolvimento</div>;
export const AdminAnalytics = () => <div>Analytics Dashboard - Em desenvolvimento</div>;
export const AdminAnnouncements = () => <div>Announcements Management - Em desenvolvimento</div>;
export const AdminSettings = () => <div>Admin Settings - Em desenvolvimento</div>;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  reading_time?: number;
  views_count: number;
  featured: boolean;
  author_id: string;
}

export const AdminBlogManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    tags: [] as string[],
    featured: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts do blog.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const postData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        author_id: user.user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        reading_time: Math.ceil(formData.content.split(' ').length / 200) // ~200 words per minute
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Post atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Post criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o post.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Post excluído com sucesso!" });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      status: 'draft',
      tags: [],
      featured: false
    });
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image_url: post.featured_image_url || '',
      status: post.status,
      tags: post.tags || [],
      featured: post.featured
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPost(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline'
    } as const;
    
    const labels = {
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Blog</h1>
          <p className="text-muted-foreground">
            Crie e gerencie posts do blog e notícias
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">Total de Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Rascunhos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {posts.reduce((acc, p) => acc + p.views_count, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total de Visualizações</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Posts do Blog</CardTitle>
          <CardDescription>
            Gerencie todos os posts do blog e notícias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{post.title}</h3>
                    {post.featured && <Badge variant="secondary">Destaque</Badge>}
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                    <span>{post.reading_time} min de leitura</span>
                    <span>{post.views_count} visualizações</span>
                    {post.tags.length > 0 && (
                      <span>Tags: {post.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Editar Post' : 'Criar Novo Post'}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? 'Edite as informações do post' : 'Preencha as informações para criar um novo post'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do post"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-amigavel-do-post"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Breve descrição do post..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Conteúdo completo do post..."
                rows={10}
              />
            </div>

            <div>
              <Label htmlFor="featured_image">URL da Imagem de Destaque</Label>
              <Input
                id="featured_image"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setFormData({ ...formData, status: value })
                  }
                >
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Post em Destaque</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {editingPost ? 'Atualizar' : 'Criar'} Post
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};