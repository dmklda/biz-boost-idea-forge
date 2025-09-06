import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContentMarketingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContentMarketingModal = ({ open, onOpenChange }: ContentMarketingModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [contentType, setContentType] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedIdea) return;

    try {
      setIsGenerating(true);

      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('content-marketing'),
        p_feature: 'content-marketing',
        p_description: `Geração de conteúdo para ${selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar conteúdo
      const { data, error } = await supabase.functions.invoke('generate-content-marketing', {
        body: { 
          idea: selectedIdea,
          contentType,
          platform,
          tone
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast({
        title: "Conteúdo gerado com sucesso!",
        description: `Foram deduzidos ${getFeatureCost('content-marketing')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      toast({
        title: "Conteúdo copiado!",
        description: "O conteúdo foi copiado para a área de transferência.",
      });
    }
  };

  const downloadContent = () => {
    if (generatedContent) {
      const dataStr = JSON.stringify(generatedContent, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `content-marketing-${selectedIdea?.title || 'content'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (generatedContent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Conteúdo de Marketing Gerado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadContent} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => setGeneratedContent(null)} 
                variant="outline" 
                size="sm"
              >
                Gerar Novo
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedContent.contentPieces && (
                <Card>
                  <CardHeader>
                    <CardTitle>Peças de Conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedContent.contentPieces.map((piece: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="whitespace-pre-wrap">{piece}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedContent.headlines && (
                <Card>
                  <CardHeader>
                    <CardTitle>Headlines/Títulos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.headlines.map((headline: string, index: number) => (
                        <Badge key={index} variant="secondary">{headline}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedContent.hashtags && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hashtags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">#{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Gerador de Conteúdo de Marketing
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Conteúdo</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog-post">Post de Blog</SelectItem>
                  <SelectItem value="social-media">Redes Sociais</SelectItem>
                  <SelectItem value="email">E-mail Marketing</SelectItem>
                  <SelectItem value="video-script">Script de Vídeo</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Plataforma</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tom</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="authoritative">Autoritativo</SelectItem>
                  <SelectItem value="playful">Descontraído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Custo: {getFeatureCost('content-marketing')} créditos
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedIdea || !contentType || isGenerating || !hasCredits('content-marketing')}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Conteúdo'
              )}
            </Button>
          </div>

          {!hasCredits('content-marketing') && (
            <p className="text-sm text-red-600 text-center">
              Créditos insuficientes. <a href="/dashboard/credits" className="underline">Comprar créditos</a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};