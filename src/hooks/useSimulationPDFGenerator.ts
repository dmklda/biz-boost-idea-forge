import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { SimulationResults, ScenarioType } from '@/hooks/useScenarioSimulator';
import { formatCurrency } from '@/lib/utils';

interface SimulationPDFOptions {
  results: SimulationResults;
  simulationName: string;
  companyName?: string;
}

export const useSimulationPDFGenerator = () => {
  const { toast } = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generateSimulationPDF = async ({ results, simulationName, companyName }: SimulationPDFOptions) => {
    if (!results || !results.results) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Dados da simulação não estão disponíveis"
      });
      return;
    }

    try {
      setIsGeneratingPdf(true);
      toast({
        title: "Gerando relatório PDF",
        description: "Preparando documento executivo..."
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentPage = 1;

      // Cores corporativas
      const colors = {
        primary: [59, 73, 223] as [number, number, number],
        secondary: [99, 102, 241] as [number, number, number],
        accent: [168, 85, 247] as [number, number, number],
        success: [34, 197, 94] as [number, number, number],
        warning: [251, 146, 60] as [number, number, number],
        danger: [239, 68, 68] as [number, number, number],
        text: [51, 65, 85] as [number, number, number],
        textLight: [100, 116, 139] as [number, number, number],
        background: [255, 255, 255] as [number, number, number],
        border: [226, 232, 240] as [number, number, number]
      };

      const scenarios = Object.keys(results.results) as ScenarioType[];
      
      // Função auxiliar para sanitizar texto
      const sanitizeText = (text: string | undefined | null): string => {
        if (!text) return "";
        return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
      };

      // Função para formatar valores monetários
      const formatCurrencyValue = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) {
          return 'R$ 0';
        }
        if (Math.abs(value) >= 1000000) {
          return `R$ ${(value / 1000000).toFixed(1)}M`;
        } else if (Math.abs(value) >= 1000) {
          return `R$ ${(value / 1000).toFixed(1)}K`;
        }
        return `R$ ${value.toFixed(0)}`;
      };

      // Função para formatar percentual
      const formatPercentage = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) {
          return '0.0%';
        }
        return `${value.toFixed(1)}%`;
      };

      // Função para adicionar rodapé
      const addFooter = (pageNum: number, totalPages: number) => {
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.textLight);
        pdf.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 25, pageHeight - 15);
        
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(0.1);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      };

      // Função para adicionar nova página
      const addNewPage = () => {
        pdf.addPage();
        currentPage++;
      };

      // Função para adicionar título de seção
      const addSectionTitle = (title: string, yPos: number): number => {
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text(title, margin, yPos);
        
        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(0.5);
        const titleWidth = pdf.getStringUnitWidth(title) * 18 * (pdf.internal.scaleFactor / 2.8346);
        pdf.line(margin, yPos + 3, margin + Math.min(titleWidth, 120), yPos + 3);
        
        return yPos + 15;
      };

      // 1. CAPA
      const createCoverPage = () => {
        // Fundo
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header colorido
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, pageWidth, 8, 'F');
        
        // Logo/Título
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text("RELATÓRIO EXECUTIVO", pageWidth / 2, 40, { align: "center" });
        
        pdf.setFontSize(16);
        pdf.setTextColor(...colors.secondary);
        pdf.text("Simulação Financeira Monte Carlo", pageWidth / 2, 50, { align: "center" });
        
        // Linha decorativa
        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(1);
        pdf.line(pageWidth / 2 - 50, 55, pageWidth / 2 + 50, 55);
        
        // Nome da empresa/simulação
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        const title = sanitizeText(companyName || simulationName || "Análise Financeira");
        pdf.text(title, pageWidth / 2, pageHeight / 2 - 20, { align: "center" });
        
        // Informações de metadados
        pdf.setFontSize(12);
        pdf.setTextColor(...colors.textLight);
        const metadata = [
          `Data: ${new Date().toLocaleDateString('pt-BR')}`,
          `Simulação: ${sanitizeText(simulationName)}`,
          `Cenários: ${scenarios.length}`,
          `Iterações: ${results.metadata?.totalIterations?.toLocaleString() || 'N/A'}`,
          `Horizonte: ${results.metadata?.timeHorizon || 'N/A'} meses`
        ];
        
        let metaY = pageHeight / 2 + 20;
        metadata.forEach(meta => {
          pdf.text(meta, pageWidth / 2, metaY, { align: "center" });
          metaY += 8;
        });
        
        // Footer colorido
        pdf.setFillColor(...colors.accent);
        pdf.rect(0, pageHeight - 8, pageWidth, 8, 'F');
      };

      // 2. RESUMO EXECUTIVO
      const createExecutiveSummary = () => {
        addNewPage();
        let yPos = addSectionTitle("RESUMO EXECUTIVO", 40);
        
        // KPIs principais em cards
        const realisticResult = results.results['realistic'] || results.results[scenarios[0]];
        
        // Card 1: Lucro Operacional
        pdf.setFillColor(240, 248, 255);
        pdf.rect(margin, yPos, 80, 25, 'F');
        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, yPos, 80, 25);
        
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textLight);
        pdf.text("LUCRO OPERACIONAL", margin + 5, yPos + 8);
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.success);
        pdf.text(formatCurrencyValue(realisticResult?.finalOperationalProfit), margin + 5, yPos + 18);
        
        // Card 2: ROI
        pdf.setFillColor(240, 253, 244);
        pdf.rect(margin + 90, yPos, 80, 25, 'F');
        pdf.setDrawColor(...colors.success);
        pdf.rect(margin + 90, yPos, 80, 25);
        
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textLight);
        pdf.text("RETORNO SOBRE INVESTIMENTO", margin + 95, yPos + 8);
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text(formatPercentage(realisticResult?.roi), margin + 95, yPos + 18);
        
        yPos += 35;
        
        // Card 3: Payback
        pdf.setFillColor(252, 240, 255);
        pdf.rect(margin, yPos, 80, 25, 'F');
        pdf.setDrawColor(...colors.accent);
        pdf.rect(margin, yPos, 80, 25);
        
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textLight);
        pdf.text("TEMPO DE PAYBACK", margin + 5, yPos + 8);
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.accent);
        pdf.text(`${realisticResult?.paybackPeriod || 'N/A'} meses`, margin + 5, yPos + 18);
        
        // Card 4: Probabilidade de Sucesso
        pdf.setFillColor(255, 247, 237);
        pdf.rect(margin + 90, yPos, 80, 25, 'F');
        pdf.setDrawColor(...colors.warning);
        pdf.rect(margin + 90, yPos, 80, 25);
        
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textLight);
        pdf.text("PROBABILIDADE DE LUCRO", margin + 95, yPos + 8);
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.warning);
        const profitProb = (1 - (realisticResult?.riskMetrics?.probability_of_loss || 0)) * 100;
        pdf.text(formatPercentage(profitProb), margin + 95, yPos + 18);
        
        yPos += 45;
        
        // Insights principais
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        pdf.text("PRINCIPAIS INSIGHTS", margin, yPos);
        yPos += 10;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        
        const insights = [
          `• A simulação Monte Carlo com ${results.metadata?.totalIterations?.toLocaleString() || 'N/A'} iterações mostra viabilidade do projeto`,
          `• Cenário realista projeta lucro operacional de ${formatCurrencyValue(realisticResult?.finalOperationalProfit)}`,
          `• Tempo estimado para recuperar investimento: ${realisticResult?.paybackPeriod || 'N/A'} meses`,
          `• Probabilidade de sucesso: ${formatPercentage(profitProb)}`,
          `• Margem de lucro projetada: ${formatPercentage(realisticResult?.profitMargin)}`
        ];
        
        insights.forEach(insight => {
          const lines = pdf.splitTextToSize(insight, pageWidth - (margin * 2));
          lines.forEach((line: string) => {
            pdf.text(line, margin, yPos);
            yPos += 6;
          });
        });
      };

      // 3. COMPARAÇÃO DE CENÁRIOS
      const createScenarioComparison = () => {
        addNewPage();
        let yPos = addSectionTitle("ANÁLISE DE CENÁRIOS", 40);
        
        // Tabela de comparação
        const tableHeaders = ['Métrica', 'Otimista', 'Realista', 'Pessimista'];
        const colWidth = (pageWidth - (margin * 2)) / 4;
        
        // Header da tabela
        pdf.setFillColor(...colors.primary);
        pdf.rect(margin, yPos, pageWidth - (margin * 2), 12, 'F');
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        
        tableHeaders.forEach((header, index) => {
          pdf.text(header, margin + (index * colWidth) + 2, yPos + 8);
        });
        
        yPos += 12;
        
        // Dados da tabela
        const tableRows = [
          ['Lucro Final', 
           formatCurrencyValue(results.results['optimistic']?.finalOperationalProfit),
           formatCurrencyValue(results.results['realistic']?.finalOperationalProfit),
           formatCurrencyValue(results.results['pessimistic']?.finalOperationalProfit)
          ],
          ['ROI', 
           formatPercentage(results.results['optimistic']?.roi),
           formatPercentage(results.results['realistic']?.roi),
           formatPercentage(results.results['pessimistic']?.roi)
          ],
          ['Payback (meses)', 
           `${results.results['optimistic']?.paybackPeriod || 'N/A'}`,
           `${results.results['realistic']?.paybackPeriod || 'N/A'}`,
           `${results.results['pessimistic']?.paybackPeriod || 'N/A'}`
          ],
          ['Prob. Lucro', 
           formatPercentage((1 - (results.results['optimistic']?.riskMetrics?.probability_of_loss || 0)) * 100),
           formatPercentage((1 - (results.results['realistic']?.riskMetrics?.probability_of_loss || 0)) * 100),
           formatPercentage((1 - (results.results['pessimistic']?.riskMetrics?.probability_of_loss || 0)) * 100)
          ]
        ];
        
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        
        tableRows.forEach((row, rowIndex) => {
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
          }
          
          row.forEach((cell, cellIndex) => {
            pdf.text(cell, margin + (cellIndex * colWidth) + 2, yPos + 7);
          });
          
          yPos += 10;
        });
        
        yPos += 20;
        
        // Interpretação dos cenários
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        pdf.text("INTERPRETAÇÃO DOS CENÁRIOS", margin, yPos);
        yPos += 15;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        
        const interpretations = [
          {
            title: "CENÁRIO OTIMISTA:",
            description: "Representa condições ideais de mercado, com alta demanda e custos controlados. Serve como meta aspiracional.",
            color: colors.success
          },
          {
            title: "CENÁRIO REALISTA:",
            description: "Baseado em premissas mais conservadoras e dados de mercado. Principal referência para planejamento.",
            color: colors.primary
          },
          {
            title: "CENÁRIO PESSIMISTA:",
            description: "Considera adversidades e riscos do mercado. Importante para análise de contingência e gestão de riscos.",
            color: colors.danger
          }
        ];
        
        interpretations.forEach(interpretation => {
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...interpretation.color);
          pdf.text(interpretation.title, margin, yPos);
          yPos += 8;
          
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...colors.text);
          const lines = pdf.splitTextToSize(interpretation.description, pageWidth - (margin * 2));
          lines.forEach((line: string) => {
            pdf.text(line, margin, yPos);
            yPos += 5;
          });
          yPos += 5;
        });
      };

      // 4. ANÁLISE DE RISCOS
      const createRiskAnalysis = () => {
        addNewPage();
        let yPos = addSectionTitle("ANÁLISE DE RISCOS", 40);
        
        scenarios.forEach(scenario => {
          const result = results.results[scenario];
          const scenarioColors = {
            optimistic: colors.success,
            realistic: colors.primary,
            pessimistic: colors.danger
          };
          
          // Card de risco por cenário
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPos, pageWidth - (margin * 2), 30, 'F');
          pdf.setDrawColor(...(scenarioColors[scenario] || colors.border));
          pdf.setLineWidth(1);
          pdf.rect(margin, yPos, pageWidth - (margin * 2), 30);
          
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...(scenarioColors[scenario] || colors.text));
          pdf.text(`CENÁRIO ${scenario.toUpperCase()}`, margin + 5, yPos + 10);
          
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...colors.text);
          
          const riskMetrics = [
            `VaR 95%: ${formatCurrencyValue(Math.abs(result?.riskMetrics?.value_at_risk_95 || 0))}`,
            `Prob. Perda: ${formatPercentage((result?.riskMetrics?.probability_of_loss || 0) * 100)}`,
            `Desvio Padrão: ${formatCurrencyValue(result?.statistics?.stdDev)}`
          ];
          
          let metricX = margin + 5;
          riskMetrics.forEach(metric => {
            pdf.text(metric, metricX, yPos + 22);
            metricX += 55;
          });
          
          yPos += 40;
        });
        
        // Recomendações de mitigação
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        pdf.text("RECOMENDAÇÕES DE MITIGAÇÃO", margin, yPos);
        yPos += 15;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        
        const recommendations = [
          "• Diversificar fontes de receita para reduzir dependência de um único canal",
          "• Estabelecer reserva de contingência para cenários adversos",
          "• Monitorar indicadores-chave mensalmente para ajustes rápidos",
          "• Criar plano de contingência para o cenário pessimista",
          "• Considerar seguros ou instrumentos financeiros para hedging"
        ];
        
        recommendations.forEach(rec => {
          const lines = pdf.splitTextToSize(rec, pageWidth - (margin * 2));
          lines.forEach((line: string) => {
            pdf.text(line, margin, yPos);
            yPos += 6;
          });
        });
      };

      // 5. ANÁLISE DE SENSIBILIDADE
      const createSensitivityAnalysis = () => {
        if (!results.sensitivityAnalysis || results.sensitivityAnalysis.length === 0) return;
        
        addNewPage();
        let yPos = addSectionTitle("ANÁLISE DE SENSIBILIDADE", 40);
        
        pdf.setFontSize(11);
        pdf.setTextColor(...colors.text);
        pdf.text("Variáveis que mais impactam o resultado do negócio:", margin, yPos);
        yPos += 15;
        
        // Ranking das variáveis mais sensíveis
        const sortedSensitivity = [...results.sensitivityAnalysis]
          .sort((a, b) => Math.abs(b.impact_on_npv || 0) - Math.abs(a.impact_on_npv || 0))
          .slice(0, 5);
        
        sortedSensitivity.forEach((analysis, index) => {
          const impactPercent = Math.abs(analysis.impact_on_npv || 0);
          const barWidth = (impactPercent / 100) * 120; // Normalizar para largura máxima
          
          // Barra de impacto
          pdf.setFillColor(...colors.accent);
          pdf.rect(margin + 60, yPos - 3, Math.max(barWidth, 5), 8, 'F');
          
          // Nome da variável
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...colors.text);
          pdf.text(`${index + 1}. ${analysis.variable.replace(/_/g, ' ')}`, margin, yPos + 2);
          
          // Valor do impacto
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...colors.primary);
          pdf.text(`${impactPercent.toFixed(1)}%`, margin + 140, yPos + 2);
          
          yPos += 15;
        });
        
        yPos += 10;
        
        // Insights de sensibilidade
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        pdf.text("INSIGHTS DA ANÁLISE:", margin, yPos);
        yPos += 10;
        
        const topVariable = sortedSensitivity[0];
        if (topVariable) {
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          
          const insights = [
            `• A variável "${topVariable.variable.replace(/_/g, ' ')}" tem o maior impacto (${Math.abs(topVariable.impact_on_npv || 0).toFixed(1)}%)`,
            "• Foque em monitorar e controlar as 3 principais variáveis identificadas",
            "• Pequenas mudanças nas variáveis mais sensíveis podem ter grandes impactos",
            "• Use essa análise para priorizar esforços de gestão e controle"
          ];
          
          insights.forEach(insight => {
            const lines = pdf.splitTextToSize(insight, pageWidth - (margin * 2));
            lines.forEach((line: string) => {
              pdf.text(line, margin, yPos);
              yPos += 6;
            });
          });
        }
      };

      // 6. CONCLUSÕES E RECOMENDAÇÕES
      const createConclusions = () => {
        addNewPage();
        let yPos = addSectionTitle("CONCLUSÕES E RECOMENDAÇÕES", 40);
        
        const realisticResult = results.results['realistic'] || results.results[scenarios[0]];
        
        // Viabilidade do projeto
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text("VIABILIDADE DO PROJETO", margin, yPos);
        yPos += 15;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        
        const profitProb = (1 - (realisticResult?.riskMetrics?.probability_of_loss || 0)) * 100;
        let viabilityText = "";
        let viabilityColor = colors.text;
        
        if (profitProb >= 70) {
          viabilityText = "PROJETO VIÁVEL - Alta probabilidade de sucesso";
          viabilityColor = colors.success;
        } else if (profitProb >= 50) {
          viabilityText = "PROJETO MODERADAMENTE VIÁVEL - Requer atenção aos riscos";
          viabilityColor = colors.warning;
        } else {
          viabilityText = "PROJETO DE ALTO RISCO - Revisar premissas e estratégia";
          viabilityColor = colors.danger;
        }
        
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...viabilityColor);
        pdf.text(viabilityText, margin, yPos);
        yPos += 20;
        
        // Recomendações estratégicas
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.text);
        pdf.text("RECOMENDAÇÕES ESTRATÉGICAS", margin, yPos);
        yPos += 15;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        
        const recommendations = [
          "1. IMPLEMENTAÇÃO FASEADA: Inicie com MVP para validar premissas antes do investimento total",
          "2. MONITORAMENTO CONTÍNUO: Acompanhe KPIs mensais e compare com projeções",
          "3. GESTÃO DE RISCOS: Mantenha reserva financeira para cenários adversos",
          "4. OTIMIZAÇÃO: Foque nas variáveis de maior impacto identificadas na análise de sensibilidade",
          "5. REVISÃO PERIÓDICA: Atualize as simulações trimestralmente com dados reais"
        ];
        
        recommendations.forEach(rec => {
          const lines = pdf.splitTextToSize(rec, pageWidth - (margin * 2));
          lines.forEach((line: string) => {
            pdf.text(line, margin, yPos);
            yPos += 6;
          });
          yPos += 3;
        });
        
        // Próximos passos
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text("PRÓXIMOS PASSOS", margin, yPos);
        yPos += 15;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        
        const nextSteps = [
          "□ Revisar e validar premissas com equipe e mentores",
          "□ Desenvolver plano de implementação faseada",
          "□ Estabelecer sistema de monitoramento de KPIs",
          "□ Preparar pitch para investidores (se necessário)",
          "□ Agendar revisão da simulação em 3 meses"
        ];
        
        nextSteps.forEach(step => {
          pdf.text(step, margin, yPos);
          yPos += 8;
        });
      };

      // Gerar todas as seções
      createCoverPage();
      createExecutiveSummary();
      createScenarioComparison();
      createRiskAnalysis();
      createSensitivityAnalysis();
      createConclusions();

      // Adicionar rodapés a todas as páginas
      const totalPages = currentPage;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i > 1) { // Não adicionar rodapé na capa
          addFooter(i, totalPages);
        }
      }

      // Salvar PDF
      const fileName = `simulacao-${sanitizeText(simulationName || 'analise')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF gerado com sucesso!",
        description: `Relatório executivo salvo como ${fileName}`
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro na geração do PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente."
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return {
    generateSimulationPDF,
    isGeneratingPdf
  };
};