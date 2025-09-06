import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FileText, Copy, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PRDMVPGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PRDMVPGeneratorModalEnhanced = ({ open, onOpenChange }: PRDMVPGeneratorModalProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [documentType, setDocumentType] = useState<"prd" | "mvp">("prd");
  const [customRequirements, setCustomRequirements] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState("");

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleGenerate = async () => {
    if (!selectedIdea || !authState.user) return;

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

  const handleReset = () => {
    setSelectedIdea(null);
    setDocumentType("prd");
    setCustomRequirements("");
    setGeneratedDocument("");
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
    a.download = `${documentType}_${selectedIdea?.title || 'documento'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Icon for the modal
  const documentIcon = <FileText className="h-5 w-5 text-blue-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title={`Gerador de ${documentType.toUpperCase()}`}
      icon={documentIcon}
      isGenerating={isGenerating}
      generatingText={`Gerando ${documentType.toUpperCase()}...`}
      actionText={`Gerar ${documentType.toUpperCase()} (5 créditos)`}
      onAction={handleGenerate}
      actionDisabled={!selectedIdea || isGenerating || !authState.user || authState.user.credits < 5}
      resetText="Novo Documento"
      onReset={handleReset}
      showReset={!!generatedDocument}
      creditCost={5}
      maxWidth={generatedDocument ? "4xl" : "2xl"}
      
    >
      {generatedDocument ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={downloadDocument} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="bg-muted/50 rounded-lg p-4 pr-8">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedDocument}
              </pre>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="space-y-6">
          <EnhancedIdeaSelector onSelect={handleIdeaSelect} />

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
              className="resize-none"
            />
          </div>
        </div>
      )}
    </ToolModalBase>
  );
};