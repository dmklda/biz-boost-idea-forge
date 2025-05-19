import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download,
  Share2,
  MessageSquare,
  X, 
  ChevronLeft,
  Save
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedAnalysisContent } from "./AdvancedAnalysisContent";
import { AdvancedAnalysisChat } from "./AdvancedAnalysisChat";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
// import html2canvas from "html2canvas"; // Comentado, pois não será usado para o corpo principal

interface AdvancedAnalysisModalProps {
  ideaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AdvancedAnalysis {
  id: string;
  idea_id: string;
  user_id: string;
  analysis_data: any;
  created_at: string;
}

interface IdeaData {
  id: string;
  title: string;
  description: string;
  problem?: string | null;
  audience?: string | null;
  has_competitors?: string | null;
  monetization?: string | null;
  budget?: number | null;
  location?: string | null;
  [key: string]: any;
}

export function AdvancedAnalysisModal({
  ideaId,
  open,
  onOpenChange,
}: AdvancedAnalysisModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [analysisCheckCompleted, setAnalysisCheckCompleted] = useState(false);

  const motivationalPhrases = [
    t('advancedAnalysis.motivation1'),
    t('advancedAnalysis.motivation2'),
    t('advancedAnalysis.motivation3'),
    t('advancedAnalysis.motivation4'),
    t('advancedAnalysis.motivation5'),
    t('advancedAnalysis.motivation6'),
    t('advancedAnalysis.motivation7'),
    t('advancedAnalysis.motivation8')
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  // Clear any active polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollInterval !== null) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  useEffect(() => {
    if (open && authState.isAuthenticated && ideaId) {
      fetchIdeaDetails();
      fetchExistingAnalysis(); // Apenas busca análises existentes, não gera novas
    } else {
      // Reset states when modal is closed
      if (!open) {
        setAnalysis(null);
        setProgress(0);
        setCurrentPhrase(0);
        setAnalysisCheckCompleted(false);
      }
    }
  }, [open, ideaId, authState.isAuthenticated]);

  // Gerar análise automaticamente APENAS quando verificação completa confirmar que não existe análise
  useEffect(() => {
    // Só gerar nova análise se: verificação completa + sem análise + não está carregando + modal aberto
    if (analysisCheckCompleted && !analysis && !loading && open && authState.isAuthenticated && ideaId) {
      console.log("Verificação completa - nenhuma análise existente. Gerando uma nova análise automaticamente.");
      generateNewAnalysis();
    }
  }, [analysisCheckCompleted, analysis, loading, open]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5; // Slower progress
          if (newProgress >= 95) { // Cap at 95% until data is actually loaded
            clearInterval(interval);
            return 95;
          }
          return newProgress;
        });

        setCurrentPhrase((prev) => {
          const newPhrase = Math.floor((progress / 100) * motivationalPhrases.length);
          return Math.min(newPhrase, motivationalPhrases.length - 1);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loading, progress, motivationalPhrases.length]);

  // Check if analysis is already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (analysis && authState.isAuthenticated) {
        try {
          const { data } = await supabase
            .from('saved_analyses')
            .select('*')
            .eq('original_analysis_id', analysis.id)
            .eq('user_id', authState.user?.id)
            .maybeSingle();
          
          setIsSaved(!!data);
        } catch (error) {
          console.error("Error checking if analysis is saved:", error);
          setIsSaved(false);
        }
      }
    };
    
    checkIfSaved();
  }, [analysis, authState.isAuthenticated, authState.user?.id]);

  const fetchIdeaDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", ideaId)
        .eq("user_id", authState.user?.id)
        .single();

      if (error) throw error;
      setIdea(data as IdeaData);
    } catch (error) {
      console.error("Error fetching idea details:", error);
    }
  };

  // Função para apenas buscar análises existentes sem gerar novas
  const fetchExistingAnalysis = async () => {
    setIsLoadingExisting(true);
    setAnalysisCheckCompleted(false);
    
    try {
      // Verificar se já existe análise
      console.log("Verificando análises existentes para a ideia:", ideaId);
      const { data, error } = await supabase
        .from("advanced_analyses")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", authState.user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        console.log("Análise existente encontrada:", data);
        setAnalysis(data as AdvancedAnalysis);
      }
    } catch (error) {
      console.error("Erro ao buscar análise avançada existente:", error);
    } finally {
      setIsLoadingExisting(false);
      setAnalysisCheckCompleted(true);
    }
  };

  // Função para gerar uma nova análise quando o botão for clicado
  const generateNewAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    setAttempts(0); // Reset attempts counter
    
    try {
      // Deduz créditos antes de iniciar a análise
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 2,
        p_feature: 'advanced_analysis',
        p_item_id: ideaId,
        p_description: 'Análise avançada da ideia'
      });
      if (creditError) {
        toast.error('Créditos insuficientes ou erro ao deduzir créditos.');
        setLoading(false);
        return;
      }
      
      // Sempre inicia uma nova análise
      console.log("Iniciando geração de nova análise avançada para a ideia:", ideaId);
      
      // Clear any existing interval
        if (pollInterval !== null) {
          clearInterval(pollInterval);
        }
        
      // Iniciar análise
        try {
        console.log("Iniciando geração de análise avançada...");
          const response = await supabase.functions.invoke("advanced-analysis", {
            body: { ideaId }
          });

          if (response.error) {
            throw new Error(response.error.message || "Error starting analysis");
          }

          console.log("Analysis generation initiated:", response);
        } catch (error) {
          console.error("Error initiating advanced analysis:", error);
        toast.error(t('errors.fetchError') + ". " + t('errors.tryAgainLater'));
        setLoading(false);
        return;
        }
        
        // Start polling for results
        const interval = window.setInterval(async () => {
          const currentAttempts = attempts + 1;
          setAttempts(currentAttempts);
          
          console.log(`Polling for analysis results (attempt ${currentAttempts}/10)...`);
          
          const { data: pollData, error: pollError } = await supabase
            .from("advanced_analyses")
            .select("*")
            .eq("idea_id", ideaId)
            .eq("user_id", authState.user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
          if (pollData) {
            clearInterval(interval);
            setPollInterval(null);
            setAnalysis(pollData as AdvancedAnalysis);
            setLoading(false);
            setProgress(100);
          console.log("Nova análise encontrada:", pollData);
          } else if (currentAttempts >= 10) {
            clearInterval(interval);
            setPollInterval(null);
          toast.error(t('errors.analysisNotFound') + ". " +
                    t('errors.startNewAnalysis'));
            setLoading(false);
            console.log("Failed to find analysis after maximum attempts");
          }
          
          setAttempts(currentAttempts);
        }, 3000);
        
        setPollInterval(interval);
    } catch (error) {
      console.error("Error fetching advanced analysis:", error);
      toast.error(t('errors.fetchError') + ". " +
                t('errors.tryAgainLater'));
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Generate sharing URL
      const shareUrl = `${window.location.origin}/dashboard/ideas?id=${ideaId}&tab=advanced`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: idea?.title || t('advancedAnalysis.title'),
          text: t('share.advancedAnalysisText'),
          url: shareUrl
        });
        
        toast.success(t('common.shared') + ". " +
                    t('share.linkShared'));
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        toast.success(t('common.copied') + ". " +
                    t('share.linkCopied'));
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error(t('errors.shareError') + ". " +
                t('errors.tryAgain'));
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis || !idea) {
      toast.error(t('errors.pdfError') + ". " +
                t('errors.contentNotReady'));
      return;
    }

    // Lógica de créditos para download de PDF
    if (authState.user?.plan !== 'pro') {
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 1,
        p_feature: 'download_pdf',
        p_item_id: ideaId,
        p_description: 'Download de PDF da análise avançada'
      });
      if (creditError) {
        toast.error(t('ideaForm.insufficientCredits', "Créditos insuficientes para baixar PDF"));
        return;
      }
    }

    try {
      setIsGeneratingPdf(true);
      toast.info(t('common.preparing') + ". " +
                t('pdf.generating'));

          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;
      let pageCount = 1;

      const addPageHeaderFooter = () => {
        if (pageCount > 1) {
            pdf.setFontSize(8);
            pdf.setTextColor(isDarkMode ? 200 : 120);
            pdf.text(t('advancedAnalysis.title'), margin, margin / 2);
            // Page number string is removed from here, will be added by the final loop
        }
      };

      const checkNewPage = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
          pdf.addPage();
          pageCount++;
          yPos = margin;
          addPageHeaderFooter();
        }
      };
      
      const addTitle = (titleText: string) => {
        checkNewPage(25); // Increased needed height for larger font
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(isDarkMode ? 235 : 20);
        pdf.text(titleText, margin, yPos);
        yPos += 9; // Adjusted for larger font
        pdf.setLineWidth(0.35); // Approx 1px
        pdf.setDrawColor(221, 221, 221); // #DDD
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 12;
      };

      const addSubTitle = (titleText: string) => {
        checkNewPage(18); // Increased needed height for larger font
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold"); // Using bold for semi-bold
        // Dark blue for subtitles (approx. Tailwind indigo-600/indigo-400)
        isDarkMode ? pdf.setTextColor(139, 148, 252) : pdf.setTextColor(59, 73, 223);
        pdf.text(titleText, margin, yPos);
        yPos += 9; // Adjusted for larger font
      };
      
      const addParagraph = (text: string | undefined | null, indent = false, customYOffset = 4) => {
        if (!text) return;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(isDarkMode ? 190 : 70);
        const textLines = pdf.splitTextToSize(text, pageWidth - (margin * 2) - (indent ? 7 : 0));
        const neededHeight = textLines.length * 4.5; // Adjusted line height for 11pt
        checkNewPage(neededHeight + customYOffset); 
        pdf.text(textLines, indent ? margin + 7 : margin, yPos);
        yPos += neededHeight + customYOffset;
      };

      const addList = (items: string[] | undefined | null) => {
        if (!items || items.length === 0) {
          addParagraph(t('common.notSpecified'), true, 2);
          return;
        }
        items.forEach(item => {
          addParagraph(`• ${item}`, true, 5);
        });
        yPos += 3;
      };
      
      // Função de sanitização de texto
      const sanitizeText = (text: string | undefined | null): string => {
        if (!text) return "";
        let sanitized = text;
        // Rule 0: Specifically remove REPLACEMENT_CHAR followed by space/punctuation
        sanitized = sanitized.replace(/\uFFFD\s*(!\'\s*|'\!\s*|!\s*|'\s*)/g, '');
        // Rule 1: Remove any other non-ASCII characters
        sanitized = sanitized.replace(/[^\x00-\x7F]/g, "");
        // Rule 2: Remove leading punctuation if not caught by Rule 0 (e.g., no preceding \uFFFD)
        sanitized = sanitized.replace(/^(!\'\s*|'\!\s*|!\s*|'\s*)/, '');
        // Rule 3: Normalize multiple spaces to a single space
        sanitized = sanitized.replace(/\s+/g, ' ');
        // Rule 4: Trim leading/trailing whitespace
        return sanitized.trim();
      };

      const addKeyValue = (key: string, value: string | number | undefined | null) => {
        if (value === undefined || value === null) value = t('common.notSpecified');
        
        const keyText = `${key}:`;
        const valueText = String(value);
        const indentText = "  → ";

        pdf.setFontSize(11); // Changed to 11pt for key
        pdf.setTextColor(isDarkMode ? 190 : 70);

        // Key
        pdf.setFont("helvetica", "bold");
        const keyLines = pdf.splitTextToSize(keyText, pageWidth - margin * 2);
        const keyNeededHeight = keyLines.length * 4.5; // Adjusted for 11pt
        checkNewPage(keyNeededHeight + 2); 
        pdf.text(keyLines, margin, yPos);
        yPos += keyNeededHeight + 2;

        // Value (indentado na linha abaixo)
        pdf.setFont("helvetica", "normal"); // Value text also 11pt
        const valueAvailableWidthForSplit = pageWidth - (margin + 7 + pdf.getStringUnitWidth(indentText) * 11 * (pdf.internal.scaleFactor / 2.8346)) - margin; 
        const valueLinesUnindented = pdf.splitTextToSize(valueText, valueAvailableWidthForSplit);
        const valueNeededHeight = valueLinesUnindented.length * 4.5; // Adjusted for 11pt
        
        checkNewPage(valueNeededHeight + 4); 
        valueLinesUnindented.forEach((line, index) => {
            const currentLineY = yPos + (index * 4.5); // Adjusted line spacing
            if (index === 0) {
                pdf.text(indentText + line, margin + 7, currentLineY);
            } else {
                pdf.text(line, margin + 7 + pdf.getStringUnitWidth(indentText) * 11 * (pdf.internal.scaleFactor / 2.8346), currentLineY); 
            }
        });
        yPos += valueNeededHeight + 4; 
      };

      pdf.setFillColor(isDarkMode ? 31 : 240, isDarkMode ? 41 : 240, isDarkMode ? 55 : 240); 
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(isDarkMode ? 255 : 20);
      pdf.text(t('advancedAnalysis.title'), pageWidth / 2, pageHeight / 2 - 40, { align: "center" }); // Ajustar Y para dar espaço ao subtítulo
      
      pdf.setFontSize(14); // Tamanho um pouco menor para o subtítulo, mas ainda legível
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(isDarkMode ? 220 : 50);
      const ideaTitleText = idea.title || t('advancedAnalysis.pdf.yourBusinessIdea');
      const ideaTitleLines = pdf.splitTextToSize(ideaTitleText, pageWidth - (margin * 2)); // Quebrar o título da ideia se for longo
      // Calcular a altura total do título da ideia para centralizar o bloco
      const ideaTitleHeight = ideaTitleLines.length * (14 * 0.352778); // 14pt para mm, aproximado
      let titleYStart = pageHeight / 2 - 20 - (ideaTitleHeight / 2); // Ajuste Y para o bloco do título da ideia
      pdf.text(ideaTitleLines, pageWidth / 2, titleYStart, { align: "center" });

      pdf.setFontSize(10);
            pdf.setTextColor(isDarkMode ? 200 : 100);
      const generatedOnText = `${t('advancedAnalysis.pdf.generatedOn')} ${new Date().toLocaleDateString()}`;
      const ideaIdText = `${t('advancedAnalysis.pdf.ideaIdLabel')} ${ideaId}`;
      pdf.text(generatedOnText, pageWidth / 2, titleYStart + ideaTitleHeight + 10, { align: "center" });
      pdf.text(ideaIdText, pageWidth / 2, titleYStart + ideaTitleHeight + 15, { align: "center" });
      
      pdf.addPage();
      pageCount++;
      yPos = margin;
      addPageHeaderFooter();

      const content = analysis.analysis_data; 

      const addSectionSpacing = () => {
        yPos += 5;
      };

      if (content.businessName?.name || content.summary?.description || content.pitch) {
        addTitle(t('advancedAnalysis.pdf.executiveSummary'));
        if(content.businessName?.name) addKeyValue(t('advancedAnalysis.pdf.businessName'), sanitizeText(content.businessName.name));
        if(content.businessName?.slogan) addKeyValue(t('advancedAnalysis.pdf.slogan'), sanitizeText(content.businessName.slogan));
        if(content.summary?.description) addParagraph(sanitizeText(content.summary.description));
        if(content.pitch) {
            addSubTitle(t('advancedAnalysis.pdf.concept'));
            addParagraph(sanitizeText(content.pitch));
        }
        addSectionSpacing();
      }

      if (content.differentials && content.differentials.length > 0) {
        addSubTitle(t('advancedAnalysis.pdf.differentials'));
        addList(content.differentials.map(sanitizeText)); // Sanitizar itens da lista
        addSectionSpacing();
      }
      
      if (content.firstSteps && content.firstSteps.length > 0) {
        addSubTitle(t('advancedAnalysis.pdf.firstSteps'));
        content.firstSteps.forEach((step: {name: string, icon?: string, description?: string}) => {
            // Omitir step.icon para evitar caracteres corrompidos
            addParagraph(sanitizeText(step.name)); 
            if(step.description) addParagraph(sanitizeText(step.description), true);
        });
        addSectionSpacing();
      }
      
      if (content.marketAnalysis) {
        addTitle(t('advancedAnalysis.pdf.marketAnalysis'));
        if(content.marketAnalysis.size) addKeyValue(t('advancedAnalysis.pdf.marketSize'), sanitizeText(content.marketAnalysis.size));
        if(content.marketAnalysis.targetAudience) addKeyValue(t('advancedAnalysis.pdf.targetAudience'), sanitizeText(content.marketAnalysis.targetAudience));
        if(content.marketAnalysis.trends?.length > 0) {
            addSubTitle(t('advancedAnalysis.pdf.marketTrends'));
            addList(content.marketAnalysis.trends.map(sanitizeText)); // Sanitizar itens da lista
        }
        if(content.marketAnalysis.barriers?.length > 0) {
            addSubTitle(t('advancedAnalysis.pdf.entryBarriers'));
            addList(content.marketAnalysis.barriers.map(sanitizeText)); // Sanitizar itens da lista
        }
        addSectionSpacing();
      }
      
      if (content.personas?.length > 0) {
        addTitle(t('advancedAnalysis.pdf.customerAnalysis'));
        addSubTitle(t('advancedAnalysis.pdf.personas'));
        content.personas.forEach((persona: {name: string, description: string, occupation?: string, behavior?: string}, idx: number) => {
            addParagraph(sanitizeText(`${t('advancedAnalysis.pdf.persona')} ${idx + 1}: ${persona.name || ''}`));
            if(persona.description) addParagraph(sanitizeText(persona.description), true);
            if(persona.occupation) addKeyValue(t('advancedAnalysis.pdf.occupation'), sanitizeText(persona.occupation));
            if(persona.behavior) addKeyValue(t('advancedAnalysis.pdf.behavior'), sanitizeText(persona.behavior));
            yPos += 3;
        });
        addSectionSpacing();
      }
      if (content.channels?.length > 0) {
        if (!(content.personas?.length > 0)) {
            addTitle(t('advancedAnalysis.pdf.customerAnalysis'));
        }
        addSubTitle(t('advancedAnalysis.pdf.acquisitionChannels'));
        content.channels.forEach((channel: {name: string, description: string}) => {
            addParagraph(sanitizeText(channel.name));
            if(channel.description) addParagraph(sanitizeText(channel.description), true);
        });
        addSectionSpacing();
      }

      if (content.competitors?.length > 0) {
        addTitle(t('advancedAnalysis.pdf.competitorAnalysis'));
        content.competitors.forEach((competitor: {name: string, strengths?: string[], weaknesses?: string[]}) => {
            addSubTitle(sanitizeText(competitor.name || t('advancedAnalysis.pdf.competitor')));
            if(competitor.strengths?.length > 0){
                addParagraph(t('advancedAnalysis.pdf.strengthsLabel'));
                addList(competitor.strengths.map(sanitizeText));
            }
            if(competitor.weaknesses?.length > 0){
                addParagraph(t('advancedAnalysis.pdf.weaknessesLabel'));
                addList(competitor.weaknesses.map(sanitizeText));
            }
            yPos += 3;
        });
        addSectionSpacing();
      }
      
      if (content.swot) {
        addTitle(t('advancedAnalysis.pdf.swotAnalysis'));
        if(content.swot.strengths?.length > 0){
            addSubTitle(t('advancedAnalysis.pdf.swotStrengths'));
            addList(content.swot.strengths.map(sanitizeText));
        }
        if(content.swot.weaknesses?.length > 0){
            addSubTitle(t('advancedAnalysis.pdf.swotWeaknesses'));
            addList(content.swot.weaknesses.map(sanitizeText));
        }
        if(content.swot.opportunities?.length > 0){
            addSubTitle(t('advancedAnalysis.pdf.swotOpportunities'));
            addList(content.swot.opportunities.map(sanitizeText));
        }
        if(content.swot.threats?.length > 0){
            addSubTitle(t('advancedAnalysis.pdf.swotThreats'));
            addList(content.swot.threats.map(sanitizeText));
        }
        addSectionSpacing();
      }

      if (content.monetization) {
        addTitle(t('advancedAnalysis.pdf.monetizationModels'));
        if(content.monetization.models?.length > 0) {
            content.monetization.models.forEach((model: {name: string, description: string, revenue?: string}) => {
                addSubTitle(sanitizeText(model.name));
                if(model.description) addParagraph(sanitizeText(model.description));
                if(model.revenue) addKeyValue(t('advancedAnalysis.pdf.revenue'), sanitizeText(model.revenue));
            });
        }
        if(content.monetization.projections) {
            addSubTitle(t('advancedAnalysis.pdf.financialProjections'));
            if(content.monetization.projections.firstYear) addKeyValue(t('advancedAnalysis.pdf.firstYear'), sanitizeText(content.monetization.projections.firstYear));
            if(content.monetization.projections.thirdYear) addKeyValue(t('advancedAnalysis.pdf.thirdYear'), sanitizeText(content.monetization.projections.thirdYear));
            if(content.monetization.projections.breakEven) addKeyValue(t('advancedAnalysis.pdf.breakEven'), sanitizeText(content.monetization.projections.breakEven));
            if(content.monetization.projections.roi) addKeyValue(t('advancedAnalysis.pdf.expectedROI'), sanitizeText(content.monetization.projections.roi));
        }
        addSectionSpacing();
      }

      if (content.risks?.length > 0) {
        addTitle(t('advancedAnalysis.pdf.riskAnalysis'));
        content.risks.forEach((risk: {name: string, level: string, description: string, mitigation?: string}) => {
            addSubTitle(sanitizeText(`${risk.name || t('advancedAnalysis.pdf.risk')} (${t('advancedAnalysis.pdf.level')}: ${risk.level || 'N/A'})`));
            if(risk.description) addParagraph(sanitizeText(risk.description));
            if(risk.mitigation) {
                addParagraph(t('advancedAnalysis.pdf.mitigationStrategyLabel'));
                addParagraph(sanitizeText(risk.mitigation), true);
            }
        });
        addSectionSpacing();
      }
      
      if (content.plan) {
        addTitle(t('advancedAnalysis.pdf.implementationPlan'));
        const planPhases = [
            { titleKey: 'advancedAnalysis.pdf.first30Days', defaultTitle: t('advancedAnalysis.pdf.first30Days'), data: content.plan.thirtyDays },
            { titleKey: 'advancedAnalysis.pdf.next60Days', defaultTitle: t('advancedAnalysis.pdf.next60Days'), data: content.plan.sixtyDays }, 
            { titleKey: 'advancedAnalysis.pdf.next90Days', defaultTitle: t('advancedAnalysis.pdf.next90Days'), data: content.plan.ninetyDays }  
        ];
        planPhases.forEach(phase => {
            if (phase.data?.length > 0) {
                addSubTitle(t(phase.titleKey));
                phase.data.forEach((item: {name: string, description: string}) => {
                    addParagraph(sanitizeText(item.name));
                    if(item.description) addParagraph(sanitizeText(item.description), true);
                });
            }
        });
        addSectionSpacing();
      }

      if (content.tools?.length > 0) {
        addTitle(t('advancedAnalysis.pdf.recommendedTools'));
        content.tools.forEach((tool: {category: string, name: string, description: string}) => {
            addSubTitle(sanitizeText(`${tool.category || t('advancedAnalysis.pdf.category')}: ${tool.name || ''}`));
            if(tool.description) addParagraph(sanitizeText(tool.description));
        });
      }
      
      // After all content is added, put total page numbers
      const totalPages = pdf.internal.pages.length;
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
        pdf.setTextColor(isDarkMode ? 200 : 120);
        const pageString = t('pdf.page', { page: i });
        const totalPagesString = ` ${t('pdf.of')} ${totalPages}`;
        const fullPageStringWidth = pdf.getStringUnitWidth(pageString + totalPagesString) * 8 * (pdf.internal.scaleFactor / 2.8346);
        const xPos = pageWidth - margin - fullPageStringWidth;

        // Re-draw the idea title/generic title in the header for all pages except title page if needed
        if (i > 1) { // Assuming page 1 is the title page
            pdf.text(t('advancedAnalysis.title'), margin, margin / 2); 
        }
        // Draw "Página X de Y"
        pdf.text(`${pageString}${totalPagesString}`, xPos, pageHeight - margin / 2);
      }

      const finalFileName = `analise-avancada-${idea?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ideia'}.pdf`;
      pdf.save(finalFileName);

      toast.success(t('pdf.downloadComplete') + ". " +
                  t('pdf.pdfReady'));
      
        } catch (error) {
      console.error("Error generating PDF programmatically:", error);
      toast.error(t('errors.pdfGenerationError') + ". " +
                t('errors.tryAgainLater'));
        } finally {
          setIsGeneratingPdf(false);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleContentRef = (ref: HTMLDivElement | null) => {
    setContentRef(ref);
  };

  const handleSaveAnalysis = async () => {
    if (!analysis || !idea || !authState.isAuthenticated) {
      toast.error(t('errors.saveError') + ". " +
                t('errors.missingData'));
      return;
    }

    try {
      setIsSaving(true);

      // Check if already saved
      const { data: existingData, error: checkError } = await supabase
        .from('saved_analyses')
        .select('*')
        .eq('original_analysis_id', analysis.id)
        .eq('user_id', authState.user?.id);

      if (existingData && existingData.length > 0) {
        // Already saved - update the timestamp
        const { error: updateError } = await supabase
          .from('saved_analyses')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existingData[0].id);

        if (updateError) throw updateError;

        toast.success(t('common.updated') + ". " +
                    t('analysis.alreadySaved'));
      } else {
        // Save new
        const { error: saveError } = await supabase
          .from('saved_analyses')
          .insert({
            user_id: authState.user?.id,
            idea_id: ideaId,
            idea_title: idea.title,
            original_analysis_id: analysis.id,
            analysis_data: analysis.analysis_data
          });

        if (saveError) throw saveError;

        toast.success(t('common.saved') + ". " +
                    t('analysis.saveSuccess'));
      }

      setIsSaved(true);
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast.error(t('errors.saveError') + ". " +
                t('errors.tryAgainLater'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl h-[90vh] flex flex-col p-0 gap-0",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
      )}>
        <DialogHeader className={cn(
          "px-4 py-3 border-b sm:px-6 sm:py-4",
          "pl-4 sm:pl-6 pr-10 sm:pr-10 py-3 sm:py-4",
          isDarkMode ? "border-slate-800" : "border-slate-200"
        )}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className={cn(
              "text-lg sm:text-xl",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {loading
                ? t('advancedAnalysis.generating')
                : t('advancedAnalysis.title')}
            </DialogTitle>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {!loading && analysis && (
                <>
                  <Button 
                    variant="default" 
                    onClick={generateNewAnalysis}
                    size="sm"
                    className="bg-brand-purple hover:bg-brand-purple/90 mr-1"
                  >
                    {t('advancedAnalysis.reanalyze', "Re-análise Avançada")}
                  </Button>
                  <Button 
                    variant={isDarkMode ? "outline" : "outline"} 
                    size="sm" 
                    onClick={handleSaveAnalysis}
                    disabled={isSaving}
                    className={cn(
                      "transition-all px-2",
                      isSaved ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : "", 
                      isDarkMode && !isSaved ? "border-slate-700 hover:bg-slate-800" : "",
                      isDarkMode && isSaved ? "bg-green-900/20 text-green-400 border-green-800 hover:bg-green-900/30" : ""
                    )}
                  >
                    <Save className={cn("h-4 w-4", isSaving && "animate-pulse")} />
                    <span className="hidden sm:inline ml-1">
                      {((): string => {
                        const logPrefix = "[SaveButtonDebug]";
                        console.log(`${logPrefix} isSaved: ${isSaved}, isSaving: ${isSaving}`);
                        if (isSaved) {
                          const translatedSaved = t('common.saved');
                          console.log(`${logPrefix} t('common.saved'):`, translatedSaved);
                          return translatedSaved;
                        } else if (isSaving) {
                          const translatedSaving = t('common.saving');
                          console.log(`${logPrefix} t('common.saving'):`, translatedSaving);
                          return translatedSaving;
                        } else {
                          const translatedSave = t('common.save');
                          console.log(`${logPrefix} t('common.save'):`, translatedSave);
                          return translatedSave;
                        }
                      })()}
                    </span>
                  </Button>
                  <Button 
                    variant={isDarkMode ? "outline" : "outline"} 
                    size="sm" 
                    onClick={handleShare}
                    className={cn(
                      "transition-all hover:bg-slate-100 px-2",
                      isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                    )}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{t('common.share')}</span>
                  </Button>
                  <Button 
                    variant={isDarkMode ? "outline" : "outline"}
                    size="sm" 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className={cn(
                      "transition-all hover:bg-slate-100 px-2",
                      isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                    )}
                  >
                    <Download className={cn("h-4 w-4", isGeneratingPdf && "animate-pulse")} />
                    <span className="hidden sm:inline ml-1">{t('common.pdf')}</span>
                  </Button>
                  <Button 
                    variant={isDarkMode ? "outline" : "outline"}
                    size="sm" 
                    onClick={toggleChat}
                    className={cn(
                      "transition-all px-2",
                      showChat ? "bg-brand-purple text-white hover:bg-brand-purple/90" : "",
                      !showChat && isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{t('advancedAnalysis.chat')}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className={cn(
            "flex-1 p-4 md:p-6 flex flex-col items-center justify-center",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <div className="max-w-md w-full space-y-6">
              <div className="text-center">
                <h2 className={cn(
                  "text-xl font-semibold mb-2",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>
                  {motivationalPhrases[currentPhrase]}
                </h2>
                <p className={cn(
                  "text-muted-foreground",
                  isDarkMode ? "text-slate-400" : ""
                )}>
                  {t('advancedAnalysis.patience')}
                </p>
              </div>
              
              <Progress value={progress} className={cn(
                "h-2",
                isDarkMode ? "bg-slate-800" : ""
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className={cn(
                  "h-24 rounded-md",
                  isDarkMode ? "bg-slate-800" : ""
                )} />
                <Skeleton className={cn(
                  "h-24 rounded-md",
                  isDarkMode ? "bg-slate-800" : ""
                )} />
                <Skeleton className={cn(
                  "h-24 rounded-md",
                  isDarkMode ? "bg-slate-800" : ""
                )} />
                <Skeleton className={cn(
                  "h-24 rounded-md",
                  isDarkMode ? "bg-slate-800" : ""
                )} />
              </div>
            </div>
          </div>
        ) : isLoadingExisting ? (
          <div className={cn(
            "flex-1 p-4 md:p-6 flex flex-col items-center justify-center",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <div className="text-center mb-4">
              <h2 className={cn(
                "text-xl font-semibold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                {t('common.loading')}
              </h2>
              <p className={cn(
                "text-muted-foreground",
                isDarkMode ? "text-slate-400" : ""
              )}>
                {t('advancedAnalysis.title')}
              </p>
            </div>
            <Skeleton className={cn(
              "h-8 w-32 rounded-md",
              isDarkMode ? "bg-slate-800" : ""
            )} />
          </div>
        ) : !analysis ? (
          <div className={cn(
            "flex-1 p-4 md:p-6 flex flex-col items-center justify-center",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <div className="text-center mb-4">
              <h2 className={cn(
                "text-xl font-semibold mb-2",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                {t('advancedAnalysis.generating')}
              </h2>
              <p className={cn(
                "text-muted-foreground mb-6",
                isDarkMode ? "text-slate-400" : ""
              )}>
                {t('advancedAnalysis.patience')}
              </p>
            </div>
            <Progress value={30} className={cn(
              "h-2 w-48",
              isDarkMode ? "bg-slate-800" : ""
            )} />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {analysis && (
              showChat ? (
                <div className="w-full flex flex-col">
                  <div className={cn(
                    "p-2 flex items-center",
                    isDarkMode ? "bg-slate-800 border-b border-slate-700" : "bg-slate-50 border-b"
                  )}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleChat}
                      className={cn(
                        "flex items-center",
                        isDarkMode ? "hover:bg-slate-700" : ""
                      )}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('common.back')}
                    </Button>
                  </div>
                  <AdvancedAnalysisChat 
                    ideaId={ideaId} 
                    idea={idea}
                    analysis={analysis.analysis_data}
                    onBack={() => setShowChat(false)} 
                  />
                </div>
              ) : (
                <ScrollArea className={cn(
                  "flex-1 p-4 md:p-6 overflow-y-auto",
                  isDarkMode ? "bg-slate-900" : "bg-white"
                )}>
                  <div 
                    ref={handleContentRef} 
                    className={cn(
                      "max-w-3xl mx-auto pb-20",
                      isDarkMode ? "text-slate-200" : "text-slate-900"
                    )}
                  >
                    <AdvancedAnalysisContent analysis={analysis.analysis_data} />
                  </div>
                </ScrollArea>
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
