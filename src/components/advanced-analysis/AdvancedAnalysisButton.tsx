
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedAnalysisModal } from "./AdvancedAnalysisModal";

interface AdvancedAnalysisButtonProps {
  ideaId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
}

export function AdvancedAnalysisButton({ ideaId, className, variant = "default" }: AdvancedAnalysisButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAdvancedAnalysis = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      toast({
        title: t('auth.required', "Autenticação necessária"),
        description: t('auth.pleaseLogin', "Faça login para continuar"),
        variant: "destructive",
      });
      return;
    }

    // Check user credits if not Pro
    if (authState.user.plan !== "pro") {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", authState.user.id)
        .single();
      
      if (userError || !userData) {
        toast({
          title: t('errors.userDataFetchFailed', "Erro ao buscar dados do usuário"),
          description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
          variant: "destructive",
        });
        return;
      }
      
      if (userData.credits < 3) {
        toast({
          title: t('credits.insufficient', "Créditos insuficientes"),
          description: t('advancedAnalysis.requiresCredits', "A análise avançada requer 3 créditos"),
          variant: "destructive",
        });
        return;
      }
    }

    setIsDialogOpen(true);
  };

  const startAdvancedAnalysis = async () => {
    setIsDialogOpen(false);
    setIsLoading(true);
    
    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke("advanced-analysis", {
        body: {
          ideaId: ideaId,
          userId: authState.user!.id
        }
      });
      
      if (error) throw error;
      
      // Show success message
      toast({
        title: t('advancedAnalysis.success', "Análise avançada concluída!"),
        description: t('advancedAnalysis.viewResults', "Visualize os resultados detalhados"),
        variant: "default",
      });
      
      // Open the results modal
      setIsAnalysisModalOpen(true);
    } catch (error) {
      console.error("Error performing advanced analysis:", error);
      toast({
        title: t('errors.analysisError', "Erro ao realizar análise avançada"),
        description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        onClick={handleAdvancedAnalysis}
        className={className}
        variant={variant}
        disabled={isLoading}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isLoading 
          ? t('common.processing', "Processando...") 
          : t('advancedAnalysis.button', "Análise Avançada")}
      </Button>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('advancedAnalysis.confirmTitle', "Análise Avançada com GPT-4o")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {authState.user?.plan === "pro" 
                ? t('advancedAnalysis.confirmDescriptionPro', "Esta análise usa GPT-4o e pode levar alguns segundos para ser concluída. Deseja continuar?")
                : t('advancedAnalysis.confirmDescription', "Esta análise avançada utilizará 3 créditos e pode levar alguns segundos para ser concluída. Deseja continuar?")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', "Cancelar")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={startAdvancedAnalysis}>
              {t('common.continue', "Continuar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AdvancedAnalysisModal
        ideaId={ideaId}
        open={isAnalysisModalOpen}
        onOpenChange={setIsAnalysisModalOpen}
      />
    </>
  );
}
