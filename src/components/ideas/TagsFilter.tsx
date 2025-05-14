
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Tag, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface TagType {
  id: string;
  name: string;
  color: string;
}

export const TagsFilter = ({
  allTags,
  selectedTags,
  onTagsChange
}: {
  allTags: TagType[];
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
}) => {
  const { t } = useTranslation();
  
  const toggleTag = (tag: TagType) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      // Add tag
      onTagsChange([...selectedTags, tag]);
    }
  };
  
  const clearAllTags = () => {
    onTagsChange([]);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          <Tag className="h-4 w-4 inline mr-1" />
          {t('ideas.filterByTags', "Filtrar por tags")}
        </h3>
        {selectedTags.length > 0 && (
          <button 
            onClick={clearAllTags}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            {t('common.clearAll', "Limpar tudo")}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {allTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('ideas.noTagsAvailable', "Nenhuma tag disponível")}
          </p>
        ) : (
          allTags.map(tag => {
            const isSelected = selectedTags.some(t => t.id === tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
                style={{
                  backgroundColor: isSelected ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: isSelected ? 'white' : 'inherit'
                }}
              >
                {isSelected && <Check className="h-3 w-3 mr-1" />}
                {tag.name}
              </Badge>
            );
          })
        )}
      </div>
    </div>
  );
};
