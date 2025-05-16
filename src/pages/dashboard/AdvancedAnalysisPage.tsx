
import { SavedAnalysesList } from "@/components/advanced-analysis";
import { useTranslation } from "react-i18next";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";
import { useState, useEffect } from "react";

const AdvancedAnalysisPage = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to force refresh the saved analyses list
  const refreshSavedAnalyses = () => {
    setRefreshKey(prevKey => prevKey + 1);
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
      </div>
      
      <SavedAnalysesList key={refreshKey} />
    </div>
  );
};

export default AdvancedAnalysisPage;
