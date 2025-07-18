
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdeaForm } from "@/components/IdeaForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentLanguage } from "@/i18n/config";

const EditIdeaPage = () => {
  const { t } = useTranslation();
  const { id: ideaId } = useParams();
  const isReanalyzing = useParams().reanalyze === 'true';
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCredits, setHasCredits] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!authState.isAuthenticated || !ideaId) {
        setIsLoading(false);
        return;
      }

      try {
        // Verificar se o usuário tem acesso a essa ideia
        const { data: idea, error: ideaError } = await supabase
          .from('ideas')
          .select('user_id')
          .eq('id', ideaId)
          .single();
          
        if (ideaError || !idea) {
          navigate('/dashboard/ideias');
          toast.error(t('ideaForm.notFound', "Ideia não encontrada"));
          return;
        }
        
        // Verificar se o usuário é o dono da ideia
        if (idea.user_id !== authState.user?.id) {
          navigate('/dashboard/ideias');
          toast.error(t('ideaForm.unauthorized', "Você não tem permissão para editar esta ideia"));
          return;
        }
        
        setIsAuthorized(true);
        
        // Para reanálise, verificar se o usuário tem créditos suficientes
        if (isReanalyzing) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', authState.user?.id)
            .single();
            
          if (profileError || !profile) {
            console.error("Error checking credits:", profileError);
            // Continue anyway
          } else if (profile.credits < 1) {
            setHasCredits(false);
            toast.error("Você não tem créditos suficientes para reanalisar esta ideia.");
            toast.error(
              t('ideaForm.noCredits', "Você não tem créditos suficientes para reanalisar"), 
              {
                action: {
                  label: t('ideaForm.buyCredits', "Comprar créditos"),
                  onClick: () => navigate('/dashboard/creditos')
                }
              }
            );
          }
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [authState.isAuthenticated, authState.user?.id, ideaId, isReanalyzing, navigate, t]);

  if (!authState.isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center">{t('auth.requiredForEdit', "Você precisa estar logado para editar ideias")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Navegação já foi redirecionada
  }

  if (isReanalyzing && !hasCredits) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('ideaForm.reanalyzeTitle', "Reanalisar Ideia")}</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">{t('ideaForm.noCreditsTitle', "Créditos insuficientes")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{t('ideaForm.noCreditsDescription', "Você precisa de pelo menos 1 crédito para reanalisar uma ideia.")}</p>
            <button 
              className="mt-4 px-4 py-2 bg-brand-purple text-white rounded hover:bg-brand-purple/80"
              onClick={() => navigate('/dashboard/creditos')}
            >
              {t('ideaForm.buyCredits', "Comprar créditos")}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Log the current language when editing/reanalyzing
  console.log("Current language for editing/reanalyzing:", getCurrentLanguage());

  return (
    <div className="space-y-6">
      {!isAnalyzing && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            {isReanalyzing 
              ? t('ideaForm.reanalyzeTitle', "Reanalisar Ideia") 
              : t('ideaForm.editTitle', "Editar Rascunho")}
          </h1>
          <p className="text-muted-foreground">
            {isReanalyzing 
              ? t('ideaForm.reanalyzeDescription', "Refine sua ideia para obter uma nova análise") 
              : t('ideaForm.editDescription', "Continue o preenchimento do seu rascunho")}
          </p>
        </>
      )}
      <IdeaForm ideaId={ideaId || undefined} isReanalyzing={isReanalyzing} onAnalysisStateChange={setIsAnalyzing} />
    </div>
  );
};

export default EditIdeaPage;
