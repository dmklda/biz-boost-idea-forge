import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const TargetAudienceIcon = () => (
  <div className="relative w-10 h-10 group">
    {/* Background gradient circle */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300" />
    
    {/* Animated glow effect */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-400/30 to-purple-500/30 animate-pulse" />
    
    {/* Outer ring animation */}
    <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
    
    {/* Main icon content */}
    <div className="relative w-full h-full flex items-center justify-center">
      <Users className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
    </div>

    {/* Sparkles */}
    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white/80 rounded-full animate-ping" />
    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping delay-300" />
    <div className="absolute top-1 -left-1 w-1 h-1 bg-white/40 rounded-full animate-ping delay-500" />
  </div>
);



const BudgetIcon = () => (
  <div className="relative w-10 h-10 group">
    {/* Background gradient circle */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 shadow-lg group-hover:shadow-xl transition-all duration-300" />

    {/* Animated glow effect */}
    <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse" />

    {/* Outer ring animation */}
    <div className="absolute inset-0 rounded-full border-2 border-white/10 group-hover:border-white/30 transition-all duration-300" />

    {/* Main icon content */}
    <div className="relative w-full h-full flex items-center justify-center">
      <DollarSign className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
    </div>

    {/* Subtle sparkles */}
    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/70 rounded-full animate-ping" />
    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping delay-200" />
  </div>
);

// Modern Location Icon Component
const LocationIcon = () => (
  <div className="relative w-10 h-10 group">
    {/* Background gradient circle */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 shadow-lg group-hover:shadow-xl transition-all duration-300" />
    
    {/* Animated glow effect */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-rose-500/30 animate-pulse" />
    
    {/* Outer ring animation */}
    <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
    
    {/* Main icon content */}
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Location pin */}
      <div className="relative group-hover:scale-110 transition-transform duration-300">
        {/* Pin body */}
        <div className="w-3 h-4 bg-white rounded-t-full shadow-sm relative">
          {/* Pin highlight */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/60 rounded-full" />
        </div>
        
        {/* Pin point */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-2 h-2 bg-white transform rotate-45 shadow-sm" />
        </div>
        
        {/* Pin dot */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-purple-600 rounded-full shadow-sm" />
        </div>
        
        {/* Pin shadow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
          <div className="w-2 h-0.5 bg-black/10 rounded-full" />
        </div>
      </div>
    </div>
    
    {/* Multiple sparkle effects */}
    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white/80 rounded-full animate-ping" />
    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping delay-300" />
    <div className="absolute top-1 -left-1 w-1 h-1 bg-white/40 rounded-full animate-ping delay-500" />
  </div>
);

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
      // First, delete all related data to avoid foreign key constraint violations
      
      // Delete generated content
      const { error: contentError } = await supabase
        .from('generated_content')
        .delete()
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id);

      if (contentError) {
        console.error("Error deleting generated content:", contentError);
        // Continue with deletion even if this fails
      }

      // Delete advanced analyses
      const { error: advancedError } = await supabase
        .from('advanced_analyses')
        .delete()
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id);

      if (advancedError) {
        console.error("Error deleting advanced analyses:", advancedError);
        // Continue with deletion even if this fails
      }

      // Delete idea analyses
      const { error: analysisError } = await supabase
        .from('idea_analyses')
        .delete()
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id);

      if (analysisError) {
        console.error("Error deleting idea analyses:", analysisError);
        // Continue with deletion even if this fails
      }

      // Delete idea tags
      const { error: tagsError } = await supabase
        .from('idea_tags')
        .delete()
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id);

      if (tagsError) {
        console.error("Error deleting idea tags:", tagsError);
        // Continue with deletion even if this fails
      }

      // Delete idea favorites
      const { error: favoritesError } = await supabase
        .from('idea_favorites')
        .delete()
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id);

      if (favoritesError) {
        console.error("Error deleting idea favorites:", favoritesError);
        // Continue with deletion even if this fails
      }

      // Finally, delete the idea itself
      const { error: ideaError } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);

      if (ideaError) throw ideaError;

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
              {t('results.summary.errorLoadingIdea', 'Erro ao carregar ideia')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "A ideia solicitada não foi encontrada."}
            </p>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('common.backToDashboard', 'Voltar ao Dashboard')}
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
            <span className="hidden sm:inline font-medium">{t('common.back', 'Voltar')}</span>
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
                title={idea.generated_name || idea.title}
              >
                {idea.generated_name || idea.title}
              </h2>
              {idea.generated_name && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ideia: {idea.title}
                </p>
              )}
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
                <span className="hidden sm:inline">{t('common.edit', 'Editar')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {analysis ? t('analysis.viewAnalysis', 'Ver Análise') : t('ideas.analyze', 'Analisar')}
                </span>
              </Button>
              {analysis && (
                <Button
                  onClick={() => setShowAdvancedAnalysis(true)}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('advancedAnalysis.button', 'Análise Avançada')}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common.delete', 'Excluir')}</span>
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
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all duration-300 group">
                  <TargetAudienceIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{t('results.targetAudience', 'Público-alvo')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{idea.audience}</p>
                  </div>
                  </div>
                )}
                
              {idea.budget && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 hover:shadow-lg transition-all duration-300 group">
                  <BudgetIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">{t('results.summary.investment', 'Orçamento')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">R$ {idea.budget}</p>
                  </div>
                  </div>
                )}
                
              {idea.location && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800 hover:shadow-lg transition-all duration-300 group">
                  <LocationIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{t('results.summary.location', 'Localização')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{idea.location}</p>
                  </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
        {/* Analysis Summary - Only show if analysis exists */}
        {analysis && (
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none" />
            <CardHeader className="relative p-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t('results.summary.title', 'Resumo da Análise')}
                </h3>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <div className="space-y-8">
                {/* Score and Status Section */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      {t('results.summary.generalScore', 'Pontuação Geral')}
                    </h4>
                    <div className="flex items-center">
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('results.status.label', 'Status da análise')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      {t('results.summary.viability', 'Viabilidade')}
                    </h4>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">{t('results.summary.marketPotential', 'Potencial de Mercado')}</span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {analysis.score >= 80 ? t('results.summary.high', 'Alto') : analysis.score >= 60 ? t('results.summary.medium', 'Médio') : t('results.summary.low', 'Baixo')}
                        </span>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${analysis.score}%` }}
                        />
                    </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      {t('results.summary.growth', 'Crescimento')}
                    </h4>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('results.summary.trend', 'Tendência')}</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          {analysis.score >= 75 ? t('results.summary.growing', 'Crescente') : analysis.score >= 50 ? t('results.summary.stable', 'Estável') : t('results.summary.uncertain', 'Incerta')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          {analysis.score >= 75 ? t('results.summary.expandingMarket', 'Mercado em expansão') : analysis.score >= 50 ? t('results.summary.matureMarket', 'Mercado maduro') : t('results.summary.emergingMarket', 'Mercado emergente')}
                        </span>
                    </div>
                    </div>
                    </div>
                    </div>
                    
                {/* Quick Overview Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    {t('results.summary.ideaOverview', 'Visão Geral da Ideia')}
                  </h4>
                  <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {idea.description}
                    </p>
                    </div>
                </div>

                {/* Key Insights Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      {t('results.summary.mainStrengths', 'Principais Pontos Fortes')}
                    </h4>
                    <ul className="space-y-3">
                      {safeGetArray(swotAnalysis, 'strengths').slice(0, 4).map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{strength}</span>
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                          {t('results.summary.noStrengthsIdentified', 'Nenhum ponto forte identificado')}
                        </li>
                      )}
                  </ul>
                </div>
                
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      {t('results.summary.mainChallenges', 'Principais Desafios')}
                    </h4>
                    <ul className="space-y-3">
                      {safeGetArray(swotAnalysis, 'weaknesses').slice(0, 4).map((weakness: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{weakness}</span>
                        </li>
                      ))}
                      {safeGetArray(swotAnalysis, 'weaknesses').length === 0 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                          {t('results.summary.noChallengesIdentified', 'Nenhum desafio identificado')}
                        </li>
                      )}
                  </ul>
                  </div>
                </div>
                
                {/* Market & Financial Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('results.summary.targetAudience', 'Público-Alvo')}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">
                      {idea.audience || t('common.notSpecified', 'Não especificado')}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t('results.summary.investment', 'Investimento')}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {idea.budget ? `R$ ${idea.budget}` : t('common.notSpecified', 'Não especificado')}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                    <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('results.summary.location', 'Localização')}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">
                      {idea.location || t('common.notSpecified', 'Não especificado')}
                    </p>
                  </div>
                </div>
                
                {/* Next Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    {t('results.summary.recommendedNextSteps', 'Próximos Passos Recomendados')}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {safeGetArray(recommendations, 'next_steps').slice(0, 4).map((step: string, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{step}</span>
                        </div>
                      </div>
                    ))}
                    {safeGetArray(recommendations, 'next_steps').length === 0 && (
                      <div className="col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                          {t('results.summary.noNextStepsIdentified', 'Nenhum próximo passo identificado')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </CardContent>
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
