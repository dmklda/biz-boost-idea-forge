import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Share2, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/sonner";
import { AdvancedAnalysisButton } from "@/components/advanced-analysis";

const ResultsPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchIdeaAndAnalysis = async () => {
      console.log("ResultsPage: Starting fetch with ideaId:", ideaId, "authState:", authState.isAuthenticated);
      
      if (!authState.isAuthenticated) {
        console.log("ResultsPage: User not authenticated, redirecting to login");
        toast.error(t('results.authRequired', "Você precisa estar logado para ver os resultados"));
        navigate("/login");
        return;
      }

      if (!ideaId) {
        console.log("ResultsPage: No ideaId provided, redirecting to dashboard");
        toast.error(t('results.missingData', "ID da ideia não fornecido"));
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("ResultsPage: Fetching idea data for ID:", ideaId);

        // Fetch idea details with error handling
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', ideaId)
          .eq('user_id', authState.user?.id)
          .single();

        if (ideaError) {
          console.error("ResultsPage: Error fetching idea:", ideaError);
          if (ideaError.code === 'PGRST116') {
            toast.error(t('results.ideaNotFound', "Ideia não encontrada"));
          } else {
            toast.error(t('results.fetchError', "Erro ao buscar detalhes da ideia"));
          }
          navigate("/dashboard");
          return;
        }

        console.log("ResultsPage: Idea data fetched successfully:", ideaData);

        // Fetch analysis details with better error handling
        const { data: analysisData, error: analysisError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user?.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (analysisError) {
          console.error("ResultsPage: Error fetching analysis:", analysisError);
          toast.error(t('results.analysisError', "Erro ao buscar análise da ideia"));
          setError("Erro ao carregar análise");
        } else if (!analysisData || analysisData.length === 0) {
          console.log("ResultsPage: No analysis found for idea:", ideaId);
          toast.error(t('results.noAnalysis', "Nenhuma análise encontrada para esta ideia"));
          setError("Nenhuma análise encontrada");
        } else {
          console.log("ResultsPage: Analysis data fetched successfully:", analysisData[0]);
          setAnalysis(analysisData[0]);
        }

        setIdea(ideaData);
      } catch (error) {
        console.error("ResultsPage: Unexpected error:", error);
        toast.error(t('results.generalError', "Ocorreu um erro inesperado"));
        setError("Erro inesperado");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have the required dependencies
    if (authState.isAuthenticated !== undefined) {
      fetchIdeaAndAnalysis();
    }
  }, [ideaId, authState.isAuthenticated, authState.user?.id, navigate, t]);

  // Loading state
  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <Card className="border shadow overflow-hidden">
          <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-6">
            <Skeleton className="h-8 w-3/4 mb-4 bg-white/20" />
            <Skeleton className="h-4 w-full bg-white/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
        
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error || !idea) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t('results.errorTitle', "Erro ao carregar resultados")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || t('results.tryAgain', "Os resultados solicitados não foram encontrados. Tente analisar sua ideia novamente.")}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/dashboard")}>
                {t('results.backToDashboard', "Voltar ao Dashboard")}
              </Button>
              {idea && (
                <Button variant="outline" onClick={() => navigate(`/dashboard/ideias/${idea.id}`)}>
                  {t('results.viewIdea', "Ver Ideia")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formatar dados de análise para exibição com fallbacks seguros
  const score = analysis?.score || 0;
  const status = analysis?.status || "Moderate";
  const swotAnalysis = analysis?.swot_analysis || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  const marketAnalysis = analysis?.market_analysis || {
    market_size: "",
    target_audience: "",
    growth_potential: "",
    barriers_to_entry: []
  };
  const competitorAnalysis = analysis?.competitor_analysis || {
    key_competitors: [],
    competitive_advantage: "",
    market_gaps: []
  };
  const financialAnalysis = analysis?.financial_analysis || {
    revenue_potential: "",
    initial_investment: "",
    break_even_estimate: "",
    funding_suggestions: []
  };
  const recommendations = analysis?.recommendations || {
    action_items: [],
    next_steps: [],
    potential_challenges: [],
    suggested_resources: []
  };

  // Safe status translation with fallback
  const getStatusTranslation = (status: string) => {
    try {
      return t(`results.status.${status.toLowerCase()}`, status) as string;
    } catch {
      return status;
    }
  };
  
  const statusTranslation = getStatusTranslation(status);

  return (
    <div className="pb-16 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back', "Voltar")}</span>
          </Button>
          <h1 className="text-xl md:text-2xl font-bold truncate">
            {t('results.title', "Resultados da Análise")}
          </h1>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {!isMobile && (
            <>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">{t('results.share', "Compartilhar")}</span>
              </Button>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">{t('results.download', "Baixar PDF")}</span>
              </Button>
            </>
          )}
          <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">{t('results.export', "Exportar")}</span>
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 border shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-4 md:p-6 text-white">
            <h1 className="text-lg md:text-2xl font-bold mb-2 break-words">{idea.title}</h1>
            <p className="text-white/80 text-sm md:text-base break-words">{idea.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 bg-white">
            <div className="p-3 md:p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-brand-blue">
                {score}%
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.viability', "Viabilidade")}</div>
            </div>
            <div className="p-3 md:p-4 text-center">
              <div className="text-sm md:text-xl font-bold truncate" style={{ 
                color: status === "Viable" ? "#16a34a" : 
                       status === "Moderate" ? "#ca8a04" : "#dc2626" 
              }}>
                {statusTranslation}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.status.label', "Status") as string}</div>
            </div>
            <div className="p-3 md:p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-brand-green">
                {swotAnalysis.strengths?.length || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.strengths', "Pontos Fortes")}</div>
            </div>
            <div className="p-3 md:p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-red-500">
                {swotAnalysis.weaknesses?.length || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.weaknesses', "Pontos Fracos")}</div>
            </div>
          </div>
          
          {/* Advanced Analysis Button */}
          {idea && analysis && (
            <div className="p-4 bg-gray-50 flex justify-center">
              <AdvancedAnalysisButton 
                ideaId={idea.id} 
                className="bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6 overflow-x-auto">
          <TabsTrigger value="summary" className="text-xs sm:text-sm">{t('results.tabs.summary', "Resumo")}</TabsTrigger>
          <TabsTrigger value="swot" className="text-xs sm:text-sm">{t('results.tabs.swot', "SWOT")}</TabsTrigger>
          <TabsTrigger value="market" className="text-xs sm:text-sm">{t('results.tabs.market', "Mercado")}</TabsTrigger>
          <TabsTrigger value="competitors" className="text-xs sm:text-sm">{t('results.tabs.competitors', "Concorrentes")}</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs sm:text-sm">{t('results.tabs.financial', "Financeiro")}</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs sm:text-sm">{t('results.tabs.recommendations', "Recomendações")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          <Card>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">{t('results.summaryTitle', "Resumo da Análise")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.ideaDescription', "Descrição da Ideia")}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{idea.description}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.targetAudience', "Público-Alvo")}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{idea.audience || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.problemSolved', "Problema Resolvido")}</h3>
                  <p className="text-muted-foreground break-words">{idea.problem || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.overallScore', "Pontuação Geral")}</h3>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center text-white text-lg md:text-2xl font-bold mr-4 shrink-0">
                      {score}%
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{statusTranslation}</p>
                      <p className="text-sm text-muted-foreground">{t('results.scoreExplanation', "Baseado na análise geral da ideia")}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{t('results.keyStrengths', "Principais Pontos Fortes")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                    {swotAnalysis.strengths?.slice(0, 3).map((strength: string, i: number) => (
                      <li key={i} className="break-words">{strength}</li>
                    ))}
                    {(!swotAnalysis.strengths || swotAnalysis.strengths.length === 0) && (
                      <li>{t('results.noStrengths', "Nenhum ponto forte identificado")}</li>
                    )}
                  </ul>
                  
                  <h3 className="font-semibold mb-2">{t('results.keyWeaknesses', "Principais Pontos Fracos")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {swotAnalysis.weaknesses?.slice(0, 3).map((weakness: string, i: number) => (
                      <li key={i} className="break-words">{weakness}</li>
                    ))}
                    {(!swotAnalysis.weaknesses || swotAnalysis.weaknesses.length === 0) && (
                      <li>{t('results.noWeaknesses', "Nenhum ponto fraco identificado")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="swot" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('results.swotAnalysis', "Análise SWOT")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">{t('results.swot.strengths', "Forças")}</h3>
                  <ul className="list-disc list-inside">
                    {swotAnalysis.strengths?.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                    {(!swotAnalysis.strengths || swotAnalysis.strengths.length === 0) && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">{t('results.swot.weaknesses', "Fraquezas")}</h3>
                  <ul className="list-disc list-inside">
                    {swotAnalysis.weaknesses?.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                    {(!swotAnalysis.weaknesses || swotAnalysis.weaknesses.length === 0) && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">{t('results.swot.opportunities', "Oportunidades")}</h3>
                  <ul className="list-disc list-inside">
                    {swotAnalysis.opportunities?.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                    {(!swotAnalysis.opportunities || swotAnalysis.opportunities.length === 0) && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">{t('results.swot.threats', "Ameaças")}</h3>
                  <ul className="list-disc list-inside">
                    {swotAnalysis.threats?.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                    {(!swotAnalysis.threats || swotAnalysis.threats.length === 0) && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhuma ameaça identificada")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="market" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('results.marketAnalysis', "Análise de Mercado")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.market.size', "Tamanho do Mercado")}</h3>
                  <p className="text-muted-foreground mb-4">{marketAnalysis.market_size || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.market.audience', "Perfil do Público-Alvo")}</h3>
                  <p className="text-muted-foreground mb-4">{marketAnalysis.target_audience || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.market.growth', "Potencial de Crescimento")}</h3>
                  <p className="text-muted-foreground mb-4">{marketAnalysis.growth_potential || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.market.barriers', "Barreiras de Entrada")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {marketAnalysis.barriers_to_entry?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                    {(!marketAnalysis.barriers_to_entry || marketAnalysis.barriers_to_entry.length === 0) && (
                      <li>{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="competitors" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('results.competitorAnalysis', "Análise de Concorrentes")}</h2>
              
              <h3 className="font-semibold mb-2">{t('results.competitors.keyCompetitors', "Principais Concorrentes")}</h3>
              <div className="mb-6">
                {competitorAnalysis.key_competitors?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {competitorAnalysis.key_competitors.map((competitor: string, i: number) => (
                      <div key={i} className="border rounded-lg p-4">
                        <p className="font-medium">{competitor}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t('results.noCompetitors', "Nenhum concorrente específico identificado")}</p>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.competitors.advantage', "Vantagem Competitiva")}</h3>
                  <p className="text-muted-foreground mb-4">{competitorAnalysis.competitive_advantage || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.competitors.gaps', "Lacunas de Mercado")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {competitorAnalysis.market_gaps?.map((gap: string, i: number) => (
                      <li key={i}>{gap}</li>
                    ))}
                    {(!competitorAnalysis.market_gaps || competitorAnalysis.market_gaps.length === 0) && (
                      <li>{t('results.noItems', "Nenhuma lacuna identificada")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('results.financialAnalysis', "Análise Financeira")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.financial.revenue', "Potencial de Receita")}</h3>
                  <p className="text-muted-foreground mb-4">{financialAnalysis.revenue_potential || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.financial.investment', "Investimento Inicial")}</h3>
                  <p className="text-muted-foreground mb-4">{financialAnalysis.initial_investment || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.financial.breakEven', "Estimativa de Break-Even")}</h3>
                  <p className="text-muted-foreground mb-4">{financialAnalysis.break_even_estimate || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.financial.funding', "Sugestões de Financiamento")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {financialAnalysis.funding_suggestions?.map((suggestion: string, i: number) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                    {(!financialAnalysis.funding_suggestions || financialAnalysis.funding_suggestions.length === 0) && (
                      <li>{t('results.noItems', "Nenhuma sugestão identificada")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('results.recommendationsTitle', "Recomendações")}</h2>
              
              <h3 className="font-semibold mb-2">{t('results.recommendations.actionItems', "Ações Recomendadas")}</h3>
              <div className="mb-6">
                <ul className="list-disc list-inside text-muted-foreground">
                  {recommendations.action_items?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                  {(!recommendations.action_items || recommendations.action_items.length === 0) && (
                    <li>{t('results.noItems', "Nenhuma ação recomendada")}</li>
                  )}
                </ul>
              </div>
              
              <h3 className="font-semibold mb-2">{t('results.recommendations.nextSteps', "Próximos Passos")}</h3>
              <div className="mb-6">
                <ul className="list-disc list-inside text-muted-foreground">
                  {recommendations.next_steps?.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                  {(!recommendations.next_steps || recommendations.next_steps.length === 0) && (
                    <li>{t('results.noItems', "Nenhum próximo passo identificado")}</li>
                  )}
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.recommendations.challenges', "Desafios Potenciais")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {recommendations.potential_challenges?.map((challenge: string, i: number) => (
                      <li key={i}>{challenge}</li>
                    ))}
                    {(!recommendations.potential_challenges || recommendations.potential_challenges.length === 0) && (
                      <li>{t('results.noItems', "Nenhum desafio identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.recommendations.resources', "Recursos Sugeridos")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {recommendations.suggested_resources?.map((resource: string, i: number) => (
                      <li key={i}>{resource}</li>
                    ))}
                    {(!recommendations.suggested_resources || recommendations.suggested_resources.length === 0) && (
                      <li>{t('results.noItems', "Nenhum recurso sugerido")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Mobile floating buttons */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-40">
          <div className="flex flex-col gap-2">
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-brand-purple hover:bg-brand-purple/90 h-12 w-12"
              onClick={() => {}} 
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-brand-purple hover:bg-brand-purple/90 h-12 w-12"
              onClick={() => {}} 
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
