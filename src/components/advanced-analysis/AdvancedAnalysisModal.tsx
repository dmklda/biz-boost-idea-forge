import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { AdvancedAnalysisContent } from "./AdvancedAnalysisContent";
import { AdvancedAnalysisChat } from "./AdvancedAnalysisChat";
import { AdvancedAnalysisHeader } from "./AdvancedAnalysisHeader";
import { AdvancedAnalysisLoading } from "./AdvancedAnalysisLoading";
import { AdvancedAnalysisStates } from "./AdvancedAnalysisStates";
import { useAdvancedAnalysis } from "@/hooks/useAdvancedAnalysis";
import { useAnalysisActions } from "@/hooks/useAnalysisActions";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogFooter as ConfirmDialogFooter } from "@/components/ui/dialog";

interface AdvancedAnalysisModalProps {
  ideaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedAnalysisData?: any;
}

export function AdvancedAnalysisModal({
  ideaId,
  open,
  onOpenChange,
  savedAnalysisData,
}: AdvancedAnalysisModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const [showChat, setShowChat] = useState(false);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);

  // Hooks personalizados
  const {
    analysis,
    loading,
    progress,
    idea,
    isLoadingExisting,
    analysisCheckCompleted,
    showCreditConfirm,
    pendingAction,
    setShowCreditConfirm,
    setPendingAction,
    generateNewAnalysis,
    handleRequestAdvancedAnalysis
  } = useAdvancedAnalysis(ideaId, savedAnalysisData);

  // Debug: Log hook values
  useEffect(() => {
    console.log('AdvancedAnalysisModal - Hook values:', {
      loading,
      progress,
      analysisCheckCompleted,
      isLoadingExisting
    });
  }, [loading, progress, analysisCheckCompleted, isLoadingExisting]);

  const {
    isSaving,
    isSaved,
    handleShare,
    handleSaveAnalysis
  } = useAnalysisActions({ analysis, idea, ideaId });

  const {
    generatePDF,
    isGeneratingPdf
  } = usePDFGenerator();

  // Progress animation effect
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        // Progress animation logic is now handled in the loading component
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // Reset states when modal is closed
  useEffect(() => {
    if (!open) {
      setShowChat(false);
    }
  }, [open]);

  const handleDownloadPDF = async () => {
    if (!analysis || !idea) return;
    
    // Lógica de créditos para download de PDF
    if (authState.user?.plan !== 'pro') {
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 1,
        p_feature: 'download_pdf',
        p_item_id: ideaId,
        p_description: 'Download de PDF da análise avançada'
      });
      if (creditError) {
        toast.error(t('ideaForm.insufficientCredits', "Créditos insuficientes para baixar PDF"));
        return;
      }
    }

    await generatePDF({ isDarkMode, idea, analysis, ideaId });
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleContentRef = (ref: HTMLDivElement | null) => {
    setContentRef(ref);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl h-[90vh] flex flex-col p-0 gap-0",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
      )}>
        <AdvancedAnalysisHeader
          loading={loading}
          analysis={analysis}
          isSaving={isSaving}
          isSaved={isSaved}
          isGeneratingPdf={isGeneratingPdf}
          showChat={showChat}
          onReanalyze={handleRequestAdvancedAnalysis}
          onSave={handleSaveAnalysis}
          onShare={handleShare}
          onDownloadPDF={handleDownloadPDF}
          onToggleChat={toggleChat}
        />

        {loading ? (
          <AdvancedAnalysisLoading 
            progress={progress} 
            isDarkMode={isDarkMode} 
            loading={loading} 
          />
        ) : (
          <AdvancedAnalysisStates 
            isLoadingExisting={isLoadingExisting}
            analysis={analysis}
            isDarkMode={isDarkMode}
          />
        )}

        {!loading && !isLoadingExisting && analysis && (
          <div className="flex-1 flex overflow-hidden">
            {showChat ? (
              <div className="w-full flex flex-col">
                <div className={cn(
                  "p-2 flex items-center",
                  isDarkMode ? "bg-slate-800 border-b border-slate-700" : "bg-slate-50 border-b"
                )}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleChat}
                    className={cn(
                      "flex items-center",
                      isDarkMode ? "hover:bg-slate-700" : ""
                    )}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('common.back')}
                  </Button>
                </div>
                <AdvancedAnalysisChat 
                  ideaId={ideaId} 
                  idea={idea}
                  analysis={analysis.analysis_data}
                  onBack={() => setShowChat(false)} 
                />
              </div>
            ) : (
              <ScrollArea className={cn(
                "flex-1 p-4 md:p-6 overflow-y-auto",
                isDarkMode ? "bg-slate-900" : "bg-white"
              )}>
                <div 
                  ref={handleContentRef} 
                  className={cn(
                    "max-w-3xl mx-auto pb-20",
                    isDarkMode ? "text-slate-200" : "text-slate-900"
                  )}
                >
                  <AdvancedAnalysisContent analysis={analysis.analysis_data} />
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <ConfirmDialog open={showCreditConfirm} onOpenChange={setShowCreditConfirm}>
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>{t('credits.confirmTitle', 'Confirmar uso de créditos')}</ConfirmDialogTitle>
            </ConfirmDialogHeader>
            <div className="py-4">
              {t('credits.confirmAdvancedAnalysis', 'Esta ação irá deduzir 2 créditos da sua conta. Deseja continuar?')}
            </div>
            <ConfirmDialogFooter>
              <Button variant="outline" onClick={() => setShowCreditConfirm(false)}>{t('common.cancel')}</Button>
              <Button onClick={() => { setShowCreditConfirm(false); pendingAction && pendingAction(); }}>{t('common.confirm', 'Confirmar')}</Button>
            </ConfirmDialogFooter>
          </ConfirmDialogContent>
        </ConfirmDialog>
      </DialogContent>
    </Dialog>
  );
}
