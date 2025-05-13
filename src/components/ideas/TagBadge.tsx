
import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagType {
  id: string;
  name: string;
  color: string;
}

interface TagBadgeProps {
  tag: TagType;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TagBadge({ tag, onRemove, className, size = "md" }: TagBadgeProps) {
  const [hovered, setHovered] = useState(false);
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs px-1.5 py-0.5";
      case "md":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-sm px-3 py-1";
      default:
        return "text-xs px-2 py-1";
    }
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        getSizeClasses(),
        onRemove ? "pr-1" : "",
        className
      )}
      style={{ 
        backgroundColor: `${tag.color}30`, // 30% opacity
        color: tag.color 
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "ml-1 rounded-full p-0.5",
            hovered ? "bg-red-500/20 text-red-500" : "bg-transparent text-current opacity-60 hover:opacity-100"
          )}
        >
          <X className={cn("h-3 w-3")} />
        </button>
      )}
    </span>
  );
}
