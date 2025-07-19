
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface TagBadgeProps {
  tag?: string;
  name?: string;
  color?: string;
  className?: string;
  ideaId?: string;
  onRemove?: () => void;
}

export const TagBadge = ({ tag, name, color, className, ideaId, onRemove }: TagBadgeProps) => {
  // Use either tag or name (prefer tag if both are provided)
  const displayText = tag || name || "";
  
  const handleRemoveTag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!ideaId || !displayText) return;
    
    try {
      // Remove tag from idea_tags table
      const { error } = await supabase
        .from('idea_tags')
        .delete()
        .eq('idea_id', ideaId)
        .eq('tag_id', (
          await supabase
            .from('tags')
            .select('id')
            .eq('name', displayText)
            .single()
        ).data?.id);

      if (error) throw error;
      
      toast.success('Tag removida com sucesso');
      onRemove?.();
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Erro ao remover tag');
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs font-normal group relative", ideaId && "cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20", className)}
      style={color ? { borderColor: color, backgroundColor: `${color}20` } : undefined}
    >
      <Tag className="h-3 w-3 mr-1" />
      {displayText}
      {ideaId && (
        <X 
          className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
          onClick={handleRemoveTag}
        />
      )}
    </Badge>
  );
};
