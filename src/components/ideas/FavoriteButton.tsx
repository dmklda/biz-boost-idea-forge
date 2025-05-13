
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface FavoriteButtonProps {
  ideaId: string;
  isFavorite?: boolean;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
  onUpdate?: () => void;
}

export function FavoriteButton({
  ideaId,
  isFavorite: initialIsFavorite,
  variant = "ghost",
  size = "sm",
  showText = false,
  className,
  onUpdate
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(initialIsFavorite);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // If isFavorite is not provided via props, fetch it
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (initialIsFavorite !== undefined || !authState.isAuthenticated) return;
      
      try {
        const { data, error } = await supabase
          .from('idea_favorites')
          .select('id')
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user?.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching favorite status:", error);
        } else {
          setIsFavorite(!!data);
        }
      } catch (error) {
        console.error("Error in fetchFavoriteStatus:", error);
      }
    };
    
    fetchFavoriteStatus();
  }, [ideaId, initialIsFavorite, authState.isAuthenticated, authState.user?.id]);
  
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authState.isAuthenticated) {
      toast.error(t('auth.required', "É necessário estar logado para favoritar ideias"));
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('idea_favorites')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user?.id);
          
        if (error) throw error;
        
        setIsFavorite(false);
        toast.success(t('ideas.removedFromFavorites', "Removido dos favoritos"));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('idea_favorites')
          .insert({
            idea_id: ideaId,
            user_id: authState.user?.id
          });
          
        if (error) throw error;
        
        setIsFavorite(true);
        toast.success(t('ideas.addedToFavorites', "Adicionado aos favoritos"));
      }
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(t('ideas.favoriteError', "Erro ao atualizar favoritos"));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading}
      onClick={toggleFavorite}
      className={cn("group", className)}
      aria-label={isFavorite ? t('ideas.removeFromFavorites', "Remover dos favoritos") : t('ideas.addToFavorites', "Adicionar aos favoritos")}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorite
            ? "fill-yellow-400 text-yellow-400"
            : "fill-transparent text-muted-foreground group-hover:text-foreground"
        )}
      />
      {showText && (
        <span className="ml-2">
          {isFavorite
            ? t('ideas.favorited', "Favorito")
            : t('ideas.favorite', "Favoritar")}
        </span>
      )}
    </Button>
  );
}
