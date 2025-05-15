import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagBadge } from "./TagBadge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Tag, Plus, Star, PlusCircle, Tag as TagIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

export interface TagType {
  id: string;
  name: string;
  color: string;
}

interface TagsSelectorProps {
  ideaId: string;
  onTagsChange?: (tags: TagType[]) => void;
}

export const TagsSelector = ({ ideaId, onTagsChange }: TagsSelectorProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#94a3b8");
  const [isLoading, setIsLoading] = useState(false);

  // Predefined colors for tags
  const colorOptions = [
    "#94a3b8", // Gray
    "#f87171", // Red
    "#fb923c", // Orange
    "#facc15", // Yellow
    "#4ade80", // Green
    "#2dd4bf", // Teal
    "#60a5fa", // Blue
    "#a78bfa", // Purple
    "#f472b6"  // Pink
  ];

  // Fetch all user tags
  const fetchTags = async () => {
    try {
      setIsLoading(true);
      
      const { data: userTags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', authState.user?.id)
        .order('name');
        
      if (error) throw error;
      
      setTags(userTags as TagType[]);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tags associated with the current idea
  const fetchIdeaTags = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('idea_tags')
        .select('tag_id, tags(id, name, color)')
        .eq('idea_id', ideaId)
        .eq('user_id', authState.user?.id);
        
      if (error) throw error;
      
      const selectedTagsData = data
        .filter(item => item.tags)
        .map(item => item.tags as TagType);
        
      setSelectedTags(selectedTagsData);
      
      // Notify parent component if needed
      if (onTagsChange) {
        onTagsChange(selectedTagsData);
      }
    } catch (error) {
      console.error("Error fetching idea tags:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new tag
  const createTag = async () => {
    if (!newTagName.trim()) {
      toast.error(t('tags.errors.emptyName') || "Tag name cannot be empty");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: authState.user?.id,
          name: newTagName.trim(),
          color: newTagColor
        })
        .select()
        .single();
        
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error(t('tags.errors.duplicate') || "A tag with this name already exists");
        } else {
          toast.error(t('tags.errors.createFailed') || "Failed to create tag");
        }
        throw error;
      }
      
      setNewTagName("");
      setNewTagColor("#94a3b8");
      setIsCreateDialogOpen(false);
      toast.success(t('tags.success.created') || "Tag created successfully");
      
      // Refresh tags list
      fetchTags();
    } catch (error) {
      console.error("Error creating tag:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle a tag on an idea
  const toggleTag = async (tag: TagType) => {
    const isTagSelected = selectedTags.some(t => t.id === tag.id);
    
    try {
      if (isTagSelected) {
        // Remove tag from idea
        const { error } = await supabase
          .from('idea_tags')
          .delete()
          .eq('idea_id', ideaId)
          .eq('tag_id', tag.id)
          .eq('user_id', authState.user?.id);
          
        if (error) throw error;
        
        // Update local state
        setSelectedTags(prev => prev.filter(t => t.id !== tag.id));
      } else {
        // Add tag to idea
        const { error } = await supabase
          .from('idea_tags')
          .insert({
            idea_id: ideaId,
            tag_id: tag.id,
            user_id: authState.user?.id
          });
          
        if (error) throw error;
        
        // Update local state
        setSelectedTags(prev => [...prev, tag]);
      }
      
      // Notify parent component if needed
      if (onTagsChange) {
        const updatedTags = isTagSelected 
          ? selectedTags.filter(t => t.id !== tag.id)
          : [...selectedTags, tag];
        onTagsChange(updatedTags);
      }
    } catch (error) {
      console.error("Error toggling tag:", error);
      toast.error(t('tags.errors.updateFailed'));
    }
  };

  // Load tags when component mounts
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      fetchTags();
      fetchIdeaTags();
    }
  }, [authState.isAuthenticated, ideaId]);

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {selectedTags.map(tag => (
          <TagBadge 
            key={tag.id} 
            name={tag.name} 
            color={tag.color}
          />
        ))}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Plus className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('tags.add')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{t('tags.title')}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  {t('tags.create')}
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
              ) : tags.length > 0 ? (
                <div className="grid gap-1.5">
                  {tags.map(tag => {
                    const isSelected = selectedTags.some(t => t.id === tag.id);
                    return (
                      <Button
                        key={tag.id}
                        variant="ghost"
                        className={`justify-between h-8 px-2 ${
                          isSelected ? "bg-muted" : ""
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        {isSelected && <span className="opacity-50">✓</span>}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  {t('tags.empty')}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tags.create')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('tags.nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('tags.namePlaceholder')}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('tags.colorLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full transition-all ${
                      newTagColor === color ? "ring-2 ring-offset-2 ring-brand-purple" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={createTag} 
              disabled={!newTagName.trim() || isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
              ) : (
                <TagIcon className="h-4 w-4 mr-2" />
              )}
              {t('tags.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
