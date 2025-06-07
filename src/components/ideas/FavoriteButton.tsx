
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  ideaId: string;
  isFavorite: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton = ({ 
  ideaId, 
  isFavorite, 
  size = "sm", 
  className,
  onToggle 
}: FavoriteButtonProps) => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleToggleFavorite = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevenir duplo clique no mobile
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 300) {
      return;
    }
    setLastClickTime(currentTime);

    if (!authState.user?.id || isLoading) return;

    try {
      setIsLoading(true);
      const newFavoriteStatus = !localIsFavorite;
      
      // Update otimista
      setLocalIsFavorite(newFavoriteStatus);
      onToggle?.(newFavoriteStatus);

      // Emitir evento global para updates em tempo real
      window.dispatchEvent(new CustomEvent('favorite-updated', {
        detail: { ideaId, isFavorite: newFavoriteStatus }
      }));

      if (newFavoriteStatus) {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('idea_favorites')
          .insert({
            user_id: authState.user.id,
            idea_id: ideaId
          });

        if (error) {
          console.error("Error adding to favorites:", error);
          // Reverter update otimista
          setLocalIsFavorite(!newFavoriteStatus);
          onToggle?.(!newFavoriteStatus);
          window.dispatchEvent(new CustomEvent('favorite-updated', {
            detail: { ideaId, isFavorite: !newFavoriteStatus }
          }));
          toast.error("Erro ao adicionar aos favoritos");
          return;
        }

        toast.success("Adicionado aos favoritos");
      } else {
        // Remover dos favoritos
        const { error } = await supabase
          .from('idea_favorites')
          .delete()
          .eq('user_id', authState.user.id)
          .eq('idea_id', ideaId);

        if (error) {
          console.error("Error removing from favorites:", error);
          // Reverter update otimista
          setLocalIsFavorite(!newFavoriteStatus);
          onToggle?.(!newFavoriteStatus);
          window.dispatchEvent(new CustomEvent('favorite-updated', {
            detail: { ideaId, isFavorite: !newFavoriteStatus }
          }));
          toast.error("Erro ao remover dos favoritos");
          return;
        }

        toast.success("Removido dos favoritos");
      }

      console.log(`Favorite status updated for idea ${ideaId}: ${newFavoriteStatus}`);

    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Reverter update otimista
      setLocalIsFavorite(!localIsFavorite);
      onToggle?.(!localIsFavorite);
      window.dispatchEvent(new CustomEvent('favorite-updated', {
        detail: { ideaId, isFavorite: !localIsFavorite }
      }));
      toast.error("Erro ao atualizar favoritos");
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar com mudanças externas do prop
  useEffect(() => {
    if (isFavorite !== localIsFavorite && !isLoading) {
      setLocalIsFavorite(isFavorite);
    }
  }, [isFavorite, localIsFavorite, isLoading]);

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "p-1 h-auto transition-all duration-200 min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto",
        localIsFavorite 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-400 hover:text-red-500",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleToggleFavorite}
      onTouchStart={handleToggleFavorite}
      disabled={isLoading}
      aria-label={localIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart 
        className={cn(
          "transition-all duration-200",
          size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5",
          localIsFavorite ? "fill-current scale-110" : "scale-100"
        )} 
      />
    </Button>
  );
};
