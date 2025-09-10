import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Star, 
  DollarSign, 
  TrendingUp, 
  Target,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  Percent,
  Lightbulb,
  BarChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PricingModelModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PricingTier {
  name: string;
  price: number;
  features: string[];
  target_customer: string;
  value_proposition: string;
}

interface PricingStrategy {
  model_type: string;
  description: string;
  pros: string[];
  cons: string[];
  implementation_tips: string[];
}

interface PricingResults {
  recommended_strategy: PricingStrategy;
  pricing_tiers: PricingTier[];
  competitor_analysis: Array<{
    competitor: string;
    pricing: string;
    positioning: string;
  }>;
  pricing_psychology: {
    recommendations: string[];
    price_anchoring: string;
    discount_strategies: string[];
  };
  testing_recommendations: string[];
  revenue_projections: {
    conservative: string;
    realistic: string;
    optimistic: string;
  };
  market_positioning?: string;
  price_sensitivity?: {
    factors: string[];
    recommendations: string[];
  };
  international_pricing?: {
    regions: Array<{
      region: string;
      strategy: string;
      price_adjustment: string;
    }>;
  };
}

export const PricingModelModalEnhanced: React.FC<PricingModelModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<PricingResults | null>(null);
  
  // Formulário com campos adicionais
  const [formData, setFormData] = useState({
    product_type: '',
    target_market: '',
    value_proposition: '',
    cost_structure: '',
    competition: '',
    pricing_goals: '',
    constraints: '',
    international_markets: false,
    price_sensitivity: '',
    customer_segments: ''
  });

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!selectedIdea) {
      toast.error("Selecione uma ideia primeiro");
      return;
    }

    // Check credits
    if (!hasCredits('pricing-model')) {
      toast.error(`Você precisa de ${getFeatureCost('pricing-model')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('pricing-model'),
        p_feature: 'pricing-model',
        p_description: `Modelo de precificação gerado para: ${selectedIdea.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Generate pricing model
      const { data, error } = await supabase.functions.invoke('generate-pricing-model', {
        body: { 
          business_idea: selectedIdea.description,
          ...formData
        }
      });

      if (error) throw error;

      setResults(data);
      toast.success("Modelo de precificação gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar modelo de precificação:', error);
      toast.error("Erro ao gerar modelo. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setResults(null);
    setFormData({
      product_type: '',
      target_market: '',
      value_proposition: '',
      cost_structure: '',
      competition: '',
      pricing_goals: '',
      constraints: '',
      international_markets: false,
      price_sensitivity: '',
      customer_segments: ''
    });
  };

  const copyToClipboard = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      toast.success("Modelo copiado para a área de transferência!");
    }
  };

  const downloadResults = () => {
    if (results) {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pricing-model-${selectedIdea?.title || 'model'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Modelo baixado com sucesso!");
    }
  };

  // Icon for the modal
  const pricingIcon = <Star className="h-5 w-5 text-yellow-500" />;

  // Renderização do formulário
  const renderForm = () => {
    return (
      <div className="space-y-6">
        <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product_type">Tipo de Produto/Serviço</Label>
                <Select 
                  value={formData.product_type} 
                  onValueChange={(value) => handleInputChange('product_type', value)}
                >
                  <SelectTrigger id="product_type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS (Software como Serviço)</SelectItem>
                    <SelectItem value="physical">Produto Físico</SelectItem>
                    <SelectItem value="digital">Produto Digital</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="service">Serviço</SelectItem>
                    <SelectItem value="subscription">Assinatura (não-SaaS)</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value_proposition">Proposta de Valor</Label>
                <Textarea
                  id="value_proposition"
                  placeholder="Qual o valor único que você oferece? Como resolve o problema do cliente?"
                  value={formData.value_proposition}
                  onChange={(e) => handleInputChange('value_proposition', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_structure">Estrutura de Custos</Label>
                <Textarea
                  id="cost_structure"
                  placeholder="Liste seus principais custos: desenvolvimento, produção, marketing, operação"
                  value={formData.cost_structure}
                  onChange={(e) => handleInputChange('cost_structure', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target_market">Mercado-Alvo</Label>
                <Textarea
                  id="target_market"
                  placeholder="Descreva seu público-alvo, segmento de mercado e tamanho"
                  value={formData.target_market}
                  onChange={(e) => handleInputChange('target_market', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_segments">Segmentos de Clientes</Label>
                <Textarea
                  id="customer_segments"
                  placeholder="Descreva os diferentes segmentos de clientes e suas características"
                  value={formData.customer_segments}
                  onChange={(e) => handleInputChange('customer_segments', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competition">Concorrência</Label>
                <Textarea
                  id="competition"
                  placeholder="Liste principais concorrentes e suas estratégias de preço"
                  value={formData.competition}
                  onChange={(e) => handleInputChange('competition', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_sensitivity">Sensibilidade a Preço</Label>
                <Select 
                  value={formData.price_sensitivity} 
                  onValueChange={(value) => handleInputChange('price_sensitivity', value)}
                >
                  <SelectTrigger id="price_sensitivity">
                    <SelectValue placeholder="Selecione a sensibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta (clientes muito sensíveis a preço)</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa (clientes valorizam qualidade sobre preço)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="international_markets"
                  checked={formData.international_markets}
                  onChange={(e) => handleInputChange('international_markets', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  aria-label="Considerar mercados internacionais"
                />
                <Label htmlFor="international_markets" className="text-sm font-medium">Considerar mercados internacionais</Label>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pricing_goals">Objetivos de Precificação</Label>
                <Select 
                  value={formData.pricing_goals} 
                  onValueChange={(value) => handleInputChange('pricing_goals', value)}
                >
                  <SelectTrigger id="pricing_goals">
                    <SelectValue placeholder="Selecione o objetivo principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market_penetration">Penetração de Mercado (preços mais baixos)</SelectItem>
                    <SelectItem value="revenue_maximization">Maximização de Receita</SelectItem>
                    <SelectItem value="profit_maximization">Maximização de Lucro</SelectItem>
                    <SelectItem value="premium_positioning">Posicionamento Premium</SelectItem>
                    <SelectItem value="customer_acquisition">Aquisição de Clientes</SelectItem>
                    <SelectItem value="customer_retention">Retenção de Clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Restrições e Limitações</Label>
                <Textarea
                  id="constraints"
                  placeholder="Ex: orçamento limitado, regulamentações, sazonalidade"
                  value={formData.constraints}
                  onChange={(e) => handleInputChange('constraints', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  };

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Modelo de Precificação</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={downloadResults}>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            <TabsTrigger value="tiers">Tiers de Preço</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="psychology">Psicologia</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="strategy" className="space-y-4 pr-4 pt-4">
              {/* Estratégia Recomendada */}
              {results.recommended_strategy && (
                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Estratégia Recomendada: {results.recommended_strategy.model_type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{results.recommended_strategy.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2 text-green-600">Vantagens:</h5>
                        <ul className="space-y-1">
                          {results.recommended_strategy.pros?.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2 text-orange-600">Desvantagens:</h5>
                        <ul className="space-y-1">
                          {results.recommended_strategy.cons?.map((con, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {results.recommended_strategy.implementation_tips?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Dicas de Implementação:</h5>
                        <ul className="space-y-1">
                          {results.recommended_strategy.implementation_tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Projeções de Receita */}
              {results.revenue_projections && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Projeções de Receita (Mensal)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm text-orange-600 mb-1">Conservador</h5>
                        <p className="text-lg font-bold">{results.revenue_projections.conservative}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-primary/5">
                        <h5 className="font-medium text-sm text-primary mb-1">Realista</h5>
                        <p className="text-lg font-bold">{results.revenue_projections.realistic}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm text-green-600 mb-1">Otimista</h5>
                        <p className="text-lg font-bold">{results.revenue_projections.optimistic}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recomendações de Teste */}
              {results.testing_recommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recomendações de Teste</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.testing_recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
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

            <TabsContent value="tiers" className="space-y-4 pr-4 pt-4">
              {/* Tiers de Preço */}
              {results.pricing_tiers?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Estrutura de Preços Sugerida
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.pricing_tiers.map((tier, index) => (
                      <Card key={index} className={index === 1 ? "border-primary shadow-lg" : ""}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            {tier.name}
                            {index === 1 && <Badge>Recomendado</Badge>}
                          </CardTitle>
                          <div className="text-2xl font-bold">
                            R$ {tier.price?.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground">/mês</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Público-Alvo:</h5>
                            <p className="text-sm text-muted-foreground">{tier.target_customer}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">Proposta de Valor:</h5>
                            <p className="text-sm text-muted-foreground">{tier.value_proposition}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-2">Recursos Inclusos:</h5>
                            <ul className="space-y-1">
                              {tier.features?.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Posicionamento de Mercado */}
              {results.market_positioning && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Posicionamento de Mercado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{results.market_positioning}</p>
                  </CardContent>
                </Card>
              )}

              {/* Precificação Internacional */}
              {results.international_pricing?.regions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Precificação Internacional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.international_pricing.regions.map((region, index) => (
                        <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                          <h5 className="font-medium text-sm">{region.region}</h5>
                          <p className="text-sm text-muted-foreground mb-1">{region.strategy}</p>
                          <Badge variant="outline">{region.price_adjustment}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-4 pr-4 pt-4">
              {/* Análise da Concorrência */}
              {results.competitor_analysis?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Análise da Concorrência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.competitor_analysis.map((competitor, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h5 className="font-medium text-sm">{competitor.competitor}</h5>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Preço:</strong> {competitor.pricing}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Posicionamento:</strong> {competitor.positioning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sensibilidade a Preço */}
              {results.price_sensitivity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sensibilidade a Preço</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.price_sensitivity.factors?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Fatores de Sensibilidade:</h5>
                        <ul className="space-y-1">
                          {results.price_sensitivity.factors.map((factor, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <BarChart className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.price_sensitivity.recommendations?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recomendações:</h5>
                        <ul className="space-y-1">
                          {results.price_sensitivity.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="psychology" className="space-y-4 pr-4 pt-4">
              {/* Psicologia de Preços */}
              {results.pricing_psychology && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Psicologia de Preços</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.pricing_psychology.recommendations?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recomendações Psicológicas:</h5>
                        <ul className="space-y-1">
                          {results.pricing_psychology.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.pricing_psychology.price_anchoring && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">Ancoragem de Preços:</h5>
                        <p className="text-sm text-muted-foreground">
                          {results.pricing_psychology.price_anchoring}
                        </p>
                      </div>
                    )}

                    {results.pricing_psychology.discount_strategies?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Estratégias de Desconto:</h5>
                        <ul className="space-y-1">
                          {results.pricing_psychology.discount_strategies.map((strategy, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Percent className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Modelo de Precificação"
      icon={pricingIcon}
      isGenerating={isGenerating}
      generatingText="Gerando modelo de precificação..."
      actionText="Gerar Modelo"
      onAction={handleGenerate}
      actionDisabled={isGenerating || !selectedIdea || !hasCredits('pricing-model')}
      resetText="Novo Modelo"
      onReset={handleReset}
      showReset={!!results}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('pricing-model')}
    >
      <div className="space-y-6">
        {results ? renderGeneratedContent() : (
          <CreditGuard feature="pricing-model">
            {renderForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};