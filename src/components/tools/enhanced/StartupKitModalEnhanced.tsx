import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StartupKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StartupKitModalEnhanced = ({ open, onOpenChange }: StartupKitModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKit, setGeneratedKit] = useState<any>(null);
  
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const { toast } = useToast();

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleGenerate = async () => {
    if (!selectedIdea) return;

    try {
      setIsGenerating(true);

      // Deduzir créditos
      const { data: creditsData, error: creditsError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: authState.user?.id,
        p_amount: getFeatureCost('startup-kit'),
        p_feature: 'startup-kit',
        p_description: `Kit completo para ${selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar kit
      const { data, error } = await supabase.functions.invoke('generate-startup-kit', {
        body: { idea: selectedIdea }
      });

      if (error) throw error;

      setGeneratedKit(data.kit);
      toast({
        title: "Kit de startup gerado!",
        description: `Foram deduzidos ${getFeatureCost('startup-kit')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar kit:', error);
      toast({
        title: "Erro ao gerar kit",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setGeneratedKit(null);
  };

  const copyToClipboard = () => {
    if (generatedKit) {
      navigator.clipboard.writeText(JSON.stringify(generatedKit, null, 2));
      toast({
        title: "Kit copiado!",
        description: "O kit foi copiado para a área de transferência.",
      });
    }
  };

  const downloadKit = () => {
    if (generatedKit) {
      const dataStr = JSON.stringify(generatedKit, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `startup-kit-${selectedIdea?.title || 'kit'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Icon for the modal
  const kitIcon = <Package className="h-5 w-5 text-orange-500" />;

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Kit Completo de Startup"
      icon={kitIcon}
      isGenerating={isGenerating}
      generatingText="Gerando kit..."
      actionText="Gerar Kit Completo"
      onAction={handleGenerate}
      actionDisabled={!selectedIdea || isGenerating || !hasCredits('startup-kit')}
      resetText="Novo Kit"
      onReset={handleReset}
      showReset={!!generatedKit}
      creditCost={getFeatureCost('startup-kit')}
      maxWidth={generatedKit ? "4xl" : "2xl"}
    >
      {generatedKit ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={downloadKit} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <div className="grid gap-4 pr-4">
              {generatedKit.businessNames && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sugestões de Nome</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedKit.businessNames.map((name: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm p-2">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedKit.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Missão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{generatedKit.mission}</p>
                    </CardContent>
                  </Card>
                )}

                {generatedKit.vision && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Visão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{generatedKit.vision}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {generatedKit.valuePropositions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Propostas de Valor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedKit.valuePropositions.map((prop: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">VP</Badge>
                          <p className="text-sm">{prop}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedKit.mvpFeatures && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features do MVP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedKit.mvpFeatures.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">Feature</Badge>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedKit.launchChecklist && (
                <Card>
                  <CardHeader>
                    <CardTitle>Checklist de Lançamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedKit.launchChecklist.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">✓</Badge>
                          <p className="text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border">
            <h3 className="font-semibold mb-2">Kit Completo Inclui:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>• Sugestões de nomes</div>
              <div>• Missão e visão</div>
              <div>• Propostas de valor</div>
              <div>• Estrutura legal</div>
              <div>• Features do MVP</div>
              <div>• Estratégia de funding</div>
              <div>• Checklist de lançamento</div>
              <div>• Plano para 90 dias</div>
            </div>
          </div>

          <EnhancedIdeaSelector onSelect={handleIdeaSelect} />
        </div>
      )}
    </ToolModalBase>
  );
};