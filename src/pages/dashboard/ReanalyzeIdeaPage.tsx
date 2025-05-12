
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { IdeaForm } from "@/components/IdeaForm";
import { FormData } from "@/types/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface IdeaDetails {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  has_competitors: string | null;
  monetization: string | null;
  budget: number | null;
  location: string | null;
  user_id: string;
}

const ReanalyzeIdeaPage = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const [idea, setIdea] = useState<IdeaDetails | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [hasCredits, setHasCredits] = useState(false);
  
  // Verificar créditos disponíveis e carregar detalhes da ideia
  useEffect(() => {
    const loadData = async () => {
      if (!authState.isAuthenticated || !ideaId) {
        navigate('/dashboard/ideias');
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Verificar créditos
        setCheckingCredits(true);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', authState.user?.id)
          .single();
          
        if (profileError) throw profileError;
        
        setHasCredits(profileData.credits > 0);
        setCheckingCredits(false);
        
        // 2. Carregar dados da ideia
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', ideaId)
          .eq('user_id', authState.user?.id)
          .single();
          
        if (ideaError) throw ideaError;
        
        if (ideaData) {
          setIdea(ideaData);
          
          // Transformar para o formato do formulário
          const convertedData: FormData = {
            idea: ideaData.title || ideaData.description || "",
            audience: ideaData.audience || "",
            problem: ideaData.problem || "",
            hasCompetitors: ideaData.has_competitors || "",
            monetization: ideaData.monetization || "",
            budget: ideaData.budget || 0,
            location: ideaData.location || ""
          };
          
          setFormData(convertedData);
        } else {
          toast.error(t('reanalyze.errors.ideaNotFound') || "Ideia não encontrada");
          navigate('/dashboard/ideias');
        }
      } catch (error) {
        console.error("Error loading idea data:", error);
        toast.error(t('reanalyze.errors.loadFailed') || "Erro ao carregar dados da ideia");
        navigate('/dashboard/ideias');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [authState.isAuthenticated, authState.user?.id, ideaId, navigate]);
  
  // Função para iniciar a reanálise
  const handleStartReanalyze = () => {
    if (!hasCredits) {
      toast.error(t('reanalyze.errors.noCredits') || "Você não tem créditos suficientes");
      navigate('/dashboard/creditos');
      return;
    }
    
    // Navegar para o formulário com prefill
    localStorage.setItem("savedIdeaFormData", JSON.stringify(formData));
    navigate(`/dashboard/idea/${ideaId}/reanalyze/form`);
  };
  
  if (loading || checkingCredits) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reanalyze.title') || "Reanalisar Ideia"}</h1>
        <p className="text-muted-foreground">
          {t('reanalyze.subtitle') || "Aprimore sua ideia e obtenha uma nova análise de viabilidade"}
        </p>
      </div>
      
      {!hasCredits && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('reanalyze.insufficientCredits.title') || "Créditos insuficientes"}</AlertTitle>
          <AlertDescription>
            {t('reanalyze.insufficientCredits.description') || 
             "Você não possui créditos suficientes para realizar uma nova análise. Adquira mais créditos para continuar."}
            <Button 
              variant="link" 
              className="p-0 h-auto text-destructive font-medium underline ml-1" 
              onClick={() => navigate('/dashboard/creditos')}
            >
              {t('reanalyze.insufficientCredits.action') || "Adquirir créditos"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{t('reanalyze.ideaDetails') || "Detalhes da Ideia"}</CardTitle>
          <CardDescription>
            {t('reanalyze.ideaDetailsDescription') || 
             "Revise os detalhes da sua ideia antes de iniciar uma nova análise"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{idea?.title}</h3>
            <p className="text-muted-foreground">{idea?.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium">{t('ideaForm.audience.title') || "Público-alvo"}</h4>
              <p className="text-sm text-muted-foreground">{idea?.audience || "-"}</p>
            </div>
            <div>
              <h4 className="font-medium">{t('ideaForm.problem.title') || "Problema"}</h4>
              <p className="text-sm text-muted-foreground">{idea?.problem || "-"}</p>
            </div>
            <div>
              <h4 className="font-medium">{t('ideaForm.monetization.title') || "Monetização"}</h4>
              <p className="text-sm text-muted-foreground">{idea?.monetization || "-"}</p>
            </div>
            <div>
              <h4 className="font-medium">{t('ideaForm.budget.title') || "Orçamento"}</h4>
              <p className="text-sm text-muted-foreground">{idea?.budget ? `$${idea.budget}` : "-"}</p>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('reanalyze.note.title') || "Nota"}</AlertTitle>
            <AlertDescription>
              {t('reanalyze.note.description') || 
               "A reanálise utilizará 1 crédito da sua conta e permitirá que você edite os detalhes da ideia antes de submeter."}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="mr-2"
            >
              {t('common.cancel') || "Cancelar"}
            </Button>
            <Button 
              onClick={handleStartReanalyze} 
              disabled={!hasCredits}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {t('reanalyze.startButton') || "Iniciar Reanálise"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReanalyzeIdeaPage;
