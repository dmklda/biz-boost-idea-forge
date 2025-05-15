
import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AnalysisUpdatedEventDetail {
  ideaId?: string;
}

/**
 * Custom hook to handle refreshing analyses data when re-analysis occurs
 * @param callback Function to execute when analysis data is updated
 * @param dependencies Array of dependencies for the callback
 */
export const useRefreshAnalyses = (callback: () => void, dependencies: any[] = []) => {
  const refreshCallback = useCallback(callback, dependencies);
  
  useEffect(() => {
    const handleAnalysisUpdate = (event: CustomEvent<AnalysisUpdatedEventDetail>) => {
      console.log("Analysis update detected in useRefreshAnalyses", event.detail);
      
      // Remove any existing advanced analysis for this idea
      if (event.detail?.ideaId) {
        const deleteOldAnalysis = async () => {
          console.log("Removing old advanced analysis for idea:", event.detail?.ideaId);
          const { error } = await supabase
            .from("advanced_analyses")
            .delete()
            .eq("idea_id", event.detail?.ideaId);
          
          if (error) {
            console.error("Error removing old advanced analysis:", error);
          } else {
            console.log("Old advanced analysis removed successfully");
          }
        };
        
        deleteOldAnalysis();
      }
      
      refreshCallback();
    };
    
    // Cast the event to CustomEvent
    window.addEventListener('analysis-updated', handleAnalysisUpdate as EventListener);
    
    return () => {
      window.removeEventListener('analysis-updated', handleAnalysisUpdate as EventListener);
    };
  }, [refreshCallback]);
};
