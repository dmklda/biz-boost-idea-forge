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
import { Loader2, Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface SocialMediaPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlatformStrategy {
  platform: string;
  content_types: string[];
  posting_frequency: string;
  best_times: string[];
  kpis: string[];
}

interface ContentCalendar {
  date: string;
  platform: string;
  content_type: string;
  content_idea: string;
  hashtags: string[];
}

interface PlannerResults {
  strategies: PlatformStrategy[];
  content_calendar: ContentCalendar[];
  growth_tactics: string[];
  analytics_recommendations: string[];
  budget_suggestions: {
    organic: string;
    paid: string;
    tools: string;
  };
}

export const SocialMediaPlannerModal = ({
  open,
  onOpenChange,
}: SocialMediaPlannerModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PlannerResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    target_audience: '',
    platforms: '',
    goals: '',
    budget: '',
    timeframe: ''
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
      const { data, error } = await supabase.functions.invoke('generate-social-media-plan', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Plano de redes sociais gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      toast.error("Erro ao gerar plano. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      target_audience: '',
      platforms: '',
      goals: '',
      budget: '',
      timeframe: ''
    });
  };

  const cost = 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Social Media Planner
          </DialogTitle>
          <DialogDescription>
            Crie um plano estratégico completo para suas redes sociais.
            <Badge variant="secondary" className="ml-2">{cost} créditos</Badge>
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_idea">Ideia de Negócio *</Label>
                <Textarea
                  id="business_idea"
                  placeholder="Descreva sua ideia de negócio..."
                  value={formData.business_idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_idea: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Público-Alvo</Label>
                <Textarea
                  id="target_audience"
                  placeholder="Descreva seu público-alvo (demografia, interesses, comportamento)"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platforms">Plataformas</Label>
                <Input
                  id="platforms"
                  placeholder="Ex: Instagram, LinkedIn, TikTok, Facebook"
                  value={formData.platforms}
                  onChange={(e) => setFormData(prev => ({ ...prev, platforms: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Objetivos</Label>
                <Input
                  id="goals"
                  placeholder="Ex: aumentar seguidores, gerar leads, vendas"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento Mensal</Label>
                <Input
                  id="budget"
                  placeholder="Ex: R$ 1.000"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Período de Planejamento</Label>
                <Input
                  id="timeframe"
                  placeholder="Ex: 3 meses, 6 meses, 1 ano"
                  value={formData.timeframe}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
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
                  Gerando Plano...
                </>
              ) : (
                `Gerar Plano (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Plano de Redes Sociais</h3>
              <Button variant="outline" onClick={handleReset}>
                Gerar Novo Plano
              </Button>
            </div>

            {/* Estratégias por Plataforma */}
            {results.strategies?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Estratégias por Plataforma
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {results.strategies.map((strategy, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{strategy.platform}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Tipos de Conteúdo:</h5>
                          <div className="flex flex-wrap gap-1">
                            {strategy.content_types?.map((type, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-1">Frequência:</h5>
                          <p className="text-sm text-muted-foreground">{strategy.posting_frequency}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Melhores Horários:</h5>
                          <div className="flex flex-wrap gap-1">
                            {strategy.best_times?.map((time, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">KPIs:</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {strategy.kpis?.map((kpi, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {kpi}
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

            {/* Calendário de Conteúdo */}
            {results.content_calendar?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendário de Conteúdo (Próximas 2 Semanas)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.content_calendar.slice(0, 14).map((item, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{item.date}</span>
                          <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                          <Badge variant="secondary" className="text-xs">{item.content_type}</Badge>
                        </div>
                        <p className="text-sm mb-2">{item.content_idea}</p>
                        {item.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.hashtags.slice(0, 5).map((tag, i) => (
                              <span key={i} className="text-xs text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Táticas de Crescimento */}
            {results.growth_tactics?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Táticas de Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.growth_tactics.map((tactic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span className="text-sm">{tactic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recomendações de Analytics */}
            {results.analytics_recommendations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recomendações de Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.analytics_recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">📊</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Sugestões de Orçamento */}
            {results.budget_suggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sugestões de Orçamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1">Orgânico:</h5>
                    <p className="text-sm text-muted-foreground">{results.budget_suggestions.organic}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Mídia Paga:</h5>
                    <p className="text-sm text-muted-foreground">{results.budget_suggestions.paid}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Ferramentas:</h5>
                    <p className="text-sm text-muted-foreground">{results.budget_suggestions.tools}</p>
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