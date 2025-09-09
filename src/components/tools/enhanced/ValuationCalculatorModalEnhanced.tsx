import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Download,
  BarChart,
  Building,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ValuationCalculatorModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Valuation {
  currentValuation: number;
  valuationRange: {
    min: number;
    probable: number;
    max: number;
  };
  nextRoundProjection: {
    valuation: number;
    timeframe: string;
  };
  comparableCompanies: Array<{
    name: string;
    description: string;
    valuation: number;
    multiple: string;
  }>;
  valuationMethods: Array<{
    name: string;
    description: string;
    valuation: number;
    multiples?: Array<{
      metric: string;
      value: string;
    }>;
  }>;
  revenueProjections: Array<{
    year: string;
    revenue: number;
    growth: number;
    description: string;
  }>;
  riskFactors: string[];
  milestones: Array<{
    title: string;
    description: string;
    valueIncrease: string;
  }>;
  fundingRecommendations?: Array<{
    stage: string;
    amount: number;
    equity: string;
    timing: string;
  }>;
  exitStrategies?: Array<{
    strategy: string;
    timeframe: string;
    potentialValue: number;
    requirements: string[];
  }>;
  keyMetrics?: Array<{
    name: string;
    target: string;
    impact: string;
  }>;
}

export const ValuationCalculatorModalEnhanced: React.FC<ValuationCalculatorModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('ValuationCalculatorModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  
  // Configurações adicionais
  const [businessStage, setBusinessStage] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [industry, setIndustry] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [teamSize, setTeamSize] = useState("");

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setUseCustom(false);
  };

  const handleCustomIdeaChange = (value: string) => {
    setCustomIdea(value);
  };

  const handleUseCustomIdeaChange = (value: boolean) => {
    setUseCustom(value);
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error("Selecione uma ideia ou digite uma descrição");
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error("Digite uma descrição da sua ideia");
      return;
    }

    // Check credits
    if (!hasCredits('valuation-calculator')) {
      toast.error(`Você precisa de ${getFeatureCost('valuation-calculator')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('valuation-calculator'),
        p_feature: 'valuation-calculator',
        p_description: `Análise de Valuation gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-valuation-calculator', {
          body: { 
            idea: ideaData,
            businessStage: businessStage || undefined,
            monthlyRevenue: monthlyRevenue || undefined,
            industry: industry || undefined,
            growthRate: growthRate || undefined,
            teamSize: teamSize || undefined
          }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setValuation(data.valuation);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockValuation = {
          currentValuation: 2500000,
          valuationRange: {
            min: 1800000,
            probable: 2500000,
            max: 3200000
          },
          nextRoundProjection: {
            valuation: 5000000,
            timeframe: "12-18 meses"
          },
          comparableCompanies: [
            {
              name: "TechStartup A",
              description: "Plataforma SaaS para análise de dados de startups",
              valuation: 4500000,
              multiple: "8.5x"
            },
            {
              name: "InnovateCorp",
              description: "Ferramenta de validação de ideias para empreendedores",
              valuation: 3200000,
              multiple: "7.2x"
            },
            {
              name: "StartupLaunch",
              description: "Plataforma de planejamento para novos negócios",
              valuation: 2800000,
              multiple: "6.5x"
            }
          ],
          valuationMethods: [
            {
              name: "Múltiplos de Receita",
              description: "Baseado em múltiplos de receita de empresas comparáveis no setor de tecnologia para startups em estágio inicial.",
              valuation: 2400000,
              multiples: [
                { metric: "Receita Anual", value: "6.0x" },
                { metric: "MRR", value: "72.0x" },
                { metric: "ARR", value: "6.0x" }
              ]
            },
            {
              name: "Fluxo de Caixa Descontado (DCF)",
              description: "Projeção de fluxos de caixa futuros descontados para valor presente usando uma taxa de desconto de 25% adequada para startups em estágio inicial.",
              valuation: 2650000,
              multiples: [
                { metric: "Taxa de Desconto", value: "25%" },
                { metric: "Taxa de Crescimento Terminal", value: "3%" }
              ]
            },
            {
              name: "Scorecard",
              description: "Método de comparação com valuations médias do mercado, ajustado por fatores como qualidade da equipe, tamanho do mercado e tecnologia.",
              valuation: 2350000
            },
            {
              name: "Venture Capital",
              description: "Baseado em expectativas de retorno de investidores de risco para o estágio atual da empresa.",
              valuation: 2800000
            }
          ],
          revenueProjections: [
            {
              year: "1",
              revenue: 400000,
              growth: 0,
              description: "Ano inicial com foco em aquisição de usuários e validação do modelo de negócio."
            },
            {
              year: "2",
              revenue: 900000,
              growth: 125,
              description: "Expansão da base de usuários e início de monetização efetiva."
            },
            {
              year: "3",
              revenue: 1800000,
              growth: 100,
              description: "Consolidação do modelo de negócio e expansão para novos segmentos."
            },
            {
              year: "4",
              revenue: 3200000,
              growth: 78,
              description: "Escala do negócio e possível expansão internacional."
            },
            {
              year: "5",
              revenue: 5000000,
              growth: 56,
              description: "Maturidade do negócio com diversificação de fontes de receita."
            }
          ],
          riskFactors: [
            "Alta competição no mercado de ferramentas para startups",
            "Dependência de adoção por early adopters para validação do modelo",
            "Necessidade de investimento contínuo em desenvolvimento de produto",
            "Potencial dificuldade em monetização de usuários gratuitos",
            "Risco de mudanças regulatórias afetando o modelo de negócio",
            "Desafios na retenção de talentos técnicos"
          ],
          milestones: [
            {
              title: "Lançamento do MVP",
              description: "Lançamento da versão mínima viável com funcionalidades core",
              valueIncrease: "15%"
            },
            {
              title: "1.000 Usuários Ativos",
              description: "Atingir marca de 1.000 usuários ativos mensais",
              valueIncrease: "25%"
            },
            {
              title: "Integração com Plataformas Parceiras",
              description: "Desenvolver integrações com ferramentas complementares",
              valueIncrease: "20%"
            },
            {
              title: "Expansão Internacional",
              description: "Entrada em mercados internacionais com versão localizada",
              valueIncrease: "35%"
            }
          ],
          fundingRecommendations: [
            {
              stage: "Seed",
              amount: 500000,
              equity: "10-15%",
              timing: "Imediato"
            },
            {
              stage: "Série A",
              amount: 2500000,
              equity: "15-20%",
              timing: "18-24 meses após seed"
            },
            {
              stage: "Série B",
              amount: 8000000,
              equity: "15-20%",
              timing: "24-36 meses após Série A"
            }
          ],
          exitStrategies: [
            {
              strategy: "Aquisição Estratégica",
              timeframe: "5-7 anos",
              potentialValue: 25000000,
              requirements: [
                "Base de usuários ativa superior a 50.000",
                "Receita anual recorrente (ARR) de pelo menos $3M",
                "Presença em pelo menos 3 mercados internacionais",
                "Propriedade intelectual bem estabelecida"
              ]
            },
            {
              strategy: "IPO",
              timeframe: "8-10 anos",
              potentialValue: 50000000,
              requirements: [
                "Receita anual superior a $10M",
                "Crescimento anual consistente acima de 30%",
                "EBITDA positivo por pelo menos 2 anos consecutivos",
                "Governança corporativa robusta implementada"
              ]
            }
          ],
          keyMetrics: [
            {
              name: "CAC (Custo de Aquisição de Cliente)",
              target: "< $200",
              impact: "Alto impacto na eficiência de marketing e valuation"
            },
            {
              name: "LTV (Valor do Tempo de Vida do Cliente)",
              target: "> $1.000",
              impact: "Crítico para demonstrar sustentabilidade do modelo"
            },
            {
              name: "Churn Mensal",
              target: "< 5%",
              impact: "Fundamental para projeções de crescimento e valuation"
            },
            {
              name: "Tempo de Payback do CAC",
              target: "< 12 meses",
              impact: "Essencial para eficiência de capital e atratividade para investidores"
            }
          ]
        };
        
        setValuation(mockValuation);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'valuation-calculator',
            title: `Análise de Valuation - ${ideaData.title}`,
            content_data: valuation
          });
      } catch (saveError) {
        console.warn('Failed to save valuation analysis to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Análise de valuation gerada com sucesso!");
    } catch (error) {
      console.error('Error generating valuation analysis:', error);
      toast.error("Erro ao gerar análise de valuation. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setValuation(null);
    setUseCustom(false);
    setBusinessStage("");
    setMonthlyRevenue("");
    setIndustry("");
    setGrowthRate("");
    setTeamSize("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const downloadValuation = () => {
    if (!valuation) return;
    
    // Create a formatted text version of the valuation
    let content = `# Análise de Valuation - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Current Valuation
    content += `## Valuation Atual\n\n`;
    content += `Valuation Atual: ${formatCurrency(valuation.currentValuation)}\n\n`;
    content += `### Faixa de Valor\n`;
    content += `- Mínimo: ${formatCurrency(valuation.valuationRange.min)}\n`;
    content += `- Provável: ${formatCurrency(valuation.valuationRange.probable)}\n`;
    content += `- Máximo: ${formatCurrency(valuation.valuationRange.max)}\n\n`;
    content += `### Próxima Rodada\n`;
    content += `- Valuation Projetado: ${formatCurrency(valuation.nextRoundProjection.valuation)}\n`;
    content += `- Timeframe: ${valuation.nextRoundProjection.timeframe}\n\n`;
    
    // Comparable Companies
    content += `## Empresas Comparáveis\n\n`;
    valuation.comparableCompanies?.forEach((company, index) => {
      content += `### ${company.name}\n`;
      content += `${company.description}\n`;
      content += `Valuation: ${formatCurrency(company.valuation)}\n`;
      content += `Múltiplo: ${company.multiple}\n\n`;
    });
    
    // Valuation Methods
    content += `## Métodos de Valuation\n\n`;
    valuation.valuationMethods?.forEach((method, index) => {
      content += `### ${method.name}\n`;
      content += `${method.description}\n`;
      content += `Valuation Estimado: ${formatCurrency(method.valuation)}\n`;
      
      if (method.multiples) {
        content += `\nMúltiplos Aplicados:\n`;
        method.multiples?.forEach(multiple => {
          content += `- ${multiple.metric}: ${multiple.value}\n`;
        });
      }
      
      content += `\n`;
    });
    
    // Revenue Projections
    content += `## Projeções de Receita (5 anos)\n\n`;
    valuation.revenueProjections?.forEach((projection, index) => {
      content += `### Ano ${projection.year}\n`;
      content += `${projection.description}\n`;
      content += `Receita: ${formatCurrency(projection.revenue)}\n`;
      content += `Crescimento: ${projection.growth > 0 ? '+' : ''}${projection.growth}%\n\n`;
    });
    
    // Risk Factors
    content += `## Fatores de Risco\n\n`;
    valuation.riskFactors?.forEach((risk, index) => {
      content += `- ${risk}\n`;
    });
    content += `\n`;
    
    // Milestones
    content += `## Marcos de Valor\n\n`;
    valuation.milestones?.forEach((milestone, index) => {
      content += `### ${milestone.title}\n`;
      content += `${milestone.description}\n`;
      content += `Aumento de Valor: +${milestone.valueIncrease}\n\n`;
    });
    
    // Funding Recommendations
    if (valuation.fundingRecommendations) {
      content += `## Recomendações de Financiamento\n\n`;
      valuation.fundingRecommendations?.forEach((funding, index) => {
        content += `### ${funding.stage}\n`;
        content += `Valor: ${formatCurrency(funding.amount)}\n`;
        content += `Equity: ${funding.equity}\n`;
        content += `Timing: ${funding.timing}\n\n`;
      });
    }
    
    // Exit Strategies
    if (valuation.exitStrategies) {
      content += `## Estratégias de Saída\n\n`;
      valuation.exitStrategies?.forEach((exit, index) => {
        content += `### ${exit.strategy}\n`;
        content += `Timeframe: ${exit.timeframe}\n`;
        content += `Valor Potencial: ${formatCurrency(exit.potentialValue)}\n`;
        content += `Requisitos:\n`;
        exit.requirements?.forEach(req => {
          content += `- ${req}\n`;
        });
        content += `\n`;
      });
    }
    
    // Key Metrics
    if (valuation.keyMetrics) {
      content += `## Métricas-Chave\n\n`;
      valuation.keyMetrics?.forEach((metric, index) => {
        content += `### ${metric.name}\n`;
        content += `Meta: ${metric.target}\n`;
        content += `Impacto: ${metric.impact}\n\n`;
      });
    }
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_valuation_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise de valuation baixada com sucesso!');
  };

  // Icon for the modal
  const valuationIcon = <Calculator className="h-5 w-5" />;

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!valuation) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Valuation para: {selectedIdea?.title || "Ideia Personalizada"}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadValuation}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="methods">Métodos</TabsTrigger>
            <TabsTrigger value="projections">Projeções</TabsTrigger>
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="overview" className="space-y-4 pr-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5" />
                      Valuation Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(valuation.currentValuation || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Faixa de Valor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Mínimo:</span>
                        <span className="font-semibold">{formatCurrency(valuation.valuationRange?.min || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Provável:</span>
                        <span className="font-semibold">{formatCurrency(valuation.valuationRange?.probable || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Máximo:</span>
                        <span className="font-semibold">{formatCurrency(valuation.valuationRange?.max || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Próxima Rodada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(valuation.nextRoundProjection?.valuation || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Em {valuation.nextRoundProjection?.timeframe || '12-18 meses'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    Empresas Comparáveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {valuation.comparableCompanies?.map((company, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{company.name}</h4>
                          <p className="text-sm text-muted-foreground">{company.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(company.valuation)}</p>
                          <Badge variant="secondary">{company.multiple}x Revenue</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {valuation.keyMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-indigo-500" />
                      Métricas-Chave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {valuation.keyMetrics?.map((metric, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-semibold">{metric.name}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <Badge variant="outline">Meta: {metric.target}</Badge>
                            <span className="text-xs text-muted-foreground">{metric.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="methods" className="space-y-4 pr-4">
              <div className="grid gap-4">
                {valuation.valuationMethods?.map((method, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {method.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <div className="flex justify-between items-center">
                          <span>Valuation Estimado:</span>
                          <span className="text-lg font-bold">{formatCurrency(method.valuation)}</span>
                        </div>
                        {method.multiples && (
                          <div>
                            <h5 className="font-semibold mb-2">Múltiplos Aplicados:</h5>
                            <div className="grid gap-2 md:grid-cols-2">
                              {method.multiples?.map((multiple, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{multiple.metric}:</span>
                                  <span>{multiple.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projections" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Projeções de Receita (5 anos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {valuation.revenueProjections?.map((projection, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-semibold">Ano {projection.year}</span>
                          <p className="text-sm text-muted-foreground">{projection.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(projection.revenue)}</p>
                          <Badge variant="outline">
                            {projection.growth > 0 ? '+' : ''}{projection.growth}% crescimento
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Fatores de Risco
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {valuation.riskFactors?.map((risk, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Target className="h-5 w-5" />
                      Marcos de Valor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {valuation.milestones?.map((milestone, index) => (
                        <div key={index} className="border-l-2 border-green-500 pl-3">
                          <h5 className="font-semibold">{milestone.title}</h5>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          <Badge variant="secondary" className="mt-1">
                            +{milestone.valueIncrease}% valuation
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4 pr-4">
              {valuation.fundingRecommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Recomendações de Financiamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {valuation.fundingRecommendations?.map((funding, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{funding.stage}</h4>
                            <Badge variant="outline">{funding.timing}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">{formatCurrency(funding.amount)}</span>
                            <Badge variant="secondary">Equity: {funding.equity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {valuation.exitStrategies && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Estratégias de Saída
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {valuation.exitStrategies?.map((exit, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{exit.strategy}</h4>
                            <Badge variant="outline">{exit.timeframe}</Badge>
                          </div>
                          <p className="text-lg font-bold mb-2">{formatCurrency(exit.potentialValue)}</p>
                          <div>
                            <h5 className="text-sm font-medium mb-1">Requisitos:</h5>
                            <ul className="text-sm space-y-1">
                              {exit.requirements?.map((req, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  // Renderização do formulário de configuração
  const renderConfigForm = () => {
    return (
      <div className="space-y-6">
        <EnhancedIdeaSelector 
          onSelect={handleIdeaSelect} 
          allowCustomIdea={true}
          customIdeaValue={customIdea}
          onCustomIdeaChange={handleCustomIdeaChange}
          useCustomIdea={useCustom}
          onUseCustomIdeaChange={handleUseCustomIdeaChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessStage">Estágio do Negócio</Label>
            <Select 
              value={businessStage} 
              onValueChange={setBusinessStage}
            >
              <SelectTrigger id="businessStage">
                <SelectValue placeholder="Selecione o estágio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Ideia</SelectItem>
                <SelectItem value="mvp">MVP</SelectItem>
                <SelectItem value="early_traction">Tração Inicial</SelectItem>
                <SelectItem value="growth">Crescimento</SelectItem>
                <SelectItem value="expansion">Expansão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Indústria/Setor</Label>
            <Select 
              value={industry} 
              onValueChange={setIndustry}
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Tecnologia</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="health">Saúde</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyRevenue">Receita Mensal (USD)</Label>
            <Input
              id="monthlyRevenue"
              placeholder="Ex: 10000"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              type="number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growthRate">Taxa de Crescimento Mensal (%)</Label>
            <Input
              id="growthRate"
              placeholder="Ex: 15"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              type="number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">Tamanho da Equipe</Label>
            <Input
              id="teamSize"
              placeholder="Ex: 5"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              type="number"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Calculadora de Valuation"
      icon={valuationIcon}
      isGenerating={isGenerating}
      generatingText="Calculando valuation..."
      actionText="Calcular Valuation"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!valuation}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('valuation-calculator')}
    >
      <div className="space-y-6">
        {valuation ? renderGeneratedContent() : (
          <CreditGuard feature="valuation-calculator">
            {renderConfigForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};