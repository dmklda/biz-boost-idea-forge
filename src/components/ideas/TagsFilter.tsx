
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TagType, TagBadge } from "@/components/ideas";

interface TagsFilterProps {
  allTags: TagType[];
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  maxTagsShown?: number;
}

export function TagsFilter({ 
  allTags, 
  selectedTags, 
  onTagsChange, 
  maxTagsShown = 20 
}: TagsFilterProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [filteredTags, setFilteredTags] = useState<TagType[]>(allTags);
  
  useEffect(() => {
    // Always ensure the filtered tags include the selected ones
    const uniqueTags = new Set([...selectedTags.map(tag => tag.id)]);
    const availableTags = allTags.filter(tag => !uniqueTags.has(tag.id));
    
    setFilteredTags(availableTags);
  }, [allTags, selectedTags]);
  
  const handleSelectTag = (tag: TagType) => {
    onTagsChange([...selectedTags, tag]);
  };
  
  const handleRemoveTag = (tagIdToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagIdToRemove));
  };
  
  const handleClearAll = () => {
    onTagsChange([]);
  };
  
  const visibleTags = showMore ? filteredTags : filteredTags.slice(0, maxTagsShown);
  
  if (allTags.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">{t('tags.noTags', "Nenhuma tag encontrada")}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{t('tags.selectedTags', "Tags selecionadas")}:</span>
        
        {selectedTags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  size="md"
                  onRemove={() => handleRemoveTag(tag.id)}
                />
              ))}
            </div>
            
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
              {t('tags.clearAll', "Limpar todos")}
            </button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">{t('tags.noneSelected', "Nenhuma selecionada")}</span>
        )}
      </div>
      
      <div className="border-t pt-4">
        <div className="text-sm font-medium mb-3">
          {t('tags.availableTags', "Tags disponíveis")}:
        </div>
        
        <div className="flex flex-wrap gap-2">
          {visibleTags.length > 0 ? (
            <>
              {visibleTags.map(tag => (
                <Badge
                  key={tag.id}
                  className="cursor-pointer hover:bg-opacity-80 transition-all"
                  style={{ 
                    backgroundColor: `${tag.color}30`, 
                    color: tag.color
                  }}
                  onClick={() => handleSelectTag(tag)}
                >
                  {tag.name}
                </Badge>
              ))}
              
              {filteredTags.length > maxTagsShown && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {showMore 
                    ? t('tags.showLess', "Mostrar menos") 
                    : t('tags.showMore', `Mostrar mais (${filteredTags.length - maxTagsShown})`)}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('tags.allSelected', "Todas as tags já foram selecionadas")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
