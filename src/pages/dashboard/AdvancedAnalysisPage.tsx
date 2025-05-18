
import { SavedAnalysesList } from "@/components/advanced-analysis";
import { useTranslation } from "react-i18next";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAffordFeature, FEATURE_COSTS } from "@/utils/creditSystem";
import { toast } from "@/components/ui/sonner";

const AdvancedAnalysisPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { authState } = useAuth();
  
  // Function to force refresh the saved analyses list
  const refreshSavedAnalyses = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Navigate to create new idea page with credit check
  const handleCreateNewIdea = () => {
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!canAffordFeature(authState.user, "advanced")) {
      toast.error(
        `Você precisa de ${FEATURE_COSTS.advanced} créditos para análise avançada.`,
        {
          action: {
            label: "Comprar créditos",
            onClick: () => navigate('/dashboard/creditos')
          }
        }
      );
      return;
    }
    
    navigate('/dashboard/ideas/new');
  };

  // Listen for analysis-updated and language-changed events
  useEffect(() => {
    const handleAnalysisUpdate = () => {
      console.log("Advanced analysis page detected analysis update");
      refreshSavedAnalyses();
    };
    
    const handleLanguageChange = () => {
      console.log("Advanced analysis page detected language change");
      refreshSavedAnalyses();
    };

    window.addEventListener("analysis-updated", handleAnalysisUpdate);
    window.addEventListener("language-changed", handleLanguageChange);
    
    return () => {
      window.removeEventListener("analysis-updated", handleAnalysisUpdate);
      window.removeEventListener("language-changed", handleLanguageChange);
    };
  }, []);

  // Use the refresh hook to update analyses when analysis is updated
  useRefreshAnalyses(refreshSavedAnalyses, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            {t('analysis.savedAnalyses', "Análises Avançadas Salvas")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('analysis.savedAnalysesDescription', "Veja e gerencie suas análises avançadas salvas")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {authState.isAuthenticated && (
            <div className="text-sm text-muted-foreground flex items-center mr-2">
              <CreditCard className="h-4 w-4 mr-1" />
              <span>Custo: {FEATURE_COSTS.advanced} créditos</span>
            </div>
          )}
          <Button onClick={handleCreateNewIdea} className="shrink-0">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('common.newIdea', "Nova Ideia")}
          </Button>
        </div>
      </div>
      
      <SavedAnalysesList key={refreshKey} />
    </div>
  );
};

export default AdvancedAnalysisPage;
