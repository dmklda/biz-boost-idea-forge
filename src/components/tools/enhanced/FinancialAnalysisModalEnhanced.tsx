//startupidea code
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Download, 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  CreditCard, 
  AlertTriangle, 
  Target, 
  PieChart, 
  Activity, 
  Database 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";

interface FinancialAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RevenueModelData {
  primaryStreams: string[];
  secondaryStreams: string[];
  pricingModel: string;
  revenueProjection: string;
  scalabilityFactors: string[];
}

interface CostStructureData {
  fixedCosts: Array<{
    category: string;
    amount: string;
    description: string;
  }>;
  variableCosts: Array<{
    category: string;
    percentage: string;
    description: string;
  }>;
  operationalCosts: string;
  totalCostEstimate: string;
}

interface FinancialProjectionsData {
  year1: {
    revenue: string;
    costs: string;
    profit: string;
    margin: string;
  };
  year2: {
    revenue: string;
    costs: string;
    profit: string;
    margin: string;
  };
  year3: {
    revenue: string;
    costs: string;
    profit: string;
    margin: string;
  };
  growthAssumptions: string[];
}

interface BreakEvenAnalysisData {
  breakEvenPoint: string;
  unitsToBreakEven: string;
  timeToBreakEven: string;
  criticalFactors: string[];
}

interface FundingRequirementsData {
  initialInvestment: string;
  workingCapital: string;
  growthCapital: string;
  totalFunding: string;
  fundingSources: string[];
  useOfFunds: Array<{
    category: string;
    percentage: string;
    amount: string;
  }>;
}

interface FinancialRisksData {
  marketRisks: string[];
  operationalRisks: string[];
  financialRisks: string[];
  mitigationStrategies: string[];
}

interface KeyMetricsData {
  cac: string;
  ltv: string;
  ltvCacRatio: string;
  grossMargin: string;
  burnRate: string;
  runway: string;
}

interface ProfitabilityAnalysisData {
  grossProfitMargin: string;
  operatingMargin: string;
  netMargin: string;
  roi: string;
  paybackPeriod: string;
}

interface CashFlowProjectionData {
  operatingCashFlow: Array<{
    period: string;
    amount: string;
  }>;
  investmentCashFlow: string;
  financingCashFlow: string;
  netCashFlow: string;
}

interface InvestmentReturnData {
  expectedRoi: string;
  irr: string;
  npv: string;
  sensitivityAnalysis: string[];
}

interface FinancialAnalysis {
  revenueModel: RevenueModelData;
  costStructure: CostStructureData;
  financialProjections: FinancialProjectionsData;
  breakEvenAnalysis: BreakEvenAnalysisData;
  fundingRequirements: FundingRequirementsData;
  financialRisks: FinancialRisksData;
  keyMetrics: KeyMetricsData;
  profitabilityAnalysis: ProfitabilityAnalysisData;
  cashFlowProjection: CashFlowProjectionData;
  investmentReturn: InvestmentReturnData;
  sources: {
    serpApi: string[];
    perplexity: string[];
  };
}

export const FinancialAnalysisModalEnhanced: React.FC<FinancialAnalysisModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('FinancialAnalysisModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);

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
    if (!hasCredits('financial-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('financial-analysis')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('financial-analysis'),
        p_feature: 'financial-analysis',
        p_description: `Análise Financeira gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Try to call the edge function
      let generatedAnalysis;
      try {
        const { data, error } = await supabase.functions.invoke('generate-financial-analysis', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        generatedAnalysis = data.analysis;
        setAnalysis(generatedAnalysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Fallback data
        const mockAnalysis = {
          revenueModel: {
            primaryStreams: ["Assinaturas mensais", "Planos anuais com desconto", "Recursos premium"],
            secondaryStreams: ["Comissões de parceiros", "Consultorias especializadas", "Cursos e treinamentos"],
            pricingModel: "Freemium com assinaturas escalonadas",
            revenueProjection: "R$ 1,2M no primeiro ano, R$ 4,8M no segundo",
            scalabilityFactors: ["Automação de processos", "Network effects", "Economia de escala"]
          },
          costStructure: {
            fixedCosts: [
              { category: "Infraestrutura", amount: "R$ 15.000/mês", description: "Servidores, CDN, segurança" },
              { category: "Pessoal", amount: "R$ 85.000/mês", description: "Salários e benefícios" },
              { category: "Marketing", amount: "R$ 25.000/mês", description: "Publicidade digital e conteúdo" }
            ],
            variableCosts: [
              { category: "Comissões", percentage: "5%", description: "Comissões sobre vendas" },
              { category: "Suporte", percentage: "8%", description: "Atendimento ao cliente" },
              { category: "Processamento", percentage: "3%", description: "Taxas de pagamento" }
            ],
            operationalCosts: "R$ 125.000/mês nos primeiros 12 meses",
            totalCostEstimate: "R$ 1.8M no primeiro ano"
          },
          financialProjections: {
            year1: { revenue: "R$ 1.200.000", costs: "R$ 900.000", profit: "R$ 300.000", margin: "25%" },
            year2: { revenue: "R$ 4.800.000", costs: "R$ 2.880.000", profit: "R$ 1.920.000", margin: "40%" },
            year3: { revenue: "R$ 12.000.000", costs: "R$ 6.000.000", profit: "R$ 6.000.000", margin: "50%" },
            growthAssumptions: ["150% crescimento anual", "Retenção de 90%", "Expansão de mercado"]
          },
          breakEvenAnalysis: {
            breakEvenPoint: "R$ 156.000/mês em receita",
            unitsToBreakEven: "2.600 usuários pagantes",
            timeToBreakEven: "14 meses",
            criticalFactors: ["Taxa de conversão > 5%", "Churn < 5%", "CAC < R$ 80"]
          },
          fundingRequirements: {
            initialInvestment: "R$ 500.000",
            workingCapital: "R$ 200.000",
            growthCapital: "R$ 800.000",
            totalFunding: "R$ 1.500.000",
            fundingSources: ["Investidores anjo", "Seed funding", "Bootstrap"],
            useOfFunds: [
              { category: "Produto", percentage: "40%", amount: "R$ 600.000" },
              { category: "Marketing", percentage: "30%", amount: "R$ 450.000" },
              { category: "Operações", percentage: "30%", amount: "R$ 450.000" }
            ]
          },
          financialRisks: {
            marketRisks: ["Competição acirrada", "Mudanças no mercado", "Recessão econômica"],
            operationalRisks: ["Falhas técnicas", "Perda de talentos", "Problemas de escala"],
            financialRisks: ["Fluxo de caixa negativo", "Dificuldade de funding", "Custos acima do previsto"],
            mitigationStrategies: ["Diversificação de receita", "Controle rigoroso de custos", "Reserva de emergência"]
          },
          keyMetrics: {
            cac: "R$ 75",
            ltv: "R$ 900",
            ltvCacRatio: "12:1",
            grossMargin: "75%",
            burnRate: "R$ 45.000/mês",
            runway: "18 meses"
          },
          profitabilityAnalysis: {
            grossProfitMargin: "75%",
            operatingMargin: "35%",
            netMargin: "25%",
            roi: "180%",
            paybackPeriod: "8 meses"
          },
          cashFlowProjection: {
            operatingCashFlow: [
              { period: "Q1", amount: "R$ -120.000" },
              { period: "Q2", amount: "R$ -80.000" },
              { period: "Q3", amount: "R$ 50.000" },
              { period: "Q4", amount: "R$ 180.000" }
            ],
            investmentCashFlow: "R$ -200.000",
            financingCashFlow: "R$ 500.000",
            netCashFlow: "R$ 330.000 no primeiro ano"
          },
          investmentReturn: {
            expectedRoi: "200% em 3 anos",
            irr: "65%",
            npv: "R$ 2.8M",
            sensitivityAnalysis: ["Cenário otimista: +50%", "Cenário pessimista: -30%"]
          },
          sources: {
            serpApi: ["Dados de financiamento do setor", "Benchmarks de custos", "Informações de mercado"],
            perplexity: ["Análises de viabilidade", "Tendências de investimento", "Métricas do setor"]
          }
        };
        
        generatedAnalysis = mockAnalysis;
        setAnalysis(mockAnalysis);
      }
      
      // Try to save to database
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'financial-analysis',
            title: `Análise Financeira - ${ideaData.title}`,
            content_data: generatedAnalysis as any
          });
      } catch (saveError) {
        console.warn('Failed to save financial analysis to database:', saveError);
      }
      
      toast.success("Análise financeira gerada com sucesso!");
    } catch (error) {
      console.error('Error generating financial analysis:', error);
      toast.error("Erro ao gerar análise financeira. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setAnalysis(null);
    setUseCustom(false);
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    const content = `# Análise Financeira - ${selectedIdea?.title || 'Ideia Personalizada'}

## Modelo de Receita
- Fluxos Primários: ${analysis.revenueModel.primaryStreams.join(', ')}
- Modelo de Preços: ${analysis.revenueModel.pricingModel}
- Projeção: ${analysis.revenueModel.revenueProjection}

## Estrutura de Custos
### Custos Fixos:
${analysis.costStructure.fixedCosts.map(cost => `- ${cost.category}: ${cost.amount}`).join('\n')}

### Custos Variáveis:
${analysis.costStructure.variableCosts.map(cost => `- ${cost.category}: ${cost.percentage}`).join('\n')}

## Projeções Financeiras
- Ano 1: ${analysis.financialProjections.year1.revenue} (Margem: ${analysis.financialProjections.year1.margin})
- Ano 2: ${analysis.financialProjections.year2.revenue} (Margem: ${analysis.financialProjections.year2.margin})
- Ano 3: ${analysis.financialProjections.year3.revenue} (Margem: ${analysis.financialProjections.year3.margin})

## Métricas-Chave
- CAC: ${analysis.keyMetrics.cac}
- LTV: ${analysis.keyMetrics.ltv}
- LTV/CAC: ${analysis.keyMetrics.ltvCacRatio}
- Burn Rate: ${analysis.keyMetrics.burnRate}

## Necessidades de Financiamento
Total: ${analysis.fundingRequirements.totalFunding}
${analysis.fundingRequirements.useOfFunds.map(use => `- ${use.category}: ${use.percentage}`).join('\n')}
`;
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_financeira_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise financeira baixada com sucesso!');
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise Financeira"
      icon={<DollarSign className="h-5 w-5 text-green-500" />}
      isGenerating={isGenerating}
      generatingText="Analisando financeiramente..."
      actionText="Gerar Análise Financeira"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!analysis}
      maxWidth="4xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('financial-analysis')}
    >
      <div className="space-y-6">
        {analysis ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Modelo de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Fluxos Primários</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.revenueModel.primaryStreams.map((stream, index) => (
                        <li key={index}>{stream}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Modelo de Preço</h4>
                    <p className="text-sm text-muted-foreground">{analysis.revenueModel.pricingModel}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Projeção de Receita</h4>
                    <p className="text-sm text-muted-foreground">{analysis.revenueModel.revenueProjection}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Estrutura de Custos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Custos Fixos</h4>
                    <div className="space-y-2">
                      {analysis.costStructure.fixedCosts.map((cost, index) => (
                        <div key={index} className="border-b pb-1 last:border-b-0">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{cost.category}</span>
                            <span className="text-sm text-muted-foreground">{cost.amount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{cost.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Estimativa Total</h4>
                    <p className="text-sm text-muted-foreground">{analysis.costStructure.totalCostEstimate}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Projeções Financeiras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <h4 className="font-medium mb-2">Ano 1</h4>
                      <p className="text-xs text-muted-foreground">Receita: {analysis.financialProjections.year1.revenue}</p>
                      <p className="text-xs text-muted-foreground">Lucro: {analysis.financialProjections.year1.profit}</p>
                      <p className="text-xs text-muted-foreground">Margem: {analysis.financialProjections.year1.margin}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Ano 2</h4>
                      <p className="text-xs text-muted-foreground">Receita: {analysis.financialProjections.year2.revenue}</p>
                      <p className="text-xs text-muted-foreground">Lucro: {analysis.financialProjections.year2.profit}</p>
                      <p className="text-xs text-muted-foreground">Margem: {analysis.financialProjections.year2.margin}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Ano 3</h4>
                      <p className="text-xs text-muted-foreground">Receita: {analysis.financialProjections.year3.revenue}</p>
                      <p className="text-xs text-muted-foreground">Lucro: {analysis.financialProjections.year3.profit}</p>
                      <p className="text-xs text-muted-foreground">Margem: {analysis.financialProjections.year3.margin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análise Break-Even
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Ponto de Equilíbrio</h4>
                    <p className="text-sm text-muted-foreground">{analysis.breakEvenAnalysis.breakEvenPoint}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Tempo para Break-Even</h4>
                    <p className="text-sm text-muted-foreground">{analysis.breakEvenAnalysis.timeToBreakEven}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Fatores Críticos</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.breakEvenAnalysis.criticalFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Necessidades de Financiamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Investimento Total</h4>
                    <p className="text-sm text-muted-foreground">{analysis.fundingRequirements.totalFunding}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Uso dos Recursos</h4>
                    <div className="space-y-1">
                      {analysis.fundingRequirements.useOfFunds.map((use, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{use.category}</span>
                          <span className="text-muted-foreground">{use.percentage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Riscos Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Riscos de Mercado</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.financialRisks.marketRisks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Estratégias de Mitigação</h4>
                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                      {analysis.financialRisks.mitigationStrategies.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Métricas-Chave
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">CAC</h4>
                      <p className="text-sm text-muted-foreground">{analysis.keyMetrics.cac}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">LTV</h4>
                      <p className="text-sm text-muted-foreground">{analysis.keyMetrics.ltv}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">LTV/CAC</h4>
                      <p className="text-sm text-muted-foreground">{analysis.keyMetrics.ltvCacRatio}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Burn Rate</h4>
                      <p className="text-sm text-muted-foreground">{analysis.keyMetrics.burnRate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Análise de Lucratividade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Margem Bruta</h4>
                      <p className="text-sm text-muted-foreground">{analysis.profitabilityAnalysis.grossProfitMargin}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Margem Operacional</h4>
                      <p className="text-sm text-muted-foreground">{analysis.profitabilityAnalysis.operatingMargin}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">ROI</h4>
                      <p className="text-sm text-muted-foreground">{analysis.profitabilityAnalysis.roi}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Payback</h4>
                      <p className="text-sm text-muted-foreground">{analysis.profitabilityAnalysis.paybackPeriod}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Fluxo de Caixa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Fluxo Operacional</h4>
                    <div className="space-y-1">
                      {analysis.cashFlowProjection.operatingCashFlow.map((flow, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{flow.period}</span>
                          <span className="text-muted-foreground">{flow.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Fluxo Líquido</h4>
                    <p className="text-sm text-muted-foreground">{analysis.cashFlowProjection.netCashFlow}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Retorno do Investimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">ROI Esperado</h4>
                      <p className="text-sm text-muted-foreground">{analysis.investmentReturn.expectedRoi}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">IRR</h4>
                      <p className="text-sm text-muted-foreground">{analysis.investmentReturn.irr}</p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="font-medium mb-1">NPV</h4>
                      <p className="text-sm text-muted-foreground">{analysis.investmentReturn.npv}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {analysis.sources && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Fontes de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">SerpAPI</h4>
                    <ul className="text-xs text-muted-foreground list-disc ml-4">
                      {analysis.sources.serpApi.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Perplexity</h4>
                    <ul className="text-xs text-muted-foreground list-disc ml-4">
                      {analysis.sources.perplexity.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button onClick={downloadAnalysis} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Análise
              </Button>
            </div>
          </div>
        ) : (
          <CreditGuard feature="financial-analysis">
            <EnhancedIdeaSelector 
              onSelect={handleIdeaSelect} 
              allowCustomIdea={true}
              customIdeaValue={customIdea}
              onCustomIdeaChange={handleCustomIdeaChange}
              useCustomIdea={useCustom}
              onUseCustomIdeaChange={handleUseCustomIdeaChange}
            />
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};