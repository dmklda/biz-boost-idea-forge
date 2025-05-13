
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedAnalysisModal } from "./AdvancedAnalysisModal";

interface AdvancedAnalysisButtonProps {
  ideaId: string;
  className?: string;
}

export function AdvancedAnalysisButton({ ideaId, className = "" }: AdvancedAnalysisButtonProps) {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAnalysisModal, setOpenAnalysisModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartAnalysis = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      toast.error(t('errors.loginRequired', "Você precisa estar logado para usar esta funcionalidade"));
      return;
    }

    // For free users, check if they have enough credits
    if (authState.user.plan === 'free' && (authState.user.credits < 3)) {
      toast.error(t('errors.insufficientCredits', "Você precisa de pelo menos 3 créditos para realizar uma análise avançada"));
      return;
    }

    setIsProcessing(true);
    setOpenConfirmDialog(false);

    try {
      // Call the Supabase Edge Function to start the advanced analysis
      const { data, error } = await supabase.functions.invoke('advanced-analysis', {
        body: { ideaId },
      });

      if (error) {
        throw new Error(error.message);
      }

      // If user is on free plan, deduct credits
      if (authState.user.plan === 'free') {
        updateUserCredits(authState.user.credits - 3);
        toast.success(t('advancedAnalysis.creditsUsed', "3 créditos foram utilizados para esta análise avançada"));
      }

      // Open the modal to show the analysis
      setOpenAnalysisModal(true);
    } catch (error) {
      console.error("Error starting advanced analysis:", error);
      toast.error(t('errors.analysisError', "Erro ao iniciar análise avançada"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className={`bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 ${className}`}
        onClick={() => setOpenConfirmDialog(true)}
        disabled={isProcessing}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t('advancedAnalysis.buttonLabel', "Análise Avançada")}
      </Button>

      <AlertDialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('advancedAnalysis.confirmTitle', "Análise Avançada com GPT-4o")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {authState.user?.plan === 'free'
                ? t('advancedAnalysis.confirmDescriptionFree', "Esta análise avançada utilizará a tecnologia GPT-4o e consumirá 3 créditos. Deseja continuar?")
                : t('advancedAnalysis.confirmDescriptionPro', "Esta análise avançada utilizará a tecnologia GPT-4o. Como você é um usuário Pro, não serão consumidos créditos adicionais. Deseja continuar?")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', "Cancelar")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartAnalysis}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              {t('common.continue', "Continuar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdvancedAnalysisModal
        ideaId={ideaId}
        open={openAnalysisModal}
        onOpenChange={setOpenAnalysisModal}
      />
    </>
  );
}
