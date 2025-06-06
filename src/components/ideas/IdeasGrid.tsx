
import React from "react";
import { IdeaCard } from "./IdeaCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Lightbulb, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite: boolean;
  score?: number | null;
  status?: string | null;
  tags?: string[];
}

interface IdeasGridProps {
  ideas: Idea[];
  loading?: boolean;
  onUpdate?: () => void;
  showSelectButton?: boolean;
  selectedIdeas?: string[];
  onIdeaSelect?: (ideaId: string) => void;
}

export const IdeasGrid: React.FC<IdeasGridProps> = ({ 
  ideas, 
  loading = false, 
  onUpdate,
  showSelectButton = false,
  selectedIdeas = [],
  onIdeaSelect
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  console.log("IdeasGrid: Rendering with", ideas.length, "ideas, loading:", loading);

  if (loading) {
    console.log("IdeasGrid: Showing loading skeleton");
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    console.log("IdeasGrid: No ideas found, showing empty state");
    return (
      <EmptyState
        icon={<Lightbulb className="h-12 w-12" />}
        title={t('ideas.empty.title', "Nenhuma ideia encontrada")}
        description={t('ideas.empty.description', "Você ainda não tem ideias. Crie sua primeira ideia!")}
        action={
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t('ideas.empty.createFirst', "Criar primeira ideia")}
          </Button>
        }
      />
    );
  }

  console.log("IdeasGrid: Rendering", ideas.length, "idea cards");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {ideas.map((idea) => {
        console.log("IdeasGrid: Rendering idea card for", idea.title, "with score:", idea.score);
        return (
          <IdeaCard
            key={idea.id}
            id={idea.id}
            title={idea.title}
            description={idea.description}
            created_at={idea.created_at}
            is_favorite={idea.is_favorite}
            score={idea.score}
            status={idea.status}
            tags={idea.tags}
            showSelectButton={showSelectButton}
            isSelected={selectedIdeas.includes(idea.id)}
            onSelect={onIdeaSelect}
            onEdit={() => {
              console.log("IdeasGrid: Edit triggered for idea", idea.id);
              onUpdate?.();
            }}
            onDelete={() => {
              console.log("IdeasGrid: Delete triggered for idea", idea.id);
              onUpdate?.();
            }}
            onAnalyze={() => {
              console.log("IdeasGrid: Analyze triggered for idea", idea.id);
              onUpdate?.();
            }}
          />
        );
      })}
    </div>
  );
};
