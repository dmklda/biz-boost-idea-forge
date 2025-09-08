import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FileText, Copy, Download, CheckCircle, Target, Users, Calendar, ChevronDown, FileDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

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

      // Handle the response - it should be markdown content
      setGeneratedDocument(data.document || data);
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

  const downloadMarkdown = () => {
    if (generatedDocument) {
      const markdownContent = typeof generatedDocument === 'string' 
        ? generatedDocument 
        : JSON.stringify(generatedDocument, null, 2);
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}_${selectedIdea?.title || 'documento'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Arquivo markdown baixado com sucesso!');
    }
  };

  const downloadPDF = async () => {
    if (!generatedDocument || !authState.user) return;

    try {
      // Deduct credits for PDF generation
      const { data: creditsData, error: creditsError } = await supabase.rpc(
        'deduct_credits_and_log',
        {
          p_user_id: authState.user.id,
          p_amount: 3,
          p_feature: 'pdf_generation',
          p_item_id: selectedIdea?.id,
          p_description: `Geração de PDF ${documentType.toUpperCase()} para: ${selectedIdea?.title}`
        }
      );

      if (creditsError) throw creditsError;

      const markdownContent = typeof generatedDocument === 'string' 
         ? generatedDocument 
         : JSON.stringify(generatedDocument, null, 2);

      // Generate PDF using Supabase function
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          content: markdownContent,
          title: `${documentType.toUpperCase()} - ${selectedIdea?.title || 'Documento'}`,
          type: 'prd-mvp'
        }
      });

      if (error) throw error;

      // Download the PDF
      const pdfBlob = new Blob([new Uint8Array(data.pdf)], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}_${selectedIdea?.title || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('PDF gerado e baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const downloadJSON = () => {
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
      toast.success('Arquivo JSON baixado com sucesso!');
    }
  };

  // Function to render markdown content beautifully
  const renderMarkdownContent = (content: string) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2 mt-3">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-2">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-800 dark:text-gray-200">
                {children}
              </strong>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-3">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-3">
                {children}
              </pre>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadMarkdown}>
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={downloadPDF}
                  disabled={!authState.user || authState.user.credits < 3}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF (3 créditos)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  JSON (.json)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="pr-4">
              {/* Check if it's markdown content (string) or structured JSON */}
              {typeof generatedDocument === 'string' ? (
                <Card>
                  <CardContent className="pt-6">
                    {renderMarkdownContent(generatedDocument)}
                  </CardContent>
                </Card>
              ) : generatedDocument && typeof generatedDocument === 'object' ? (
                <div className="grid gap-4">
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
                 </div>
               ) : (
                 <Card>
                   <CardContent className="pt-6">
                     <p className="text-center text-muted-foreground">Nenhum conteúdo gerado ainda.</p>
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