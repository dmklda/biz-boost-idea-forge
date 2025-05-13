import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchIdeaAndAnalysis = async () => {
      if (!authState.isAuthenticated || !ideaId) {
        toast.error(t('results.missingData', "Dados insuficientes para mostrar resultados"));
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);

        // Fetch idea details
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', ideaId)
          .eq('user_id', authState.user?.id)
          .single();

        if (ideaError) {
          console.error("Error fetching idea:", ideaError);
          toast.error(t('results.fetchError', "Erro ao buscar detalhes da ideia"));
          navigate("/dashboard");
          return;
        }

        // Fetch analysis details
        const { data: analysisData, error: analysisError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('idea_id', ideaId)
          .eq('user_id', authState.user?.id)
          .single();

        if (analysisError) {
          console.error("Error fetching analysis:", analysisError);
          toast.error(t('results.analysisError', "Erro ao buscar análise da ideia"));
          navigate("/dashboard");
          return;
        }

        setIdea(ideaData);
        setAnalysis(analysisData);
      } catch (error) {
        console.error("Error in fetchIdeaAndAnalysis:", error);
        toast.error(t('results.generalError', "Ocorreu um erro ao carregar os resultados"));
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchIdeaAndAnalysis();
  }, [ideaId, authState, navigate, t]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!idea || !analysis) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('results.noData', "Dados não encontrados")}</h2>
            <p className="text-muted-foreground mb-6">
              {t('results.tryAgain', "Os resultados solicitados não foram encontrados. Tente analisar sua ideia novamente.")}
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              {t('results.backToDashboard', "Voltar ao Dashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formatar dados de análise para exibição
  const score = analysis.score || 0;
  const status = analysis.status || "Moderate";
  const swotAnalysis = analysis.swot_analysis || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  const marketAnalysis = analysis.market_analysis || {
    market_size: "",
    target_audience: "",
    growth_potential: "",
    barriers_to_entry: []
  };
  const competitorAnalysis = analysis.competitor_analysis || {
    key_competitors: [],
    competitive_advantage: "",
    market_gaps: []
  };
  const financialAnalysis = analysis.financial_analysis || {
    revenue_potential: "",
    initial_investment: "",
    break_even_estimate: "",
    funding_suggestions: []
  };
  const recommendations = analysis.recommendations || {
    action_items: [],
    next_steps: [],
    potential_challenges: [],
    suggested_resources: []
  };

  // Fix for TypeScript error - Using string casting for specific translation paths
  const statusTranslation = t(`results.status.${status.toLowerCase()}`, status) as string;
  
  return (
    <div className="pb-16 md:pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">{t('results.title', "Resultados da Análise")}</h1>
        
        <div className="flex gap-2">
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
          <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-6 text-white">
            <h1 className="text-xl md:text-2xl font-bold mb-2">{idea.title}</h1>
            <p className="text-white/80">{idea.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 bg-white">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-brand-blue">
                {score}%
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.viability', "Viabilidade")}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ 
                color: status === "Viable" ? "#16a34a" : 
                       status === "Moderate" ? "#ca8a04" : "#dc2626" 
              }}>
                {statusTranslation}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.status.label', "Status") as string}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-brand-green">
                {swotAnalysis.strengths?.length || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.strengths', "Pontos Fortes")}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">
                {swotAnalysis.weaknesses?.length || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.weaknesses', "Pontos Fracos")}</div>
            </div>
          </div>
          
          {/* Add Advanced Analysis Button */}
          {!loading && idea && analysis && (
            <div className="p-4 bg-gray-50 flex justify-center">
              <AdvancedAnalysisButton 
                ideaId={idea.id} 
                variant="default"
                className="bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="summary">{t('results.tabs.summary', "Resumo")}</TabsTrigger>
          <TabsTrigger value="swot">{t('results.tabs.swot', "SWOT")}</TabsTrigger>
          <TabsTrigger value="market">{t('results.tabs.market', "Mercado")}</TabsTrigger>
          <TabsTrigger value="competitors">{t('results.tabs.competitors', "Concorrentes")}</TabsTrigger>
          <TabsTrigger value="financial">{t('results.tabs.financial', "Financeiro")}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('results.tabs.recommendations', "Recomendações")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('results.summaryTitle', "Resumo da Análise")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.ideaDescription', "Descrição da Ideia")}</h3>
                  <p className="text-muted-foreground mb-4">{idea.description}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.targetAudience', "Público-Alvo")}</h3>
                  <p className="text-muted-foreground mb-4">{idea.audience || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.problemSolved', "Problema Resolvido")}</h3>
                  <p className="text-muted-foreground">{idea.problem || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.overallScore', "Pontuação Geral")}</h3>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {score}%
                    </div>
                    <div>
                      <p className="font-medium">{statusTranslation}</p>
                      <p className="text-sm text-muted-foreground">{t('results.scoreExplanation', "Baseado na análise geral da ideia")}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{t('results.keyStrengths', "Principais Pontos Fortes")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground mb-4">
                    {swotAnalysis.strengths?.slice(0, 3).map((strength: string, i: number) => (
                      <li key={i}>{strength}</li>
                    ))}
                    {(!swotAnalysis.strengths || swotAnalysis.strengths.length === 0) && (
                      <li>{t('results.noStrengths', "Nenhum ponto forte identificado")}</li>
                    )}
                  </ul>
                  
                  <h3 className="font-semibold mb-2">{t('results.keyWeaknesses', "Principais Pontos Fracos")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {swotAnalysis.weaknesses?.slice(0, 3).map((weakness: string, i: number) => (
                      <li key={i}>{weakness}</li>
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
      
      {/* Share button floating (mobile only) */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-40">
          <div className="flex flex-col gap-2">
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-brand-purple hover:bg-brand-purple/90 h-12 w-12"
              onClick={() => {}} // Add your share function here
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-brand-purple hover:bg-brand-purple/90 h-12 w-12"
              onClick={() => {}} // Add your download function here
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
