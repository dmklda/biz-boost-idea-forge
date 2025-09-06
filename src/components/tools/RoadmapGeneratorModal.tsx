import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useToast } from "@/hooks/use-toast";
import { IdeaSelector } from "@/components/shared/IdeaSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoadmapGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoadmapGeneratorModal = ({ open, onOpenChange }: RoadmapGeneratorModalProps) => {
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [roadmapType, setRoadmapType] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [team, setTeam] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);
  
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
        p_amount: getFeatureCost('roadmap-generator'),
        p_feature: 'roadmap-generator',
        p_description: `Roadmap para ${selectedIdea.title}`
      });

      if (creditsError) {
        throw new Error(creditsError.message);
      }

      // Gerar roadmap
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { 
          idea: selectedIdea,
          roadmapType,
          duration,
          team
        }
      });

      if (error) throw error;

      setGeneratedRoadmap(data.roadmap);
      toast({
        title: "Roadmap gerado com sucesso!",
        description: `Foram deduzidos ${getFeatureCost('roadmap-generator')} créditos da sua conta.`,
      });
    } catch (error) {
      console.error('Erro ao gerar roadmap:', error);
      toast({
        title: "Erro ao gerar roadmap",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedRoadmap) {
      navigator.clipboard.writeText(JSON.stringify(generatedRoadmap, null, 2));
      toast({
        title: "Roadmap copiado!",
        description: "O roadmap foi copiado para a área de transferência.",
      });
    }
  };

  const downloadRoadmap = () => {
    if (generatedRoadmap) {
      const dataStr = JSON.stringify(generatedRoadmap, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roadmap-${selectedIdea?.title || 'roadmap'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (generatedRoadmap) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-purple-500" />
              Roadmap de Desenvolvimento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={downloadRoadmap} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => setGeneratedRoadmap(null)} 
                variant="outline" 
                size="sm"
              >
                Novo Roadmap
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedRoadmap.phases && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fases do Projeto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedRoadmap.phases.map((phase: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Fase {index + 1}</Badge>
                            <h4 className="font-semibold">{phase.name || phase.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                          {phase.duration && (
                            <p className="text-xs text-gray-500">Duração: {phase.duration}</p>
                          )}
                          {phase.deliverables && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Entregáveis:</p>
                              <div className="flex flex-wrap gap-1">
                                {phase.deliverables.map((deliverable: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {deliverable}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedRoadmap.mvpFeatures && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features do MVP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-2">
                      {generatedRoadmap.mvpFeatures.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">MVP</Badge>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedRoadmap.techStack && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stack Tecnológico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedRoadmap.techStack.map((tech: string, index: number) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
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
            <Map className="h-5 w-5 text-purple-500" />
            Gerador de Roadmap
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Roadmap</label>
              <Select value={roadmapType} onValueChange={setRoadmapType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="technology">Tecnologia</SelectItem>
                  <SelectItem value="business">Negócio</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="go-to-market">Go-to-Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Duração</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-months">3 meses</SelectItem>
                  <SelectItem value="6-months">6 meses</SelectItem>
                  <SelectItem value="12-months">12 meses</SelectItem>
                  <SelectItem value="18-months">18 meses</SelectItem>
                  <SelectItem value="24-months">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tamanho da Equipe</label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo Founder</SelectItem>
                  <SelectItem value="small">Pequena (2-5)</SelectItem>
                  <SelectItem value="medium">Média (6-15)</SelectItem>
                  <SelectItem value="large">Grande (16+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Custo: {getFeatureCost('roadmap-generator')} créditos
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={!selectedIdea || !roadmapType || isGenerating || !hasCredits('roadmap-generator')}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Roadmap'
              )}
            </Button>
          </div>

          {!hasCredits('roadmap-generator') && (
            <p className="text-sm text-red-600 text-center">
              Créditos insuficientes. <a href="/dashboard/credits" className="underline">Comprar créditos</a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};