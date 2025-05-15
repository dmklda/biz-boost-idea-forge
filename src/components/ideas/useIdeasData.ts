
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TagType } from "./TagsFilter";
import { Idea } from "./IdeasGrid";

export const useIdeasData = (userId: string | undefined) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [favoriteIdeas, setFavoriteIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  
  const fetchIdeas = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch all ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          created_at,
          idea_analyses (score, status)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (ideasError) throw ideasError;
      
      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('idea_favorites')
        .select('idea_id')
        .eq('user_id', userId);
        
      if (favoritesError) throw favoritesError;
      
      // Fetch tags for each idea
      const { data: ideaTagsData, error: ideaTagsError } = await supabase
        .from('idea_tags')
        .select('idea_id, tag_id, tags (id, name, color)')
        .eq('user_id', userId);
        
      if (ideaTagsError) throw ideaTagsError;
      
      // Process the data
      const favoriteIdeaIds = new Set(favoritesData?.map((fav: any) => fav.idea_id) || []);
      
      // Create a map of idea_id to tags
      const ideaTagsMap: Record<string, string[]> = {};
      ideaTagsData?.forEach((ideaTag: any) => {
        if (!ideaTagsMap[ideaTag.idea_id]) {
          ideaTagsMap[ideaTag.idea_id] = [];
        }
        ideaTagsMap[ideaTag.idea_id].push(ideaTag.tags.name);
      });
      
      // Process ideas with their analysis data and favorite status
      const processedIdeas = ideasData?.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        created_at: idea.created_at,
        is_favorite: favoriteIdeaIds.has(idea.id),
        score: idea.idea_analyses?.[0]?.score || null,
        status: idea.idea_analyses?.[0]?.status || null,
        tags: ideaTagsMap[idea.id] || []
      }));
      
      setIdeas(processedIdeas || []);
      setFavoriteIdeas(processedIdeas?.filter(idea => idea.is_favorite) || []);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTags = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setAllTags(data.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })));
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchIdeas();
      fetchTags();
    }
  }, [userId]);
  
  const handleTagsChange = (tags: TagType[]) => {
    setSelectedTags(tags);
  };
  
  const filteredIdeas = selectedTags.length > 0
    ? ideas.filter(idea => 
        selectedTags.every(tag => 
          idea.tags?.includes(tag.name)
        )
      )
    : ideas;
    
  return {
    ideas,
    favoriteIdeas,
    filteredIdeas,
    loading,
    allTags,
    selectedTags,
    handleTagsChange,
    fetchIdeas
  };
};
