
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentLanguage } from "@/i18n/config";

interface AdvancedAnalysisButtonProps {
  ideaId: string;
  onAnalysisComplete?: () => void;
}

export function AdvancedAnalysisButton({
  ideaId,
  onAnalysisComplete,
}: AdvancedAnalysisButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      toast.info(t("analysis.advanced.generating", "Gerando análise avançada..."));

      // Get the current user language
      const userLanguage = getCurrentLanguage();
      console.log("Current user language for advanced analysis:", userLanguage);

      // Call the edge function with user language
      const { data, error } = await supabase.functions.invoke("advanced-analysis", {
        body: {
          ideaId,
          userLanguage
        },
      });

      if (error) {
        console.error("Error generating advanced analysis:", error);
        toast.error(t("analysis.advanced.error", "Erro ao gerar análise avançada"));
        return;
      }

      toast.success(t("analysis.advanced.success", "Análise avançada gerada com sucesso!"));
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      // Dispatch an event to notify other components
      const analysisUpdateEvent = new CustomEvent("analysis-updated", {
        detail: { ideaId },
      });
      window.dispatchEvent(analysisUpdateEvent);

    } catch (err) {
      console.error("Advanced analysis error:", err);
      toast.error(t("analysis.advanced.error", "Erro ao gerar análise avançada"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="whitespace-nowrap"
    >
      {loading
        ? t("analysis.advanced.generating", "Gerando...")
        : t("analysis.advanced.button", "Análise Avançada")}
    </Button>
  );
}
