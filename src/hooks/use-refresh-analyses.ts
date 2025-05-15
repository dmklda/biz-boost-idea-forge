
import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AnalysisUpdatedEvent extends CustomEvent {
  detail?: {
    ideaId?: string;
  };
}

/**
 * Custom hook to handle refreshing analyses data when re-analysis occurs
 * @param callback Function to execute when analysis data is updated
 * @param dependencies Array of dependencies for the callback
 */
export const useRefreshAnalyses = (callback: () => void, dependencies: any[] = []) => {
  const refreshCallback = useCallback(callback, dependencies);
  
  useEffect(() => {
    const handleAnalysisUpdate = (event: Event) => {
      console.log("Analysis update detected in useRefreshAnalyses");
      const customEvent = event as AnalysisUpdatedEvent;
      console.log("Updated idea ID:", customEvent.detail?.ideaId);
      refreshCallback();
    };
    
    window.addEventListener('analysis-updated', handleAnalysisUpdate);
    
    return () => {
      window.removeEventListener('analysis-updated', handleAnalysisUpdate);
    };
  }, [refreshCallback]);
};
