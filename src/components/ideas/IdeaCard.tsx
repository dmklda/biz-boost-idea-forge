
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, BarChart3, CheckSquare } from "lucide-react";
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
  const [localIsFavorite, setLocalIsFavorite] = useState(is_favorite);
  const [showReanalyzeModal, setShowReanalyzeModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Não navegar se clicar em elementos interativos
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button') || 
                                 target.closest('[role="menuitem"]') || 
                                 target.closest('[data-radix-collection-item]') ||
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
      navigate(`/dashboard/ideias/${id}`);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(id);
  };

  const handleEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onEdit) {
      onEdit(id);
    } else {
      // Verificar se a ideia existe antes de navegar
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('id')
          .eq('id', id)
          .eq('user_id', authState.user?.id)
          .single();

        if (error || !data) {
          toast.error("Ideia não encontrada");
          return;
        }

        navigate(`/dashboard/ideias/${id}/edit`);
      } catch (error) {
        console.error("Error checking idea:", error);
        toast.error("Erro ao verificar ideia");
      }
    }
  };

  const handleReanalyze = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReanalyzeModal(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(id);
      return;
    }

    // Implementar delete nativo aqui
    if (!confirm("Tem certeza que deseja excluir esta ideia?")) return;

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);

      if (error) {
        console.error("Error deleting idea:", error);
        toast.error("Erro ao excluir ideia");
        return;
      }

      toast.success("Ideia excluída com sucesso");
      
      // Emitir evento para atualização global
      window.dispatchEvent(new CustomEvent('idea-deleted', {
        detail: { ideaId: id }
      }));

    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Erro ao excluir ideia");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAnalyze) {
      onAnalyze(id);
      return;
    }

    // Verificar se tem análise antes de navegar
    try {
      const { data: analysisData } = await supabase
        .from('idea_analyses')
        .select('id')
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (analysisData && analysisData.length > 0) {
        navigate(`/dashboard/resultados/${id}?id=${id}`);
      } else {
        navigate(`/dashboard/ideias/${id}/analyze`);
      }
    } catch (error) {
      console.error("Error checking analysis:", error);
      navigate(`/dashboard/ideias/${id}/analyze`);
    }
  };

  const handleFavoriteToggle = (isFavorite: boolean) => {
    setLocalIsFavorite(isFavorite);
  };

  const handleReanalyzeSuccess = () => {
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
                    className="h-10 w-10 p-0 opacity-100 transition-opacity dropdown-trigger action-button min-h-[44px] min-w-[44px]"
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
                    onClick={handleEdit} 
                    className="flex items-center gap-2 cursor-pointer min-h-[44px] md:min-h-auto"
                  >
                    <Edit className="h-4 w-4" />
                    {t('ideas.actions.edit', 'Editar')}
                  </DropdownMenuItem>
                  {(score !== null && score !== undefined) && (
                    <>
                      <DropdownMenuItem 
                        onClick={handleReanalyze} 
                        className="flex items-center gap-2 cursor-pointer min-h-[44px] md:min-h-auto"
                      >
                        <Edit className="h-4 w-4" />
                        {t('ideas.actions.reanalyze', 'Reanalisar')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleAnalyze} 
                        className="flex items-center gap-2 cursor-pointer min-h-[44px] md:min-h-auto"
                      >
                        <BarChart3 className="h-4 w-4" />
                        {t('ideas.actions.viewResults', 'Ver Resultados')}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={handleDelete} 
                    className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer min-h-[44px] md:min-h-auto"
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
              className="w-full flex items-center gap-2 min-h-[44px]"
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
