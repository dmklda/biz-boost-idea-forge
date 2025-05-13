
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdvancedAnalysisModal } from './AdvancedAnalysisModal';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface AdvancedAnalysisButtonProps {
  ideaId: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
  label?: string;
}

export function AdvancedAnalysisButton({
  ideaId,
  className,
  size = 'default',
  variant = 'default',
  showIcon = true,
  label,
}: AdvancedAnalysisButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          "transition-all",
          showIcon ? "" : "px-6",
          variant === 'default' && !className && (
            isDarkMode 
              ? "bg-gradient-to-r from-brand-blue/90 to-brand-purple/90 hover:from-brand-blue hover:to-brand-purple"
              : "bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90"
          ),
          className
        )}
        size={size}
        variant={variant}
      >
        {showIcon && (
          <Sparkles className={cn(
            "h-4 w-4",
            label ? "mr-2" : ""
          )} />
        )}
        {label || t('advancedAnalysis.button', 'Análise Avançada com GPT-4o')}
      </Button>

      <AdvancedAnalysisModal ideaId={ideaId} open={open} onOpenChange={setOpen} />
    </>
  );
}
