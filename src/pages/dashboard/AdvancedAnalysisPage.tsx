
import { SavedAnalysesList } from "@/components/advanced-analysis";
import { useTranslation } from "react-i18next";

const AdvancedAnalysisPage = () => {
  const { t } = useTranslation();

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
      
      <SavedAnalysesList />
    </div>
  );
};

export default AdvancedAnalysisPage;
