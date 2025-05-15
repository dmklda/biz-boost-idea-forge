
import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook to handle refreshing analyses data when re-analysis occurs
 * @param callback Function to execute when analysis data is updated
 * @param dependencies Array of dependencies for the callback
 */
export const useRefreshAnalyses = (callback: () => void, dependencies: any[] = []) => {
  const refreshCallback = useCallback(callback, dependencies);
  
  useEffect(() => {
    const handleAnalysisUpdate = () => {
      console.log("Analysis update detected in useRefreshAnalyses");
      refreshCallback();
    };
    
    window.addEventListener('analysis-updated', handleAnalysisUpdate);
    
    return () => {
      window.removeEventListener('analysis-updated', handleAnalysisUpdate);
    };
  }, [refreshCallback]);
};
