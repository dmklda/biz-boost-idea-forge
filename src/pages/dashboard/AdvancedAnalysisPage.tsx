
import { SavedAnalysesList } from "@/components/advanced-analysis";
import { useTranslation } from "react-i18next";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreditSystem } from "@/utils/creditSystem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdvancedAnalysisPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { checkCredits, hasFeatureAccess, userCredits, userPlan } = useCreditSystem();

  // Function to force refresh the saved analyses list
  const refreshSavedAnalyses = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Navigate to create new idea page
  const handleCreateNewIdea = async () => {
    // For Pro users, no credit check needed
    if (userPlan === 'pro') {
      navigate('/dashboard/ideas/new');
      return;
    }
    
    // For other plans, check if they have enough credits
    const hasEnoughCredits = await checkCredits('ADVANCED_ANALYSIS');
    if (hasEnoughCredits) {
      navigate('/dashboard/ideas/new');
    }
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

  // Check if user has access to advanced analysis
  const hasAccess = hasFeatureAccess('advancedAnalysis');
  const needsCredits = userPlan !== 'pro' && userCredits < 2;

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
        <Button 
          onClick={handleCreateNewIdea} 
          className="shrink-0"
          disabled={!hasAccess && needsCredits}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('common.newIdea', "Nova Ideia")}
        </Button>
      </div>
      
      {!hasAccess && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t('analysis.advancedAccessRequired', "Acesso à Análise Avançada Restrito")}</AlertTitle>
          <AlertDescription>
            {t('analysis.needsProPlanOrCredits', "Análises avançadas requerem plano Pro ou 2 créditos por análise.")}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/planos')}
                className="mr-2"
              >
                {t('analysis.upgradeToPro', "Atualizar para Pro")}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard/creditos')}
              >
                {t('analysis.buyCredits', "Comprar Créditos")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <SavedAnalysesList key={refreshKey} />
    </div>
  );
};

export default AdvancedAnalysisPage;
