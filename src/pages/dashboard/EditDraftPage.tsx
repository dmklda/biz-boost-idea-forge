
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IdeaForm } from "@/components/IdeaForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

const EditDraftPage = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [draftExists, setDraftExists] = useState(false);
  
  // Verificar se o rascunho existe e pertence ao usuário
  useEffect(() => {
    const checkDraft = async () => {
      if (!authState.isAuthenticated || !draftId) {
        navigate('/dashboard');
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('ideas')
          .select('id')
          .eq('id', draftId)
          .eq('user_id', authState.user?.id)
          .eq('is_draft', true)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setDraftExists(true);
        } else {
          toast.error(t('drafts.errors.notFound') || "Rascunho não encontrado");
          navigate('/dashboard/rascunhos');
        }
      } catch (error) {
        console.error("Error checking draft:", error);
        toast.error(t('drafts.errors.accessDenied') || "Acesso negado");
        navigate('/dashboard/rascunhos');
      } finally {
        setLoading(false);
      }
    };
    
    checkDraft();
  }, [authState.isAuthenticated, authState.user?.id, draftId, navigate]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!draftExists) return null;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('drafts.edit.title') || "Editar Rascunho"}</h1>
        <p className="text-muted-foreground">
          {t('drafts.edit.subtitle') || "Continue preenchendo sua ideia a partir do rascunho salvo"}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('ideaForm.title') || "Compartilhe sua ideia"}</CardTitle>
          <CardDescription>
            {t('ideaForm.subtitle') || "Preencha o formulário e receba uma análise detalhada do potencial de negócio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IdeaForm draftId={draftId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDraftPage;
