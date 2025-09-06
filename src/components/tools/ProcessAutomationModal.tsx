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
import { Loader2, Zap, Clock, DollarSign, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface ProcessAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AutomationOpportunity {
  process_name: string;
  current_method: string;
  automation_solution: string;
  time_saved: string;
  cost_reduction: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  priority: 'Alta' | 'Média' | 'Baixa';
  tools_needed: string[];
  implementation_steps: string[];
}

interface AutomationResults {
  opportunities: AutomationOpportunity[];
  summary: {
    total_time_saved: string;
    total_cost_reduction: string;
    recommended_first_steps: string[];
  };
  tools_comparison: Array<{
    tool_name: string;
    features: string[];
    pricing: string;
    best_for: string;
  }>;
}

export const ProcessAutomationModal = ({
  open,
  onOpenChange,
}: ProcessAutomationModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AutomationResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    business_type: '',
    current_processes: '',
    team_size: '',
    budget: '',
    technical_level: '',
    pain_points: ''
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
      const { data, error } = await supabase.functions.invoke('generate-process-automation', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Análise de automação gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast.error("Erro ao gerar análise. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      business_type: '',
      current_processes: '',
      team_size: '',
      budget: '',
      technical_level: '',
      pain_points: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Média': return 'default';
      case 'Baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const cost = 9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automação de Processos
          </DialogTitle>
          <DialogDescription>
            Identifique oportunidades de automação para otimizar seus processos de negócio.
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
                <Label htmlFor="business_type">Tipo de Negócio</Label>
                <Input
                  id="business_type"
                  placeholder="Ex: E-commerce, SaaS, Consultoria, Marketplace"
                  value={formData.business_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_processes">Processos Atuais</Label>
                <Textarea
                  id="current_processes"
                  placeholder="Liste os principais processos do seu negócio (vendas, atendimento, produção, etc.)"
                  value={formData.current_processes}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_processes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pain_points">Principais Problemas</Label>
                <Textarea
                  id="pain_points"
                  placeholder="Quais são as principais dificuldades e gargalos nos seus processos?"
                  value={formData.pain_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, pain_points: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_size">Tamanho da Equipe</Label>
                <Input
                  id="team_size"
                  placeholder="Ex: 1-5 pessoas, 6-20 pessoas, 20+ pessoas"
                  value={formData.team_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento para Automação</Label>
                <Input
                  id="budget"
                  placeholder="Ex: R$ 500/mês, R$ 2.000/mês"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="technical_level">Nível Técnico da Equipe</Label>
                <Input
                  id="technical_level"
                  placeholder="Ex: Iniciante, Intermediário, Avançado"
                  value={formData.technical_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, technical_level: e.target.value }))}
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
                  Analisando Oportunidades...
                </>
              ) : (
                `Gerar Análise (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Oportunidades de Automação</h3>
              <Button variant="outline" onClick={handleReset}>
                Nova Análise
              </Button>
            </div>

            {/* Resumo */}
            {results.summary && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Resumo da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        <strong>Tempo economizado:</strong> {results.summary.total_time_saved}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        <strong>Redução de custos:</strong> {results.summary.total_cost_reduction}
                      </span>
                    </div>
                  </div>
                  
                  {results.summary.recommended_first_steps?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Primeiros Passos Recomendados:</h4>
                      <ul className="space-y-1">
                        {results.summary.recommended_first_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">1.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Oportunidades */}
            {results.opportunities?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Oportunidades Identificadas</h4>
                <div className="space-y-4">
                  {results.opportunities.map((opportunity, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          {opportunity.process_name}
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(opportunity.priority) as any}>
                              {opportunity.priority}
                            </Badge>
                            <Badge className={getDifficultyColor(opportunity.difficulty)}>
                              {opportunity.difficulty}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Método Atual:</h5>
                          <p className="text-sm text-muted-foreground">{opportunity.current_method}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-1">Solução de Automação:</h5>
                          <p className="text-sm">{opportunity.automation_solution}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Tempo Economizado:</h5>
                            <p className="text-sm text-green-600">{opportunity.time_saved}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-1">Redução de Custos:</h5>
                            <p className="text-sm text-green-600">{opportunity.cost_reduction}</p>
                          </div>
                        </div>

                        {opportunity.tools_needed?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Ferramentas Necessárias:</h5>
                            <div className="flex flex-wrap gap-1">
                              {opportunity.tools_needed.map((tool, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {opportunity.implementation_steps?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Passos de Implementação:</h5>
                            <ol className="space-y-1">
                              {opportunity.implementation_steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Comparação de Ferramentas */}
            {results.tools_comparison?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comparação de Ferramentas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.tools_comparison.map((tool, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h5 className="font-medium mb-2">{tool.tool_name}</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                          <div>
                            <strong>Recursos:</strong>
                            <ul className="mt-1 space-y-1">
                              {tool.features?.slice(0, 3).map((feature, i) => (
                                <li key={i} className="text-muted-foreground">• {feature}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Preço:</strong>
                            <p className="text-muted-foreground mt-1">{tool.pricing}</p>
                          </div>
                          <div>
                            <strong>Melhor para:</strong>
                            <p className="text-muted-foreground mt-1">{tool.best_for}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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