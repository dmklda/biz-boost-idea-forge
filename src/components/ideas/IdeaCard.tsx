import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Edit, FileText, Trash2, Lightbulb, BarChart3, Star, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TagBadge } from "./TagBadge";
import { FavoriteButton } from "./FavoriteButton";
import { CompareIdeasModal } from "./CompareIdeasModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { CreateValidationModal } from "@/components/marketplace/CreateValidationModal";

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
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showCreateValidationModal, setShowCreateValidationModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

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

  const handleCreateValidationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateValidationModal(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      // First, delete all related data to avoid foreign key constraint violations
      
      // Delete generated content
      const { error: contentError } = await supabase
        .from('generated_content')
        .delete()
        .eq('idea_id', idea.id);

      if (contentError) {
        console.error("Error deleting generated content:", contentError);
        // Continue with deletion even if this fails
      }

      // Delete advanced analyses
      const { error: advancedError } = await supabase
        .from('advanced_analyses')
        .delete()
        .eq('idea_id', idea.id);

      if (advancedError) {
        console.error("Error deleting advanced analyses:", advancedError);
        // Continue with deletion even if this fails
      }

      // Delete idea analyses
      const { error: analysisError } = await supabase
        .from('idea_analyses')
        .delete()
        .eq('idea_id', idea.id);

      if (analysisError) {
        console.error("Error deleting idea analyses:", analysisError);
        // Continue with deletion even if this fails
      }

      // Delete idea tags
      const { error: tagsError } = await supabase
        .from('idea_tags')
        .delete()
        .eq('idea_id', idea.id);

      if (tagsError) {
        console.error("Error deleting idea tags:", tagsError);
        // Continue with deletion even if this fails
      }

      // Delete idea favorites
      const { error: favoritesError } = await supabase
        .from('idea_favorites')
        .delete()
        .eq('idea_id', idea.id);

      if (favoritesError) {
        console.error("Error deleting idea favorites:", favoritesError);
        // Continue with deletion even if this fails
      }

      // Finally, delete the idea itself
      const { error: ideaError } = await supabase
        .from('ideas')
        .delete()
        .eq('id', idea.id);

      if (ideaError) throw ideaError;

      toast.success(t('ideas.deleted', 'Ideia excluída com sucesso'));
      onUpdate(); // Refresh the ideas list
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error(t('ideas.deleteError', 'Erro ao excluir ideia'));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
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
          {/* Header with Favorite and Delete Buttons */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-lg line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {idea.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton 
                ideaId={idea.id} 
                isFavorite={idea.is_favorite || false} 
                onUpdate={onUpdate}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
            onClick={handleCreateValidationClick}
          >
            <Target className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="hidden md:inline text-sm font-medium">{t('ideas.createValidation', "Criar Validação")}</span>
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

      <CreateValidationModal
        open={showCreateValidationModal}
        onOpenChange={setShowCreateValidationModal}
        ideaId={idea.id}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t('ideas.deleteTitle', 'Excluir Ideia')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('ideas.deleteConfirm', 'Tem certeza que deseja excluir esta ideia? Esta ação não pode ser desfeita.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-slate-200 dark:border-slate-700">
              {t('common.cancel', 'Cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {deleting ? t('common.deleting', 'Excluindo...') : t('common.confirm', 'Confirmar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
