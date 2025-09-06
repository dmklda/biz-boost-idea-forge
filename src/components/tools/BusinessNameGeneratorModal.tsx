import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaSelector } from "../shared/IdeaSelector";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Copy, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BusinessNameGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BusinessNameGeneratorModal: React.FC<BusinessNameGeneratorModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error("Selecione uma ideia ou digite uma descrição");
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error("Digite uma descrição da sua ideia");
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      // Generate multiple names at once
      const names = [];
      for (let i = 0; i < 5; i++) {
        const { data, error } = await supabase.functions.invoke('generate-business-name', {
          body: { idea: ideaData }
        });

        if (error) throw error;
        
        if (data?.name) {
          names.push(data.name);
        }
      }

      setGeneratedNames(names.filter(name => name && name.trim()));
      toast.success("Nomes gerados com sucesso!");
    } catch (error) {
      console.error('Error generating names:', error);
      toast.error("Erro ao gerar nomes. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success("Nome copiado!");
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setGeneratedNames([]);
    setUseCustom(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Gerador de Nomes para Startup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <IdeaSelector onSelect={setSelectedIdea} />

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Gerando..." : "Gerar Nomes"}
            </Button>
            
            {generatedNames.length > 0 && (
              <Button variant="outline" onClick={handleReset}>
                Resetar
              </Button>
            )}
          </div>

          {generatedNames.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Nomes Sugeridos:</Label>
              <div className="grid gap-3">
                {generatedNames.map((name, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            Sugestão {index + 1}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(name)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};