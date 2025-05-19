
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdvancedAnalysisModal } from "./AdvancedAnalysisModal";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

interface AdvancedAnalysisButtonProps {
  ideaId: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
  showIcon?: boolean;
  icon?: "chart" | "sparkles";
}

export function AdvancedAnalysisButton({
  ideaId,
  variant = "default",
  size = "default",
  showLabel = true,
  showIcon = true,
  icon = "chart",
  className,
}: AdvancedAnalysisButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const IconComponent = icon === "chart" ? BarChart3 : Sparkles;

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant={variant}
        size={size}
        className={cn(
          "transition-all whitespace-nowrap",
          variant === "default" && "bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90",
          isDarkMode && variant === "outline" && "border-slate-700 hover:bg-slate-800",
          className
        )}
      >
        {showIcon && <IconComponent className={cn("h-4 w-4", showLabel && "mr-1.5")} />}
        {showLabel && t('advancedAnalysis.button', "Análise Avançada")}
      </Button>
      
      <AdvancedAnalysisModal
        ideaId={ideaId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

export default AdvancedAnalysisButton;
