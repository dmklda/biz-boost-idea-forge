import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Download,
  Share2,
  MessageSquare,
  Save,
  Brain
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface AdvancedAnalysisHeaderProps {
  loading: boolean;
  analysis: any;
  isSaving: boolean;
  isSaved: boolean;
  isGeneratingPdf: boolean;
  showChat: boolean;
  onReanalyze: () => void;
  onSave: () => void;
  onShare: () => void;
  onDownloadPDF: () => void;
  onToggleChat: () => void;
}

export function AdvancedAnalysisHeader({
  loading,
  analysis,
  isSaving,
  isSaved,
  isGeneratingPdf,
  showChat,
  onReanalyze,
  onSave,
  onShare,
  onDownloadPDF,
  onToggleChat
}: AdvancedAnalysisHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <DialogHeader className={cn(
      "px-4 py-3 border-b sm:px-6 sm:py-4",
      "pl-4 sm:pl-6 pr-10 sm:pr-10 py-3 sm:py-4",
      isDarkMode ? "border-slate-800" : "border-slate-200"
    )}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <DialogTitle className={cn(
          "text-lg sm:text-xl",
          isDarkMode ? "text-white" : "text-slate-900"
        )}>
          {loading
            ? t('advancedAnalysis.generating')
            : t('advancedAnalysis.title')}
        </DialogTitle>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {!loading && analysis && (
            <>
              <Button 
                variant="default" 
                onClick={onReanalyze}
                size="sm"
                className="bg-brand-purple hover:bg-brand-purple/90 mr-1"
              >
                {t('advancedAnalysis.reanalyze', "Re-análise Avançada")}
              </Button>
              <Button 
                variant={isDarkMode ? "outline" : "outline"} 
                size="sm" 
                onClick={onSave}
                disabled={isSaving}
                className={cn(
                  "transition-all px-2",
                  isSaved ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : "", 
                  isDarkMode && !isSaved ? "border-slate-700 hover:bg-slate-800" : "",
                  isDarkMode && isSaved ? "bg-green-900/20 text-green-400 border-green-800 hover:bg-green-900/30" : ""
                )}
              >
                <Save className={cn("h-4 w-4", isSaving && "animate-pulse")} />
                <span className="hidden sm:inline ml-1">
                  {isSaved ? t('common.saved') : isSaving ? t('common.saving') : t('common.save')}
                </span>
              </Button>
              <Button 
                variant={isDarkMode ? "outline" : "outline"} 
                size="sm" 
                onClick={onShare}
                className={cn(
                  "transition-all hover:bg-slate-100 px-2",
                  isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                )}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">{t('common.share')}</span>
              </Button>
              <Button 
                variant={isDarkMode ? "outline" : "outline"}
                size="sm" 
                onClick={onDownloadPDF}
                disabled={isGeneratingPdf}
                className={cn(
                  "transition-all hover:bg-slate-100 px-2",
                  isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                )}
              >
                <Download className={cn("h-4 w-4", isGeneratingPdf && "animate-pulse")} />
                <span className="hidden sm:inline ml-1">{t('common.pdf')}</span>
              </Button>
              <Button 
                variant={isDarkMode ? "outline" : "outline"}
                size="sm" 
                onClick={onToggleChat}
                className={cn(
                  "transition-all px-2",
                  showChat ? "bg-brand-purple text-white hover:bg-brand-purple/90" : "",
                  !showChat && isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">{t('advancedAnalysis.chat')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </DialogHeader>
  );
} 