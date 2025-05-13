
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

export const TagBadge = ({ tag }: { tag: string }) => {
  return (
    <Badge variant="outline" className="text-xs font-normal">
      <Tag className="h-3 w-3 mr-1" />
      {tag}
    </Badge>
  );
};
