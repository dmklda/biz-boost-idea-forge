import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Guide {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  level: string;
  status: string;
  reading_time: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getGuideBySlug = async (slug: string): Promise<Guide | null> => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching guide:', err);
      return null;
    }
  };

  return {
    guides,
    loading,
    error,
    getGuideBySlug,
    refetch: fetchGuides
  };
};