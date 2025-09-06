import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { IdeaSelector } from "@/components/shared/IdeaSelector";

interface StartupKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StartupKitModal = ({ open, onOpenChange }: StartupKitModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKit, setGeneratedKit] = useState<any>(null);
  
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

  if (generatedKit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Kit Completo de Startup
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadKit} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => setGeneratedKit(null)} 
                variant="outline" 
                size="sm"
              >
                Novo Kit
              </Button>
            </div>
            
            <div className="grid gap-4">
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

              <div className="grid md:grid-cols-2 gap-4">
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
                    <div className="grid md:grid-cols-2 gap-2">
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
            <Package className="h-5 w-5 text-orange-500" />
            Kit Completo de Startup
          </DialogTitle>
        </DialogHeader>
        
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

          <IdeaSelector onSelect={setSelectedIdea} />

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Custo: {getFeatureCost('startup-kit')} créditos
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedIdea || isGenerating || !hasCredits('startup-kit')}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Kit...
                </>
              ) : (
                'Gerar Kit Completo'
              )}
            </Button>
          </div>

          {!hasCredits('startup-kit') && (
            <p className="text-sm text-red-600 text-center">
              Créditos insuficientes. <a href="/dashboard/credits" className="underline">Comprar créditos</a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};