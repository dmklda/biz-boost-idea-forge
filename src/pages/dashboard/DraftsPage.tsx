
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Typing for drafts
interface Draft {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const DraftsPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  // Fetch user's drafts
  useEffect(() => {
    const fetchDrafts = async () => {
      if (!authState.isAuthenticated) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('ideas')
          .select('id, title, created_at, updated_at')
          .eq('user_id', authState.user?.id)
          .eq('is_draft', true)
          .order('updated_at', { ascending: false });
          
        if (error) {
          throw error;
        }

        setDrafts(data || []);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        toast.error(t('drafts.errors.fetchFailed', "Falha ao buscar rascunhos"));
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [authState.isAuthenticated, authState.user?.id, t]);

  // Filter drafts based on search query
  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete draft
  const handleDeleteDraft = async () => {
    if (!draftToDelete) return;
    
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', draftToDelete)
        .eq('user_id', authState.user?.id); // Segurança adicional
        
      if (error) throw error;
      
      setDrafts(drafts.filter(draft => draft.id !== draftToDelete));
      toast.success(t('drafts.deleteSuccess', "Rascunho excluído com sucesso"));
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error(t('drafts.deleteError', "Erro ao excluir rascunho"));
    } finally {
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
    }
  };

  // Prompt to delete draft
  const promptDeleteDraft = (id: string) => {
    setDraftToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('drafts.title', "Rascunhos")}</h1>
          <p className="text-muted-foreground">
            {t('drafts.subtitle', "Gerencie seus rascunhos de ideias")}
          </p>
        </div>
        <Link to="/dashboard/ideias">
          <Button className="bg-brand-purple hover:bg-brand-purple/90">
            <Save className="h-4 w-4 mr-2" />
            {t('drafts.viewCompleted', "Ver ideias completas")}
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('drafts.search', "Buscar rascunhos...")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('drafts.listTitle', "Seus rascunhos")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('drafts.table.title', "Título")}</TableHead>
                <TableHead>{t('drafts.table.created', "Criado em")}</TableHead>
                <TableHead>{t('drafts.table.updated', "Atualizado em")}</TableHead>
                <TableHead>{t('drafts.table.status', "Status")}</TableHead>
                <TableHead>{t('drafts.table.actions', "Ações")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDrafts.length > 0 ? (
                filteredDrafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate">
                        {draft.title}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(draft.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(draft.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-600">
                        {t('drafts.status.draft', "Rascunho")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/ideias/editar?id=${draft.id}`} className="flex items-center gap-1">
                            <Edit className="h-3.5 w-3.5" />
                            {t('drafts.continue', "Continuar")}
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => promptDeleteDraft(draft.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchQuery 
                      ? t('drafts.noResults', "Nenhum rascunho encontrado para sua busca") 
                      : t('drafts.empty', "Você ainda não tem rascunhos salvos")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('drafts.delete.title', "Excluir rascunho?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('drafts.delete.description', "Esta ação não pode ser desfeita. O rascunho será permanentemente excluído.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', "Cancelar")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDraft}
              className="bg-red-500 hover:bg-red-600"
            >
              {t('common.delete', "Excluir")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DraftsPage;
