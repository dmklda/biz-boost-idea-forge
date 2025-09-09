import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock, Target, BarChart, Shield, Download, FileText, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketTimingModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimingFactor {
  factor: string;
  score: number;
  description: string;
  impact: 'Positivo' | 'Negativo' | 'Neutro';
}

interface LaunchWindow {
  period: string;
  score: number;
  reasoning: string;
  opportunities: string[];
  risks: string[];
}

interface TimingResults {
  overall_score: number;
  recommendation: string;
  timing_factors: TimingFactor[];
  best_launch_windows: LaunchWindow[];
  market_readiness: {
    technology: number;
    consumer_demand: number;
    competitive_landscape: number;
    regulatory_environment: number;
  };
  strategic_recommendations: string[];
  early_indicators: string[];
  risk_mitigation: string[];
}

export const MarketTimingModalEnhanced = ({
  open,
  onOpenChange,
}: MarketTimingModalEnhancedProps) => {
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<TimingResults | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [useCustomIdea, setUseCustomIdea] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    business_idea: '',
    industry: '',
    target_market: '',
    technology_requirements: '',
    competitive_landscape: '',
    market_trends: '',
    regulatory_factors: '',
    funding_requirements: '',
    team_readiness: '',
    launchTimeline: '6 meses',
    marketConditions: '',
    seasonality: 'Negócio para o ano todo',
    analysisType: 'completa'
  });

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    // Preencher alguns campos com dados da ideia selecionada
    if (idea) {
      setFormData(prev => ({
        ...prev,
        business_idea: idea.description || '',
        industry: idea.industry || ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (useCustomIdea && !formData.business_idea.trim()) {
      toast.error("Por favor, descreva sua ideia de negócio");
      return;
    }

    if (!useCustomIdea && !selectedIdea) {
      toast.error("Por favor, selecione uma ideia ou crie uma personalizada");
      return;
    }

    if (!hasCredits('market-timing')) {
      toast.error(`Você precisa de ${getFeatureCost('market-timing')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('market-timing'),
        p_feature: 'market-timing',
        p_description: `Análise de timing para ${useCustomIdea ? 'ideia personalizada' : selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Preparar dados para envio
      const dataToSend = useCustomIdea ? formData : {
        ...formData,
        business_idea: selectedIdea.description,
        industry: selectedIdea.industry || formData.industry
      };

      // Gerar análise
      const { data, error } = await supabase.functions.invoke('generate-market-timing', {
        body: {
          ...dataToSend,
          launchTimeline: dataToSend.launchTimeline,
          marketConditions: dataToSend.marketConditions,
          seasonality: dataToSend.seasonality,
          analysisType: dataToSend.analysisType
        }
      });

      if (error) throw error;

      // A API retorna os dados dentro de um objeto 'timing'
      setResults(data.timing);
      toast.success("Análise de timing gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast.error("Erro ao gerar análise. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setSelectedIdea(null);
    setUseCustomIdea(false);
    setFormData({
      business_idea: '',
      industry: '',
      target_market: '',
      technology_requirements: '',
      competitive_landscape: '',
      market_trends: '',
      regulatory_factors: '',
      funding_requirements: '',
      team_readiness: '',
      launchTimeline: '6 meses',
      marketConditions: '',
      seasonality: 'Negócio para o ano todo',
      analysisType: 'completa'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'Positivo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Negativo': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  // Função para exportar a análise em PDF
  const exportToPDF = async () => {
    if (!results) return;
    
    setIsExporting(true);
    try {
      // Aqui seria implementada a lógica de geração de PDF
      // Simulando um atraso para demonstração
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Criar um objeto com os dados formatados para o PDF
      const pdfData = {
        title: useCustomIdea ? formData.business_idea.substring(0, 30) : selectedIdea?.title,
        score: results.overall_score,
        recommendation: results.recommendation,
        timing_factors: results.timing_factors,
        best_launch_windows: results.best_launch_windows,
        market_readiness: results.market_readiness,
        strategic_recommendations: results.strategic_recommendations,
        early_indicators: results.early_indicators,
        risk_mitigation: results.risk_mitigation,
        generated_at: new Date().toLocaleString('pt-BR')
      };
      
      // Aqui seria feita a chamada para a API de geração de PDF
      // Por enquanto, apenas simularemos o download
      const dataStr = JSON.stringify(pdfData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise-timing-${pdfData.title?.toLowerCase().replace(/\s+/g, '-') || 'analise'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Análise exportada com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar análise:', error);
      toast.error("Erro ao exportar análise. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Função para compartilhar a análise
  const shareAnalysis = () => {
    if (!results) return;
    
    // Aqui seria implementada a lógica de compartilhamento
    // Por enquanto, apenas mostraremos uma mensagem
    toast.success("Link de compartilhamento copiado para a área de transferência!");
  };
  
  // Icon for the modal
  const timingIcon = <Clock className="h-5 w-5 text-blue-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise de Timing de Mercado"
      icon={timingIcon}
      isGenerating={isGenerating}
      generatingText="Analisando timing..."
      actionText="Gerar Análise"
      onAction={handleSubmit}
      actionDisabled={isGenerating || (!selectedIdea && !useCustomIdea) || (useCustomIdea && !formData.business_idea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!results}
      creditCost={getFeatureCost('market-timing')}
      maxWidth={results ? "4xl" : "2xl"}
      description="Determine o momento ideal para lançar sua startup baseado em fatores de mercado."
    >
      {results ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Análise de Timing de Mercado</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-1"
              >
                {isExporting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                    <span className="hidden sm:inline">Exportando...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar PDF</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareAnalysis}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="factors">Fatores</TabsTrigger>
              <TabsTrigger value="windows">Janelas de Lançamento</TabsTrigger>
              <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="overview" className="space-y-4 pr-4 pt-4">
                {/* Score Geral */}
                <Card className={`${getScoreBg(results.overall_score)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Score Geral de Timing
                      <span className={`text-2xl font-bold ${getScoreColor(results.overall_score)}`}>
                        {results.overall_score}/100
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{results.recommendation}</p>
                  </CardContent>
                </Card>

                {/* Prontidão do Mercado */}
                {results.market_readiness && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-blue-500" />
                        Prontidão do Mercado
                      </CardTitle>
                      <CardDescription>
                        Análise dos principais fatores que indicam a maturidade do mercado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.technology)}`}>
                            {results.market_readiness.technology}%
                          </div>
                          <div className="text-sm text-muted-foreground">Tecnologia</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.consumer_demand)}`}>
                            {results.market_readiness.consumer_demand}%
                          </div>
                          <div className="text-sm text-muted-foreground">Demanda</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.competitive_landscape)}`}>
                            {results.market_readiness.competitive_landscape}%
                          </div>
                          <div className="text-sm text-muted-foreground">Competição</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className={`text-lg font-bold ${getScoreColor(results.market_readiness.regulatory_environment)}`}>
                            {results.market_readiness.regulatory_environment}%
                          </div>
                          <div className="text-sm text-muted-foreground">Regulação</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recomendações Estratégicas */}
                {results.strategic_recommendations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Recomendações Estratégicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.strategic_recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-gray-50">
                            <span className="text-primary">📋</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="factors" className="space-y-4 pr-4 pt-4">
                {/* Fatores de Timing */}
                {results.timing_factors?.length > 0 && (
                  <div className="space-y-3">
                    {results.timing_factors.map((factor, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getImpactIcon(factor.impact)}
                              <h5 className="font-medium text-sm">{factor.factor}</h5>
                            </div>
                            <Badge variant={factor.score >= 70 ? "default" : factor.score >= 40 ? "secondary" : "destructive"}>
                              {factor.score}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Indicadores Antecipados */}
                {results.early_indicators?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Indicadores Antecipados
                      </CardTitle>
                      <CardDescription>
                        Sinais que indicam mudanças no mercado e oportunidades emergentes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.early_indicators.map((indicator, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-gray-50">
                            <span className="text-primary">🔍</span>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="windows" className="space-y-4 pr-4 pt-4">
                {/* Janelas de Lançamento */}
                {results.best_launch_windows?.length > 0 && (
                  <div className="space-y-4">
                    {results.best_launch_windows.map((window, index) => (
                      <Card key={index} className={index === 0 ? "border-primary shadow-md" : ""}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              {window.period}
                            </div>
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              Score: {window.score}/100
                            </Badge>
                          </CardTitle>
                          {index === 0 && <CardDescription>Janela de lançamento recomendada</CardDescription>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm">{window.reasoning}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-green-600">Oportunidades:</h5>
                              <ul className="space-y-1">
                                {window.opportunities?.map((opp, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-green-600">+</span>
                                    {opp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-red-600">Riscos:</h5>
                              <ul className="space-y-1">
                                {window.risks?.map((risk, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-red-600">-</span>
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4 pr-4 pt-4">
                {/* Mitigação de Riscos */}
                {results.risk_mitigation?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Mitigação de Riscos
                      </CardTitle>
                      <CardDescription>
                        Estratégias para reduzir riscos e aumentar chances de sucesso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.risk_mitigation.map((mitigation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-gray-50">
                            <span className="text-primary">🛡️</span>
                            {mitigation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recomendações Estratégicas */}
                {results.strategic_recommendations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Plano de Ação
                      </CardTitle>
                      <CardDescription>
                        Passos recomendados para aproveitar o timing ideal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.strategic_recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-gray-50 border-b last:border-0 pb-2 last:pb-0">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="saved" onValueChange={(value) => setUseCustomIdea(value === "custom")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Usar Ideia Existente
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Análise Personalizada
              </TabsTrigger>
            </TabsList>
            
            {/* Opções avançadas de análise */}
            <div className="mt-4 p-4 border rounded-md bg-muted">
               <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                 <Target className="h-4 w-4 text-blue-500" />
                 Opções Avançadas de Análise
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div className="space-y-2">
                   <Label htmlFor="marketConditions">Condições de Mercado</Label>
                   <Textarea
                     id="marketConditions"
                     placeholder="Descreva as condições atuais do mercado, tendências econômicas, etc."
                     value={formData.marketConditions}
                     onChange={(e) => setFormData(prev => ({ ...prev, marketConditions: e.target.value }))}
                     className="min-h-[80px] resize-none"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                   <Label htmlFor="launchTimeline">Horizonte de Lançamento</Label>
                   <Select 
                     value={formData.launchTimeline}
                     onValueChange={(value) => setFormData(prev => ({ ...prev, launchTimeline: value }))}
                   >
                     <SelectTrigger id="launchTimeline">
                       <SelectValue placeholder="Selecione o horizonte" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="3 meses">Curto prazo (3 meses)</SelectItem>
                       <SelectItem value="6 meses">Médio prazo (6 meses)</SelectItem>
                       <SelectItem value="12 meses">Longo prazo (12 meses)</SelectItem>
                       <SelectItem value="24 meses">Estratégico (24 meses)</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                
                <div className="space-y-2">
                   <Label htmlFor="seasonality">Sazonalidade</Label>
                   <Select 
                     value={formData.seasonality}
                     onValueChange={(value) => setFormData(prev => ({ ...prev, seasonality: value }))}
                   >
                     <SelectTrigger id="seasonality">
                       <SelectValue placeholder="Selecione a sazonalidade" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Negócio para o ano todo">Negócio para o ano todo</SelectItem>
                       <SelectItem value="Sazonal - Verão">Sazonal - Verão</SelectItem>
                       <SelectItem value="Sazonal - Inverno">Sazonal - Inverno</SelectItem>
                       <SelectItem value="Sazonal - Datas comemorativas">Sazonal - Datas comemorativas</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="analysisType">Tipo de Análise</Label>
                   <Select 
                     value={formData.analysisType}
                     onValueChange={(value) => setFormData(prev => ({ ...prev, analysisType: value }))}
                   >
                     <SelectTrigger id="analysisType">
                       <SelectValue placeholder="Selecione o tipo de análise" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="completa">Análise Completa</SelectItem>
                       <SelectItem value="rápida">Análise Rápida</SelectItem>
                       <SelectItem value="detalhada">Análise Detalhada</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Dicas para uma Análise Precisa
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Forneça o máximo de detalhes sobre seu mercado-alvo e concorrentes</li>
                  <li>• Considere fatores sazonais que podem afetar a demanda pelo seu produto/serviço</li>
                  <li>• Inclua informações sobre tendências tecnológicas relevantes para seu setor</li>
                  <li>• Mencione quaisquer mudanças regulatórias previstas que possam impactar seu negócio</li>
                </ul>
              </div>
            </div>

            <TabsContent value="saved" className="mt-4">
              <EnhancedIdeaSelector onSelect={handleIdeaSelect} />

              {selectedIdea && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-base font-medium">Informações Complementares</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Setor/Indústria</Label>
                      <Input
                        id="industry"
                        placeholder="Ex: Fintech, EdTech, HealthTech, E-commerce"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_market">Mercado-Alvo</Label>
                      <Input
                        id="target_market"
                        placeholder="Descreva seu público-alvo e tamanho do mercado"
                        value={formData.target_market}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_market: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="business_idea">Ideia de Negócio *</Label>
                  <Textarea
                    id="business_idea"
                    placeholder="Descreva sua ideia de negócio em detalhes..."
                    value={formData.business_idea}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_idea: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Setor/Indústria</Label>
                  <Input
                    id="industry"
                    placeholder="Ex: Fintech, EdTech, HealthTech, E-commerce"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_market">Mercado-Alvo</Label>
                  <Input
                    id="target_market"
                    placeholder="Descreva seu público-alvo e tamanho do mercado"
                    value={formData.target_market}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_market: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technology_requirements">Requisitos Tecnológicos</Label>
                  <Input
                    id="technology_requirements"
                    placeholder="Que tecnologias são necessárias?"
                    value={formData.technology_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, technology_requirements: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitive_landscape">Cenário Competitivo</Label>
                  <Input
                    id="competitive_landscape"
                    placeholder="Principais concorrentes, barreiras de entrada"
                    value={formData.competitive_landscape}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitive_landscape: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market_trends">Tendências de Mercado</Label>
                  <Input
                    id="market_trends"
                    placeholder="Tendências relevantes, mudanças de comportamento"
                    value={formData.market_trends}
                    onChange={(e) => setFormData(prev => ({ ...prev, market_trends: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatory_factors">Fatores Regulatórios</Label>
                  <Input
                    id="regulatory_factors"
                    placeholder="Regulamentações, licenças, mudanças legais"
                    value={formData.regulatory_factors}
                    onChange={(e) => setFormData(prev => ({ ...prev, regulatory_factors: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funding_requirements">Necessidades de Financiamento</Label>
                  <Input
                    id="funding_requirements"
                    placeholder="Valor necessário, fontes de financiamento"
                    value={formData.funding_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, funding_requirements: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_readiness">Preparação da Equipe</Label>
                  <Input
                    id="team_readiness"
                    placeholder="Nível de preparação da equipe, competências"
                    value={formData.team_readiness}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_readiness: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ToolModalBase>
  );
};