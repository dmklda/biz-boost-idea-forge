
import React from "react";
import { Button } from "@/components/ui/button";
import { Star, StarOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const FavoriteButton = ({ 
  ideaId, 
  isFavorite, 
  onUpdate 
}: { 
  ideaId: string; 
  isFavorite: boolean; 
  onUpdate: () => void 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authState.user) return;
    
    try {
      setIsLoading(true);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('idea_favorites')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user.id);
          
        if (error) throw error;
        
        toast({
          title: t('ideas.removedFromFavorites', "Removido dos favoritos"),
          duration: 2000,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('idea_favorites')
          .insert({
            idea_id: ideaId,
            user_id: authState.user.id
          });
          
        if (error) throw error;
        
        toast({
          title: t('ideas.addedToFavorites', "Adicionado aos favoritos"),
          duration: 2000,
        });
      }
      
      // Refresh data
      onUpdate();
      
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast({
        title: t('errors.generic', "Ocorreu um erro"),
        description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      {isFavorite ? (
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      ) : (
        <StarOff className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
};
