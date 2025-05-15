
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IdeaCard } from "./IdeaCard";

export interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite?: boolean;
  score?: number | null;
  status?: string | null;
  tags?: string[];
}

interface IdeasGridProps {
  ideas: Idea[];
  loading: boolean;
  emptyAction?: React.ReactNode;
  onUpdate?: () => void;
}

export const IdeasGrid = ({ ideas, loading, emptyAction, onUpdate }: IdeasGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }
  
  if (ideas.length === 0) {
    return (
      <EmptyState
        icon={<Lightbulb className="h-10 w-10 text-muted-foreground" />}
        title={t('ideas.noIdeas', "Nenhuma ideia encontrada")}
        description={t('ideas.createFirst', "Crie sua primeira ideia para começar")}
        action={
          emptyAction || (
            <Button onClick={() => navigate("/new-idea")} className="bg-brand-purple hover:bg-brand-purple/90">
              <Plus className="mr-2 h-4 w-4" />
              {t('ideas.newIdea', "Nova Ideia")}
            </Button>
          )
        }
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ideas.map(idea => (
        <IdeaCard 
          key={idea.id} 
          idea={idea} 
          onUpdate={onUpdate || (() => {})} 
        />
      ))}
    </div>
  );
};
