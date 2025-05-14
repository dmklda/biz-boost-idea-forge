
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { IdeasTabs, useIdeasData } from "@/components/ideas";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">
          {t('ideas.title', "Suas Ideias")}
        </h1>
        <Button onClick={() => navigate("/new-idea")} className="bg-brand-purple hover:bg-brand-purple/90">
          <Plus className="mr-2 h-4 w-4" />
          {t('ideas.createNew', "Nova Ideia")}
        </Button>
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
