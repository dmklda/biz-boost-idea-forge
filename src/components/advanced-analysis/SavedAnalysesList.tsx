
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Brain, Trash2, Sparkles, BarChart3, Lightbulb, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AdvancedAnalysisModal } from "./AdvancedAnalysisModal";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";

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
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (analysisId: string) => {
    setDeletingAnalysisId(analysisId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingAnalysisId) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .delete()
        .eq('id', deletingAnalysisId);
        
      if (error) throw error;
      
      // Update the UI after successful deletion
      setAnalyses(analyses.filter(analysis => analysis.id !== deletingAnalysisId));
      
      toast.success(t('common.deleted', "Excluído!") + ". " + 
        t('analysis.deleteSuccess', "Análise excluída com sucesso"));
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error(t('errors.deleteError', "Erro ao excluir análise") + ". " + 
        t('errors.tryAgainLater', "Tente novamente mais tarde"));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingAnalysisId(null);
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

  // Get analysis score from data
  const getAnalysisScore = (analysisData: any) => {
    if (!analysisData) return null;
    
    if (typeof analysisData === 'object') {
      // Try to find score in various possible locations
      if (analysisData.score) return analysisData.score;
      if (analysisData.summary?.score) return analysisData.summary.score;
      if (analysisData.viability_score) return analysisData.viability_score;
      if (analysisData.analysis?.score) return analysisData.analysis.score;
    }
    
    return null;
  };

  // Get status color based on score
  const getStatusColor = (score: number) => {
    if (score >= 70) return "from-green-500 to-emerald-500";
    if (score >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getStatusText = (score: number) => {
    if (score >= 70) return t('ideas.status.viable', 'Viável');
    if (score >= 40) return t('ideas.status.moderate', 'Moderado');
    return t('ideas.status.unviable', 'Inviável');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-rose-600/5 pointer-events-none" />
            <CardHeader className="relative pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="relative pb-4 flex-grow">
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
            <CardFooter className="relative pt-0 pb-6 flex justify-between mt-auto">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <>
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-rose-600/5 pointer-events-none" />
          <CardContent className="relative p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
              {t('analysis.noSavedAnalyses', "Nenhuma análise salva")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {t('analysis.saveAnalysisDescription', "Salve análises avançadas para consultá-las posteriormente")}
            </p>
            <Button 
              onClick={() => navigate('/dashboard/ideias')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {t('ideas.viewIdeas', "Ver minhas ideias")}
            </Button>
          </CardContent>
        </Card>
        
        {/* Modal para visualizar análise salva */}
        {selectedAnalysis && (
          <AdvancedAnalysisModal
            ideaId={selectedAnalysis.idea_id}
            open={showAnalysisModal}
            onOpenChange={setShowAnalysisModal}
            savedAnalysisData={selectedAnalysis.analysis_data}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map(analysis => {
          const score = getAnalysisScore(analysis.analysis_data);
          const isUpdated = new Date(analysis.created_at).toDateString() !== new Date(analysis.updated_at).toDateString();
          
          return (
            <Card key={analysis.id} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-rose-600/5 group-hover:opacity-100 opacity-0 transition-opacity duration-300 pointer-events-none" />
              
              <CardHeader className="relative pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {analysis.idea_title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(analysis.updated_at).toLocaleDateString()}
                        </span>
                        {isUpdated && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('common.updated', "Atualizado")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(analysis.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="relative pb-4 flex-grow">
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {getAnalysisPreview(analysis.analysis_data)}
                </p>
                
                {/* Score Badge */}
                {score !== null && (
                  <div className="mb-4">
                    <Badge 
                      className={cn(
                        "text-xs font-semibold px-3 py-1 bg-gradient-to-r shadow-lg",
                        getStatusColor(score)
                      )}
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {getStatusText(score)} ({score})
                    </Badge>
                  </div>
                )}
                
                {/* Analysis Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    <span>{t('analysis.advanced', 'Análise Avançada')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{t('analysis.detailed', 'Detalhada')}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="relative pt-0 pb-6 flex flex-row flex-wrap items-center justify-center gap-2 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/ideias/${analysis.idea_id}`);
                  }}
                >
                  <FileText className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="hidden md:inline text-sm font-medium">{t('ideas.viewIdea', "Ver ideia")}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnalysis(analysis);
                    setShowAnalysisModal(true);
                  }}
                >
                  <Brain className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="hidden md:inline text-sm font-medium">{t('advancedAnalysis.viewAnalysis1', "Analise Avançada")}</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Modal para visualizar análise salva */}
      {selectedAnalysis && (
        <AdvancedAnalysisModal
          ideaId={selectedAnalysis.idea_id}
          open={showAnalysisModal}
          onOpenChange={setShowAnalysisModal}
          savedAnalysisData={selectedAnalysis.analysis_data}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t('analysis.deleteTitle', 'Excluir Análise')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('analysis.deleteConfirm', 'Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-slate-200 dark:border-slate-700">
              {t('common.cancel', 'Cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {deleting ? t('common.deleting', 'Excluindo...') : t('common.confirm', 'Confirmar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
