
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdeaForm } from "@/components/IdeaForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentLanguage } from "@/i18n/config";
import { useCreditSystem } from "@/utils/creditSystem";
import { Button } from "@/components/ui/button";

const EditIdeaPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('id');
  const isReanalyzing = searchParams.get('reanalyze') === 'true';
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { checkCredits, deductCredits, userPlan } = useCreditSystem();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCredits, setHasCredits] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!authState.isAuthenticated || !ideaId) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has access to this idea
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
        
        // Check if user owns the idea
        if (idea.user_id !== authState.user?.id) {
          navigate('/dashboard/ideias');
          toast.error(t('ideaForm.unauthorized', "Você não tem permissão para editar esta ideia"));
          return;
        }
        
        setIsAuthorized(true);
        
        // For reanalysis, check if user has enough credits (unless they're on Pro plan)
        if (isReanalyzing && userPlan !== 'pro') {
          const hasEnoughCredits = await checkCredits('REANALYSIS');
          setHasCredits(hasEnoughCredits);
          
          if (!hasEnoughCredits) {
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
  }, [authState.isAuthenticated, authState.user?.id, ideaId, isReanalyzing, navigate, t, checkCredits, userPlan]);

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
    return null; // Redirect already handled
  }

  if (isReanalyzing && !hasCredits && userPlan !== 'pro') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('ideaForm.reanalyzeTitle', "Reanalisar Ideia")}</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">{t('ideaForm.noCreditsTitle', "Créditos insuficientes")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{t('ideaForm.noCreditsDescription', "Você precisa de pelo menos 1 crédito para reanalisar uma ideia.")}</p>
            <div className="mt-4 flex justify-center gap-4">
              <Button 
                onClick={() => navigate('/dashboard/creditos')}
                className="bg-brand-purple hover:bg-brand-purple/90"
              >
                {t('ideaForm.buyCredits', "Comprar créditos")}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/planos')}
              >
                {t('ideaForm.upgradePlan', "Atualizar plano")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Log the current language when editing/reanalyzing
  console.log("Current language for editing/reanalyzing:", getCurrentLanguage());

  // Update this function to handle form submission without onSubmitSuccess prop
  const handleFormSubmit = async () => {
    // If reanalyzing and user is not on Pro plan, deduct a credit
    if (isReanalyzing && userPlan !== 'pro') {
      await deductCredits('REANALYSIS', ideaId || undefined);
    }
  };

  return (
    <div className="space-y-6">
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
      
      {/* Remove the onSubmitSuccess prop since it's not supported by the IdeaForm component */}
      <IdeaForm 
        ideaId={ideaId || undefined} 
        isReanalyzing={isReanalyzing} 
      />
    </div>
  );
};

export default EditIdeaPage;
