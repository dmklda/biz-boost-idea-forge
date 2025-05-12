
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileEdit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { format } from "date-fns";

// Interface para os rascunhos
interface Draft {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const DraftsPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDraftId, setEditDraftId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  
  // Carregar rascunhos
  useEffect(() => {
    const fetchDrafts = async () => {
      if (!authState.isAuthenticated) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('ideas')
          .select('id, title, description, created_at, updated_at')
          .eq('user_id', authState.user?.id)
          .eq('is_draft', true)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        setDrafts(data);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        toast.error(t('drafts.errors.fetchFailed') || "Erro ao carregar rascunhos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrafts();
  }, [authState.isAuthenticated, authState.user?.id]);
  
  // Filtrar rascunhos pela busca
  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    draft.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Continuar preenchimento
  const handleContinueDraft = (draftId: string) => {
    navigate(`/dashboard/rascunho/${draftId}`);
  };
  
  // Excluir rascunho
  const handleDeleteDraft = async () => {
    if (!draftToDelete) return;
    
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', draftToDelete);
        
      if (error) throw error;
      
      // Atualizar lista removendo o rascunho excluído
      setDrafts(drafts.filter(draft => draft.id !== draftToDelete));
      toast.success(t('drafts.deleteSuccess') || "Rascunho excluído com sucesso");
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error(t('drafts.errors.deleteFailed') || "Erro ao excluir rascunho");
    } finally {
      setDraftToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('drafts.title') || "Rascunhos"}</h1>
          <p className="text-muted-foreground">
            {t('drafts.subtitle') || "Ideias salvas como rascunho para continuar depois"}
          </p>
        </div>
        <Button className="bg-brand-purple hover:bg-brand-purple/90" asChild>
          <Link to="/">
            <Plus className="h-4 w-4 mr-2" />
            {t('drafts.newDraft') || "Nova ideia"}
          </Link>
        </Button>
      </div>
      
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('drafts.search') || "Buscar rascunhos..."}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Lista de rascunhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="mt-4 flex justify-between">
                  <div className="h-9 bg-muted rounded w-24"></div>
                  <div className="h-9 bg-muted rounded w-9"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDrafts.length > 0 ? (
          filteredDrafts.map((draft) => (
            <Card key={draft.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{draft.title || t('drafts.untitled') || "Sem título"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {draft.description || t('drafts.noDescription') || "Sem descrição"}
                </p>
                <div className="text-xs text-muted-foreground">
                  {t('drafts.lastUpdated') || "Atualizado em"}: {format(new Date(draft.updated_at), 'dd/MM/yyyy HH:mm')}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Button 
                    onClick={() => handleContinueDraft(draft.id)} 
                    className="bg-brand-blue hover:bg-brand-blue/90"
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    {t('drafts.continue') || "Continuar"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setDraftToDelete(draft.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileEdit className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{t('drafts.empty.title') || "Nenhum rascunho encontrado"}</h3>
            <p className="text-muted-foreground mt-1 mb-4">{t('drafts.empty.description') || "Você ainda não salvou nenhuma ideia como rascunho"}</p>
            <Button asChild>
              <Link to="/">
                <Plus className="h-4 w-4 mr-2" />
                {t('drafts.empty.button') || "Criar uma nova ideia"}
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Diálogo de edição */}
      <Dialog open={!!editDraftId} onOpenChange={(open) => !open && setEditDraftId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('drafts.edit.title') || "Editar rascunho"}</DialogTitle>
            <DialogDescription>
              {t('drafts.edit.description') || "Continue preenchendo sua ideia a partir do rascunho salvo"}
            </DialogDescription>
          </DialogHeader>
          {editDraftId && <IdeaForm draftId={editDraftId} />}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('drafts.delete.title') || "Excluir rascunho"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('drafts.delete.description') || "Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel') || "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDraft}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete') || "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DraftsPage;
