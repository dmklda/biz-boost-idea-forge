
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2, FileText, Download, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Idea {
  id: string;
  title: string;
  description: string;
  audience?: string;
  problem?: string;
  monetization?: string;
}

interface PRDMVPGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PRDMVPGeneratorModal = ({ open, onOpenChange }: PRDMVPGeneratorModalProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [documentType, setDocumentType] = useState<"prd" | "mvp">("prd");
  const [customRequirements, setCustomRequirements] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState("");

  useEffect(() => {
    if (open && authState.user) {
      fetchUserIdeas();
    }
  }, [open, authState.user]);

  const fetchUserIdeas = async () => {
    if (!authState.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, description, audience, problem, monetization')
        .eq('user_id', authState.user.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Erro ao carregar ideias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedIdeaId || !authState.user) return;

    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (!selectedIdea) return;

    setIsGenerating(true);
    try {
      // Deduct credits first
      const { data: creditsData, error: creditsError } = await supabase.rpc(
        'deduct_credits_and_log',
        {
          p_user_id: authState.user.id,
          p_amount: 5,
          p_feature: 'prd_mvp_generation',
          p_item_id: selectedIdea.id,
          p_description: `Geração de ${documentType.toUpperCase()} para: ${selectedIdea.title}`
        }
      );

      if (creditsError) throw creditsError;

      // Generate document
      const { data, error } = await supabase.functions.invoke('generate-prd-mvp', {
        body: {
          idea: selectedIdea,
          documentType,
          customRequirements
        }
      });

      if (error) throw error;

      setGeneratedDocument(data.document);
      toast.success(`${documentType.toUpperCase()} gerado com sucesso!`);
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Erro ao gerar documento');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocument);
    toast.success('Documento copiado para a área de transferência!');
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDocument], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}_${ideas.find(i => i.id === selectedIdeaId)?.title || 'documento'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (generatedDocument) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {documentType.toUpperCase()} Gerado
            </DialogTitle>
            <DialogDescription>
              Seu documento foi gerado com sucesso! Você pode copiar, baixar ou fazer ajustes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadDocument} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button onClick={() => setGeneratedDocument("")} variant="outline" size="sm">
                Gerar Novo
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedDocument}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerador de PRD/MVP
          </DialogTitle>
          <DialogDescription>
            Crie documentos PRD (Product Requirements Document) ou MVP (Minimum Viable Product) profissionais baseados nas suas ideias existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Idea Selection */}
          <div className="space-y-2">
            <Label htmlFor="idea-select">Selecionar Ideia</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select value={selectedIdeaId} onValueChange={setSelectedIdeaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma ideia para gerar o documento" />
                </SelectTrigger>
                <SelectContent>
                  {ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{idea.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-60">
                          {idea.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label>Tipo de Documento</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as "prd" | "mvp")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prd">
                  <div className="flex flex-col">
                    <span className="font-medium">PRD - Product Requirements Document</span>
                    <span className="text-xs text-muted-foreground">Especificações técnicas detalhadas</span>
                  </div>
                </SelectItem>
                <SelectItem value="mvp">
                  <div className="flex flex-col">
                    <span className="font-medium">MVP - Minimum Viable Product</span>
                    <span className="text-xs text-muted-foreground">Versão mínima viável do produto</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos Específicos (Opcional)</Label>
            <Textarea
              id="requirements"
              placeholder="Descreva requisitos específicos, funcionalidades especiais ou direcionamentos para o documento..."
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing Info */}
          <Card className="border-brand-purple/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-brand-purple">💳</span>
                Custo da Geração
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Esta ferramenta consome <strong>5 créditos</strong> por documento gerado.
                Você possui <strong>{authState.user?.credits || 0} créditos</strong> disponíveis.
              </p>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedIdeaId || isGenerating || !authState.user || authState.user.credits < 5}
            className="w-full bg-brand-purple hover:bg-brand-purple/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando {documentType.toUpperCase()}...
              </>
            ) : (
              `Gerar ${documentType.toUpperCase()} (5 créditos)`
            )}
          </Button>

          {(!authState.user || authState.user.credits < 5) && (
            <p className="text-sm text-destructive text-center">
              Créditos insuficientes. <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = "/dashboard/configuracoes?tab=credits"}>Comprar mais créditos</Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
