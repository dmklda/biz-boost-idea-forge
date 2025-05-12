
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: () => void;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export const TagBadge = ({ 
  name, 
  color = "#94a3b8", 
  onRemove, 
  className,
  clickable = false,
  onClick
}: TagBadgeProps) => {
  // Convert hex color to rgba with transparency for the background
  const getBgColorWithOpacity = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return rgba with opacity
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "group py-1 px-2 border-2 flex items-center gap-1 transition-colors",
        clickable && "cursor-pointer hover:opacity-90",
        className
      )}
      style={{ 
        backgroundColor: getBgColorWithOpacity(color),
        borderColor: color,
        color: color
      }}
      onClick={handleClick}
    >
      <span>{name}</span>
      {onRemove && (
        <X 
          className="h-3 w-3 cursor-pointer hover:opacity-75" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </Badge>
  );
};
