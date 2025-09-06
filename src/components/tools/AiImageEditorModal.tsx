import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImageIcon, Upload, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface AiImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditResults {
  original_url: string;
  edited_url: string;
  edit_description: string;
  techniques_applied: string[];
  processing_details: {
    resolution: string;
    format: string;
    file_size: string;
    processing_time: string;
  };
}

export const AiImageEditorModal = ({
  open,
  onOpenChange,
}: AiImageEditorModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<EditResults | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    edit_instructions: '',
    style: '',
    quality_level: '',
    output_format: '',
    special_effects: ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (!selectedFile) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (!formData.edit_instructions.trim()) {
      toast.error("Por favor, descreva as edições desejadas");
      return;
    }

    setIsLoading(true);
    
    try {
      // Upload da imagem para o storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `ai-edits/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('generated-content')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Chamar edge function para edição
      const { data, error } = await supabase.functions.invoke('ai-image-editor', {
        body: {
          image_path: filePath,
          ...formData
        }
      });

      if (error) throw error;

      setResults(data);
      toast.success("Imagem editada com sucesso!");
    } catch (error) {
      console.error('Erro ao editar imagem:', error);
      toast.error("Erro ao editar imagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({
      edit_instructions: '',
      style: '',
      quality_level: '',
      output_format: '',
      special_effects: ''
    });
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success("Imagem baixada com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  const cost = 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Editor de Imagens com IA
          </DialogTitle>
          <DialogDescription>
            Edite e aprimore suas imagens usando inteligência artificial avançada.
            <Badge variant="secondary" className="ml-2">{cost} créditos</Badge>
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            {/* Upload de Imagem */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload da Imagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm font-medium">
                        Clique para selecionar uma imagem
                      </span>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP até 10MB
                    </p>
                  </div>
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Preview:</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configurações de Edição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_instructions">Instruções de Edição *</Label>
                <Textarea
                  id="edit_instructions"
                  placeholder="Descreva as edições que deseja fazer na imagem. Ex: remover fundo, melhorar qualidade, adicionar efeitos, corrigir cores..."
                  value={formData.edit_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, edit_instructions: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Estilo de Edição</Label>
                  <Input
                    id="style"
                    placeholder="Ex: profissional, artístico, moderno, vintage"
                    value={formData.style}
                    onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality_level">Nível de Qualidade</Label>
                  <Input
                    id="quality_level"
                    placeholder="Ex: alta, máxima, padrão"
                    value={formData.quality_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, quality_level: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output_format">Formato de Saída</Label>
                  <Input
                    id="output_format"
                    placeholder="Ex: PNG, JPG, WEBP"
                    value={formData.output_format}
                    onChange={(e) => setFormData(prev => ({ ...prev, output_format: e.target.value }))}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="special_effects">Efeitos Especiais</Label>
                <Input
                  id="special_effects"
                  placeholder="Ex: desfoque, nitidez, saturação, contraste, filtros"
                  value={formData.special_effects}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_effects: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !selectedFile || !formData.edit_instructions.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Editando Imagem...
                </>
              ) : (
                `Editar Imagem (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Imagem Editada</h3>
              <Button variant="outline" onClick={handleReset}>
                Editar Nova Imagem
              </Button>
            </div>

            {/* Comparação Antes/Depois */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Imagem Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={results.original_url}
                      alt="Original"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(results.original_url, '_blank')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Imagem Editada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={results.edited_url}
                      alt="Editada"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(results.edited_url, '_blank')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDownload(results.edited_url, 'imagem_editada.png')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes da Edição */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes da Edição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Descrição das Edições:</h5>
                  <p className="text-sm text-muted-foreground">{results.edit_description}</p>
                </div>

                {results.techniques_applied?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Técnicas Aplicadas:</h5>
                    <div className="flex flex-wrap gap-2">
                      {results.techniques_applied.map((technique, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {results.processing_details && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Detalhes do Processamento:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Resolução:</span>
                        <div className="font-medium">{results.processing_details.resolution}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Formato:</span>
                        <div className="font-medium">{results.processing_details.format}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tamanho:</span>
                        <div className="font-medium">{results.processing_details.file_size}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tempo:</span>
                        <div className="font-medium">{results.processing_details.processing_time}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};