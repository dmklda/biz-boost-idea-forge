
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag?: string;
  name?: string;
  color?: string;
  className?: string;
}

export const TagBadge = ({ tag, name, color, className }: TagBadgeProps) => {
  // Use either tag or name (prefer tag if both are provided)
  const displayText = tag || name || "";
  
  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs font-normal", className)}
      style={color ? { borderColor: color, backgroundColor: `${color}20` } : undefined}
    >
      <Tag className="h-3 w-3 mr-1" />
      {displayText}
    </Badge>
  );
};
