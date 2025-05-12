
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, AlertCircle } from "lucide-react";

const DraftsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const analyzedIdeaId = searchParams.get('analyzed');

  useEffect(() => {
    const fetchDrafts = async () => {
      if (!authState.isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .eq('user_id', authState.user?.id)
          .eq('is_draft', true)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setDrafts(data || []);

        // If we have an analyzed idea ID, show a success message
        if (analyzedIdeaId) {
          toast.success(t('drafts.ideaAnalyzed', "Rascunho analisado com sucesso!"), {
            action: {
              label: t('drafts.viewAnalysis', "Ver análise"),
              onClick: () => navigate(`/dashboard/ideias?id=${analyzedIdeaId}`)
            }
          });
        }
      } catch (error) {
        console.error("Error fetching drafts:", error);
        toast.error(t('drafts.fetchError', "Erro ao carregar rascunhos"));
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [authState.isAuthenticated, authState.user?.id, analyzedIdeaId, navigate, t]);

  const handleEditDraft = (id: string) => {
    navigate(`/dashboard/editar?id=${id}`);
  };

  const handleDeleteDraft = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);

      if (error) throw error;

      setDrafts(drafts.filter(draft => draft.id !== id));
      toast.success(t('drafts.deleted', "Rascunho excluído com sucesso"));
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error(t('drafts.deleteError', "Erro ao excluir rascunho"));
    } finally {
      setDeletingId(null);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">{t('auth.requiredForDrafts', "Você precisa estar logado para ver seus rascunhos")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('drafts.title', "Meus Rascunhos")}</h1>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="bg-brand-blue hover:bg-brand-blue/90"
        >
          {t('drafts.newDraft', "Novo Rascunho")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="pt-4 flex justify-end gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('drafts.empty', "Nenhum rascunho encontrado")}</h2>
            <p className="text-muted-foreground mb-4">{t('drafts.emptyDesc', "Você ainda não criou nenhum rascunho")}</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              {t('drafts.create', "Criar uma ideia")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{draft.title}</h2>
                  <p className="text-muted-foreground">
                    {new Date(draft.updated_at).toLocaleDateString()}
                  </p>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteDraft(draft.id)}
                      disabled={deletingId === draft.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingId === draft.id
                        ? t('common.deleting', "Excluindo...")
                        : t('common.delete', "Excluir")}
                    </Button>
                    <Button
                      className="bg-brand-purple hover:bg-brand-purple/90"
                      onClick={() => handleEditDraft(draft.id)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      {t('common.edit', "Editar")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsPage;
