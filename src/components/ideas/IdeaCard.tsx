
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Edit, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TagBadge } from "./TagBadge";
import { FavoriteButton } from "./FavoriteButton";
import { useCompareIdeasModal } from "./CompareIdeasModal";

interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite?: boolean;
  score?: number | null;
  status?: string | null;
  tags?: string[];
}

export const IdeaCard = ({ idea, onUpdate }: { idea: Idea; onUpdate: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openCompareModal } = useCompareIdeasModal();

  const handleCardClick = () => {
    navigate(`/dashboard/ideias/${idea.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/editar?id=${idea.id}`);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCompareModal([idea.id]);
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
      <CardContent className="p-4 flex-grow" onClick={handleCardClick}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold line-clamp-2">{idea.title}</h3>
          <FavoriteButton 
            ideaId={idea.id} 
            isFavorite={idea.is_favorite || false} 
            onUpdate={onUpdate}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{idea.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>{new Date(idea.created_at).toLocaleDateString()}</span>
        </div>
        
        {idea.score !== null && idea.score !== undefined && (
          <div className="mb-3">
            <Badge 
              className={cn(
                "text-xs font-medium",
                idea.score >= 70 ? "bg-green-500" : 
                idea.score >= 40 ? "bg-yellow-500" : "bg-red-500"
              )}
            >
              {t('ideas.score', "Score")}: {idea.score}
            </Badge>
          </div>
        )}
        
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 flex flex-wrap gap-2 justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4 mr-1" />
          {t('common.edit', "Editar")}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
          onClick={handleCompareClick}
        >
          <FileText className="h-4 w-4 mr-1" />
          {t('ideas.compare', "Comparar")}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/ideias/${idea.id}`);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          {t('ideas.viewDetails', "Ver detalhes")}
        </Button>
      </CardFooter>
    </Card>
  );
};
