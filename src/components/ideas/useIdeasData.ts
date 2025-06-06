
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite: boolean;
  score?: number | null;
  status?: string | null;
  tags?: string[];
}

export const useIdeasData = () => {
  const { authState } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("useIdeasData: Hook initialized");

  const fetchIdeas = useCallback(async () => {
    if (!authState.user?.id) {
      console.log("useIdeasData: No user ID available, skipping fetch");
      return;
    }

    try {
      console.log("useIdeasData: Starting fetch for user", authState.user.id);
      setLoading(true);

      // Fetch ideas with analysis scores
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          created_at,
          idea_analyses!inner (
            score,
            status
          )
        `)
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (ideasError) {
        console.error("useIdeasData: Error fetching ideas:", ideasError);
        throw ideasError;
      }

      console.log("useIdeasData: Ideas fetched successfully, count:", ideasData?.length || 0);

      // Fetch favorites for all ideas
      const ideaIds = ideasData?.map(idea => idea.id) || [];
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('idea_favorites')
        .select('idea_id')
        .eq('user_id', authState.user.id)
        .in('idea_id', ideaIds);

      if (favoritesError) {
        console.error("useIdeasData: Error fetching favorites:", favoritesError);
      }

      const favoriteIds = new Set(favoritesData?.map(fav => fav.idea_id) || []);
      console.log("useIdeasData: Favorites loaded for", favoriteIds.size, "ideas");

      // Fetch tags for all ideas
      const { data: tagsData, error: tagsError } = await supabase
        .from('idea_tags')
        .select(`
          idea_id,
          tags (name)
        `)
        .eq('user_id', authState.user.id)
        .in('idea_id', ideaIds);

      if (tagsError) {
        console.error("useIdeasData: Error fetching tags:", tagsError);
      }

      // Group tags by idea_id
      const tagsByIdea = tagsData?.reduce((acc, item) => {
        if (!acc[item.idea_id]) {
          acc[item.idea_id] = [];
        }
        acc[item.idea_id].push(item.tags.name);
        return acc;
      }, {} as Record<string, string[]>) || {};

      console.log("useIdeasData: Tags loaded for", Object.keys(tagsByIdea).length, "ideas");

      // Combine all data
      const formattedIdeas: Idea[] = ideasData?.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        created_at: idea.created_at,
        is_favorite: favoriteIds.has(idea.id),
        score: idea.idea_analyses?.[0]?.score || null,
        status: idea.idea_analyses?.[0]?.status || null,
        tags: tagsByIdea[idea.id] || []
      })) || [];

      console.log("useIdeasData: Final formatted ideas:", formattedIdeas.length);
      setIdeas(formattedIdeas);

    } catch (error) {
      console.error("useIdeasData: Error in fetchIdeas:", error);
      toast.error("Erro ao carregar ideias");
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    console.log("useIdeasData: useEffect triggered, fetching ideas");
    fetchIdeas();
  }, [fetchIdeas]);

  // Listen for real-time updates
  useEffect(() => {
    if (!authState.user?.id) return;

    console.log("useIdeasData: Setting up real-time listeners");

    const handleAnalysisUpdate = () => {
      console.log("useIdeasData: Analysis update event received, refetching data");
      fetchIdeas();
    };

    const handleFavoriteUpdate = (event: CustomEvent) => {
      console.log("useIdeasData: Favorite update event received", event.detail);
      const { ideaId, isFavorite } = event.detail;
      
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, is_favorite: isFavorite }
            : idea
        )
      );
    };

    const handleTagsUpdate = (event: CustomEvent) => {
      console.log("useIdeasData: Tags update event received", event.detail);
      const { ideaId, tags } = event.detail;
      
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, tags }
            : idea
        )
      );
    };

    // Add event listeners
    window.addEventListener('analysis-updated', handleAnalysisUpdate);
    window.addEventListener('favorite-updated', handleFavoriteUpdate as EventListener);
    window.addEventListener('tags-updated', handleTagsUpdate as EventListener);

    return () => {
      console.log("useIdeasData: Cleaning up event listeners");
      window.removeEventListener('analysis-updated', handleAnalysisUpdate);
      window.removeEventListener('favorite-updated', handleFavoriteUpdate as EventListener);
      window.removeEventListener('tags-updated', handleTagsUpdate as EventListener);
    };
  }, [authState.user?.id, fetchIdeas]);

  return {
    ideas,
    loading,
    refetch: fetchIdeas
  };
};
