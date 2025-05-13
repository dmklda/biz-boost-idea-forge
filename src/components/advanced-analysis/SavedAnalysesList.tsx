
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ExternalLink, FileText, Search, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdvancedAnalysisContent } from "./AdvancedAnalysisContent";
import { Input } from "@/components/ui/input";

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
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      
      setAnalyses(data as SavedAnalysis[]);
    } catch (error) {
      console.error("Error fetching saved analyses:", error);
      toast.error(t('errors.fetchError', "Erro ao carregar análises"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);
        
      if (error) throw error;
      
      // Update local state
      setAnalyses(analyses.filter(analysis => analysis.id !== id));
      
      toast.success(t('common.deleted', "Excluído"));
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error(t('errors.deleteError', "Erro ao excluir análise"));
    }
  };

  const handleViewAnalysis = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsDialogOpen(true);
  };

  const filteredAnalyses = searchQuery.trim() === "" 
    ? analyses 
    : analyses.filter(analysis => 
        analysis.idea_title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {t('analysis.noSavedAnalyses', "Nenhuma análise salva")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('analysis.saveInstructions', "Salve análises avançadas para acessá-las rapidamente aqui")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search', "Buscar...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {t('common.noResults', "Nenhum resultado encontrado")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnalyses.map((analysis) => (
            <Card 
              key={analysis.id} 
              className={cn(
                "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                isDarkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800/50" : ""
              )}
              onClick={() => handleViewAnalysis(analysis)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{analysis.idea_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(analysis.updated_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {analysis.analysis_data.summary || t('analysis.viewDetails', "Clique para ver detalhes")}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/dashboard/ideias/${analysis.idea_id}`, '_blank');
                  }}
                  className={cn(
                    "text-muted-foreground",
                    isDarkMode ? "hover:bg-slate-800" : ""
                  )}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {t('ideas.viewIdea', "Ver ideia")}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleDeleteAnalysis(analysis.id, e)} 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "max-w-4xl h-[90vh] flex flex-col p-0 gap-0",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          <DialogHeader className={cn(
            "px-4 py-3 border-b sm:px-6 sm:py-4",
            isDarkMode ? "border-slate-800" : "border-slate-200"
          )}>
            <div className="flex items-center justify-between">
              <DialogTitle className={cn(
                "text-lg sm:text-xl",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                {selectedAnalysis?.idea_title || t('advancedAnalysis.title', "Análise Avançada")}
              </DialogTitle>
            </div>
          </DialogHeader>
          <ScrollArea className={cn(
            "flex-1 p-4 md:p-6 overflow-y-auto",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <div className={cn(
              "max-w-3xl mx-auto pb-20",
              isDarkMode ? "text-slate-200" : "text-slate-900"
            )}>
              {selectedAnalysis && (
                <AdvancedAnalysisContent analysis={selectedAnalysis.analysis_data} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
