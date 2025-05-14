
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Brain, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface SavedAnalysis {
  id: string;
  user_id: string;
  idea_id: string;
  idea_title: string;
  original_analysis_id: string;
  analysis_data: any;
  created_at: string;
  updated_at: string;
}

export function SavedAnalysesList() {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchSavedAnalyses();
    }
  }, [authState.isAuthenticated]);

  const fetchSavedAnalyses = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('saved_analyses')
        .select('*')
        .eq('user_id', authState.user?.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setAnalyses(data || []);
    } catch (error) {
      console.error("Error fetching saved analyses:", error);
      toast.error(t('errors.fetchError', "Erro ao buscar análises") + ". " + 
        t('errors.tryAgainLater', "Tente novamente mais tarde"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the UI after successful deletion
      setAnalyses(analyses.filter(analysis => analysis.id !== id));
      
      toast.success(t('common.deleted', "Excluído!") + ". " + 
        t('analysis.deleteSuccess', "Análise excluída com sucesso"));
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error(t('errors.deleteError', "Erro ao excluir análise") + ". " + 
        t('errors.tryAgainLater', "Tente novamente mais tarde"));
    }
  };

  // Function to get a preview of the analysis content
  const getAnalysisPreview = (analysisData: any) => {
    if (!analysisData) return "";
    
    // Try to extract a meaningful summary from the analysis data
    if (typeof analysisData === 'object') {
      // Get the executive summary if available
      if (analysisData.executiveSummary) {
        return analysisData.executiveSummary.substring(0, 120) + "...";
      }
      
      // Or try to get the first section/key with text content
      for (const key in analysisData) {
        if (typeof analysisData[key] === 'string' && analysisData[key].length > 10) {
          return analysisData[key].substring(0, 120) + "...";
        }
        
        if (typeof analysisData[key] === 'object' && analysisData[key]?.description) {
          return analysisData[key].description.substring(0, 120) + "...";
        }
      }
      
      // If we couldn't find a good preview, return a generic message
      return t('analysis.noPreview', "Clique para visualizar a análise completa");
    }
    
    return String(analysisData).substring(0, 120) + "...";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <Card key={i} className="border shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <EmptyState
        icon={<Brain className="h-10 w-10 text-muted-foreground" />}
        title={t('analysis.noSavedAnalyses', "Nenhuma análise salva")}
        description={t('analysis.saveAnalysisDescription', "Salve análises avançadas para consultá-las posteriormente")}
        action={
          <Button 
            variant="outline" 
            onClick={() => window.open('/dashboard/ideias', '_blank')}
          >
            {t('ideas.viewIdeas', "Ver minhas ideias")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {analyses.map(analysis => (
        <Card key={analysis.id} className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{analysis.idea_title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span>
                    {new Date(analysis.updated_at).toLocaleDateString()} 
                    {new Date(analysis.created_at).toDateString() !== new Date(analysis.updated_at).toDateString() && 
                      ` (${t('common.updated', "Atualizado")})`
                    }
                  </span>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDelete(analysis.id);
                }}
                title={t('common.delete', "Excluir")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {getAnalysisPreview(analysis.analysis_data)}
            </p>
          </CardContent>
          <CardFooter className="pt-0 pb-4 flex justify-between">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`/dashboard/ideias/${analysis.idea_id}`, '_blank')}
              className="text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              {t('ideas.viewIdea', "Ver ideia")}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-brand-purple hover:bg-brand-purple/90"
              onClick={() => window.open(`/dashboard/analises-avancadas/${analysis.id}`, '_blank')}
            >
              <Brain className="h-4 w-4 mr-1.5" />
              {t('analysis.viewAnalysis', "Ver análise")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
