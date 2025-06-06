
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Search, Download, Eye, Trash2, Image, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GeneratedContent {
  id: string;
  content_type: 'logo' | 'prd' | 'mvp';
  title: string;
  content_data: any;
  file_url?: string;
  created_at: string;
  idea_id?: string;
}

export const MyContentPage = () => {
  const { authState } = useAuth();
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (authState.user) {
      fetchGeneratedContent();
    }
  }, [authState.user]);

  useEffect(() => {
    filterContents();
  }, [contents, searchTerm, filterType]);

  const fetchGeneratedContent = async () => {
    if (!authState.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching generated content:', error);
      toast.error('Erro ao carregar conteúdos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContents = () => {
    let filtered = contents;

    if (filterType !== "all") {
      filtered = filtered.filter(content => content.content_type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContents(filtered);
  };

  const handleDelete = async (contentId: string) => {
    if (!authState.user) return;

    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', contentId)
        .eq('user_id', authState.user.id);

      if (error) throw error;

      setContents(contents.filter(content => content.id !== contentId));
      toast.success('Conteúdo excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Erro ao excluir conteúdo');
    }
  };

  const downloadLogo = (content: GeneratedContent) => {
    if (!content.file_url) return;
    
    const link = document.createElement('a');
    link.href = content.file_url;
    link.download = `logo_${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDocument = (content: GeneratedContent) => {
    const documentContent = content.content_data.document;
    const blob = new Blob([documentContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const openPreview = (content: GeneratedContent) => {
    setSelectedContent(content);
    setPreviewOpen(true);
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'logo': return 'Logo';
      case 'prd': return 'PRD';
      case 'mvp': return 'Plano MVP';
      default: return type;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return <Image className="h-4 w-4" />;
      case 'prd':
      case 'mvp': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const groupedContents = filteredContents.reduce((acc, content) => {
    if (!acc[content.content_type]) {
      acc[content.content_type] = [];
    }
    acc[content.content_type].push(content);
    return acc;
  }, {} as Record<string, GeneratedContent[]>);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Meus Conteúdos</h1>
        <p className="text-muted-foreground">
          Acesse e gerencie todo o conteúdo gerado pelas ferramentas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar conteúdos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="logo">Logos</SelectItem>
            <SelectItem value="prd">PRDs</SelectItem>
            <SelectItem value="mvp">Planos MVP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        </div>
      ) : filteredContents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Comece usando as ferramentas para gerar conteúdo"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={filterType === "all" ? "grid" : filterType} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grid">Todos ({filteredContents.length})</TabsTrigger>
            <TabsTrigger value="logo">Logos ({groupedContents.logo?.length || 0})</TabsTrigger>
            <TabsTrigger value="prd">PRDs ({groupedContents.prd?.length || 0})</TabsTrigger>
            <TabsTrigger value="mvp">MVPs ({groupedContents.mvp?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onDelete={handleDelete}
                  onDownload={content.content_type === 'logo' ? downloadLogo : downloadDocument}
                  onPreview={openPreview}
                />
              ))}
            </div>
          </TabsContent>

          {['logo', 'prd', 'mvp'].map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContents[type]?.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onDelete={handleDelete}
                    onDownload={content.content_type === 'logo' ? downloadLogo : downloadDocument}
                    onPreview={openPreview}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.content_type === 'logo' && selectedContent.file_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedContent.file_url}
                    alt="Logo"
                    className="max-w-full max-h-96 object-contain border rounded-lg"
                  />
                </div>
              )}
              
              {(selectedContent.content_type === 'prd' || selectedContent.content_type === 'mvp') && (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {selectedContent.content_data.document}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => selectedContent.content_type === 'logo' ? downloadLogo(selectedContent) : downloadDocument(selectedContent)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ContentCardProps {
  content: GeneratedContent;
  onDelete: (id: string) => void;
  onDownload: (content: GeneratedContent) => void;
  onPreview: (content: GeneratedContent) => void;
}

const ContentCard = ({ content, onDelete, onDownload, onPreview }: ContentCardProps) => {
  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'logo': return 'Logo';
      case 'prd': return 'PRD';
      case 'mvp': return 'Plano MVP';
      default: return type;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return <Image className="h-4 w-4" />;
      case 'prd':
      case 'mvp': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getContentTypeIcon(content.content_type)}
            <Badge variant="secondary">
              {getContentTypeLabel(content.content_type)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(content.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg leading-tight">{content.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {content.content_type === 'logo' && content.file_url && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={content.file_url}
              alt="Logo preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(content.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPreview(content)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(content)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
