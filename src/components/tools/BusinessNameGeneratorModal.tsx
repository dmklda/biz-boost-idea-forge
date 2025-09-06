import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { Copy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";

interface BusinessNameGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BusinessNameGeneratorModal: React.FC<BusinessNameGeneratorModalProps> = ({
  open,
  onOpenChange
}) => {
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  
  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setUseCustom(false);
  };
  
  const handleCustomIdeaChange = (value: string) => {
    setCustomIdea(value);
  };
  
  const handleUseCustomIdeaChange = (value: boolean) => {
    setUseCustom(value);
  };

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

    // Check if user has enough credits
    if (!hasCredits('business-name-generator')) {
      toast.error("Créditos insuficientes para gerar nomes");
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      // Deduct credits first
      const { data: creditsData, error: creditsError } = await supabase.rpc(
        'deduct_credits_and_log',
        {
          p_user_id: user.id,
          p_amount: getFeatureCost('business-name-generator'),
          p_feature: 'business-name-generator',
          p_item_id: selectedIdea?.id || null,
          p_description: `Geração de nomes para: ${ideaData.title}`
        }
      );

      if (creditsError) throw creditsError;

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

  // Icon for the modal
  const nameIcon = <Sparkles className="h-5 w-5 text-primary" />;
  
  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Nomes para Startup"
      icon={nameIcon}
      isGenerating={isGenerating}
      generatingText="Gerando nomes..."
      actionText={`Gerar Nomes (${getFeatureCost('business-name-generator')})`}
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim()) || !hasCredits('business-name-generator')}
      resetText="Resetar"
      onReset={handleReset}
      showReset={generatedNames.length > 0}
      maxWidth="4xl"
      creditCost={getFeatureCost('business-name-generator')}
    >
      <div className="space-y-6">
        <EnhancedIdeaSelector 
          onSelect={handleIdeaSelect} 
          allowCustomIdea={true}
          customIdeaValue={customIdea}
          onCustomIdeaChange={handleCustomIdeaChange}
          useCustomIdea={useCustom}
          onUseCustomIdeaChange={handleUseCustomIdeaChange}
        />

        {generatedNames.length > 0 && (
          <div className="space-y-4 mt-6">
            <Label className="text-base font-semibold">Nomes Sugeridos:</Label>
            <div className="grid gap-3">
              {generatedNames.map((name, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg break-words">{name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          Sugestão {index + 1}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(name)}
                        className="flex items-center gap-2 w-full sm:w-auto"
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
    </ToolModalBase>
  );
};