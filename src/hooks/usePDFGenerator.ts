import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface PDFGeneratorOptions {
  isDarkMode: boolean;
  idea: any;
  analysis: any;
  ideaId: string;
}

export const usePDFGenerator = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePDF = async ({ isDarkMode, idea, analysis, ideaId }: PDFGeneratorOptions) => {
    if (!analysis || !idea) {
      toast.error(t('errors.pdfError') + ". " + t('errors.contentNotReady'));
      return;
    }

    try {
      setIsGeneratingPdf(true);
      toast.info(t('common.preparing') + ". " + t('pdf.generating'));

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
      let totalPages = 0;

      // Configurações de cores modernas
      const colors = {
        primary: [59, 73, 223] as [number, number, number], // Azul principal
        secondary: [99, 102, 241] as [number, number, number], // Azul secundário
        accent: [168, 85, 247] as [number, number, number], // Roxo
        success: [34, 197, 94] as [number, number, number], // Verde
        warning: [251, 146, 60] as [number, number, number], // Laranja
        danger: [239, 68, 68] as [number, number, number], // Vermelho
        text: [51, 65, 85] as [number, number, number], // Texto principal
        textLight: [100, 116, 139] as [number, number, number], // Texto secundário
        background: [255, 255, 255] as [number, number, number], // Fundo
        border: [226, 232, 240] as [number, number, number], // Bordas
        gradient1: [59, 73, 223] as [number, number, number], // Gradiente 1
        gradient2: [168, 85, 247] as [number, number, number] // Gradiente 2
      };

      // Função melhorada de sanitização de texto
      const sanitizeText = (text: string | undefined | null): string => {
        if (!text) return "";
        let sanitized = text;
        // Remove emojis e caracteres especiais problemáticos
        sanitized = sanitized.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "");
        // Remove caracteres de controle
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Remove aspas e caracteres especiais no início
        sanitized = sanitized.replace(/^[!\'\s]+/, '');
        // Normaliza espaços e quebras de linha
        sanitized = sanitized.replace(/\s+/g, ' ');
        sanitized = sanitized.replace(/\n+/g, ' ');
        // Remove pontuação duplicada
        sanitized = sanitized.replace(/([.!?])\1+/g, '$1');
        sanitized = sanitized.replace(/\s+([.!?])/g, '$1');
        return sanitized.trim();
      };

      // Função para adicionar rodapé com numeração correta
      const addFooter = (pageNum: number, totalPages: number) => {
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.textLight);
        pdf.setFont("helvetica", "normal");
        
        const footerText = `${t('pdf.page')} ${pageNum} ${t('pdf.of')} ${totalPages}`;
        const footerWidth = pdf.getStringUnitWidth(footerText) * 8 * (pdf.internal.scaleFactor / 2.8346);
        const footerX = pageWidth - margin - footerWidth;
        
        pdf.text(footerText, footerX, pageHeight - 15);
        
        // Linha sutil no rodapé
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(0.1);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      };

      // Função auxiliar para adicionar texto com controle de quebra de página
      const addTextWithPageBreak = (text: string, x: number, yPos: number, fontSize: number, fontStyle: string, textColor: [number, number, number], maxWidth: number, lineHeight: number = 5): number => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", fontStyle);
        pdf.setTextColor(...textColor);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        let currentY = yPos;
        
        for (const line of lines) {
          // Verificar se precisa de nova página
          if (currentY > pageHeight - 60) {
            pdf.addPage();
            currentPage++;
            currentY = 40; // Reset para nova página
          }
          
          pdf.text(line, x, currentY);
          currentY += lineHeight;
        }
        
        return currentY;
      };

      // Função auxiliar para adicionar título de seção
      const addSectionTitle = (title: string, yPos: number): number => {
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text(title, margin, yPos);
        
        // Linha decorativa
        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(1);
        const titleWidth = pdf.getStringUnitWidth(title) * 24 * (pdf.internal.scaleFactor / 2.8346);
        pdf.line(margin, yPos + 5, margin + Math.min(titleWidth, 80), yPos + 5);
        
        return yPos + 20;
      };

      // Função auxiliar para verificar e criar nova página se necessário
      const checkAndAddPage = (requiredSpace: number, currentY: number): number => {
        if (currentY + requiredSpace > pageHeight - 60) {
          pdf.addPage();
          currentPage++;
          return 40; // Reset para nova página
        }
        return currentY;
      };

      // Função para criar slide de capa
      const createCoverSlide = () => {
        // Fundo gradiente sutil
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Elemento decorativo no topo
        pdf.setFillColor(...colors.gradient1);
        pdf.rect(0, 0, pageWidth, 8, 'F');
        
        // Logo StartupIdea centralizado
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.gradient1);
        pdf.text("STARTUPIDEA", pageWidth / 2, 35, { align: "center" });
        
        // Linha decorativa
        pdf.setDrawColor(...colors.gradient2);
        pdf.setLineWidth(0.5);
        pdf.line(pageWidth / 2 - 40, 40, pageWidth / 2 + 40, 40);
        
        // Título principal
        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text(t('advancedAnalysis.title'), pageWidth / 2, pageHeight / 2 - 30, { align: "center" });
        
        // Nome da ideia
        const ideaTitle = sanitizeText(idea.title || t('advancedAnalysis.pdf.yourBusinessIdea'));
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        
        const ideaLines = pdf.splitTextToSize(ideaTitle, pageWidth - (margin * 2));
        const ideaHeight = ideaLines.length * 6;
        const ideaY = pageHeight / 2 + 10;
        
        ideaLines.forEach((line: string, index: number) => {
          pdf.text(line, pageWidth / 2, ideaY + (index * 6), { align: "center" });
        });
        
        // Informações de rodapé
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textLight);
        const generatedOn = `${t('advancedAnalysis.pdf.generatedOn')} ${new Date().toLocaleDateString('pt-BR')}`;
        const ideaIdText = `${t('advancedAnalysis.pdf.ideaIdLabel')} ${ideaId}`;
        
        pdf.text(generatedOn, pageWidth / 2, ideaY + ideaHeight + 20, { align: "center" });
        pdf.text(ideaIdText, pageWidth / 2, ideaY + ideaHeight + 27, { align: "center" });
        
        // Elemento decorativo no rodapé
        pdf.setFillColor(...colors.gradient2);
        pdf.rect(0, pageHeight - 8, pageWidth, 8, 'F');
      };

      // Função para criar slide de resumo executivo
      const createExecutiveSummarySlide = () => {
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.executiveSummary'), 40);
        
        const content = analysis.analysis_data;
        
        // Nome do negócio
        if (content.businessName?.name) {
          const businessNameText = `${t('advancedAnalysis.pdf.businessName')}: ${sanitizeText(content.businessName.name)}`;
          yPos = addTextWithPageBreak(businessNameText, margin, yPos, 14, "bold", colors.text, pageWidth - (margin * 2), 6);
          yPos += 10;
        }
        
        // Slogan
        if (content.businessName?.slogan) {
          const sloganText = `"${sanitizeText(content.businessName.slogan)}"`;
          yPos = addTextWithPageBreak(sloganText, margin, yPos, 12, "italic", colors.textLight, pageWidth - (margin * 2), 6);
          yPos += 15;
        }
        
        // Descrição
        if (content.summary?.description) {
          yPos = addTextWithPageBreak(sanitizeText(content.summary.description), margin, yPos, 11, "normal", colors.text, pageWidth - (margin * 2), 5);
          yPos += 10;
        }
        
        // Conceito
        if (content.pitch) {
          yPos = addTextWithPageBreak(t('advancedAnalysis.pdf.concept'), margin, yPos, 12, "bold", colors.secondary, pageWidth - (margin * 2), 6);
          yPos += 5;
          yPos = addTextWithPageBreak(sanitizeText(content.pitch), margin, yPos, 11, "normal", colors.text, pageWidth - (margin * 2), 5);
        }
      };

      // Função para criar slide de diferenciais
      const createDifferentialsSlide = () => {
        const content = analysis.analysis_data;
        if (!content.differentials || content.differentials.length === 0) return;
        
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.differentials'), 40);
        
        // Diferenciais em formato de cards
        content.differentials.forEach((diff: string, index: number) => {
          const sanitizedDiff = sanitizeText(diff);
          if (!sanitizedDiff) return;
          
          // Verificar espaço necessário
          const cardHeight = 30;
          yPos = checkAndAddPage(cardHeight, yPos);
          
          // Card background
          pdf.setFillColor(...colors.background);
          pdf.rect(margin - 5, yPos - 5, pageWidth - (margin * 2) + 10, cardHeight, 'F');
          
          // Borda colorida
          pdf.setFillColor(...colors.accent);
          pdf.rect(margin - 5, yPos - 5, 3, cardHeight, 'F');
          
          // Número do diferencial
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...colors.accent);
          pdf.text(`${index + 1}`, margin + 5, yPos + 8);
          
          // Texto do diferencial
          const diffLines = pdf.splitTextToSize(sanitizedDiff, pageWidth - (margin * 2) - 20);
          diffLines.forEach((line: string, lineIndex: number) => {
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(...colors.text);
            pdf.text(line, margin + 20, yPos + (lineIndex * 4) + 4);
          });
          
          yPos += cardHeight + 5;
        });
      };

      // Função para criar slide de análise de mercado
      const createMarketAnalysisSlide = () => {
        const content = analysis.analysis_data;
        if (!content.marketAnalysis) return;
        
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.marketAnalysis'), 40);
        
        // Tamanho do mercado
        if (content.marketAnalysis.size) {
          const marketSizeText = `${t('advancedAnalysis.pdf.marketSize')}: ${sanitizeText(content.marketAnalysis.size)}`;
          yPos = addTextWithPageBreak(marketSizeText, margin, yPos, 14, "bold", colors.text, pageWidth - (margin * 2), 6);
          yPos += 10;
        }
        
        // Público-alvo
        if (content.marketAnalysis.targetAudience) {
          const audienceText = `${t('advancedAnalysis.pdf.targetAudience')}: ${sanitizeText(content.marketAnalysis.targetAudience)}`;
          yPos = addTextWithPageBreak(audienceText, margin, yPos, 14, "bold", colors.text, pageWidth - (margin * 2), 6);
          yPos += 15;
        }
        
        // Tendências do mercado
        if (content.marketAnalysis.trends?.length > 0) {
          yPos = addTextWithPageBreak(t('advancedAnalysis.pdf.marketTrends'), margin, yPos, 16, "bold", colors.secondary, pageWidth - (margin * 2), 6);
          yPos += 5;
          
          content.marketAnalysis.trends.forEach((trend: string, index: number) => {
            const sanitizedTrend = sanitizeText(trend);
            if (!sanitizedTrend) return;
            
            // Verificar espaço necessário
            const trendLines = pdf.splitTextToSize(sanitizedTrend, pageWidth - (margin * 2) - 15);
            const trendHeight = trendLines.length * 4 + 8;
            yPos = checkAndAddPage(trendHeight, yPos);
            
            // Bullet point colorido
            pdf.setFontSize(12);
            pdf.setTextColor(...colors.success);
            pdf.text("▶", margin + 5, yPos + 4);
            
            // Texto da tendência
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(...colors.text);
            
            trendLines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, margin + 15, yPos + (lineIndex * 4));
            });
            
            yPos += trendHeight;
          });
        }
      };

      // Função para criar slide de competidores
      const createCompetitorsSlide = () => {
        const content = analysis.analysis_data;
        if (!content.competitors || content.competitors.length === 0) return;
        
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.competitorAnalysis'), 40);
        
        content.competitors.forEach((competitor: any, index: number) => {
          // Verificar espaço necessário para o card do competidor
          const cardHeight = 100;
          yPos = checkAndAddPage(cardHeight, yPos);
          
          // Card do competidor
          pdf.setFillColor(...colors.background);
          pdf.rect(margin - 5, yPos - 5, pageWidth - (margin * 2) + 10, cardHeight, 'F');
          
          // Borda colorida
          pdf.setFillColor(...colors.warning);
          pdf.rect(margin - 5, yPos - 5, 3, cardHeight, 'F');
          
          // Nome do competidor
          const competitorName = `${index + 1}. ${sanitizeText(competitor.name || `Concorrente ${index + 1}`)}`;
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...colors.primary);
          pdf.text(competitorName, margin + 10, yPos + 8);
          
          let cardY = yPos + 15;
          
          // Pontos fortes
          if (competitor.strengths?.length > 0) {
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...colors.success);
            pdf.text("Pontos Fortes:", margin + 10, cardY);
            cardY += 8;
            
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(...colors.text);
            
            competitor.strengths.forEach((strength: string) => {
              const sanitizedStrength = sanitizeText(strength);
              if (sanitizedStrength && cardY < yPos + cardHeight - 10) {
                pdf.text(`• ${sanitizedStrength}`, margin + 15, cardY);
                cardY += 5;
              }
            });
          }
          
          // Pontos fracos
          if (competitor.weaknesses?.length > 0) {
            cardY += 5;
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...colors.danger);
            pdf.text("Pontos Fracos:", margin + 10, cardY);
            cardY += 8;
            
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(...colors.text);
            
            competitor.weaknesses.forEach((weakness: string) => {
              const sanitizedWeakness = sanitizeText(weakness);
              if (sanitizedWeakness && cardY < yPos + cardHeight - 10) {
                pdf.text(`• ${sanitizedWeakness}`, margin + 15, cardY);
                cardY += 5;
              }
            });
          }
          
          yPos += cardHeight + 10;
        });
      };

      // Função para criar slide de personas
      const createPersonasSlide = () => {
        const content = analysis.analysis_data;
        if (!content.personas || content.personas.length === 0) return;
        
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.customerAnalysis'), 40);
        
        content.personas.forEach((persona: any, index: number) => {
          // Verificar espaço necessário para o card da persona
          const cardHeight = 80;
          yPos = checkAndAddPage(cardHeight, yPos);
          
          // Card da persona
          pdf.setFillColor(...colors.background);
          pdf.rect(margin - 5, yPos - 5, pageWidth - (margin * 2) + 10, cardHeight, 'F');
          
          // Borda colorida
          pdf.setFillColor(...colors.gradient1);
          pdf.rect(margin - 5, yPos - 5, 3, cardHeight, 'F');
          
          // Nome da persona
          const personaName = `${t('advancedAnalysis.pdf.persona')} ${index + 1}: ${sanitizeText(persona.name || '')}`;
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...colors.primary);
          pdf.text(personaName, margin + 10, yPos + 8);
          
          let cardY = yPos + 15;
          
          // Descrição
          if (persona.description) {
            const descLines = pdf.splitTextToSize(sanitizeText(persona.description), pageWidth - (margin * 2) - 20);
            descLines.forEach((line: string, lineIndex: number) => {
              if (cardY < yPos + cardHeight - 20) {
                pdf.setFontSize(11);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(...colors.text);
                pdf.text(line, margin + 10, cardY);
                cardY += 4;
              }
            });
          }
          
          // Ocupação e comportamento
          if (persona.occupation || persona.behavior) {
            cardY += 5;
            
            if (persona.occupation) {
              const occupationText = `${t('advancedAnalysis.pdf.occupation')}: ${sanitizeText(persona.occupation)}`;
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(...colors.textLight);
              pdf.text(occupationText, margin + 10, cardY);
              cardY += 8;
            }
            
            if (persona.behavior) {
              const behaviorText = `${t('advancedAnalysis.pdf.behavior')}: ${sanitizeText(persona.behavior)}`;
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(...colors.textLight);
              pdf.text(behaviorText, margin + 10, cardY);
            }
          }
          
          yPos += cardHeight + 10;
        });
      };

      // Função para criar slide SWOT em formato de mapa mental
      const createSWOTSlide = () => {
        const content = analysis.analysis_data;
        if (!content.swot) return;
        
        pdf.addPage();
        currentPage++;
        
        // Título
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text(t('advancedAnalysis.pdf.swotAnalysis'), pageWidth / 2, 40, { align: "center" });
        
        // Linha decorativa
        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(1);
        pdf.line(pageWidth / 2 - 40, 45, pageWidth / 2 + 40, 45);
        
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;
        const radius = 60;
        
        // Desenhar círculo central
        pdf.setFillColor(...colors.background);
        pdf.circle(centerX, centerY, radius, 'F');
        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(2);
        pdf.circle(centerX, centerY, radius);
        
        // Texto central
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text("SWOT", centerX, centerY + 2, { align: "center" });
        
        // Função para criar quadrantes
        const createQuadrant = (title: string, items: string[], color: [number, number, number], x: number, y: number, width: number, height: number) => {
          // Background do quadrante
          pdf.setFillColor(...color);
          pdf.rect(x, y, width, height, 'F');
          
          // Título do quadrante
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
          pdf.text(title, x + width / 2, y + 8, { align: "center" });
          
          // Items
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(255, 255, 255);
          
          let itemY = y + 15;
          items.forEach((item: string, index: number) => {
            const sanitizedItem = sanitizeText(item);
            if (!sanitizedItem) return;
            
            const itemLines = pdf.splitTextToSize(sanitizedItem, width - 10);
            itemLines.forEach((line: string) => {
              if (itemY < y + height - 5) {
                pdf.text(`• ${line}`, x + 5, itemY);
                itemY += 4;
              }
            });
          });
        };
        
        // Quadrantes SWOT
        const quadrantWidth = 70;
        const quadrantHeight = 80;
        
        // Strengths (Superior esquerdo)
        if (content.swot.strengths?.length > 0) {
          createQuadrant(
            t('advancedAnalysis.pdf.swotStrengths'),
            content.swot.strengths,
            colors.success,
            margin,
            60,
            quadrantWidth,
            quadrantHeight
          );
        }
        
        // Weaknesses (Superior direito)
        if (content.swot.weaknesses?.length > 0) {
          createQuadrant(
            t('advancedAnalysis.pdf.swotWeaknesses'),
            content.swot.weaknesses,
            colors.warning,
            pageWidth - margin - quadrantWidth,
            60,
            quadrantWidth,
            quadrantHeight
          );
        }
        
        // Opportunities (Inferior esquerdo)
        if (content.swot.opportunities?.length > 0) {
          createQuadrant(
            t('advancedAnalysis.pdf.swotOpportunities'),
            content.swot.opportunities,
            colors.primary,
            margin,
            150,
            quadrantWidth,
            quadrantHeight
          );
        }
        
        // Threats (Inferior direito)
        if (content.swot.threats?.length > 0) {
          createQuadrant(
            t('advancedAnalysis.pdf.swotThreats'),
            content.swot.threats,
            colors.danger,
            pageWidth - margin - quadrantWidth,
            150,
            quadrantWidth,
            quadrantHeight
          );
        }
      };

      // Função para criar slide de mindmap
      const createMindMapSlide = () => {
        const content = analysis.analysis_data;
        if (!content.mindmap) return;
        
        pdf.addPage();
        currentPage++;
        
        // Título
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text(t('mindmap.title'), pageWidth / 2, 40, { align: "center" });
        
        // Linha decorativa
        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(1);
        pdf.line(pageWidth / 2 - 30, 45, pageWidth / 2 + 30, 45);
        
        // Função recursiva para renderizar o mindmap
        const renderMindMapNode = (node: any, x: number, y: number, level: number = 0) => {
          if (!node) return;
          
          const nodeText = sanitizeText(node.label || node.name || "Unknown");
          const fontSize = Math.max(10 - level, 8);
          
          // Desenhar nó
          pdf.setFontSize(fontSize);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...colors.primary);
          
          // Background do nó
          const textWidth = pdf.getStringUnitWidth(nodeText) * fontSize * (pdf.internal.scaleFactor / 2.8346);
          const nodeWidth = textWidth + 10;
          const nodeHeight = fontSize + 6;
          
          pdf.setFillColor(...colors.background);
          pdf.rect(x - nodeWidth/2, y - nodeHeight/2, nodeWidth, nodeHeight, 'F');
          pdf.setDrawColor(...colors.primary);
          pdf.setLineWidth(0.5);
          pdf.rect(x - nodeWidth/2, y - nodeHeight/2, nodeWidth, nodeHeight);
          
          // Texto do nó
          pdf.text(nodeText, x, y + fontSize/3, { align: "center" });
          
          // Renderizar filhos
          if (node.children && node.children.length > 0) {
            const childCount = node.children.length;
            const angleStep = (Math.PI * 2) / childCount;
            const radius = 40 + level * 20;
            
            node.children.forEach((child: any, index: number) => {
              const angle = index * angleStep;
              const childX = x + Math.cos(angle) * radius;
              const childY = y + Math.sin(angle) * radius;
              
              // Linha conectando
              pdf.setDrawColor(...colors.textLight);
              pdf.setLineWidth(0.3);
              pdf.line(x, y, childX, childY);
              
              // Renderizar filho
              renderMindMapNode(child, childX, childY, level + 1);
            });
          }
        };
        
        // Renderizar mindmap a partir do nó raiz
        const rootNode = content.mindmap.root || content.mindmap;
        renderMindMapNode(rootNode, pageWidth / 2, pageHeight / 2);
      };

      // Função para criar slide de projeções financeiras
      const createFinancialSlide = () => {
        const content = analysis.analysis_data;
        if (!content.monetization) return;
        
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.monetizationModels'), 40);
        
        // Modelos de monetização
        if (content.monetization.models?.length > 0) {
          content.monetization.models.forEach((model: any) => {
            // Verificar espaço necessário
            const cardHeight = 50;
            yPos = checkAndAddPage(cardHeight, yPos);
            
            // Card do modelo
            pdf.setFillColor(...colors.background);
            pdf.rect(margin - 5, yPos - 5, pageWidth - (margin * 2) + 10, cardHeight, 'F');
            
            // Borda colorida
            pdf.setFillColor(...colors.gradient2);
            pdf.rect(margin - 5, yPos - 5, 3, cardHeight, 'F');
            
            // Nome do modelo
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...colors.primary);
            pdf.text(sanitizeText(model.name), margin + 10, yPos + 8);
            
            // Descrição
            if (model.description) {
              const descLines = pdf.splitTextToSize(sanitizeText(model.description), pageWidth - (margin * 2) - 20);
              descLines.forEach((line: string, lineIndex: number) => {
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(...colors.text);
                pdf.text(line, margin + 10, yPos + 20 + (lineIndex * 3.5));
              });
            }
            
            yPos += cardHeight + 5;
          });
        }
        
        // Projeções financeiras
        if (content.monetization.projections) {
          yPos += 10;
          
          yPos = addTextWithPageBreak(t('advancedAnalysis.pdf.financialProjections'), margin, yPos, 16, "bold", colors.secondary, pageWidth - (margin * 2), 6);
          yPos += 5;
          
          const projections = content.monetization.projections;
          const projectionItems = [
            { key: 'firstYear', label: t('advancedAnalysis.pdf.firstYear') },
            { key: 'thirdYear', label: t('advancedAnalysis.pdf.thirdYear') },
            { key: 'breakEven', label: t('advancedAnalysis.pdf.breakEven') },
            { key: 'roi', label: t('advancedAnalysis.pdf.expectedROI') }
          ];
          
          projectionItems.forEach((item) => {
            if (projections[item.key]) {
              const projectionText = `${item.label}: ${sanitizeText(projections[item.key])}`;
              yPos = addTextWithPageBreak(projectionText, margin, yPos, 12, "bold", colors.text, pageWidth - (margin * 2), 6);
            }
          });
        }
      };

      // Função para criar slide de cronograma
      const createTimelineSlide = () => {
        const content = analysis.analysis_data;
        if (!content.plan) return;
        
        pdf.addPage();
        currentPage++;
        
        let yPos = addSectionTitle(t('advancedAnalysis.pdf.implementationPlan'), 40);
        
        const planPhases = [
          { titleKey: 'advancedAnalysis.pdf.first30Days', data: content.plan.thirtyDays, color: colors.success },
          { titleKey: 'advancedAnalysis.pdf.next60Days', data: content.plan.sixtyDays, color: colors.warning },
          { titleKey: 'advancedAnalysis.pdf.next90Days', data: content.plan.ninetyDays, color: colors.primary }
        ];
        
        planPhases.forEach((phase) => {
          if (phase.data?.length > 0) {
            // Título da fase
            yPos = addTextWithPageBreak(t(phase.titleKey), margin, yPos, 14, "bold", phase.color, pageWidth - (margin * 2), 6);
            yPos += 5;
            
            // Items da fase
            phase.data.forEach((item: any) => {
              // Verificar espaço necessário
              const itemHeight = 30;
              yPos = checkAndAddPage(itemHeight, yPos);
              
              // Card do item
              pdf.setFillColor(...colors.background);
              pdf.rect(margin - 3, yPos - 3, pageWidth - (margin * 2) + 6, itemHeight, 'F');
              
              // Borda colorida
              pdf.setFillColor(...phase.color);
              pdf.rect(margin - 3, yPos - 3, 2, itemHeight, 'F');
              
              // Nome do item
              pdf.setFontSize(11);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(...colors.text);
              pdf.text(sanitizeText(item.name), margin + 8, yPos + 6);
              
              // Descrição
              if (item.description) {
                const descLines = pdf.splitTextToSize(sanitizeText(item.description), pageWidth - (margin * 2) - 15);
                descLines.forEach((line: string, lineIndex: number) => {
                  pdf.setFontSize(9);
                  pdf.setFont("helvetica", "normal");
                  pdf.setTextColor(...colors.textLight);
                  pdf.text(line, margin + 8, yPos + 15 + (lineIndex * 3));
                });
              }
              
              yPos += itemHeight + 5;
            });
            
            yPos += 5;
          }
        });
      };

      // Função para criar slide de conclusão
      const createConclusionSlide = () => {
        pdf.addPage();
        currentPage++;
        
        // Título
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.primary);
        pdf.text("Conclusão", pageWidth / 2, 40, { align: "center" });
        
        // Linha decorativa
        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(1);
        pdf.line(pageWidth / 2 - 30, 45, pageWidth / 2 + 30, 45);
        
        // Mensagem de conclusão
        const conclusionText = `Esta análise avançada demonstra o potencial da ideia "${sanitizeText(idea.title)}" no mercado atual. Com base nos dados apresentados, a ideia apresenta oportunidades significativas de crescimento e monetização.`;
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colors.text);
        
        const conclusionLines = pdf.splitTextToSize(conclusionText, pageWidth - (margin * 2));
        const conclusionY = pageHeight / 2 - 20;
        
        conclusionLines.forEach((line: string, index: number) => {
          pdf.text(line, pageWidth / 2, conclusionY + (index * 6), { align: "center" });
        });
        
        // Call to action
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colors.accent);
        pdf.text("Próximos Passos:", pageWidth / 2, conclusionY + conclusionLines.length * 6 + 20, { align: "center" });
        
        const nextSteps = [
          "Validar hipóteses com o público-alvo",
          "Desenvolver MVP baseado na análise",
          "Buscar feedback de especialistas",
          "Iniciar implementação do plano"
        ];
        
        let stepsY = conclusionY + conclusionLines.length * 6 + 35;
        nextSteps.forEach((step, index) => {
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...colors.text);
          pdf.text(`${index + 1}. ${step}`, pageWidth / 2, stepsY, { align: "center" });
          stepsY += 8;
        });
      };

      // Gerar todos os slides
      createCoverSlide();
      createExecutiveSummarySlide();
      createDifferentialsSlide();
      createMarketAnalysisSlide();
      createCompetitorsSlide();
      createPersonasSlide();
      createSWOTSlide();
      createMindMapSlide();
      createFinancialSlide();
      createTimelineSlide();
      createConclusionSlide();

      // Atualizar numeração final
      totalPages = pdf.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addFooter(i, totalPages);
      }

      const finalFileName = `pitch-deck-${idea?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ideia'}.pdf`;
      pdf.save(finalFileName);

      toast.success(t('pdf.downloadComplete') + ". " + t('pdf.pdfReady'));
      
    } catch (error) {
      console.error("Error generating PDF programmatically:", error);
      toast.error(t('errors.pdfGenerationError') + ". " + t('errors.tryAgainLater'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return {
    generatePDF,
    isGeneratingPdf
  };
}; 