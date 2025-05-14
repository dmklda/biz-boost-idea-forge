import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  Check, 
  AlertTriangle, 
  X, 
  FileText, 
  Users, 
  Tag, 
  DollarSign,
  MapPin,
  Coins
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { FavoriteButton } from "@/components/ideas/FavoriteButton";
import { TagsSelector, TagType } from "@/components/ideas/TagsSelector";
import { AdvancedAnalysisButton } from "@/components/advanced-analysis";

// Define types for idea and analysis data
interface Idea {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  budget: number | null;
  location: string | null;
  monetization: string | null;
  has_competitors: string | null;
  created_at: string;
}

interface Analysis {
  id: string;
  idea_id: string;
  score: number;
  status: string;
  swot_analysis: SwotAnalysis | null;
  market_analysis: MarketAnalysis | null;
  recommendations: Recommendations | null;
  competitor_analysis: CompetitorAnalysis | null;
  financial_analysis: FinancialAnalysis | null;
  created_at: string;
}

interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface MarketAnalysis {
  market_size: string;
  target_audience: string;
  growth_potential: string;
  barriers_to_entry: string[];
}

interface Recommendations {
  action_items: string[];
  next_steps: string[];
  potential_challenges: string[];
  suggested_resources: string[];
}

interface CompetitorAnalysis {
  key_competitors: string[];
  competitive_advantage: string;
  market_gaps: string[];
}

interface FinancialAnalysis {
  revenue_potential: string;
  initial_investment: string;
  break_even_estimate: string;
  funding_suggestions: string[];
}

const IdeaDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  
  // Fetch idea and analysis data
  useEffect(() => {
    const fetchIdeaDetails = async () => {
      if (!id || !authState.user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch the idea details
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', id)
          .eq('user_id', authState.user.id)
          .single();
          
        if (ideaError) throw ideaError;
        if (!ideaData) {
          toast.error(t('ideas.notFound') || "Ideia não encontrada");
          navigate('/dashboard/ideias');
          return;
        }
        
        setIdea(ideaData);
        
        // Fetch the analysis details
        const { data: analysisData, error: analysisError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('idea_id', id)
          .maybeSingle();
          
        if (analysisError) throw analysisError;
        
        if (analysisData) {
          // Convert the JSON fields to properly typed objects with type assertions
          const typedAnalysis: Analysis = {
            id: analysisData.id,
            idea_id: analysisData.idea_id,
            score: analysisData.score,
            status: analysisData.status,
            created_at: analysisData.created_at,
            swot_analysis: analysisData.swot_analysis as unknown as SwotAnalysis,
            market_analysis: analysisData.market_analysis as unknown as MarketAnalysis,
            recommendations: analysisData.recommendations as unknown as Recommendations,
            competitor_analysis: analysisData.competitor_analysis as unknown as CompetitorAnalysis,
            financial_analysis: analysisData.financial_analysis as unknown as FinancialAnalysis,
          };
          
          setAnalysis(typedAnalysis);
        }
      } catch (error) {
        console.error("Error fetching idea details:", error);
        toast.error(t('errors.fetchingDetails') || "Erro ao buscar detalhes da ideia");
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdeaDetails();
  }, [id, authState.user?.id, navigate, t]);
  
  // Function to handle sharing
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/resultados?id=${id}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  // Function to download analysis as PDF
  const handleDownloadPDF = () => {
    // To be implemented - would connect to a PDF generation service
    toast.info(t('features.comingSoon') || "Funcionalidade em breve");
  };
  
  // Function to get score color class
  const getScoreColorClass = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };
  
  // Function to get status badge
  const getStatusBadge = (score: number) => {
    if (score >= 70) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500">Ótimo</Badge>;
    } else if (score >= 40) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500">Médio</Badge>;
    } else {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500">Baixo</Badge>;
    }
  };
  
  // Handle tags change
  const handleTagsChange = (updatedTags: TagType[]) => {
    setTags(updatedTags);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="animate-pulse">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <div className="h-4 w-20 bg-muted rounded"></div>
          </Button>
        </div>
        
        <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
        
        <Card className="animate-pulse shadow-sm">
          <CardHeader>
            <div className="h-6 w-1/3 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!idea) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium">{t('ideas.notFound') || "Ideia não encontrada"}</h2>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to="/dashboard/ideias">{t('ideas.backToIdeas') || "Voltar para Ideias"}</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-24">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/ideias')} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back') || "Voltar"}
        </Button>
        
        <div className="flex items-center gap-2">
          <FavoriteButton 
            ideaId={idea.id} 
            variant="outline" 
            size="sm"
            showText={true}
          />
          
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">{copySuccess ? (t('common.copied') || "Copiado!") : (t('common.share') || "Compartilhar")}</span>
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>
      
      {/* Idea header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{idea.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
            {analysis && (
              <>
                <span>•</span>
                {getStatusBadge(analysis.score)}
              </>
            )}
          </div>
          {/* Add tags selector */}
          <div className="ml-auto">
            <TagsSelector ideaId={idea.id} onTagsChange={handleTagsChange} />
          </div>
        </div>
      </div>
      
      {/* Analysis content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">{t('ideas.detail.overview') || "Visão Geral"}</TabsTrigger>
          <TabsTrigger value="analysis">{t('ideas.detail.analysis') || "Análise"}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('ideas.detail.recommendations') || "Recomendações"}</TabsTrigger>
          <TabsTrigger value="financials">{t('ideas.detail.financials') || "Financeiro"}</TabsTrigger>
        </TabsList>
        
        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Score card */}
          {analysis && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>{t('ideas.detail.viabilityScore') || "Pontuação de Viabilidade"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className={`text-5xl font-bold ${getScoreColorClass(analysis.score)}`}>
                      {analysis.score}%
                    </span>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      {analysis.score >= 70
                        ? (t('ideas.detail.highScore') || "Excelente viabilidade! Esta ideia tem um grande potencial de sucesso.")
                        : analysis.score >= 40
                        ? (t('ideas.detail.mediumScore') || "Viabilidade moderada. A ideia tem potencial, mas requer ajustes.")
                        : (t('ideas.detail.lowScore') || "Baixa viabilidade. Recomendamos revisar os principais aspectos da ideia.")}
                    </p>
                  </div>
                  
                  <div className="w-full sm:max-w-xs">
                    <Progress value={analysis.score} className="h-3" />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Add Advanced Analysis Button */}
                {analysis && (
                  <div className="mt-4 flex justify-center sm:justify-end">
                    <AdvancedAnalysisButton 
                      ideaId={idea.id} 
                      className="ml-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Idea details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>{t('ideas.detail.ideaDetails') || "Detalhes da Ideia"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {t('ideas.detail.description') || "Descrição"}
                </h3>
                <p className="mt-1">{idea.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  {t('ideas.detail.problemSolved') || "Problema Resolvido"}
                </h3>
                <p className="mt-1">{idea.problem || "Não especificado"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {t('ideas.detail.targetAudience') || "Público-alvo"}
                </h3>
                <p className="mt-1">{idea.audience || "Não especificado"}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {idea.budget !== null && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {t('ideas.detail.budget') || "Orçamento"}
                    </h3>
                    <p className="mt-1">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(idea.budget)}
                    </p>
                  </div>
                )}
                
                {idea.location && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {t('ideas.detail.location') || "Localização"}
                    </h3>
                    <p className="mt-1">{idea.location}</p>
                  </div>
                )}
                
                {idea.monetization && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center gap-1">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      {t('ideas.detail.monetization') || "Monetização"}
                    </h3>
                    <p className="mt-1">{idea.monetization}</p>
                  </div>
                )}
                
                {idea.has_competitors && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center gap-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {t('ideas.detail.competitors') || "Concorrentes"}
                    </h3>
                    <p className="mt-1">{idea.has_competitors}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick summary */}
          {analysis && analysis.swot_analysis && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>{t('ideas.detail.quickSummary') || "Resumo Rápido"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm flex items-center gap-1 text-green-500">
                      <Check className="h-4 w-4" />
                      {t('ideas.detail.strengths') || "Pontos Fortes"}
                    </h3>
                    <ul className="ml-6 list-disc text-sm space-y-1">
                      {analysis.swot_analysis.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm flex items-center gap-1 text-red-500">
                      <X className="h-4 w-4" />
                      {t('ideas.detail.weaknesses') || "Pontos Fracos"}
                    </h3>
                    <ul className="ml-6 list-disc text-sm space-y-1">
                      {analysis.swot_analysis.weaknesses.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Analysis tab */}
        <TabsContent value="analysis" className="space-y-4">
          {analysis && analysis.swot_analysis ? (
            <>
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle>{t('ideas.detail.swotAnalysis') || "Análise SWOT"}</CardTitle>
                  <CardDescription>
                    {t('ideas.detail.swotDescription') || "Forças, Fraquezas, Oportunidades e Ameaças"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm flex items-center gap-1 text-green-500">
                        <Check className="h-4 w-4" />
                        {t('ideas.detail.strengths') || "Pontos Fortes"}
                      </h3>
                      <ul className="ml-6 list-disc space-y-1">
                        {analysis.swot_analysis.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm flex items-center gap-1 text-red-500">
                        <X className="h-4 w-4" />
                        {t('ideas.detail.weaknesses') || "Pontos Fracos"}
                      </h3>
                      <ul className="ml-6 list-disc space-y-1">
                        {analysis.swot_analysis.weaknesses.map((weakness, idx) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm flex items-center gap-1 text-blue-500">
                        <AlertTriangle className="h-4 w-4" />
                        {t('ideas.detail.opportunities') || "Oportunidades"}
                      </h3>
                      <ul className="ml-6 list-disc space-y-1">
                        {analysis.swot_analysis.opportunities.map((opportunity, idx) => (
                          <li key={idx}>{opportunity}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm flex items-center gap-1 text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        {t('ideas.detail.threats') || "Ameaças"}
                      </h3>
                      <ul className="ml-6 list-disc space-y-1">
                        {analysis.swot_analysis.threats.map((threat, idx) => (
                          <li key={idx}>{threat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {analysis.market_analysis && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle>{t('ideas.detail.marketAnalysis') || "Análise de Mercado"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.marketSize') || "Tamanho do Mercado"}</h3>
                      <p className="mt-1">{analysis.market_analysis.market_size}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.targetAudience') || "Público-alvo"}</h3>
                      <p className="mt-1">{analysis.market_analysis.target_audience}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.growthPotential') || "Potencial de Crescimento"}</h3>
                      <p className="mt-1">{analysis.market_analysis.growth_potential}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.barriers') || "Barreiras de Entrada"}</h3>
                      <ul className="ml-6 list-disc mt-1">
                        {analysis.market_analysis.barriers_to_entry.map((barrier, idx) => (
                          <li key={idx}>{barrier}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {analysis.competitor_analysis && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle>{t('ideas.detail.competitorAnalysis') || "Análise de Concorrentes"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.keyCompetitors') || "Principais Concorrentes"}</h3>
                      <ul className="ml-6 list-disc mt-1">
                        {analysis.competitor_analysis.key_competitors.map((competitor, idx) => (
                          <li key={idx}>{competitor}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.competitiveAdvantage') || "Vantagem Competitiva"}</h3>
                      <p className="mt-1">{analysis.competitor_analysis.competitive_advantage}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm">{t('ideas.detail.marketGaps') || "Lacunas de Mercado"}</h3>
                      <ul className="ml-6 list-disc mt-1">
                        {analysis.competitor_analysis.market_gaps.map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  {t('ideas.detail.noAnalysis') || "Análise detalhada não disponível"}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Recommendations tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {analysis && analysis.recommendations ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>{t('ideas.detail.recommendationsAndNextSteps') || "Recomendações e Próximos Passos"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.actionItems') || "Itens de Ação"}</h3>
                  <ul className="ml-6 list-disc mt-1">
                    {analysis.recommendations.action_items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.nextSteps') || "Próximos Passos"}</h3>
                  <ul className="ml-6 list-disc mt-1">
                    {analysis.recommendations.next_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.potentialChallenges') || "Desafios Potenciais"}</h3>
                  <ul className="ml-6 list-disc mt-1">
                    {analysis.recommendations.potential_challenges.map((challenge, idx) => (
                      <li key={idx}>{challenge}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.suggestedResources') || "Recursos Sugeridos"}</h3>
                  <ul className="ml-6 list-disc mt-1">
                    {analysis.recommendations.suggested_resources.map((resource, idx) => (
                      <li key={idx}>{resource}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  {t('ideas.detail.noRecommendations') || "Recomendações não disponíveis"}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Financials tab */}
        <TabsContent value="financials" className="space-y-4">
          {analysis && analysis.financial_analysis ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>{t('ideas.detail.financialAnalysis') || "Análise Financeira"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.revenuePotential') || "Potencial de Receita"}</h3>
                  <p className="mt-1">{analysis.financial_analysis.revenue_potential}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.initialInvestment') || "Investimento Inicial"}</h3>
                  <p className="mt-1">{analysis.financial_analysis.initial_investment}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.breakEvenEstimate') || "Estimativa de Ponto de Equilíbrio"}</h3>
                  <p className="mt-1">{analysis.financial_analysis.break_even_estimate}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{t('ideas.detail.fundingSuggestions') || "Sugestões de Financiamento"}</h3>
                  <ul className="ml-6 list-disc mt-1">
                    {analysis.financial_analysis.funding_suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  {t('ideas.detail.noFinancials') || "Análise financeira não disponível"}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Share button floating (mobile only) */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-40">
          <div className="flex flex-col gap-2">
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-brand-purple hover:bg-brand-purple/90 h-12 w-12"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-brand-purple hover:bg-brand-purple/90 h-12 w-12"
              onClick={handleDownloadPDF}
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaDetailPage;
