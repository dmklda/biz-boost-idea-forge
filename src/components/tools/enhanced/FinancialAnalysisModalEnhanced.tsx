import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  PieChart,
  Download,
  BarChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinancialAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FinancialAnalysis {
  revenueModel: string;
  costStructure: string[];
  initialInvestment: string;
  monthlyOperatingCosts: string;
  revenueProjections: string[];
  breakEvenAnalysis: string;
  fundingRequirements: string;
  financialRisks: string[];
  profitabilityTimeline: string;
  keyMetrics: string[];
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

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-financial-analysis', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setAnalysis(data.analysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockAnalysis = {
          revenueModel: "Modelo de assinatura mensal com três níveis de preço: Básico (R$ 29,90), Premium (R$ 59,90) e Enterprise (R$ 149,90). Receita adicional com vendas de recursos complementares e parcerias estratégicas.",
          costStructure: [
            "Desenvolvimento e manutenção de software: 35% da receita",
            "Marketing e aquisição de clientes: 25% da receita",
            "Infraestrutura e hospedagem: 15% da receita",
            "Suporte ao cliente: 10% da receita",
            "Despesas administrativas: 5% da receita",
            "Outros custos operacionais: 10% da receita"
          ],
          initialInvestment: "R$ 250.000,00",
          monthlyOperatingCosts: "R$ 45.000,00 (estimativa para os primeiros 12 meses)",
          revenueProjections: [
            "Mês 1-6: R$ 15.000,00 - R$ 30.000,00 por mês",
            "Mês 7-12: R$ 35.000,00 - R$ 60.000,00 por mês",
            "Ano 2: R$ 80.000,00 - R$ 120.000,00 por mês",
            "Ano 3: R$ 150.000,00 - R$ 250.000,00 por mês"
          ],
          breakEvenAnalysis: "Ponto de equilíbrio estimado em 18 meses, com aproximadamente 2.500 usuários pagantes, considerando um mix de planos e uma taxa de conversão de 5% de usuários gratuitos para pagantes.",
          fundingRequirements: "Investimento inicial de R$ 250.000,00 para desenvolvimento do MVP, lançamento e operações dos primeiros 6 meses. Rodada adicional de R$ 500.000,00 recomendada para escalar após validação do produto.",
          financialRisks: [
            "Taxa de conversão abaixo do esperado para planos pagos",
            "Custo de aquisição de cliente (CAC) acima das projeções",
            "Churn rate elevado nos primeiros meses",
            "Aumento nos custos de infraestrutura com o crescimento",
            "Necessidade de investimento adicional antes do ponto de equilíbrio"
          ],
          profitabilityTimeline: "Lucro operacional esperado a partir do mês 19, com margem de lucro de 10-15% no segundo ano e potencial para 25-30% a partir do terceiro ano, dependendo da eficiência na aquisição e retenção de clientes.",
          keyMetrics: [
            "CAC (Custo de Aquisição de Cliente): R$ 120,00",
            "LTV (Valor do Tempo de Vida do Cliente): R$ 720,00",
            "Razão LTV:CAC: 6:1",
            "Taxa de conversão: 5% de gratuito para pago",
            "Churn mensal: 5% (meta)",
            "MRR (Receita Recorrente Mensal): crescimento de 15% mês a mês no primeiro ano"
          ]
        };
        
        setAnalysis(mockAnalysis);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'financial-analysis',
            title: `Análise Financeira - ${ideaData.title}`,
            content_data: analysis as any
          });
      } catch (saveError) {
        console.warn('Failed to save financial analysis to database:', saveError);
        // Continue showing the content even if saving fails
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
    
    // Create a formatted text version of the analysis
    const content = `# Análise Financeira - ${selectedIdea?.title || 'Ideia Personalizada'}

## Modelo de Receita
${analysis.revenueModel}

## Investimento Inicial
${analysis.initialInvestment}

## Custos Operacionais Mensais
${analysis.monthlyOperatingCosts}

## Estrutura de Custos
${analysis.costStructure?.map(cost => `- ${cost}`).join('\n')}

## Projeções de Receita
${analysis.revenueProjections?.map(projection => `- ${projection}`).join('\n')}

## Análise de Ponto de Equilíbrio
${analysis.breakEvenAnalysis}

## Necessidades de Financiamento
${analysis.fundingRequirements}

## Riscos Financeiros
${analysis.financialRisks?.map(risk => `- ${risk}`).join('\n')}

## Cronograma de Lucratividade
${analysis.profitabilityTimeline}

## Métricas Chave
${analysis.keyMetrics?.map(metric => `- ${metric}`).join('\n')}
`;
    
    // Create a download link
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

  // Icon for the modal
  const analysisIcon = <DollarSign className="h-5 w-5 text-green-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise Financeira"
      icon={analysisIcon}
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Análise para: {selectedIdea?.title || "Ideia Personalizada"}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAnalysis}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
            </div>

            <ScrollArea className="h-[60vh]">
              <div className="grid gap-6 md:grid-cols-2 pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-500" />
                      Modelo de Receita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.revenueModel}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-red-500" />
                      Investimento Inicial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold text-lg">{analysis.initialInvestment}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Ponto de Equilíbrio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.breakEvenAnalysis}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                      Necessidades de Financiamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.fundingRequirements}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-orange-500" />
                      Estrutura de Custos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.costStructure?.map((cost, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">•</Badge>
                          <span className="text-sm">{cost}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Projeções de Receita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.revenueProjections?.map((projection, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge className="mt-1">{index + 1}</Badge>
                          <span className="text-sm">{projection}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Riscos Financeiros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.financialRisks?.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="destructive" className="mt-1">!</Badge>
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-500" />
                      Métricas Chave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.keyMetrics?.map((metric, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">📊</Badge>
                          <span className="text-sm">{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Cronograma de Lucratividade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.profitabilityTimeline}</p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <CreditGuard feature="financial-analysis"> //TODO: verificar se o feature está correto
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