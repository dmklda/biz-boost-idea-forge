
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
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedAnalysisContent } from "./AdvancedAnalysisContent";
import { AdvancedAnalysisChat } from "./AdvancedAnalysisChat";
import { useToast } from "@/hooks/use-toast";
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
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);

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
      toast({
        title: t('common.preparing', "Preparando PDF..."),
        description: t('pdf.generating', "Este processo pode levar alguns segundos"),
      });

      // Create a temporary container to render the content for PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '1000px'; // Fixed width for PDF
      pdfContainer.style.padding = '20px';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      document.body.appendChild(pdfContainer);

      // Clone the content into the container
      pdfContainer.appendChild(contentRef.cloneNode(true));

      // Wait a moment for styles to apply
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(pdfContainer, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Split into pages if needed
          let heightLeft = imgHeight;
          let position = 0;
          let pageHeight = 295; // A4 height in mm
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Clean up
          document.body.removeChild(pdfContainer);
          
          // Download PDF
          const fileName = `analise-avancada-${idea?.title || 'ideia'}.pdf`.replace(/\s+/g, '-');
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
        }
      }, 500);
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {loading
                ? t('advancedAnalysis.generating', "Gerando Análise Avançada...")
                : t('advancedAnalysis.title', "Análise Avançada com GPT-4o")}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!loading && analysis && (
                <>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {t('common.share', "Compartilhar")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleChat}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('advancedAnalysis.chat', "Chat")}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  {motivationalPhrases[currentPhrase]}
                </h2>
                <p className="text-muted-foreground">
                  {t('advancedAnalysis.patience', "Este processo pode levar alguns segundos, estamos utilizando GPT-4o para criar uma análise completa")}
                </p>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-md" />
                <Skeleton className="h-24 rounded-md" />
                <Skeleton className="h-24 rounded-md" />
                <Skeleton className="h-24 rounded-md" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex">
            {analysis && (
              showChat ? (
                <AdvancedAnalysisChat 
                  ideaId={ideaId} 
                  idea={idea}
                  analysis={analysis.analysis_data}
                  onBack={() => setShowChat(false)} 
                />
              ) : (
                <ScrollArea className="flex-1 p-6">
                  <div ref={handleContentRef}>
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
