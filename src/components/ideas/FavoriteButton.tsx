
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface FavoriteButtonProps {
  ideaId: string;
  isFavorite: boolean;
  onUpdate: () => void;
  variant?: string;
  size?: string;
  showText?: boolean;
  className?: string;
}

export const FavoriteButton = ({ 
  ideaId, 
  isFavorite, 
  onUpdate,
  variant = "ghost",
  size = "sm",
  showText = false,
  className
}: FavoriteButtonProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authState.isAuthenticated) return;
    
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
        toast.success(t('ideas.addedToFavorites', "Adicionado aos favoritos"));
      }
      
      // Notify parent component to update
      onUpdate();
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast.error(t('common.errorOccurred', "Ocorreu um erro"));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant as any}
      size={size as any}
      onClick={toggleFavorite}
      disabled={isLoading}
      className={cn(
        "hover:text-amber-500",
        isFavorite && "text-amber-500",
        className
      )}
    >
      <Star className={cn("h-4 w-4", showText && "mr-2")} fill={isFavorite ? "currentColor" : "none"} />
      {showText && (isFavorite ? t('ideas.unfavorite', "Desfavoritar") : t('ideas.favorite', "Favoritar"))}
    </Button>
  );
};
