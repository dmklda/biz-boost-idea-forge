
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { IdeasTabs, useIdeasData } from "@/components/ideas";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";
import { IdeaForm } from "@/components/IdeaForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoadingScreen from "@/components/ui/LoadingScreen";

const IdeasPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const {
    ideas,
    favoriteIdeas,
    filteredIdeas,
    loading,
    allTags,
    selectedTags,
    handleTagsChange,
    fetchIdeas
  } = useIdeasData(authState.user?.id);

  // Use the refresh hook to update ideas when analysis is updated
  useRefreshAnalyses(fetchIdeas, []);

  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handler para impedir fechar o modal durante análise
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (isAnalyzing && !open) return; // Não permite fechar se analisando
    setIsAnalysisDialogOpen(open);
  }, [isAnalyzing]);

  return (
    <div className="space-y-6">
      {isAnalyzing ? (
        <LoadingScreen />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl md:text-2xl font-bold">
              {t('ideas.title', "Suas Ideias")}
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/rascunhos")}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                {t('ideas.viewDrafts', "Ver Rascunhos")}
              </Button>
              <Button onClick={() => setIsAnalysisDialogOpen(true)} className="bg-brand-purple hover:bg-brand-purple/90">
                <Plus className="mr-2 h-4 w-4" />
                {t('ideas.newIdea', "Nova Ideia")}
              </Button>
            </div>
          </div>
          <IdeasTabs
            ideas={ideas}
            favoriteIdeas={favoriteIdeas}
            filteredIdeas={filteredIdeas}
            loading={loading}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            fetchIdeas={fetchIdeas}
          />
          <Dialog 
            open={isAnalysisDialogOpen} 
            onOpenChange={handleDialogOpenChange}
          >
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('ideaForm.title')}</DialogTitle>
                <DialogDescription>{t('ideaForm.subtitle')}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <IdeaForm 
                  onAnalysisComplete={() => setIsAnalysisDialogOpen(false)}
                  onAnalysisStateChange={setIsAnalyzing}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default IdeasPage;
