import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SuccessCase {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo_url: string;
  founder_name: string;
  founder_photo_url: string;
  industry: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  status: string;
  featured: boolean;
  metrics: any;
  created_at: string;
  updated_at: string;
}

export const useSuccessCases = () => {
  const [successCases, setSuccessCases] = useState<SuccessCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuccessCases();
  }, []);

  const fetchSuccessCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('success_cases')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuccessCases(data || []);
    } catch (err) {
      console.error('Error fetching success cases:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSuccessCaseBySlug = async (slug: string): Promise<SuccessCase | null> => {
    try {
      const { data, error } = await supabase
        .from('success_cases')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching success case:', err);
      return null;
    }
  };

  return {
    successCases,
    loading,
    error,
    getSuccessCaseBySlug,
    refetch: fetchSuccessCases
  };
};