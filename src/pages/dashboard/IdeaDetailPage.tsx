
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Edit, Trash2, Star, Calendar, Target, DollarSign, MapPin, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/sonner";
import { FavoriteButton, TagsSelector } from "@/components/ideas";
import { AdvancedAnalysisModal } from "@/components/advanced-analysis";

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
    if (!confirm("Tem certeza que deseja excluir esta ideia?")) return;

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id);

      if (error) throw error;

      toast.success("Ideia excluída com sucesso");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Erro ao excluir ideia");
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
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar ideia</h2>
            <p className="text-muted-foreground mb-6">
              {error || "A ideia solicitada não foi encontrada."}
            </p>
            <Button onClick={() => navigate("/dashboard")}>
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
    <div className="pb-16 md:pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <h1 className="text-xl md:text-2xl font-bold truncate">
          Detalhes da Ideia
        </h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg md:text-xl break-words">
                  {idea.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                  </Badge>
                  {analysis && (
                    <Badge variant="outline" className="text-xs">
                      {analysis.score}% viabilidade
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton
                  ideaId={idea.id}
                  isFavorite={false}
                  size="default"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {analysis ? "Ver Análise" : "Analisar"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 break-words leading-relaxed">
              {idea.description}
            </p>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Tags:</h4>
              <TagsSelector
                ideaId={idea.id}
                onTagsChange={(tags) => handleTagsUpdate(tags.map(t => t.name))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {idea.audience && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Público-alvo</p>
                    <p className="text-sm text-muted-foreground break-words">{idea.audience}</p>
                  </div>
                </div>
              )}
              
              {idea.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Orçamento</p>
                    <p className="text-sm text-muted-foreground">R$ {idea.budget}</p>
                  </div>
                </div>
              )}
              
              {idea.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Localização</p>
                    <p className="text-sm text-muted-foreground break-words">{idea.location}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6 overflow-x-auto">
              <TabsTrigger value="summary" className="text-xs sm:text-sm">Resumo</TabsTrigger>
              <TabsTrigger value="swot" className="text-xs sm:text-sm">SWOT</TabsTrigger>
              <TabsTrigger value="market" className="text-xs sm:text-sm">Mercado</TabsTrigger>
              <TabsTrigger value="competitors" className="text-xs sm:text-sm">Concorrentes</TabsTrigger>
              <TabsTrigger value="financial" className="text-xs sm:text-sm">Financeiro</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs sm:text-sm">Recomendações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Resumo da Análise</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Pontuação Geral</h4>
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center text-white text-xl font-bold mr-4">
                          {analysis.score}%
                        </div>
                        <div>
                          <p className="font-medium">{analysis.status}</p>
                          <p className="text-sm text-muted-foreground">Status da análise</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Principais Pontos Fortes</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {safeGetArray(swotAnalysis, 'strengths').slice(0, 3).map((strength: string, i: number) => (
                          <li key={i} className="break-words">{strength}</li>
                        ))}
                        {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                          <li>Nenhum ponto forte identificado</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="swot">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Análise SWOT</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Forças</h4>
                      <ul className="list-disc list-inside text-sm">
                        {safeGetArray(swotAnalysis, 'strengths').map((item: string, i: number) => (
                          <li key={i} className="text-muted-foreground break-words">{item}</li>
                        ))}
                        {safeGetArray(swotAnalysis, 'strengths').length === 0 && (
                          <li className="text-muted-foreground">Nenhum item identificado</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Fraquezas</h4>
                      <ul className="list-disc list-inside text-sm">
                        {safeGetArray(swotAnalysis, 'weaknesses').map((item: string, i: number) => (
                          <li key={i} className="text-muted-foreground break-words">{item}</li>
                        ))}
                        {safeGetArray(swotAnalysis, 'weaknesses').length === 0 && (
                          <li className="text-muted-foreground">Nenhum item identificado</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Oportunidades</h4>
                      <ul className="list-disc list-inside text-sm">
                        {safeGetArray(swotAnalysis, 'opportunities').map((item: string, i: number) => (
                          <li key={i} className="text-muted-foreground break-words">{item}</li>
                        ))}
                        {safeGetArray(swotAnalysis, 'opportunities').length === 0 && (
                          <li className="text-muted-foreground">Nenhum item identificado</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Ameaças</h4>
                      <ul className="list-disc list-inside text-sm">
                        {safeGetArray(swotAnalysis, 'threats').map((item: string, i: number) => (
                          <li key={i} className="text-muted-foreground break-words">{item}</li>
                        ))}
                        {safeGetArray(swotAnalysis, 'threats').length === 0 && (
                          <li className="text-muted-foreground">Nenhuma ameaça identificada</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Análise de Mercado</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Tamanho do Mercado</h4>
                      <p className="text-sm text-muted-foreground mb-4 break-words">
                        {marketAnalysis.market_size || "Não especificado"}
                      </p>
                      
                      <h4 className="font-medium mb-2">Perfil do Público-Alvo</h4>
                      <p className="text-sm text-muted-foreground break-words">
                        {marketAnalysis.target_audience || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Potencial de Crescimento</h4>
                      <p className="text-sm text-muted-foreground mb-4 break-words">
                        {marketAnalysis.growth_potential || "Não especificado"}
                      </p>
                      
                      <h4 className="font-medium mb-2">Barreiras de Entrada</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {safeGetArray(marketAnalysis, 'barriers_to_entry').map((item: string, i: number) => (
                          <li key={i} className="break-words">{item}</li>
                        ))}
                        {safeGetArray(marketAnalysis, 'barriers_to_entry').length === 0 && (
                          <li>Nenhum item identificado</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Análise de Concorrentes</h3>
                  
                  <h4 className="font-medium mb-2">Principais Concorrentes</h4>
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
                      <p className="text-sm text-muted-foreground">Nenhum concorrente específico identificado</p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Vantagem Competitiva</h4>
                      <p className="text-sm text-muted-foreground break-words">
                        {competitorAnalysis.competitive_advantage || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Lacunas de Mercado</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {safeGetArray(competitorAnalysis, 'market_gaps').map((gap: string, i: number) => (
                          <li key={i} className="break-words">{gap}</li>
                        ))}
                        {safeGetArray(competitorAnalysis, 'market_gaps').length === 0 && (
                          <li>Nenhuma lacuna identificada</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Análise Financeira</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Potencial de Receita</h4>
                      <p className="text-sm text-muted-foreground mb-4 break-words">
                        {financialAnalysis.revenue_potential || "Não especificado"}
                      </p>
                      
                      <h4 className="font-medium mb-2">Investimento Inicial</h4>
                      <p className="text-sm text-muted-foreground break-words">
                        {financialAnalysis.initial_investment || "Não especificado"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Estimativa de Break-Even</h4>
                      <p className="text-sm text-muted-foreground mb-4 break-words">
                        {financialAnalysis.break_even_estimate || "Não especificado"}
                      </p>
                      
                      <h4 className="font-medium mb-2">Sugestões de Financiamento</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {safeGetArray(financialAnalysis, 'funding_suggestions').map((suggestion: string, i: number) => (
                          <li key={i} className="break-words">{suggestion}</li>
                        ))}
                        {safeGetArray(financialAnalysis, 'funding_suggestions').length === 0 && (
                          <li>Nenhuma sugestão identificada</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recomendações</h3>
                  
                  <h4 className="font-medium mb-2">Ações Recomendadas</h4>
                  <div className="mb-6">
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {safeGetArray(recommendations, 'action_items').map((item: string, i: number) => (
                        <li key={i} className="break-words">{item}</li>
                      ))}
                      {safeGetArray(recommendations, 'action_items').length === 0 && (
                        <li>Nenhuma ação recomendada</li>
                      )}
                    </ul>
                  </div>
                  
                  <h4 className="font-medium mb-2">Próximos Passos</h4>
                  <div className="mb-6">
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {safeGetArray(recommendations, 'next_steps').map((step: string, i: number) => (
                        <li key={i} className="break-words">{step}</li>
                      ))}
                      {safeGetArray(recommendations, 'next_steps').length === 0 && (
                        <li>Nenhum próximo passo identificado</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Desafios Potenciais</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {safeGetArray(recommendations, 'potential_challenges').map((challenge: string, i: number) => (
                          <li key={i} className="break-words">{challenge}</li>
                        ))}
                        {safeGetArray(recommendations, 'potential_challenges').length === 0 && (
                          <li>Nenhum desafio identificado</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recursos Sugeridos</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {safeGetArray(recommendations, 'suggested_resources').map((resource: string, i: number) => (
                          <li key={i} className="break-words">{resource}</li>
                        ))}
                        {safeGetArray(recommendations, 'suggested_resources').length === 0 && (
                          <li>Nenhum recurso sugerido</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {analysis && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowAdvancedAnalysis(true)}
                  className="bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Análise Avançada
                </Button>
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
    </div>
  );
};

export default IdeaDetailPage;
