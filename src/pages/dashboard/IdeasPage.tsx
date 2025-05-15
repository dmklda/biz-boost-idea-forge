
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { IdeasTabs, useIdeasData } from "@/components/ideas";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";

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

  return (
    <div className="space-y-6">
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
          <Button onClick={() => navigate("/dashboard/analise")} className="bg-brand-purple hover:bg-brand-purple/90">
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
    </div>
  );
};

export default IdeasPage;
