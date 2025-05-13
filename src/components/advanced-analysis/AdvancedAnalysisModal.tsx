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
import html2canvas from "html2canvas";

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

  const motivationalPhrases = [
    t('advancedAnalysis.motivation1', "Analisando potenciais de mercado..."),
    t('advancedAnalysis.motivation2', "Identificando oportunidades únicas..."),
    t('advancedAnalysis.motivation3', "Criando estratégias de crescimento..."),
    t('advancedAnalysis.motivation4', "Avaliando vantagens competitivas..."),
    t('advancedAnalysis.motivation5', "Definindo perfis de clientes ideais..."),
    t('advancedAnalysis.motivation6', "Gerando insights de monetização..."),
    t('advancedAnalysis.motivation7', "Calculando projeções financeiras..."),
    t('advancedAnalysis.motivation8', "Finalizando sua análise avançada...")
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
      fetchAdvancedAnalysis();
    } else {
      // Reset states when modal is closed
      if (!open) {
        setAnalysis(null);
        setProgress(0);
        setCurrentPhrase(0);
      }
    }
  }, [open, ideaId, authState.isAuthenticated]);

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
          const { data, error } = await supabase
            .from('saved_analyses')
            .select('*')
            .eq('original_analysis_id', analysis.id)
            .eq('user_id', authState.user?.id)
            .single();
          
          if (data) {
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }
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

  const fetchAdvancedAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    setAttempts(0); // Reset attempts counter
    
    try {
      // First check if analysis already exists
      console.log("Checking for existing analysis for idea:", ideaId);
      const { data, error } = await supabase
        .from("advanced_analyses")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", authState.user?.id)
        .single();

      if (error) {
        console.log("Advanced analysis not found yet, will start polling...");
        
        // Clear any existing interval and start a new one
        if (pollInterval !== null) {
          clearInterval(pollInterval);
        }
        
        // First make one call to generate the analysis
        try {
          console.log("Initiating advanced analysis generation...");
          const response = await supabase.functions.invoke("advanced-analysis", {
            body: { ideaId }
          });

          if (response.error) {
            throw new Error(response.error.message || "Error starting analysis");
          }

          console.log("Analysis generation initiated:", response);
        } catch (error) {
          console.error("Error initiating advanced analysis:", error);
          // Continue polling anyway, as the analysis might still be generated
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
            .single();
          
          if (pollData) {
            clearInterval(interval);
            setPollInterval(null);
            setAnalysis(pollData as AdvancedAnalysis);
            setLoading(false);
            setProgress(100);
            console.log("Analysis found:", pollData);
          } else if (currentAttempts >= 10) {
            clearInterval(interval);
            setPollInterval(null);
            toast({
              title: t('errors.analysisNotFound', "Análise não encontrada"),
              description: t('errors.startNewAnalysis', "Inicie uma nova análise"),
              variant: "destructive",
            });
            setLoading(false);
            console.log("Failed to find analysis after maximum attempts");
          }
          
          setAttempts(currentAttempts);
        }, 3000);
        
        setPollInterval(interval);
        return;
      }
      
      setAnalysis(data as AdvancedAnalysis);
      setLoading(false);
      setProgress(100);
    } catch (error) {
      console.error("Error fetching advanced analysis:", error);
      toast({
        title: t('errors.fetchError', "Erro ao buscar análise"),
        description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
        variant: "destructive",
      });
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
          title: idea?.title || "Análise Avançada",
          text: "Confira esta análise avançada de ideia de negócio!",
          url: shareUrl
        });
        
        toast({
          title: t('common.shared', "Compartilhado!"),
          description: t('share.linkShared', "Conteúdo compartilhado com sucesso"),
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        toast({
          title: t('common.copied', "Link copiado!"),
          description: t('share.linkCopied', "Link copiado para a área de transferência"),
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: t('errors.shareError', "Erro ao compartilhar"),
        description: t('errors.tryAgain', "Tente novamente mais tarde"),
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef) {
      toast({
        title: t('errors.pdfError', "Erro ao gerar PDF"),
        description: t('errors.contentNotReady', "O conteúdo não está pronto para download"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPdf(true);
      toast({
        title: t('common.preparing', "Preparando PDF..."),
        description: t('pdf.generating', "Este processo pode levar alguns segundos"),
      });

      // Create a temporary container to render the content for PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '900px'; // Wider for better quality
      pdfContainer.style.padding = '40px';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      pdfContainer.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
      pdfContainer.style.color = isDarkMode ? '#f3f4f6' : '#111827';
      document.body.appendChild(pdfContainer);

      // Create a title page for PDF
      const titlePage = document.createElement('div');
      titlePage.style.padding = '40px';
      titlePage.style.height = '1123px'; // A4 height in pixels at 96 DPI
      titlePage.style.display = 'flex';
      titlePage.style.flexDirection = 'column';
      titlePage.style.justifyContent = 'center';
      titlePage.style.alignItems = 'center';
      titlePage.style.textAlign = 'center';
      titlePage.innerHTML = `
        <div style="margin-bottom: 40px;">
          <h1 style="font-size: 36px; font-weight: bold; margin-bottom: 20px; color: ${isDarkMode ? '#f3f4f6' : '#111827'}">
            Análise Avançada
          </h1>
          <h2 style="font-size: 24px; margin-bottom: 40px; color: ${isDarkMode ? '#d1d5db' : '#4b5563'}">
            ${idea?.title || 'Sua Ideia de Negócio'}
          </h2>
          <p style="font-size: 16px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}">
            Gerado em ${new Date().toLocaleDateString()}
          </p>
        </div>
        <div style="margin-top: 60px; font-size: 14px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; max-width: 600px;">
          <p>Este relatório contém uma análise detalhada da viabilidade e potencial 
          do seu projeto de negócio, incluindo insights de mercado, análise de 
          concorrentes e recomendações estratégicas.</p>
        </div>
      `;
      
      // Create a header for all pages
      const header = document.createElement('div');
      header.style.marginBottom = '20px';
      header.style.borderBottom = isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb';
      header.style.paddingBottom = '10px';
      header.innerHTML = `
        <div style="font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; display: flex; justify-content: space-between;">
          <div>${idea?.title || 'Análise Avançada'}</div>
          <div>Página {page} de {pages}</div>
        </div>
      `;

      // Clone the content into the container
      const clonedContent = contentRef.cloneNode(true) as HTMLElement;
      
      // Style the cloned content for PDF
      const allElements = clonedContent.querySelectorAll('*');
      allElements.forEach(el => {
        const element = el as HTMLElement;
        if (element.style) {
          // Make backgrounds explicit for PDF
          if (window.getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)') {
            element.style.backgroundColor = 'transparent';
          }
          
          // Ensure contrast for text
          if (isDarkMode && window.getComputedStyle(element).color === 'rgb(0, 0, 0)') {
            element.style.color = '#f3f4f6';
          }
          
          // Improve readability of text
          if (element.tagName === 'P' || element.tagName === 'LI' || element.tagName === 'SPAN') {
            element.style.fontSize = '12px';
            element.style.lineHeight = '1.4';
          }
          
          // Make headings stand out
          if (element.tagName === 'H1') {
            element.style.fontSize = '24px';
            element.style.marginBottom = '16px';
            element.style.color = isDarkMode ? '#ffffff' : '#111827';
          }
          
          if (element.tagName === 'H2' || element.tagName === 'H3') {
            element.style.fontSize = '18px';
            element.style.marginBottom = '12px';
            element.style.marginTop = '16px';
            element.style.color = isDarkMode ? '#f3f4f6' : '#1f2937';
          }
        }
      });

      pdfContainer.appendChild(titlePage.cloneNode(true));
      pdfContainer.appendChild(document.createElement('div')); // Page break
      pdfContainer.appendChild(header.cloneNode(true));
      pdfContainer.appendChild(clonedContent);

      // Wait a moment for styles to apply
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(pdfContainer, {
            scale: 1.5, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            logging: false,
          });

          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add title page
          pdf.setFillColor(isDarkMode ? 31 : 255, isDarkMode ? 41 : 255, isDarkMode ? 55 : 255);
          pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
          
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          // Split into pages - Add page breaks at reasonable positions
          let heightLeft = imgHeight;
          let position = 0;
          let pageHeight = 290; // A4 height in mm with margins
          
          // Add table of contents
          pdf.addPage();
          pdf.setFillColor(isDarkMode ? 31 : 255, isDarkMode ? 41 : 255, isDarkMode ? 55 : 255);
          pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
          
          // Add page counter to footer
          const totalPages = Math.ceil(imgHeight / pageHeight) + 2; // +2 for title and TOC
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(isDarkMode ? 200 : 100);
            pdf.text(`Página ${i} de ${totalPages}`, 180, 290);
          }
          
          // Add remaining pages with content
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.setFillColor(isDarkMode ? 31 : 255, isDarkMode ? 41 : 255, isDarkMode ? 55 : 255);
            pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Clean up
          document.body.removeChild(pdfContainer);
          
          // Download PDF
          const fileName = `analise-avancada-${idea?.title || 'ideia'}.pdf`.replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          pdf.save(fileName);
          
          toast({
            title: t('pdf.downloadComplete', "Download Concluído"),
            description: t('pdf.pdfReady', "Seu PDF está pronto"),
          });
        } catch (error) {
          console.error("Error generating PDF:", error);
          document.body.removeChild(pdfContainer);
          
          toast({
            title: t('errors.pdfGenerationError', "Erro ao gerar PDF"),
            description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
            variant: "destructive",
          });
        } finally {
          setIsGeneratingPdf(false);
        }
      }, 500);
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setIsGeneratingPdf(false);
      toast({
        title: t('errors.pdfError', "Erro ao gerar PDF"),
        description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
        variant: "destructive",
      });
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
      toast({
        title: t('errors.saveError', "Erro ao salvar análise"),
        description: t('errors.missingData', "Dados insuficientes para salvar"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Check if already saved
      const { data: existingData, error: checkError } = await supabase
        .from('saved_analyses')
        .select('id')
        .eq('original_analysis_id', analysis.id)
        .eq('user_id', authState.user?.id)
        .single();

      if (existingData) {
        // Already saved - update the timestamp
        const { error: updateError } = await supabase
          .from('saved_analyses')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existingData.id);

        if (updateError) throw updateError;

        toast({
          title: t('common.updated', "Atualizado!"),
          description: t('analysis.alreadySaved', "Esta análise já estava salva e foi atualizada"),
        });
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

        toast({
          title: t('common.saved', "Salvo!"),
          description: t('analysis.saveSuccess', "Análise avançada salva com sucesso"),
        });
      }

      setIsSaved(true);
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
        title: t('errors.saveError', "Erro ao salvar análise"),
        description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
        variant: "destructive",
      });
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
          isDarkMode ? "border-slate-800" : "border-slate-200"
        )}>
          <div className="flex items-center justify-between">
            <DialogTitle className={cn(
              "text-lg sm:text-xl",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {loading
                ? t('advancedAnalysis.generating', "Gerando Análise Avançada...")
                : t('advancedAnalysis.title', "Análise Avançada com GPT-4o")}
            </DialogTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              {!loading && analysis && (
                <>
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
                      {isSaved 
                        ? t('common.saved', "Salvo") 
                        : isSaving 
                          ? t('common.saving', "Salvando...") 
                          : t('common.save', "Salvar")}
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
                    <span className="hidden sm:inline ml-1">{t('common.share', "Compartilhar")}</span>
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
                    <span className="hidden sm:inline ml-1">PDF</span>
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
                    <span className="hidden sm:inline ml-1">{t('advancedAnalysis.chat', "Chat")}</span>
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)}
                className={isDarkMode ? "hover:bg-slate-800" : ""}
              >
                <X className="h-4 w-4" />
              </Button>
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
                  {t('advancedAnalysis.patience', "Este processo pode levar alguns segundos, estamos utilizando GPT-4o para criar uma análise completa")}
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
                      {t('common.back', "Voltar")}
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
                      "max-w-3xl mx-auto pb-20", // Added bottom padding for mobile
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
