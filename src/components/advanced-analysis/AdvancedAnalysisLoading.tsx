import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { BarChart3, Users, DollarSign, TrendingUp, Search, PieChart, Lightbulb, Zap } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface AdvancedAnalysisLoadingProps {
  progress: number;
  isDarkMode: boolean;
  loading: boolean;
}

export function AdvancedAnalysisLoading({ progress, isDarkMode, loading }: AdvancedAnalysisLoadingProps) {
  const { t } = useTranslation();
  
  // Debug: Log progress changes
  useEffect(() => {
    console.log('AdvancedAnalysisLoading - Progress:', progress, 'Loading:', loading);
  }, [progress, loading]);
  
  // Refs para animações
  const containerRef = useRef<HTMLDivElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const motivationalPhrases = [
    t('advancedAnalysis.motivation1'),
    t('advancedAnalysis.motivation2'),
    t('advancedAnalysis.motivation3'),
    t('advancedAnalysis.motivation4'),
    t('advancedAnalysis.motivation5'),
    t('advancedAnalysis.motivation6'),
    t('advancedAnalysis.motivation7'),
    t('advancedAnalysis.motivation8')
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  // Troca de mensagens motivacionais baseada no progresso
  useEffect(() => {
    if (loading && progress > 0) {
      const phraseIndex = Math.floor((progress / 100) * motivationalPhrases.length);
      const newPhraseIndex = Math.min(phraseIndex, motivationalPhrases.length - 1);
      console.log(`Progress: ${progress}% - Changing to phrase ${newPhraseIndex}`);
      setCurrentPhrase(newPhraseIndex);
    }
  }, [progress, motivationalPhrases.length, loading]);

  // Animação de troca de mensagens automática (reduzida para não interferir com progresso)
  useEffect(() => {
    if (loading && progress < 10) { // Só troca automaticamente se progresso < 10%
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => {
          const next = (prev + 1) % motivationalPhrases.length;
          console.log(`Auto-changing phrase from ${prev} to ${next}`);
          return next;
        });
      }, 4000); // Troca a cada 4 segundos

      return () => clearInterval(interval);
    }
  }, [loading, motivationalPhrases.length, progress]);

  // Garantir que o progresso seja sempre um número válido
  const safeProgress = Math.max(0, Math.min(100, progress || 0));

  // Debug: Log safeProgress changes (reduzido)
  useEffect(() => {
    if (safeProgress > 0) {
      console.log('SafeProgress updated:', safeProgress);
    }
  }, [safeProgress]);

  // Removed manual DOM manipulation - using React state instead

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden",
        isDarkMode ? "bg-slate-900" : "bg-white"
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-float" />
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Main loading animation */}
        <div className="flex justify-center">
          <div 
            ref={brainRef}
            className="relative animate-pulse-glow"
          >
            <div className="w-24 h-24 md:w-40 md:h-40">
              <DotLottieReact
                src="https://lottie.host/1e1ec35f-a1e7-46fc-b7a6-ec779667e7e3/b9u1h3QSuU.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div 
          ref={progressRef}
          className="space-y-4 animate-slideInFromBottom"
        >
          <div className="text-center">
            <h2 
              ref={messageRef}
              className={cn(
                "text-xl font-semibold mb-3 transition-all duration-500 ease-in-out",
                isDarkMode ? "text-white" : "text-slate-900"
              )}
              key={currentPhrase} // Força re-render para animação
            >
              {motivationalPhrases[currentPhrase]}
            </h2>
            <p className={cn(
              "text-muted-foreground text-sm",
              isDarkMode ? "text-slate-400" : ""
            )}>
              {t('advancedAnalysis.patience')}
            </p>
          </div>
          
          {/* Modern progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('common.analyzing')}</span>
              <span className="font-bold text-brand-purple">{Math.round(safeProgress)}%</span>
            </div>
            <div className={cn(
              "h-4 rounded-full overflow-hidden progress-bar-container shadow-inner",
              isDarkMode ? "bg-slate-800" : "bg-slate-200"
            )}>
              <div 
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full progress-bar-fill shadow-lg"
                style={{ 
                  width: `${safeProgress}%`,
                  minWidth: '0%',
                  maxWidth: '100%',
                  transition: 'width 0.3s ease-out',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #7c3aed 100%)',
                  boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)'
                }}
              />
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground">
                {safeProgress < 25 && t('analysis.market')}
                {safeProgress >= 25 && safeProgress < 50 && t('analysis.audience')}
                {safeProgress >= 50 && safeProgress < 75 && t('analysis.monetization')}
                {safeProgress >= 75 && safeProgress < 100 && t('analysis.growth')}
                {safeProgress >= 100 && t('common.completed')}
              </span>
            </div>
          </div>
        </div>

        {/* Business analysis indicators */}
        <div className="flex justify-center space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-xs text-muted-foreground">Dados</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <PieChart className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">Análise</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse" style={{ animationDelay: '1s' }}>
              <Lightbulb className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-xs text-muted-foreground">Insights</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-orange-400/20 to-red-400/20 animate-pulse" style={{ animationDelay: '1.5s' }}>
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-xs text-muted-foreground">Resultado</span>
          </div>
        </div>

        {/* Analysis steps preview */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: BarChart3, label: t('analysis.market'), color: 'from-blue-500 to-cyan-500', threshold: 25 },
            { icon: Users, label: t('analysis.audience'), color: 'from-green-500 to-emerald-500', threshold: 50 },
            { icon: DollarSign, label: t('analysis.monetization'), color: 'from-yellow-500 to-orange-500', threshold: 75 },
            { icon: TrendingUp, label: t('analysis.growth'), color: 'from-purple-500 to-pink-500', threshold: 100 }
          ].map((step, index) => {
            const isActive = safeProgress >= step.threshold;
            // Log apenas quando uma etapa é ativada
            if (isActive && safeProgress > 0) {
              console.log(`Step ${index} (${step.label}) activated at ${safeProgress}%`);
            }
            return (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-700 ease-in-out",
                  isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white/50 border-slate-200",
                  isActive 
                    ? "opacity-100 scale-105 shadow-lg border-2" 
                    : "opacity-40 scale-95 shadow-sm"
                )}
                style={{
                  transform: isActive ? 'scale(1.05)' : 'scale(0.95)',
                  transition: 'all 0.7s ease-in-out'
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-1.5 rounded-full bg-gradient-to-r transition-all duration-500 ease-in-out",
                    step.color,
                    isActive 
                      ? "animate-pulse scale-125 shadow-md" 
                      : "scale-100"
                  )}
                  style={{
                    transform: isActive ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}>
                    <step.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-all duration-500 ease-in-out",
                    isDarkMode ? "text-slate-300" : "text-slate-700",
                    isActive 
                      ? "font-bold text-base" 
                      : "font-medium"
                  )}
                  style={{
                    fontSize: isActive ? '0.875rem' : '0.75rem',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'all 0.5s ease-in-out'
                  }}>
                    {step.label}
                  </span>
                </div>
                {isActive && (
                  <div className="mt-2 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 