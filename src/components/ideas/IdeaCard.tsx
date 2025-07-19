import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Edit, FileText, Trash2, Lightbulb, BarChart3, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TagBadge } from "./TagBadge";
import { FavoriteButton } from "./FavoriteButton";
import { CompareIdeasModal } from "./CompareIdeasModal";

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
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);

  const handleCardClick = () => {
    navigate(`/dashboard/ideias/${idea.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/ideias/${idea.id}/edit`);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompareModalOpen(true);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/ideias/${idea.id}`);
  };

  // Get status color based on score
  const getStatusColor = (score: number) => {
    if (score >= 70) return "from-green-500 to-emerald-500";
    if (score >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getStatusText = (score: number) => {
    if (score >= 70) return t('ideas.status.viable', 'Viável');
    if (score >= 40) return t('ideas.status.moderate', 'Moderado');
    return t('ideas.status.unviable', 'Inviável');
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 group-hover:opacity-100 opacity-0 transition-opacity duration-300 pointer-events-none" />
        
        <CardContent className="relative p-6 flex-grow" onClick={handleCardClick}>
          {/* Header with Favorite Button */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-lg line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {idea.title}
              </h3>
            </div>
            <FavoriteButton 
              ideaId={idea.id} 
              isFavorite={idea.is_favorite || false} 
              onUpdate={onUpdate}
            />
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
            {idea.description}
          </p>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500 mb-4">
            <Calendar className="h-4 w-4" />
            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
          </div>

          {/* Score Badge */}
          {idea.score !== null && idea.score !== undefined && (
            <div className="mb-4">
              <Badge 
                className={cn(
                  "text-xs font-semibold px-3 py-1 bg-gradient-to-r shadow-lg",
                  getStatusColor(idea.score)
                )}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                {getStatusText(idea.score)} ({idea.score})
              </Badge>
            </div>
          )}

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.slice(0, 3).map((tag, index) => (
                <TagBadge key={index} tag={tag} />
              ))}
              {idea.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{idea.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer with Actions */}
        <CardFooter className="relative pt-0 pb-6 px-6 flex flex-row flex-wrap items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group/btn"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="hidden md:inline text-sm font-medium">{t('common.edit', "Editar")}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group/btn"
            onClick={handleCompareClick}
          >
            <FileText className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="hidden md:inline text-sm font-medium">{t('ideas.compare.button', "Comparar")}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group/btn"
            onClick={handleViewDetailsClick}
          >
            <ExternalLink className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="hidden md:inline text-sm font-medium">{t('ideas.viewDetails', "Ver detalhes")}</span>
          </Button>
        </CardFooter>
      </Card>
      
      <CompareIdeasModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        ideaIds={[idea.id]}
      />
    </>
  );
};
