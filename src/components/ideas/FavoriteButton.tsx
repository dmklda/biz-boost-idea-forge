
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

interface FavoriteButtonProps {
  ideaId: string;
  variant?: "default" | "outline" | "ghost" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  onFavoriteChange?: (isFavorite: boolean) => void;
  className?: string;
  showText?: boolean;
}

export const FavoriteButton = ({ 
  ideaId,
  variant = "ghost",
  size = "sm",
  onFavoriteChange,
  className,
  showText = false
}: FavoriteButtonProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if idea is favorited on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!authState.isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('idea_favorites')
          .select('id')
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user?.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setIsFavorite(!!data);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFavoriteStatus();
  }, [ideaId, authState.isAuthenticated]);
  
  const toggleFavorite = async () => {
    if (!authState.isAuthenticated) {
      toast.error(t('auth.requireLogin') || "You need to login to favorite ideas");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('idea_favorites')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user?.id);
          
        if (error) throw error;
        
        setIsFavorite(false);
        if (onFavoriteChange) onFavoriteChange(false);
        toast.success(t('ideas.removedFromFavorites') || "Removed from favorites");
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
        if (onFavoriteChange) onFavoriteChange(true);
        toast.success(t('ideas.addedToFavorites') || "Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast.error(t('ideas.favoriteError') || "Error updating favorite status");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        size === "icon" ? "h-8 w-8" : "px-2",
        className
      )}
      onClick={toggleFavorite}
      disabled={isLoading || !authState.isAuthenticated}
    >
      <Star 
        className={cn(
          "h-4 w-4",
          showText && "mr-1",
          isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        )} 
      />
      {showText && (
        <span className={isFavorite ? "text-yellow-400" : ""}>
          {isFavorite ? (t('ideas.favorited') || "Favorited") : (t('ideas.favorite') || "Favorite")}
        </span>
      )}
    </Button>
  );
};
