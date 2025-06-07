import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, BarChart3, CheckSquare, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FavoriteButton } from "./FavoriteButton";
import { TagBadge } from "./TagBadge";
import { ReanalyzeModal } from "./ReanalyzeModal";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite: boolean;
  score?: number | null;
  status?: string | null;
  tags?: string[];
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAnalyze?: (id: string) => void;
  className?: string;
}

export const IdeaCard = ({
  id,
  title,
  description,
  created_at,
  is_favorite,
  score,
  status,
  tags = [],
  onSelect,
  isSelected = false,
  showSelectButton = false,
  onEdit,
  onDelete,
  onAnalyze,
  className
}: IdeaCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authState } = useAuth();
  const isMobile = useIsMobile();
  const [localIsFavorite, setLocalIsFavorite] = useState(is_favorite);
  const [showReanalyzeModal, setShowReanalyzeModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Não navegar se clicar em elementos interativos
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button') || 
                                 target.closest('[role="menuitem"]') || 
                                 target.closest('[data-radix-collection-item]') ||
                                 target.closest('[data-radix-dropdown-menu-trigger]') ||
                                 target.closest('[data-radix-dropdown-menu-content]') ||
                                 target.closest('.dropdown-trigger') ||
                                 target.closest('.favorite-button') ||
                                 target.closest('.action-button');
    
    if (isInteractiveElement) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (showSelectButton && onSelect) {
      onSelect(id);
    } else {
      console.log("IdeaCard: Navigating to idea details for", id);
      navigate(`/dashboard/ideias/${id}`);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("IdeaCard: Select button clicked for", id);
    onSelect?.(id);
  };

  const handleEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("IdeaCard: Edit button clicked for idea", id);
    
    if (onEdit) {
      onEdit(id);
      return;
    }

    try {
      // Verificar se a ideia existe e pertence ao usuário
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select('id, title')
        .eq('id', id)
        .eq('user_id', authState.user?.id)
        .single();

      if (ideaError || !ideaData) {
        console.error("Error checking idea:", ideaError);
        toast.error("Ideia não encontrada ou você não tem permissão para editá-la");
        return;
      }

      console.log("IdeaCard: Navigating to edit page for", ideaData.title);
      navigate(`/dashboard/ideias/${id}/edit`);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast.error("Erro ao verificar ideia");
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("IdeaCard: View details clicked for idea", id);
    navigate(`/dashboard/ideias/${id}`);
  };

  const handleViewResults = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("IdeaCard: View results clicked for idea", id);
    
    try {
      // Verificar se tem análise
      const { data: analysisData, error: analysisError } = await supabase
        .from('idea_analyses')
        .select('id, created_at')
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (analysisError) {
        console.error("Error checking analysis:", analysisError);
        toast.error("Erro ao verificar análise");
        return;
      }

      if (analysisData && analysisData.length > 0) {
        console.log("IdeaCard: Analysis found, navigating to results");
        navigate(`/dashboard/resultados/${id}`);
      } else {
        console.log("IdeaCard: No analysis found, navigating to analyze page");
        navigate(`/dashboard/ideias/${id}/analyze`);
      }
    } catch (error) {
      console.error("Error in handleViewResults:", error);
      navigate(`/dashboard/ideias/${id}/analyze`);
    }
  };

  const handleReanalyze = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("IdeaCard: Reanalyze clicked for idea", id);
    setShowReanalyzeModal(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("IdeaCard: Delete clicked for idea", id);
    
    if (onDelete) {
      onDelete(id);
      return;
    }

    // Confirmar delete
    if (!confirm("Tem certeza que deseja excluir esta ideia?")) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log("IdeaCard: Starting delete process for", id);
      
      // Deletar a ideia
      const { error: deleteError } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);

      if (deleteError) {
        console.error("Error deleting idea:", deleteError);
        toast.error("Erro ao excluir ideia");
        return;
      }

      console.log("IdeaCard: Idea deleted successfully");
      toast.success("Ideia excluída com sucesso");
      
      // Emitir evento para atualização global
      window.dispatchEvent(new CustomEvent('idea-deleted', {
        detail: { ideaId: id }
      }));

      // Forçar refresh da página se estiver na lista de ideias
      if (window.location.pathname === '/dashboard/ideias') {
        window.location.reload();
      }

    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("Erro ao excluir ideia");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFavoriteToggle = (isFavorite: boolean) => {
    console.log("IdeaCard: Favorite toggled for", id, "to", isFavorite);
    setLocalIsFavorite(isFavorite);
  };

  const handleReanalyzeSuccess = () => {
    console.log("IdeaCard: Reanalysis successful for", id);
    // Emitir evento para refresh dos dados
    window.dispatchEvent(new CustomEvent('analysis-updated'));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'viable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not viable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const translations: Record<string, string> = {
      'viable': t('ideas.status.viable', 'Viável'),
      'moderate': t('ideas.status.moderate', 'Moderado'),
      'not viable': t('ideas.status.notViable', 'Não Viável')
    };
    return translations[status?.toLowerCase()] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card 
        className={cn(
          "group transition-all duration-200 hover:shadow-md cursor-pointer relative overflow-hidden",
          isSelected && "ring-2 ring-brand-blue shadow-lg",
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base line-clamp-2 break-words group-hover:text-brand-blue transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {formatDate(created_at)}
                </span>
                {score !== null && score !== undefined && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    {score}% viabilidade
                  </Badge>
                )}
                {status && (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs px-2 py-0 border", getStatusColor(status))}
                  >
                    {getStatusText(status)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="favorite-button"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <FavoriteButton
                  ideaId={id}
                  isFavorite={localIsFavorite}
                  onToggle={handleFavoriteToggle}
                  size="sm"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-10 w-10 p-0 opacity-100 transition-opacity dropdown-trigger action-button",
                      isMobile ? "min-h-[44px] min-w-[44px]" : ""
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem 
                    onClick={handleViewDetails}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      isMobile ? "min-h-[44px]" : "min-h-auto"
                    )}
                  >
                    <Eye className="h-4 w-4" />
                    {t('ideas.actions.viewDetails', 'Ver Detalhes')}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleEdit} 
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      isMobile ? "min-h-[44px]" : "min-h-auto"
                    )}
                  >
                    <Edit className="h-4 w-4" />
                    {t('ideas.actions.edit', 'Editar')}
                  </DropdownMenuItem>
                  
                  {(score !== null && score !== undefined) && (
                    <>
                      <DropdownMenuItem 
                        onClick={handleViewResults}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isMobile ? "min-h-[44px]" : "min-h-auto"
                        )}
                      >
                        <BarChart3 className="h-4 w-4" />
                        {t('ideas.actions.viewResults', 'Ver Resultados')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={handleReanalyze} 
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isMobile ? "min-h-[44px]" : "min-h-auto"
                        )}
                      >
                        <Edit className="h-4 w-4" />
                        {t('ideas.actions.reanalyze', 'Reanalisar')}
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    className={cn(
                      "flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer",
                      isMobile ? "min-h-[44px]" : "min-h-auto"
                    )}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Excluindo...' : t('ideas.actions.delete', 'Excluir')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 break-words leading-relaxed">
            {description}
          </p>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag, index) => (
                <TagBadge key={index} name={tag} />
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {showSelectButton && (
          <CardFooter className="pt-0">
            <Button
              onClick={handleSelect}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full flex items-center gap-2",
                isMobile ? "min-h-[44px]" : ""
              )}
            >
              <CheckSquare className="h-4 w-4" />
              {isSelected 
                ? t('ideas.compare.selected', 'Selecionada') 
                : t('ideas.compare.select', 'Selecionar')
              }
            </Button>
          </CardFooter>
        )}
      </Card>

      <ReanalyzeModal
        isOpen={showReanalyzeModal}
        onClose={() => setShowReanalyzeModal(false)}
        ideaId={id}
        currentTitle={title}
        currentDescription={description}
        onSuccess={handleReanalyzeSuccess}
      />
    </>
  );
};
