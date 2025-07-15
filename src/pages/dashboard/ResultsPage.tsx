
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Share2, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { AdvancedAnalysisButton } from "@/components/advanced-analysis";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend } from "recharts";
import { Tooltip as UITooltip, TooltipTrigger as UITooltipTrigger, TooltipContent as UITooltipContent } from "@/components/ui/tooltip";
import { Card as UICard } from "@/components/ui/card";
import { useMemo } from "react";

// Adicionar o ícone do Notion inline
const NotionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 268"><path fill="#FFF" d="M16.092 11.538 164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188Z"/><path d="M164.09.608 16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608ZM69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095l-1.819.125Zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921ZM212.377 89.53c1.034 4.681 0 9.362-4.681 9.897l-7.783 1.542v114.404c-6.758 3.637-12.981 5.715-18.18 5.715-8.308 0-10.386-2.604-16.609-10.396l-50.898-80.079v77.476l16.1 3.646s0 9.362-12.989 9.362l-35.814 2.077c-1.043-2.086 0-7.284 3.63-8.318l9.351-2.595V109.823l-12.98-1.052c-1.044-4.68 1.55-11.439 8.826-11.965l38.426-2.585 52.958 81.113v-71.76l-13.498-1.552c-1.043-5.733 3.111-9.896 8.3-10.404l35.84-2.087Z"/></svg>
);

const ResultsPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { id: ideaId } = useParams();
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const isMobile = useIsMobile();

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
          .order('created_at', { ascending: false });

        if (analysisError) {
          console.error("ResultsPage: Error fetching analysis:", analysisError);
          toast.error(t('results.analysisError', "Erro ao buscar análise da ideia"));
          setError("Erro ao carregar análise");
        } else if (!analysisData || analysisData.length === 0) {
          console.log("ResultsPage: No analysis found for idea:", ideaId);
          toast.error(t('results.noAnalysis', "Nenhuma análise encontrada para esta ideia"));
          setError("Nenhuma análise encontrada");
        } else {
          setAnalysis(analysisData[0]);
          setHistory(analysisData); // Salva todo o histórico
        }

        setIdea(ideaData);
      } catch (error) {
        console.error("ResultsPage: Unexpected error:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
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

  // Função para compartilhar análise
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/dashboard/resultados/${ideaId}`;
      if (navigator.share) {
        await navigator.share({
          title: idea?.title || t('results.title'),
          text: t('results.shareText', 'Confira minha análise de ideia!'),
          url: shareUrl
        });
        toast.success(t('results.shared', 'Link compartilhado!'));
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t('results.copied', 'Link copiado para área de transferência!'));
      }
    } catch (error) {
      toast.error(t('results.shareError', 'Erro ao compartilhar.'));
    }
  };

  // Função para exportar para Notion (apenas visual, sem integração real)
  const handleExportNotion = () => {
    toast.info("Exportação para Notion é um recurso premium. Assine para liberar!");
  };

  // Funções premium (PDF, CSV)
  const handlePremiumExport = () => {
    toast.info("Exportação disponível apenas para usuários premium.");
  };

  // Exemplo para ação que demanda crédito:
  const handleCreditFeature = () => {
    toast.error("Você precisa de créditos para acessar esta funcionalidade. Adquira créditos ou faça upgrade!");
  };

  // Safe parsing of analysis data with fallbacks
  const score = analysis?.score || 0;
  const status = analysis?.status || "Moderate";
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

  // Dados para gráfico de barras SWOT (mover para depois de swotAnalysis)
  const swotBarData = useMemo(() => [
    { name: t('results.swot.strengths', 'Forças'), value: safeGetArray(swotAnalysis, 'strengths').length },
    { name: t('results.swot.weaknesses', 'Fraquezas'), value: safeGetArray(swotAnalysis, 'weaknesses').length },
    { name: t('results.swot.opportunities', 'Oportunidades'), value: safeGetArray(swotAnalysis, 'opportunities').length },
    { name: t('results.swot.threats', 'Ameaças'), value: safeGetArray(swotAnalysis, 'threats').length },
  ], [swotAnalysis, t]);

  // Dados para gráfico de evolução do score
  const scoreHistoryData = useMemo(() =>
    history.map((item) => ({
      date: new Date(item.created_at).toLocaleDateString(),
      score: item.score || 0,
      status: item.status || '',
    })),
    [history]
  );

  // Dados para comparação de histórico
  const handleSelectHistory = (item: any) => {
    setSelectedHistory((prev) => {
      if (prev.find((h) => h.id === item.id)) {
        return prev.filter((h) => h.id !== item.id);
      }
      if (prev.length === 2) {
        return [prev[1], item];
      }
      return [...prev, item];
    });
  };

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
            onClick={() => navigate("/dashboard/ideias")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back', "Voltar")}</span>
          </Button>
          <h1 className="text-xl md:text-2xl font-bold truncate">
            {t('results.title', "Resultados da Análise")}
          </h1>
        </div>
        
        <div className="flex gap-2 flex-wrap mb-4">
          {/* Compartilhar - sempre ativo */}
          <UITooltip>
            <UITooltipTrigger asChild>
              <span>
                <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </span>
            </UITooltipTrigger>
            <UITooltipContent>Compartilhar análise</UITooltipContent>
          </UITooltip>

          {/* Exportar CSV - premium */}
          {isMobile ? (
            <span
              onClick={() => toast.info("Exportação disponível apenas para usuários premium.")}
              style={{ display: 'inline-flex' }}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2" disabled tabIndex={0}>
                <FileText className="h-4 w-4" />
                <span className="sr-only">Exportar CSV</span>
              </Button>
            </span>
          ) : (
            <UITooltip>
              <UITooltipTrigger asChild>
                <span>
                  <Button variant="outline" size="default" className="flex items-center gap-2" disabled>
                    <FileText className="h-4 w-4" />
                  </Button>
                </span>
              </UITooltipTrigger>
              <UITooltipContent>Exportar CSV (premium)</UITooltipContent>
            </UITooltip>
          )}

          {/* Exportar para Notion - em breve */}
          {isMobile ? (
            <span
              onClick={() => toast.info("Exportação para Notion em breve!")}
              style={{ display: 'inline-flex' }}
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2" disabled tabIndex={0}>
                <NotionIcon />
                <span className="sr-only">Exportar para Notion</span>
              </Button>
            </span>
          ) : (
            <UITooltip>
              <UITooltipTrigger asChild>
                <span>
                  <Button variant="outline" size="default" className="flex items-center gap-2" disabled>
                    <NotionIcon />
                  </Button>
                </span>
              </UITooltipTrigger>
              <UITooltipContent>Exportar para Notion (em breve!)</UITooltipContent>
            </UITooltip>
          )}
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
                {safeGetArray(swotAnalysis, 'strengths').length || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('results.strengths', "Pontos Fortes")}</div>
            </div>
            <div className="p-3 md:p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-red-500">
                {safeGetArray(swotAnalysis, 'weaknesses').length || 0}
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
                    {safeGetArray(swotAnalysis, 'strengths').slice(0, 3).map((strength: string, i: number) => (
                      <li key={i} className="break-words">{strength}</li>
                    ))}
                    {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                      <li>{t('results.noStrengths', "Nenhum ponto forte identificado")}</li>
                    )}
                  </ul>
                  
                  <h3 className="font-semibold mb-2">{t('results.keyWeaknesses', "Principais Pontos Fracos")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {safeGetArray(swotAnalysis, 'weaknesses').slice(0, 3).map((weakness: string, i: number) => (
                      <li key={i} className="break-words">{weakness}</li>
                    ))}
                    {safeGetArray(swotAnalysis, 'weaknesses').length === 0 && (
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
                    {safeGetArray(swotAnalysis, 'strengths').map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground break-words">{item}</li>
                    ))}
                    {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">{t('results.swot.weaknesses', "Fraquezas")}</h3>
                  <ul className="list-disc list-inside">
                    {safeGetArray(swotAnalysis, 'weaknesses').map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground break-words">{item}</li>
                    ))}
                    {safeGetArray(swotAnalysis, 'weaknesses').length === 0 && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">{t('results.swot.opportunities', "Oportunidades")}</h3>
                  <ul className="list-disc list-inside">
                    {safeGetArray(swotAnalysis, 'opportunities').map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground break-words">{item}</li>
                    ))}
                    {safeGetArray(swotAnalysis, 'opportunities').length === 0 && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhum item identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">{t('results.swot.threats', "Ameaças")}</h3>
                  <ul className="list-disc list-inside">
                    {safeGetArray(swotAnalysis, 'threats').map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground break-words">{item}</li>
                    ))}
                    {safeGetArray(swotAnalysis, 'threats').length === 0 && (
                      <li className="text-muted-foreground">{t('results.noItems', "Nenhuma ameaça identificada")}</li>
                    )}
                  </ul>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4">{t('results.swotRadar', 'Radar SWOT')}</h2>
              <div className="w-full h-72 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { category: t('results.swot.strengths', 'Forças'), value: safeGetArray(swotAnalysis, 'strengths').length },
                    { category: t('results.swot.weaknesses', 'Fraquezas'), value: safeGetArray(swotAnalysis, 'weaknesses').length },
                    { category: t('results.swot.opportunities', 'Oportunidades'), value: safeGetArray(swotAnalysis, 'opportunities').length },
                    { category: t('results.swot.threats', 'Ameaças'), value: safeGetArray(swotAnalysis, 'threats').length },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar name="SWOT" dataKey="value" stroke="#7E69AB" fill="#9b87f5" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
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
                  <p className="text-muted-foreground mb-4 break-words">{marketAnalysis.market_size || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.market.audience', "Perfil do Público-Alvo")}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{marketAnalysis.target_audience || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.market.growth', "Potencial de Crescimento")}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{marketAnalysis.growth_potential || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.market.barriers', "Barreiras de Entrada")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {safeGetArray(marketAnalysis, 'barriers_to_entry').map((item: string, i: number) => (
                      <li key={i} className="break-words">{item}</li>
                    ))}
                    {safeGetArray(marketAnalysis, 'barriers_to_entry').length === 0 && (
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
                {safeGetArray(competitorAnalysis, 'key_competitors').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {safeGetArray(competitorAnalysis, 'key_competitors').map((competitor: string, i: number) => (
                      <div key={i} className="border rounded-lg p-4">
                        <p className="font-medium break-words">{competitor}</p>
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
                  <p className="text-muted-foreground mb-4 break-words">{competitorAnalysis.competitive_advantage || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.competitors.gaps', "Lacunas de Mercado")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {safeGetArray(competitorAnalysis, 'market_gaps').map((gap: string, i: number) => (
                      <li key={i} className="break-words">{gap}</li>
                    ))}
                    {safeGetArray(competitorAnalysis, 'market_gaps').length === 0 && (
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
                  <p className="text-muted-foreground mb-4 break-words">{financialAnalysis.revenue_potential || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.financial.investment', "Investimento Inicial")}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{financialAnalysis.initial_investment || t('results.notSpecified', "Não especificado")}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.financial.breakEven', "Estimativa de Break-Even")}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{financialAnalysis.break_even_estimate || t('results.notSpecified', "Não especificado")}</p>
                  
                  <h3 className="font-semibold mb-2">{t('results.financial.funding', "Sugestões de Financiamento")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {safeGetArray(financialAnalysis, 'funding_suggestions').map((suggestion: string, i: number) => (
                      <li key={i} className="break-words">{suggestion}</li>
                    ))}
                    {safeGetArray(financialAnalysis, 'funding_suggestions').length === 0 && (
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
                  {safeGetArray(recommendations, 'action_items').map((item: string, i: number) => (
                    <li key={i} className="break-words">{item}</li>
                  ))}
                  {safeGetArray(recommendations, 'action_items').length === 0 && (
                    <li>{t('results.noItems', "Nenhuma ação recomendada")}</li>
                  )}
                </ul>
              </div>
              
              <h3 className="font-semibold mb-2">{t('results.recommendations.nextSteps', "Próximos Passos")}</h3>
              <div className="mb-6">
                <ul className="list-disc list-inside text-muted-foreground">
                  {safeGetArray(recommendations, 'next_steps').map((step: string, i: number) => (
                    <li key={i} className="break-words">{step}</li>
                  ))}
                  {safeGetArray(recommendations, 'next_steps').length === 0 && (
                    <li>{t('results.noItems', "Nenhum próximo passo identificado")}</li>
                  )}
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('results.recommendations.challenges', "Desafios Potenciais")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {safeGetArray(recommendations, 'potential_challenges').map((challenge: string, i: number) => (
                      <li key={i} className="break-words">{challenge}</li>
                    ))}
                    {safeGetArray(recommendations, 'potential_challenges').length === 0 && (
                      <li>{t('results.noItems', "Nenhum desafio identificado")}</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{t('results.recommendations.resources', "Recursos Sugeridos")}</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {safeGetArray(recommendations, 'suggested_resources').map((resource: string, i: number) => (
                      <li key={i} className="break-words">{resource}</li>
                    ))}
                    {safeGetArray(recommendations, 'suggested_resources').length === 0 && (
                      <li>{t('results.noItems', "Nenhum recurso sugerido")}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Gráfico de evolução do score */}
      {scoreHistoryData.length > 1 && (
        <UICard className="mb-6 p-4">
          <h2 className="text-lg font-semibold mb-2">{t('results.scoreEvolution', 'Evolução do Score')}</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#7E69AB" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </UICard>
      )}

      {/* Gráfico de barras SWOT */}
      <UICard className="mb-6 p-4">
        <h2 className="text-lg font-semibold mb-2">{t('results.swotBar', 'Resumo SWOT')}</h2>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={swotBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="name" />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#9b87f5" barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </UICard>

      {/* Cards de recomendações */}
      {safeGetArray(recommendations, 'action_items').length > 0 && (
        <UICard className="mb-6 p-4">
          <h2 className="text-lg font-semibold mb-2">{t('results.recommendations', 'Recomendações Principais')}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {safeGetArray(recommendations, 'action_items').map((item: string, idx: number) => (
              <div key={idx} className="bg-brand-blue/10 border-l-4 border-brand-blue rounded p-3 text-brand-blue font-medium">
                {item}
              </div>
            ))}
          </div>
        </UICard>
      )}

      {/* Checklist de próximos passos */}
      {safeGetArray(recommendations, 'next_steps').length > 0 && (
        <UICard className="mb-6 p-4">
          <h2 className="text-lg font-semibold mb-2">{t('results.nextSteps', 'Próximos Passos')}</h2>
          <ul className="space-y-2">
            {safeGetArray(recommendations, 'next_steps').map((step: string, idx: number) => (
              <li key={idx} className="flex items-center gap-2">
                <input type="checkbox" disabled className="accent-brand-blue" aria-label={t('results.nextStepCheckbox', 'Marcar próximo passo como concluído')} />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </UICard>
      )}

      {/* Comparação de histórico */}
      {history.length > 1 && (
        <UICard className="mb-6 p-4">
          <h2 className="text-lg font-semibold mb-2">{t('results.compareHistory', 'Comparar Análises')}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {history.map((item) => (
              <Button key={item.id} size="sm" variant={selectedHistory.find((h) => h.id === item.id) ? "default" : "outline"} onClick={() => handleSelectHistory(item)}>
                {new Date(item.created_at).toLocaleDateString()} - {item.score}%
              </Button>
            ))}
          </div>
          {selectedHistory.length === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedHistory.map((item, idx) => {
                const swot = safeParseJSON(item.swot_analysis, { strengths: [], weaknesses: [], opportunities: [], threats: [] });
                return (
                  <UICard key={item.id} className="p-4 border shadow-sm">
                    <div className="font-bold mb-2">{t('results.analysis', 'Análise')} {idx + 1}</div>
                    <div className="mb-2">Score: <span className={item.score >= 70 ? 'text-green-600' : item.score >= 40 ? 'text-yellow-600' : 'text-red-600'}>{item.score}</span></div>
                    <div className="mb-2">Status: {item.status}</div>
                    <div className="mb-2">Forças: {safeGetArray(swot, 'strengths').length}</div>
                    <div className="mb-2">Fraquezas: {safeGetArray(swot, 'weaknesses').length}</div>
                    <div className="mb-2">Oportunidades: {safeGetArray(swot, 'opportunities').length}</div>
                    <div className="mb-2">Ameaças: {safeGetArray(swot, 'threats').length}</div>
                  </UICard>
                );
              })}
            </div>
          )}
        </UICard>
      )}

      {/* Adiciona a seção de histórico de análises */}
      <div className="my-8">
        <h2 className="text-lg font-semibold mb-4">Histórico de Análises</h2>
        {history.length > 1 ? (
          <div className="space-y-2">
            {history.map((item, idx) => (
              <Card key={item.id} className="border shadow-sm">
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div>
                    <div className="font-medium">Score: <span className={item.score >= 70 ? 'text-green-600' : item.score >= 40 ? 'text-yellow-600' : 'text-red-600'}>{item.score}</span></div>
                    <div className="text-xs text-muted-foreground">Status: {item.status}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setAnalysis(item)}>
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Nenhum histórico anterior encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
