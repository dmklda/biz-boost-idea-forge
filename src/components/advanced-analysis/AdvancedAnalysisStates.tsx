import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface AdvancedAnalysisStatesProps {
  isLoadingExisting: boolean;
  analysis: any;
  isDarkMode: boolean;
}

export function AdvancedAnalysisStates({ 
  isLoadingExisting, 
  analysis, 
  isDarkMode 
}: AdvancedAnalysisStatesProps) {
  const { t } = useTranslation();

  if (isLoadingExisting) {
    return (
      <div className={cn(
        "flex-1 p-4 md:p-6 flex flex-col items-center justify-center",
        isDarkMode ? "bg-slate-900" : "bg-white"
      )}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "relative p-4 rounded-full animate-pulse-glow",
              isDarkMode ? "bg-slate-800/50" : "bg-white/50"
            )}>
              <Loader variant="circular" size="lg" className="text-brand-purple" />
            </div>
          </div>
          <div>
            <h2 className={cn(
              "text-xl font-semibold mb-2 animate-fadeIn",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {t('common.loading')}
            </h2>
            <p className={cn(
              "text-muted-foreground animate-slideInFromBottom",
              isDarkMode ? "text-slate-400" : ""
            )}>
              {t('advancedAnalysis.title')}
            </p>
          </div>
          <Loader variant="text-shimmer" text={t('common.loading')} size="sm" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={cn(
        "flex-1 p-4 md:p-6 flex flex-col items-center justify-center",
        isDarkMode ? "bg-slate-900" : "bg-white"
      )}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className={cn(
              "relative p-6 rounded-full animate-pulse-glow",
              isDarkMode ? "bg-slate-800/50" : "bg-white/50"
            )}>
              <Sparkles className="h-12 w-12 text-brand-purple animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-rotate" />
            </div>
          </div>
          <div>
            <h2 className={cn(
              "text-xl font-semibold mb-3 animate-fadeIn",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {t('advancedAnalysis.generating')}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-6 animate-slideInFromBottom",
              isDarkMode ? "text-slate-400" : ""
            )}>
              {t('advancedAnalysis.patience')}
            </p>
          </div>
          <div className="space-y-3">
            <div className={cn(
              "h-2 w-48 rounded-full overflow-hidden mx-auto",
              isDarkMode ? "bg-slate-800" : "bg-slate-200"
            )}>
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '30%' }} />
            </div>
            <Loader variant="loading-dots" text={t('common.preparing')} size="sm" />
          </div>
        </div>
      </div>
    );
  }

  return null;
} 