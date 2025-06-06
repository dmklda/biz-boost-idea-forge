
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TagType } from "./TagsFilter";
import { Idea } from "./IdeasGrid";

export const useIdeasData = (userId: string | undefined) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [favoriteIdeas, setFavoriteIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const fetchIdeas = useCallback(async (forceRefresh = false) => {
    if (!userId) return;
    
    try {
      if (forceRefresh) {
        console.log("useIdeasData: Force refreshing ideas data");
      }
      setLoading(true);
      
      // Fetch all ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          created_at,
          idea_analyses (score, status, created_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (ideasError) {
        console.error("useIdeasData: Error fetching ideas:", ideasError);
        throw ideasError;
      }
      
      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('idea_favorites')
        .select('idea_id')
        .eq('user_id', userId);
        
      if (favoritesError) {
        console.error("useIdeasData: Error fetching favorites:", favoritesError);
        throw favoritesError;
      }
      
      // Fetch tags for each idea
      const { data: ideaTagsData, error: ideaTagsError } = await supabase
        .from('idea_tags')
        .select('idea_id, tag_id, tags (id, name, color)')
        .eq('user_id', userId);
        
      if (ideaTagsError) {
        console.error("useIdeasData: Error fetching idea tags:", ideaTagsError);
        throw ideaTagsError;
      }
      
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
      const processedIdeas = ideasData?.map((idea: any) => {
        // Sort analyses to ensure the latest is first
        const sortedAnalyses = idea.idea_analyses?.length > 0 
          ? [...idea.idea_analyses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          : [];
        
        return {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          created_at: idea.created_at,
          is_favorite: favoriteIdeaIds.has(idea.id),
          score: sortedAnalyses?.[0]?.score || null,
          status: sortedAnalyses?.[0]?.status || null,
          tags: ideaTagsMap[idea.id] || []
        };
      });
      
      console.log(`useIdeasData: Successfully loaded ${processedIdeas?.length || 0} ideas`);
      setIdeas(processedIdeas || []);
      setFavoriteIdeas(processedIdeas?.filter(idea => idea.is_favorite) || []);
    } catch (error) {
      console.error("useIdeasData: Error in fetchIdeas:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  const fetchTags = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error("useIdeasData: Error fetching tags:", error);
        throw error;
      }
      
      const processedTags = data?.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })) || [];
      
      console.log(`useIdeasData: Successfully loaded ${processedTags.length} tags`);
      setAllTags(processedTags);
    } catch (error) {
      console.error("useIdeasData: Error in fetchTags:", error);
    }
  }, [userId]);

  // Force refresh function that can be called externally
  const forceRefresh = useCallback(() => {
    console.log("useIdeasData: Force refresh triggered");
    setRefreshKey(prev => prev + 1);
    fetchIdeas(true);
    fetchTags();
  }, [fetchIdeas, fetchTags]);

  // Optimistic update for favorites
  const updateFavoriteStatus = useCallback((ideaId: string, isFavorite: boolean) => {
    console.log(`useIdeasData: Optimistically updating favorite status for idea ${ideaId} to ${isFavorite}`);
    
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === ideaId 
          ? { ...idea, is_favorite: isFavorite }
          : idea
      )
    );
    
    setFavoriteIdeas(prevFavorites => {
      if (isFavorite) {
        const ideaToAdd = ideas.find(idea => idea.id === ideaId);
        if (ideaToAdd && !prevFavorites.find(fav => fav.id === ideaId)) {
          return [...prevFavorites, { ...ideaToAdd, is_favorite: true }];
        }
      } else {
        return prevFavorites.filter(fav => fav.id !== ideaId);
      }
      return prevFavorites;
    });
  }, [ideas]);

  // Optimistic update for tags
  const updateIdeaTags = useCallback((ideaId: string, newTags: string[]) => {
    console.log(`useIdeasData: Optimistically updating tags for idea ${ideaId}:`, newTags);
    
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === ideaId 
          ? { ...idea, tags: newTags }
          : idea
      )
    );
    
    setFavoriteIdeas(prevFavorites => 
      prevFavorites.map(idea => 
        idea.id === ideaId 
          ? { ...idea, tags: newTags }
          : idea
      )
    );
  }, []);
  
  useEffect(() => {
    if (userId) {
      console.log("useIdeasData: Initial data fetch for user:", userId);
      fetchIdeas();
      fetchTags();
    }
  }, [userId, refreshKey, fetchIdeas, fetchTags]);

  // Listen for global events to trigger refresh
  useEffect(() => {
    const handleRefresh = () => {
      console.log("useIdeasData: Global refresh event received");
      forceRefresh();
    };

    const handleAnalysisUpdate = () => {
      console.log("useIdeasData: Analysis update event received");
      forceRefresh();
    };

    const handleFavoriteUpdate = (event: CustomEvent) => {
      console.log("useIdeasData: Favorite update event received:", event.detail);
      if (event.detail?.ideaId && event.detail?.isFavorite !== undefined) {
        updateFavoriteStatus(event.detail.ideaId, event.detail.isFavorite);
      }
    };

    const handleTagUpdate = (event: CustomEvent) => {
      console.log("useIdeasData: Tag update event received:", event.detail);
      if (event.detail?.ideaId && event.detail?.tags) {
        updateIdeaTags(event.detail.ideaId, event.detail.tags);
      }
      // Also refresh tags list
      fetchTags();
    };
    
    window.addEventListener('ideas-refresh', handleRefresh);
    window.addEventListener('analysis-updated', handleAnalysisUpdate);
    window.addEventListener('favorite-updated', handleFavoriteUpdate as EventListener);
    window.addEventListener('tags-updated', handleTagUpdate as EventListener);
    
    return () => {
      window.removeEventListener('ideas-refresh', handleRefresh);
      window.removeEventListener('analysis-updated', handleAnalysisUpdate);
      window.removeEventListener('favorite-updated', handleFavoriteUpdate as EventListener);
      window.removeEventListener('tags-updated', handleTagUpdate as EventListener);
    };
  }, [forceRefresh, updateFavoriteStatus, updateIdeaTags, fetchTags]);
  
  const handleTagsChange = useCallback((tags: TagType[]) => {
    setSelectedTags(tags);
  }, []);
  
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
    fetchIdeas: forceRefresh,
    updateFavoriteStatus,
    updateIdeaTags
  };
};
