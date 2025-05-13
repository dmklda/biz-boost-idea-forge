
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
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedAnalysisContent } from "./AdvancedAnalysisContent";
import { AdvancedAnalysisChat } from "./AdvancedAnalysisChat";

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
  const [idea, setIdea] = useState<any>(null);

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

  useEffect(() => {
    if (open && authState.isAuthenticated && ideaId) {
      fetchAdvancedAnalysis();
      fetchIdeaDetails();
    }
  }, [open, ideaId, authState.isAuthenticated]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
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
      setIdea(data);
    } catch (error) {
      console.error("Error fetching idea details:", error);
    }
  };

  const fetchAdvancedAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      const { data, error } = await supabase
        .from("advanced_analyses")
        .select("*")
        .eq("idea_id", ideaId)
        .eq("user_id", authState.user?.id)
        .single();

      if (error) {
        // If analysis doesn't exist yet, maybe it's still being processed
        console.log("Advanced analysis not found yet, waiting...");
        
        // Poll for it a few times
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = setInterval(async () => {
          attempts++;
          
          const { data: pollData, error: pollError } = await supabase
            .from("advanced_analyses")
            .select("*")
            .eq("idea_id", ideaId)
            .eq("user_id", authState.user?.id)
            .single();
          
          if (pollData) {
            clearInterval(pollInterval);
            setAnalysis(pollData);
            setLoading(false);
            setProgress(100);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            toast({
              title: t('errors.analysisNotFound', "Análise não encontrada"),
              description: t('errors.startNewAnalysis', "Inicie uma nova análise"),
              variant: "destructive",
            });
            setLoading(false);
          }
        }, 3000);
        
        return;
      }
      
      setAnalysis(data);
    } catch (error) {
      console.error("Error fetching advanced analysis:", error);
      toast({
        title: t('errors.fetchError', "Erro ao buscar análise"),
        description: t('errors.tryAgainLater', "Tente novamente mais tarde"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleShare = () => {
    // Generate sharing URL
    const shareUrl = `${window.location.origin}/dashboard/ideias/${ideaId}?tab=advanced`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: t('common.copied', "Link copiado!"),
      description: t('share.linkCopied', "Link copiado para a área de transferência"),
    });
  };

  const handleDownloadPDF = () => {
    // This would be implemented with a PDF generation library
    toast({
      title: t('features.comingSoon', "Em breve"),
      description: t('advancedAnalysis.pdfDownload', "Download em PDF será disponibilizado em breve!"),
    });
  };

  const toggleChat = () => {
    setShowChat(!showChat);
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
                  <AdvancedAnalysisContent analysis={analysis.analysis_data} />
                </ScrollArea>
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
