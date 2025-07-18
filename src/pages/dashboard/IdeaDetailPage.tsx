import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Edit, Trash2, Star, Calendar, Target, DollarSign, MapPin, Users, TrendingUp, Sparkles, Zap, Lightbulb, Shield, AlertTriangle } from "lucide-react";
import ProgressRing from "@/components/ui/progress-ring";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/sonner";
import { FavoriteButton, TagsSelector } from "@/components/ideas";
import { AdvancedAnalysisModal } from "@/components/advanced-analysis";
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

const IdeaDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const fetchIdeaDetails = async () => {
      if (!authState.isAuthenticated || !id) {
        navigate("/dashboard");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch idea details
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', id)
          .eq('user_id', authState.user?.id)
          .single();
          
        if (ideaError) {
          console.error("Error fetching idea:", ideaError);
          if (ideaError.code === 'PGRST116') {
            toast.error("Ideia não encontrada");
          } else {
            toast.error("Erro ao buscar detalhes da ideia");
          }
          navigate("/dashboard");
          return;
        }
        
        // Fetch analysis details
        const { data: analysisData, error: analysisError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('idea_id', id)
          .eq('user_id', authState.user?.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (analysisError) {
          console.error("Error fetching analysis:", analysisError);
        }

        setIdea(ideaData);
        if (analysisData && analysisData.length > 0) {
          setAnalysis(analysisData[0]);
        }

      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Erro inesperado");
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdeaDetails();
  }, [id, authState.isAuthenticated, authState.user?.id, navigate]);
  
  // Safe data parsing functions
  const safeParseJSON = (data: any, fallback: any = {}) => {
    if (typeof data === 'object' && data !== null) {
      return data;
    }
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const safeGetArray = (obj: any, key: string, fallback: any[] = []) => {
    const value = obj?.[key];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  };
  
  const handleEdit = () => {
    navigate(`/dashboard/ideias/${id}/edit`);
  };
  
  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);

      if (error) throw error;

      toast.success(t('ideas.deleted', 'Ideia excluída com sucesso'));
      navigate("/dashboard/ideias");
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error(t('ideas.deleteError', 'Erro ao excluir ideia'));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAnalyze = () => {
    if (analysis) {
      navigate(`/dashboard/resultados/${id}?id=${id}`);
    } else {
      navigate(`/dashboard/ideias/${id}/analyze`);
    }
  };
  
  const handleTagsUpdate = (newTags: string[]) => {
    // Emit event to update tags
    window.dispatchEvent(new CustomEvent('tags-updated', {
      detail: { ideaId: id, tags: newTags }
    }));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Erro ao carregar ideia
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "A ideia solicitada não foi encontrada."}
            </p>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe parsing of analysis data
  const swotAnalysis = safeParseJSON(analysis?.swot_analysis, {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });

  const marketAnalysis = safeParseJSON(analysis?.market_analysis, {
    market_size: "",
    target_audience: "",
    growth_potential: "",
    barriers_to_entry: []
  });

  const competitorAnalysis = safeParseJSON(analysis?.competitor_analysis, {
    key_competitors: [],
    competitive_advantage: "",
    market_gaps: []
  });

  const financialAnalysis = safeParseJSON(analysis?.financial_analysis, {
    revenue_potential: "",
    initial_investment: "",
    break_even_estimate: "",
    funding_suggestions: []
  });

  const recommendations = safeParseJSON(analysis?.recommendations, {
    action_items: [],
    next_steps: [],
    potential_challenges: [],
    suggested_resources: []
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-16 md:pb-8">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 p-4 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/dashboard/ideias")}
            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Voltar</span>
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Main Idea Card */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none" />
          <CardHeader className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">
                  {analysis ? "Analisada" : "Pendente"}
                </Badge>
              </div>
              <h2
                className="text-xl md:text-3xl font-bold truncate break-words max-h-16 md:max-h-24 overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
                title={idea.title}
              >
                {idea.title}
              </h2>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              <FavoriteButton
                ideaId={idea.id}
                isFavorite={idea.is_favorite}
                size="default"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {analysis ? "Ver Análise" : "Analisar"}
                </span>
              </Button>
              {analysis && (
                <Button
                  onClick={() => setShowAdvancedAnalysis(true)}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Análise Avançada</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Excluir</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-6">
            <p className="text-slate-600 dark:text-slate-300 mb-6 break-words leading-relaxed text-lg">
              {idea.description}
            </p>
            
            {/* Tags Section */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Tags:
              </h4>
              <TagsSelector
                ideaId={idea.id}
                onTagsChange={(tags) => handleTagsUpdate(tags.map(t => t.name))}
              />
            </div>
              
            {/* Idea Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {idea.audience && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Público-alvo</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{idea.audience}</p>
                  </div>
                </div>
              )}
                
              {idea.budget && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Orçamento</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">R$ {idea.budget}</p>
                  </div>
                </div>
              )}
                
              {idea.location && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Localização</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{idea.location}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          
        {/* Analysis Tabs */}
        {analysis && (
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none" />
            <Tabs defaultValue="summary" className="w-full relative">
              <div className="p-6 pb-0">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6 overflow-x-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <TabsTrigger value="summary" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-300">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Resumo
                  </TabsTrigger>
                  <TabsTrigger value="swot" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-300">
                    <Shield className="h-4 w-4 mr-2" />
                    SWOT
                  </TabsTrigger>
                  <TabsTrigger value="market" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-300">
                    <Target className="h-4 w-4 mr-2" />
                    Mercado
                  </TabsTrigger>
                  <TabsTrigger value="competitors" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-300">
                    <Users className="h-4 w-4 mr-2" />
                    Concorrentes
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-300">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financeiro
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-300">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Recomendações
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="summary" className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300">Pontuação Geral</h4>
                    <div className="flex items-center mb-4">
                      <div className="mr-6">
                        <ProgressRing 
                          progress={analysis.score} 
                          size={80}
                          strokeWidth={6}
                          gradient="blue"
                          animated={true}
                          showValue={true}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{analysis.status}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Status da análise</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300">Principais Pontos Fortes</h4>
                    <ul className="space-y-2">
                      {safeGetArray(swotAnalysis, 'strengths').slice(0, 3).map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span className="break-words">{strength}</span>
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum ponto forte identificado</li>
                      )}
                    </ul>
                  </div>
                </div>
              </TabsContent>
        
              <TabsContent value="swot" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Forças
                    </h4>
                    <ul className="space-y-2">
                      {safeGetArray(swotAnalysis, 'strengths').map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum item identificado</li>
                      )}
                    </ul>
                  </div>
                    
                  <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Fraquezas
                    </h4>
                    <ul className="space-y-2">
                      {safeGetArray(swotAnalysis, 'weaknesses').map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'weaknesses').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum item identificado</li>
                      )}
                    </ul>
                  </div>
                    
                  <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Oportunidades
                    </h4>
                    <ul className="space-y-2">
                      {safeGetArray(swotAnalysis, 'opportunities').map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'opportunities').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum item identificado</li>
                      )}
                    </ul>
                  </div>
                    
                  <div className="p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Ameaças
                    </h4>
                    <ul className="space-y-2">
                      {safeGetArray(swotAnalysis, 'threats').map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'threats').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhuma ameaça identificada</li>
                      )}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="market" className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Tamanho do Mercado</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {marketAnalysis.market_size || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Perfil do Público-Alvo</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {marketAnalysis.target_audience || "Não especificado"}
                      </p>
                    </div>
                  </div>
                    
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Potencial de Crescimento</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {marketAnalysis.growth_potential || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Barreiras de Entrada</h4>
                      <ul className="space-y-2">
                        {safeGetArray(marketAnalysis, 'barriers_to_entry').map((item: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                        {safeGetArray(marketAnalysis, 'barriers_to_entry').length === 0 && (
                          <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum item identificado</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="competitors" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Principais Concorrentes</h4>
                    {safeGetArray(competitorAnalysis, 'key_competitors').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {safeGetArray(competitorAnalysis, 'key_competitors').map((competitor: string, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border border-slate-200 dark:border-slate-700">
                            <p className="font-medium break-words text-slate-700 dark:text-slate-300">{competitor}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum concorrente específico identificado</p>
                    )}
                  </div>
                    
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Vantagem Competitiva</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {competitorAnalysis.competitive_advantage || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Lacunas de Mercado</h4>
                      <ul className="space-y-2">
                        {safeGetArray(competitorAnalysis, 'market_gaps').map((gap: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            {gap}
                          </li>
                        ))}
                        {safeGetArray(competitorAnalysis, 'market_gaps').length === 0 && (
                          <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhuma lacuna identificada</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Potencial de Receita</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {financialAnalysis.revenue_potential || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Investimento Inicial</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {financialAnalysis.initial_investment || "Não especificado"}
                      </p>
                    </div>
                  </div>
                    
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Estimativa de Break-Even</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 break-words p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {financialAnalysis.break_even_estimate || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Sugestões de Financiamento</h4>
                      <ul className="space-y-2">
                        {safeGetArray(financialAnalysis, 'funding_suggestions').map((suggestion: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                        {safeGetArray(financialAnalysis, 'funding_suggestions').length === 0 && (
                          <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhuma sugestão identificada</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
        
              <TabsContent value="recommendations" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Ações Recomendadas</h4>
                    <ul className="space-y-2">
                      {safeGetArray(recommendations, 'action_items').map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {safeGetArray(recommendations, 'action_items').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhuma ação recomendada</li>
                      )}
                    </ul>
                  </div>
                
                  <div>
                    <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Próximos Passos</h4>
                    <ul className="space-y-2">
                      {safeGetArray(recommendations, 'next_steps').map((step: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                      {safeGetArray(recommendations, 'next_steps').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum próximo passo identificado</li>
                      )}
                    </ul>
                  </div>
                
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Desafios Potenciais</h4>
                      <ul className="space-y-2">
                        {safeGetArray(recommendations, 'potential_challenges').map((challenge: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                        {safeGetArray(recommendations, 'potential_challenges').length === 0 && (
                          <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum desafio identificado</li>
                        )}
                      </ul>
                    </div>
                
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Recursos Sugeridos</h4>
                      <ul className="space-y-2">
                        {safeGetArray(recommendations, 'suggested_resources').map((resource: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 break-words flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            {resource}
                          </li>
                        ))}
                        {safeGetArray(recommendations, 'suggested_resources').length === 0 && (
                          <li className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhum recurso sugerido</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>

      <AdvancedAnalysisModal
        open={showAdvancedAnalysis}
        onOpenChange={setShowAdvancedAnalysis}
        ideaId={id!}
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t('ideas.deleteTitle', 'Excluir Ideia')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('ideas.deleteConfirm', 'Tem certeza que deseja excluir esta ideia? Esta ação não pode ser desfeita.')}
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
    </div>
  );
};

export default IdeaDetailPage;
