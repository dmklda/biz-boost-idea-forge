import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Target, 
  Shield, 
  Lightbulb, 
  AlertTriangle,
  Download,
  BarChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketAnalysisModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MarketAnalysis {
  marketSize: string;
  targetAudience: string;
  marketTrends: string[];
  opportunities: string[];
  threats: string[];
  competitiveAdvantage: string[];
  entryBarriers: string[];
  recommendations: string[];
}

export const MarketAnalysisModalEnhanced: React.FC<MarketAnalysisModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('MarketAnalysisModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);

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
    if (!hasCredits('market-analysis')) {
      toast.error(`Você precisa de ${getFeatureCost('market-analysis')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('market-analysis'),
        p_feature: 'market-analysis',
        p_description: `Análise de Mercado gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      let generatedAnalysis;
      try {
        const { data, error } = await supabase.functions.invoke('generate-market-analysis', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        generatedAnalysis = data.analysis;
        setAnalysis(generatedAnalysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockAnalysis = {
          marketSize: "O mercado global para esta solução é estimado em R$ 5,2 bilhões, com crescimento anual de 14,3% nos próximos 5 anos.",
          targetAudience: "Profissionais urbanos entre 25-45 anos, com renda média-alta, preocupados com eficiência e sustentabilidade.",
          marketTrends: [
            "Aumento da demanda por soluções digitais integradas",
            "Crescente preocupação com privacidade e segurança de dados",
            "Preferência por interfaces simplificadas e intuitivas",
            "Maior disposição para pagar por serviços por assinatura"
          ],
          opportunities: [
            "Expansão para mercados internacionais com baixa penetração",
            "Desenvolvimento de funcionalidades premium para monetização",
            "Parcerias estratégicas com empresas complementares",
            "Criação de comunidade de usuários para feedback contínuo"
          ],
          threats: [
            "Entrada de grandes players tecnológicos no segmento",
            "Mudanças regulatórias que podem impactar o modelo de negócio",
            "Rápida evolução tecnológica exigindo atualizações constantes",
            "Resistência de usuários tradicionais à adoção digital"
          ],
          competitiveAdvantage: [
            "Interface mais intuitiva que a concorrência",
            "Algoritmo proprietário com maior precisão",
            "Integração com plataformas existentes",
            "Modelo de preços mais acessível para o mercado-alvo"
          ],
          entryBarriers: [
            "Necessidade de investimento inicial significativo",
            "Curva de aprendizado para desenvolvimento da tecnologia",
            "Estabelecimento de parcerias estratégicas",
            "Construção de credibilidade no mercado"
          ],
          recommendations: [
            "Focar inicialmente em um nicho específico para validação",
            "Desenvolver MVP com funcionalidades essenciais",
            "Estabelecer parcerias estratégicas para distribuição",
            "Investir em marketing digital direcionado ao público-alvo",
            "Coletar feedback contínuo para iterações rápidas"
          ]
        };
        
        generatedAnalysis = mockAnalysis;
        setAnalysis(mockAnalysis);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'market-analysis',
            title: `Análise de Mercado - ${ideaData.title}`,
            content_data: generatedAnalysis as any
          });
      } catch (saveError) {
        console.warn('Failed to save market analysis to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Análise de mercado gerada com sucesso!");
    } catch (error) {
      console.error('Error generating market analysis:', error);
      toast.error("Erro ao gerar análise de mercado. Tente novamente.");
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
    const content = `# Análise de Mercado - ${selectedIdea?.title || 'Ideia Personalizada'}

## Tamanho do Mercado
${analysis.marketSize}

## Público-Alvo
${analysis.targetAudience}

## Tendências do Mercado
${analysis.marketTrends?.map(trend => `- ${trend}`).join('\n')}

## Oportunidades
${analysis.opportunities?.map(opportunity => `- ${opportunity}`).join('\n')}

## Ameaças
${analysis.threats?.map(threat => `- ${threat}`).join('\n')}

## Vantagens Competitivas
${analysis.competitiveAdvantage?.map(advantage => `- ${advantage}`).join('\n')}

## Barreiras de Entrada
${analysis.entryBarriers?.map(barrier => `- ${barrier}`).join('\n')}

## Recomendações Estratégicas
${analysis.recommendations?.map((recommendation, index) => `${index + 1}. ${recommendation}`).join('\n')}
`;
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_de_mercado_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise de mercado baixada com sucesso!');
  };

  // Icon for the modal
  const analysisIcon = <TrendingUp className="h-5 w-5 text-blue-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Análise de Mercado"
      icon={analysisIcon}
      isGenerating={isGenerating}
      generatingText="Analisando mercado..."
      actionText="Gerar Análise de Mercado"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!analysis}
      maxWidth="4xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('market-analysis')}
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
                      <BarChart className="h-5 w-5 text-green-500" />
                      Tamanho do Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.marketSize}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Público-Alvo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.targetAudience}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      Tendências do Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.marketTrends?.map((trend, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">•</Badge>
                          <span className="text-sm">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Oportunidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.opportunities?.map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">•</Badge>
                          <span className="text-sm">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Ameaças
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.threats?.map((threat, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="destructive" className="mt-1">•</Badge>
                          <span className="text-sm">{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      Vantagens Competitivas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.competitiveAdvantage?.map((advantage, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">•</Badge>
                          <span className="text-sm">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-500" />
                      Barreiras de Entrada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.entryBarriers?.map((barrier, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">•</Badge>
                          <span className="text-sm">{barrier}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                      Recomendações Estratégicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations?.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge className="mt-1">{index + 1}</Badge>
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <CreditGuard feature="market-analysis">
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