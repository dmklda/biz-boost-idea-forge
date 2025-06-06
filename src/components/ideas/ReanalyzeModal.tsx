
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2, Sparkles } from "lucide-react";

interface ReanalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  currentTitle: string;
  currentDescription: string;
  onSuccess?: () => void;
}

export const ReanalyzeModal = ({ 
  isOpen, 
  onClose, 
  ideaId, 
  currentTitle, 
  currentDescription,
  onSuccess 
}: ReanalyzeModalProps) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleReanalyze = async () => {
    if (!authState.user?.id || !title.trim() || !description.trim()) {
      toast.error(t('ideaForm.fillAllFields', "Preencha todos os campos obrigatórios"));
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Deduzir crédito antes da reanálise
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 1,
        p_feature: 'reanalysis',
        p_item_id: ideaId,
        p_description: 'Reanálise de ideia com IA'
      });

      if (creditError) {
        toast.error(t('credits.insufficient', 'Créditos insuficientes ou erro ao deduzir créditos'));
        setIsAnalyzing(false);
        return;
      }

      // Atualizar a ideia
      const { error: updateError } = await supabase
        .from('ideas')
        .update({
          title: title.trim(),
          description: description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ideaId)
        .eq('user_id', authState.user.id);

      if (updateError) {
        console.error("Error updating idea:", updateError);
        toast.error(t('ideaForm.updateError', "Erro ao atualizar ideia"));
        setIsAnalyzing(false);
        return;
      }

      // Chamar edge function para reanálise
      const { data, error } = await supabase.functions.invoke('analyze-idea', {
        body: {
          ideaId,
          idea: title.trim(),
          audience: '',
          problem: '',
          hasCompetitors: '',
          monetization: '',
          budget: 0,
          location: '',
          isReanalysis: true
        }
      });

      if (error) {
        console.error("Error reanalyzing idea:", error);
        toast.error(t('ideaForm.analysisError', "Erro na reanálise"));
        setIsAnalyzing(false);
        return;
      }

      toast.success(t('ideaForm.reanalysisSuccess', "Reanálise concluída com sucesso!"));
      
      // Emitir evento para atualização global
      window.dispatchEvent(new CustomEvent('analysis-updated'));
      
      onSuccess?.();
      onClose();

    } catch (error) {
      console.error("Error in reanalysis:", error);
      toast.error(t('ideaForm.reanalysisError', "Erro na reanálise"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    if (!isAnalyzing) {
      setTitle(currentTitle);
      setDescription(currentDescription);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-purple" />
            {t('ideaForm.reanalyzeTitle', "Reanalisar Ideia")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            {t('ideaForm.reanalyzeDescription', "Refine sua ideia para obter uma nova análise com insights atualizados.")}
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reanalyze-title">
                {t('ideaForm.title', "Título da Ideia")} *
              </Label>
              <Textarea
                id="reanalyze-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('ideaForm.titlePlaceholder', "Descreva sua ideia em uma frase")}
                disabled={isAnalyzing}
                className="mt-2"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="reanalyze-description">
                {t('ideaForm.description', "Descrição Detalhada")} *
              </Label>
              <Textarea
                id="reanalyze-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('ideaForm.descriptionPlaceholder', "Detalhe mais sua ideia")}
                disabled={isAnalyzing}
                className="mt-2"
                rows={6}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isAnalyzing}
          >
            {t('common.cancel', "Cancelar")}
          </Button>
          <Button 
            onClick={handleReanalyze}
            disabled={isAnalyzing || !title.trim() || !description.trim()}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.analyzing', "Analisando...")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('ideaForm.reanalyze', "Reanalisar")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
