import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, DollarSign, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface PricingModelModalProps {
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
}

export const PricingModelModal = ({
  open,
  onOpenChange,
}: PricingModelModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PricingResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    product_type: '',
    target_market: '',
    value_proposition: '',
    cost_structure: '',
    competition: '',
    pricing_goals: '',
    constraints: ''
  });

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (!formData.business_idea.trim()) {
      toast.error("Por favor, descreva sua ideia de negócio");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-pricing-model', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Modelo de precificação gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      toast.error("Erro ao gerar modelo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      product_type: '',
      target_market: '',
      value_proposition: '',
      cost_structure: '',
      competition: '',
      pricing_goals: '',
      constraints: ''
    });
  };

  const cost = 9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Modelo de Precificação
          </DialogTitle>
          <DialogDescription>
            Desenvolva estratégias de precificação inteligentes para maximizar receita e competitividade.
            <Badge variant="secondary" className="ml-2">{cost} créditos</Badge>
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_idea">Ideia de Negócio *</Label>
                <Textarea
                  id="business_idea"
                  placeholder="Descreva sua ideia de negócio e produto/serviço..."
                  value={formData.business_idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_idea: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">Tipo de Produto/Serviço</Label>
                <Input
                  id="product_type"
                  placeholder="Ex: SaaS, produto físico, consultoria, marketplace"
                  value={formData.product_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_market">Mercado-Alvo</Label>
                <Textarea
                  id="target_market"
                  placeholder="Descreva seu público-alvo, segmento de mercado e tamanho"
                  value={formData.target_market}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_market: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value_proposition">Proposta de Valor</Label>
                <Textarea
                  id="value_proposition"
                  placeholder="Qual o valor único que você oferece? Como resolve o problema do cliente?"
                  value={formData.value_proposition}
                  onChange={(e) => setFormData(prev => ({ ...prev, value_proposition: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_structure">Estrutura de Custos</Label>
                <Textarea
                  id="cost_structure"
                  placeholder="Liste seus principais custos: desenvolvimento, produção, marketing, operação"
                  value={formData.cost_structure}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_structure: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competition">Concorrência</Label>
                <Textarea
                  id="competition"
                  placeholder="Liste principais concorrentes e suas estratégias de preço"
                  value={formData.competition}
                  onChange={(e) => setFormData(prev => ({ ...prev, competition: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing_goals">Objetivos de Precificação</Label>
                <Input
                  id="pricing_goals"
                  placeholder="Ex: maximizar receita, penetração de mercado, premium"
                  value={formData.pricing_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing_goals: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Restrições e Limitações</Label>
                <Input
                  id="constraints"
                  placeholder="Ex: orçamento limitado, regulamentações, sazonalidade"
                  value={formData.constraints}
                  onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.business_idea.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Modelo...
                </>
              ) : (
                `Gerar Modelo (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Modelo de Precificação</h3>
              <Button variant="outline" onClick={handleReset}>
                Gerar Novo Modelo
              </Button>
            </div>

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
                            <span className="text-green-600">✓</span>
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
                            <span className="text-orange-600">⚠</span>
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
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tiers de Preço */}
            {results.pricing_tiers?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
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
                                <span className="text-primary">✓</span>
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
                            <span className="text-primary">💡</span>
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
                            <span className="text-primary">%</span>
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                        <span className="text-primary">🧪</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};