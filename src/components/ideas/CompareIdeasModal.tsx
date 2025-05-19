import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FileText, AlertCircle } from "lucide-react";

interface CompareIdeasModalContextType {
  openCompareModal: (initialIdeaIds: string[]) => void;
  closeCompareModal: () => void;
}

const CompareIdeasModalContext = createContext<CompareIdeasModalContextType | undefined>(undefined);

export const CompareIdeasModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ideaIds, setIdeaIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const { t } = useTranslation();
  const { authState } = useAuth();

  const openCompareModal = (initialIdeaIds: string[]) => {
    setIdeaIds(initialIdeaIds);
    setIsOpen(true);
    fetchIdeas();
  };

  const closeCompareModal = () => {
    setIsOpen(false);
    setIdeaIds([]);
    setIdeas([]);
    setSelectedIdea(null);
  };

  const fetchIdeas = async () => {
    if (!authState.isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title')
        .eq('user_id', authState.user?.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error("Error fetching ideas for comparison:", error);
      toast.error(t('errors.fetchIdeasError', "Erro ao buscar ideias para comparação"));
    }
  };

  const handleAddIdea = () => {
    if (selectedIdea && !ideaIds.includes(selectedIdea)) {
      setIdeaIds([...ideaIds, selectedIdea]);
      setSelectedIdea(null);
    }
  };

  const handleRemoveIdea = (id: string) => {
    setIdeaIds(ideaIds.filter(ideaId => ideaId !== id));
  };

  const handleCompareIdeas = async () => {
    if (ideaIds.length < 2) {
      toast.error(t('ideas.compareMinError', "Selecione pelo menos 2 ideias para comparar"));
      return;
    }

    setComparing(true);
    try {
      // Deduz crédito antes de comparar
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 1,
        p_feature: 'compare_ideas',
        p_item_id: ideaIds[0],
        p_description: 'Comparação de ideias com IA'
      });
      if (creditError) {
        toast.error('Créditos insuficientes ou erro ao deduzir créditos.');
        setComparing(false);
        return;
      }
      // Esta é uma simulação de chamada de API para comparação
      // Na implementação real, você usaria algo como:
      // const { data, error } = await supabase.rpc('compare_ideas', { idea_ids: ideaIds });
      
      // Simulando um delay para mostrar o carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t('ideas.compareSuccess', "Comparação de ideias realizada com sucesso"));
      closeCompareModal();
    } catch (error) {
      console.error("Error comparing ideas:", error);
      toast.error(t('errors.compareError', "Erro ao comparar ideias"));
    } finally {
      setComparing(false);
    }
  };

  const selectedIdeas = ideas.filter(idea => ideaIds.includes(idea.id));

  return (
    <CompareIdeasModalContext.Provider value={{ openCompareModal, closeCompareModal }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ideas.compare.title', "Comparar Ideias")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedIdeas.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ideas.compare.selectedIdeas', "Ideias selecionadas")}:</p>
                <ul className="space-y-2">
                  {selectedIdeas.map(idea => (
                    <li key={idea.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate">{idea.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveIdea(idea.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive"
                      >
                        {t('common.remove', "Remover")}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">
                  {t('ideas.compare.noIdeasSelected', "Nenhuma ideia selecionada para comparação")}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('ideas.compare.addMoreIdeas', "Adicionar mais ideias")}:</p>
              <div className="flex gap-2">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedIdea || ""}
                  onChange={(e) => setSelectedIdea(e.target.value)}
                >
                  <option value="">{t('ideas.compare.selectIdea', "Selecione uma ideia")}</option>
                  {ideas
                    .filter(idea => !ideaIds.includes(idea.id))
                    .map(idea => (
                      <option key={idea.id} value={idea.id}>
                        {idea.title}
                      </option>
                    ))}
                </select>
                <Button 
                  onClick={handleAddIdea} 
                  disabled={!selectedIdea}
                  className="whitespace-nowrap"
                >
                  {t('common.add', "Adicionar")}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeCompareModal}>
              {t('common.cancel', "Cancelar")}
            </Button>
            <Button 
              onClick={handleCompareIdeas} 
              disabled={ideaIds.length < 2 || comparing}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              <FileText className="h-4 w-4 mr-1" />
              {comparing 
                ? t('common.processing', "Processando...") 
                : t('ideas.compare.button', "Comparar")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CompareIdeasModalContext.Provider>
  );
};

export const useCompareIdeasModal = () => {
  const context = useContext(CompareIdeasModalContext);
  if (!context) {
    throw new Error("useCompareIdeasModal must be used within CompareIdeasModalProvider");
  }
  return context;
};

// Add a standalone CompareIdeasModal component for direct use in pages
export const CompareIdeasModal = ({ 
  isOpen, 
  onClose, 
  ideaIds 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  ideaIds: string[] 
}) => {
  const [comparing, setComparing] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>(ideaIds);
  const { t } = useTranslation();
  const { authState } = useAuth();

  // Fetch ideas when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchIdeas();
      setSelectedIdeaIds(ideaIds);
    }
  }, [isOpen, ideaIds]);

  const fetchIdeas = async () => {
    if (!authState.isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title')
        .eq('user_id', authState.user?.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error("Error fetching ideas for comparison:", error);
      toast.error(t('errors.fetchIdeasError', "Erro ao buscar ideias para comparação"));
    }
  };

  const handleAddIdea = () => {
    if (selectedIdea && !selectedIdeaIds.includes(selectedIdea)) {
      setSelectedIdeaIds([...selectedIdeaIds, selectedIdea]);
      setSelectedIdea(null);
    }
  };

  const handleRemoveIdea = (id: string) => {
    setSelectedIdeaIds(selectedIdeaIds.filter(ideaId => ideaId !== id));
  };

  const handleCompareIdeas = async () => {
    if (selectedIdeaIds.length < 2) {
      toast.error(t('ideas.compareMinError', "Selecione pelo menos 2 ideias para comparar"));
      return;
    }

    setComparing(true);
    try {
      // Deduz crédito antes de comparar
      const { error: creditError } = await (supabase.rpc as any)('deduct_credits_and_log', {
        p_user_id: authState.user.id,
        p_amount: 1,
        p_feature: 'compare_ideas',
        p_item_id: selectedIdeaIds[0],
        p_description: 'Comparação de ideias com IA'
      });
      if (creditError) {
        toast.error('Créditos insuficientes ou erro ao deduzir créditos.');
        setComparing(false);
        return;
      }
      // Esta é uma simulação de chamada de API para comparação
      // Na implementação real, você usaria algo como:
      // const { data, error } = await supabase.rpc('compare_ideas', { idea_ids: selectedIdeaIds });
      
      // Simulando um delay para mostrar o carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t('ideas.compareSuccess', "Comparação de ideias realizada com sucesso"));
      onClose();
    } catch (error) {
      console.error("Error comparing ideas:", error);
      toast.error(t('errors.compareError', "Erro ao comparar ideias"));
    } finally {
      setComparing(false);
    }
  };

  const selectedIdeasData = ideas.filter(idea => selectedIdeaIds.includes(idea.id));

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ideas.compare.title', "Comparar Ideias")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {selectedIdeasData.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('ideas.compare.selectedIdeas', "Ideias selecionadas")}:</p>
              <ul className="space-y-2">
                {selectedIdeasData.map(idea => (
                  <li key={idea.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span className="text-sm truncate">{idea.title}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveIdea(idea.id)}
                      className="h-7 px-2 text-destructive hover:text-destructive"
                    >
                      {t('common.remove', "Remover")}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-center text-muted-foreground">
                {t('ideas.compare.noIdeasSelected', "Nenhuma ideia selecionada para comparação")}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('ideas.compare.addMoreIdeas', "Adicionar mais ideias")}:</p>
            <div className="flex gap-2">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedIdea || ""}
                onChange={(e) => setSelectedIdea(e.target.value)}
              >
                <option value="">{t('ideas.compare.selectIdea', "Selecione uma ideia")}</option>
                {ideas
                  .filter(idea => !selectedIdeaIds.includes(idea.id))
                  .map(idea => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title}
                    </option>
                  ))}
              </select>
              <Button 
                onClick={handleAddIdea} 
                disabled={!selectedIdea}
                className="whitespace-nowrap"
              >
                {t('common.add', "Adicionar")}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', "Cancelar")}
          </Button>
          <Button 
            onClick={handleCompareIdeas} 
            disabled={selectedIdeaIds.length < 2 || comparing}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            <FileText className="h-4 w-4 mr-1" />
            {comparing 
              ? t('common.processing', "Processando...") 
              : t('ideas.compare.button', "Comparar")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
