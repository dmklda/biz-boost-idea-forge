
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AdvancedAnalysisButton } from "@/components/advanced-analysis";
import { 
  ArrowLeft, 
  BarChart, 
  ExternalLink, 
  Eye, 
  Lightbulb, 
  PenLine, 
  Share2, 
  Star, 
  Tag,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/ideas";
import { TagBadge, TagType } from "@/components/ideas";
import { CompareIdeasModal } from "@/components/ideas";

interface IdeaDetail {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  has_competitors: string | null;
  monetization: string | null;
  budget: number | null;
  location: string | null;
  created_at: string;
  status: string;
  is_draft: boolean;
  isFavorite?: boolean;
  tags?: TagType[];
}

interface IdeaAnalysis {
  score: number;
  status: string;
  market_analysis: {
    market_size: string;
    target_audience: string;
    growth_potential: string;
    barriers_to_entry: string[];
  };
  competitor_analysis: {
    market_gaps: string[];
    key_competitors: string[];
    competitive_advantage: string;
  };
  financial_analysis: {
    revenue_potential: string;
    initial_investment: string;
    break_even_estimate: string;
    funding_suggestions: string[];
  };
  swot_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: {
    next_steps: string[];
    action_items: string[];
    suggested_resources: string[];
    potential_challenges: string[];
  };
}

const IdeaDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  useEffect(() => {
    if (authState.isAuthenticated && id) {
      fetchIdeaAndAnalysis();
    }
  }, [authState.isAuthenticated, id]);
  
  const fetchIdeaAndAnalysis = async () => {
    try {
      setLoading(true);
      
      // Fetch idea details
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();
        
      if (ideaError) throw ideaError;
      
      // Fetch favorite status
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('idea_favorites')
        .select('id')
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id)
        .maybeSingle();
        
      if (favoriteError && favoriteError.code !== 'PGRST116') {
        console.error("Error fetching favorite status:", favoriteError);
      }
      
      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('idea_tags')
        .select('tag_id, tags (*)')
        .eq('idea_id', id)
        .eq('user_id', authState.user?.id);
        
      if (tagsError) {
        console.error("Error fetching tags:", tagsError);
      }
      
      const formattedTags = tagsData?.map(tagItem => ({
        id: tagItem.tags.id,
        name: tagItem.tags.name,
        color: tagItem.tags.color
      })) || [];
      
      // Fetch analysis details
      const { data: analysisData, error: analysisError } = await supabase
        .from('idea_analyses')
        .select('*')
        .eq('idea_id', id)
        .maybeSingle();
        
      if (analysisError && analysisError.code !== 'PGRST116') {
        console.error("Error fetching analysis:", analysisError);
      }
      
      setIdea({
        ...ideaData,
        isFavorite: !!favoriteData,
        tags: formattedTags
      });
      
      if (analysisData) {
        // Parse JSON fields to ensure they match the required IdeaAnalysis interface
        const parsedAnalysis: IdeaAnalysis = {
          score: analysisData.score,
          status: analysisData.status,
          market_analysis: typeof analysisData.market_analysis === 'string' 
            ? JSON.parse(analysisData.market_analysis)
            : analysisData.market_analysis,
          competitor_analysis: typeof analysisData.competitor_analysis === 'string'
            ? JSON.parse(analysisData.competitor_analysis)
            : analysisData.competitor_analysis,
          financial_analysis: typeof analysisData.financial_analysis === 'string'
            ? JSON.parse(analysisData.financial_analysis)
            : analysisData.financial_analysis,
          swot_analysis: typeof analysisData.swot_analysis === 'string'
            ? JSON.parse(analysisData.swot_analysis)
            : analysisData.swot_analysis,
          recommendations: typeof analysisData.recommendations === 'string'
            ? JSON.parse(analysisData.recommendations)
            : analysisData.recommendations
        };
        
        setAnalysis(parsedAnalysis);
      }
    } catch (error) {
      console.error("Error fetching idea details:", error);
      toast.error(t('ideas.fetchError', "Erro ao carregar detalhes da ideia"));
      // Navigate back on error
      navigate("/dashboard/ideias");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/dashboard/ideias");
  };
  
  const handleUpdateFavorites = () => {
    fetchIdeaAndAnalysis();
  };
  
  const handleEdit = () => {
    if (!idea) return;
    
    if (idea.is_draft) {
      // Edit draft
      navigate(`/dashboard/editar?id=${id}`);
    } else {
      // Reanalyze idea
      navigate(`/dashboard/editar?id=${id}&reanalyze=true`);
    }
  };
  
  const handleShare = () => {
    if (navigator.share && id) {
      navigator.share({
        title: idea?.title || t('ideas.shared', "Ideia compartilhada"),
        url: `${window.location.origin}/dashboard/ideias/${id}`
      }).catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(`${window.location.origin}/dashboard/ideias/${id}`)
        .then(() => {
          toast.success(t('ideas.linkCopied', "Link copiado para a área de transferência"));
        })
        .catch((error) => {
          console.error("Error copying link:", error);
          toast.error(t('ideas.linkCopyError', "Erro ao copiar link"));
        });
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excelente':
        return "bg-green-500/10 text-green-500";
      case 'promissor':
        return "bg-blue-500/10 text-blue-500";
      case 'razoável':
        return "bg-yellow-500/10 text-yellow-500";
      case 'desafiador':
        return "bg-orange-500/10 text-orange-500";
      case 'problemático':
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-slate-500/10 text-slate-500";
    }
  };
  
  const renderSwotItem = (items: string[], className?: string) => {
    return (
      <ul className={cn("space-y-1", className)}>
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-current shrink-0"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };
  
  if (!authState.isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p>{t('auth.requiredForIdeas', "Você precisa estar logado para ver detalhes da ideia")}</p>
            <Button 
              onClick={() => navigate("/login")}
              className="mt-4 bg-brand-purple hover:bg-brand-purple/90"
            >
              {t('auth.login', "Entrar")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (!idea) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', "Voltar")}
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {t('ideas.notFound', "Ideia não encontrada")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t('ideas.notFoundDescription', "A ideia que você está procurando não existe ou foi removida")}
            </p>
            <Button onClick={handleBackClick}>
              {t('ideas.backToIdeas', "Voltar para ideias")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleBackClick} className="p-0 h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold truncate">{idea.title}</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCompareModalOpen(true)}
          >
            <BarChart className="h-4 w-4 mr-2" />
            {t('ideas.compare', "Comparar")}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {t('ideas.share', "Compartilhar")}
          </Button>
          
          <FavoriteButton
            ideaId={idea.id}
            isFavorite={idea.isFavorite}
            variant="outline"
            size="sm"
            showText={true}
            onUpdate={handleUpdateFavorites}
          />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEdit}
            className="bg-brand-purple text-white hover:bg-brand-purple/90 hover:text-white border-0"
          >
            {idea.is_draft ? (
              <>
                <PenLine className="h-4 w-4 mr-2" />
                {t('ideas.edit', "Editar")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('ideas.reanalyze', "Reanalisar")}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {idea.tags.map(tag => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{t('ideas.overview', "Visão Geral")}</CardTitle>
          <CardDescription>
            {new Date(idea.created_at).toLocaleDateString()} • 
            {idea.is_draft ? (
              <Badge variant="outline" className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {t('ideas.draft', "Rascunho")}
              </Badge>
            ) : (
              <Badge variant="outline" className={cn("ml-2", getStatusBadgeColor(analysis?.status || ''))}>
                {analysis?.status || t('ideas.notAnalyzed', "Não analisado")}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">{t('ideas.description', "Descrição")}</h3>
            <p className="text-muted-foreground">{idea.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">{t('ideas.audience', "Público-alvo")}</h3>
              <p className="text-muted-foreground">{idea.audience || t('ideas.notSpecified', "Não especificado")}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">{t('ideas.problem', "Problema a resolver")}</h3>
              <p className="text-muted-foreground">{idea.problem || t('ideas.notSpecified', "Não especificado")}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">{t('ideas.competitors', "Concorrentes")}</h3>
              <p className="text-muted-foreground">
                {idea.has_competitors === 'sim' ? t('ideas.yesCompetitors', "Sim, existem concorrentes") : 
                 idea.has_competitors === 'nao' ? t('ideas.noCompetitors', "Não existem concorrentes") :
                 idea.has_competitors === 'nao-sei' ? t('ideas.unknownCompetitors', "Não sei se existem concorrentes") :
                 t('ideas.notSpecified', "Não especificado")}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">{t('ideas.monetization', "Monetização")}</h3>
              <p className="text-muted-foreground">{idea.monetization || t('ideas.notSpecified', "Não especificado")}</p>
            </div>
            
            {idea.budget !== null && (
              <div>
                <h3 className="font-medium mb-2">{t('ideas.budget', "Orçamento inicial")}</h3>
                <p className="text-muted-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(idea.budget)}
                </p>
              </div>
            )}
            
            {idea.location && (
              <div>
                <h3 className="font-medium mb-2">{t('ideas.location', "Localização")}</h3>
                <p className="text-muted-foreground">{idea.location}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <AdvancedAnalysisButton ideaId={idea.id} size="sm" />
        </CardFooter>
      </Card>
      
      {!idea.is_draft && analysis && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <Eye className="h-4 w-4 mr-2" />
              {t('analysis.overview', "Visão Geral")}
            </TabsTrigger>
            <TabsTrigger value="market">
              <Tag className="h-4 w-4 mr-2" />
              {t('analysis.market', "Mercado")}
            </TabsTrigger>
            <TabsTrigger value="financial">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('analysis.financial', "Financeiro")}
            </TabsTrigger>
            <TabsTrigger value="swot">
              <Lightbulb className="h-4 w-4 mr-2" />
              {t('analysis.swot', "SWOT")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t('analysis.score', "Pontuação")}</span>
                    <span className={getScoreColor(analysis.score)}>{analysis.score}/100</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        analysis.score >= 80 ? "bg-green-500" :
                        analysis.score >= 60 ? "bg-yellow-500" :
                        analysis.score >= 40 ? "bg-orange-500" : "bg-red-500"
                      )}
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('analysis.recommendations', "Recomendações")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderSwotItem(analysis.recommendations.next_steps.slice(0, 3))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analysis.marketAnalysis', "Análise de Mercado")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.marketSize', "Tamanho do Mercado")}</h3>
                    <p className="text-muted-foreground">{analysis.market_analysis.market_size}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.targetAudience', "Público-alvo")}</h3>
                    <p className="text-muted-foreground">{analysis.market_analysis.target_audience}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.growthPotential', "Potencial de Crescimento")}</h3>
                    <p className="text-muted-foreground">{analysis.market_analysis.growth_potential}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.barriersToEntry', "Barreiras de Entrada")}</h3>
                    {renderSwotItem(analysis.market_analysis.barriers_to_entry)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('analysis.competitorAnalysis', "Análise de Concorrentes")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.marketGaps', "Lacunas no Mercado")}</h3>
                    {renderSwotItem(analysis.competitor_analysis.market_gaps)}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.keyCompetitors', "Principais Concorrentes")}</h3>
                    {renderSwotItem(analysis.competitor_analysis.key_competitors)}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.competitiveAdvantage', "Vantagem Competitiva")}</h3>
                    <p className="text-muted-foreground">{analysis.competitor_analysis.competitive_advantage}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('analysis.financialAnalysis', "Análise Financeira")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.revenuePotential', "Potencial de Receita")}</h3>
                    <p className="text-muted-foreground">{analysis.financial_analysis.revenue_potential}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.initialInvestment', "Investimento Inicial")}</h3>
                    <p className="text-muted-foreground">{analysis.financial_analysis.initial_investment}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.breakEvenEstimate', "Estimativa de Retorno")}</h3>
                    <p className="text-muted-foreground">{analysis.financial_analysis.break_even_estimate}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t('analysis.fundingSuggestions', "Sugestões de Financiamento")}</h3>
                    {renderSwotItem(analysis.financial_analysis.funding_suggestions)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="swot" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-500/20 dark:border-green-700/20">
                <CardHeader className="border-b border-green-500/20 dark:border-green-700/20">
                  <CardTitle className="text-green-600 dark:text-green-400">{t('analysis.strengths', "Forças")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {renderSwotItem(analysis.swot_analysis.strengths, "text-green-600 dark:text-green-400")}
                </CardContent>
              </Card>
              
              <Card className="border-red-500/20 dark:border-red-700/20">
                <CardHeader className="border-b border-red-500/20 dark:border-red-700/20">
                  <CardTitle className="text-red-600 dark:text-red-400">{t('analysis.weaknesses', "Fraquezas")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {renderSwotItem(analysis.swot_analysis.weaknesses, "text-red-600 dark:text-red-400")}
                </CardContent>
              </Card>
              
              <Card className="border-blue-500/20 dark:border-blue-700/20">
                <CardHeader className="border-b border-blue-500/20 dark:border-blue-700/20">
                  <CardTitle className="text-blue-600 dark:text-blue-400">{t('analysis.opportunities', "Oportunidades")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {renderSwotItem(analysis.swot_analysis.opportunities, "text-blue-600 dark:text-blue-400")}
                </CardContent>
              </Card>
              
              <Card className="border-orange-500/20 dark:border-orange-700/20">
                <CardHeader className="border-b border-orange-500/20 dark:border-orange-700/20">
                  <CardTitle className="text-orange-600 dark:text-orange-400">{t('analysis.threats', "Ameaças")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {renderSwotItem(analysis.swot_analysis.threats, "text-orange-600 dark:text-orange-400")}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <CompareIdeasModal
        open={isCompareModalOpen}
        onOpenChange={setIsCompareModalOpen}
        currentIdeaId={idea.id}
      />
    </div>
  );
};

export default IdeaDetailPage;
