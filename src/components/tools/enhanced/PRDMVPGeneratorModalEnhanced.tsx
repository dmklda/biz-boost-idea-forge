import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FileText, Copy, Download, CheckCircle, Target, Users, Calendar } from "lucide-react";
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
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);

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

      // Parse JSON response if it's a string
      let parsedDocument = data.document;
      if (typeof data.document === 'string') {
        try {
          parsedDocument = JSON.parse(data.document);
        } catch (parseError) {
          // If parsing fails, treat as plain text
          parsedDocument = { content: data.document };
        }
      }
      
      setGeneratedDocument(parsedDocument);
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
    setGeneratedDocument(null);
  };

  const copyToClipboard = () => {
    if (generatedDocument) {
      const textContent = typeof generatedDocument === 'string' 
        ? generatedDocument 
        : JSON.stringify(generatedDocument, null, 2);
      navigator.clipboard.writeText(textContent);
      toast.success('Documento copiado para a área de transferência!');
    }
  };

  const downloadDocument = () => {
    if (generatedDocument) {
      const textContent = typeof generatedDocument === 'string' 
        ? generatedDocument 
        : JSON.stringify(generatedDocument, null, 2);
      const blob = new Blob([textContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}_${selectedIdea?.title || 'documento'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Function to render document sections visually
  const renderDocumentSection = (title: string, content: any, icon: React.ReactNode) => {
    if (!content) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(content) ? (
            <div className="space-y-2">
              {content.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                  <span className="text-sm">{typeof item === 'string' ? item : item.title || item.name || JSON.stringify(item)}</span>
                </div>
              ))}
            </div>
          ) : typeof content === 'object' ? (
            <div className="space-y-2">
              {Object.entries(content).map(([key, value]: [string, any]) => (
                <div key={key} className="border-l-2 border-blue-200 pl-3">
                  <h4 className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <p className="text-sm text-muted-foreground">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </CardContent>
      </Card>
    );
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
      actionText={`Gerar ${documentType.toUpperCase()}`}
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
              Baixar JSON
            </Button>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="grid gap-4 pr-4">
              {/* Document Title */}
              {generatedDocument.title && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      {generatedDocument.title}
                    </CardTitle>
                    {generatedDocument.description && (
                      <p className="text-sm text-muted-foreground">{generatedDocument.description}</p>
                    )}
                  </CardHeader>
                </Card>
              )}

              {/* Overview */}
              {renderDocumentSection("Visão Geral", generatedDocument.overview || generatedDocument.summary, <Target className="h-4 w-4" />)}
              
              {/* Objectives */}
              {renderDocumentSection("Objetivos", generatedDocument.objectives || generatedDocument.goals, <CheckCircle className="h-4 w-4" />)}
              
              {/* Features */}
              {renderDocumentSection("Funcionalidades", generatedDocument.features || generatedDocument.requirements, <FileText className="h-4 w-4" />)}
              
              {/* User Stories */}
              {renderDocumentSection("Histórias de Usuário", generatedDocument.userStories || generatedDocument.stories, <Users className="h-4 w-4" />)}
              
              {/* Technical Requirements */}
              {renderDocumentSection("Requisitos Técnicos", generatedDocument.technicalRequirements || generatedDocument.techSpecs, <FileText className="h-4 w-4" />)}
              
              {/* Timeline */}
              {renderDocumentSection("Cronograma", generatedDocument.timeline || generatedDocument.schedule, <Calendar className="h-4 w-4" />)}
              
              {/* MVP Features */}
              {renderDocumentSection("Features do MVP", generatedDocument.mvpFeatures || generatedDocument.mvp, <Target className="h-4 w-4" />)}
              
              {/* Success Metrics */}
              {renderDocumentSection("Métricas de Sucesso", generatedDocument.successMetrics || generatedDocument.metrics, <CheckCircle className="h-4 w-4" />)}
              
              {/* Risks */}
              {renderDocumentSection("Riscos e Mitigações", generatedDocument.risks || generatedDocument.challenges, <FileText className="h-4 w-4" />)}
              
              {/* Any other content */}
              {generatedDocument.content && (
                <Card>
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-sm">{generatedDocument.content}</pre>
                  </CardContent>
                </Card>
              )}
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