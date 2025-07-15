import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FileText, AlertCircle } from "lucide-react";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogFooter as ConfirmDialogFooter } from "@/components/ui/dialog";
import { ComparisonResultsModal } from "./ComparisonResultsModal";
import { useGamification } from '@/hooks/useGamification';

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
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
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

  const handleRequestCompareIdeas = () => {
    setPendingAction(() => handleCompareIdeas);
    setShowCreditConfirm(true);
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
                  title={t('ideas.compare.selectIdea', 'Selecione uma ideia')}
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
              onClick={handleRequestCompareIdeas} 
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
      {/* Modal de confirmação de crédito */}
      <ConfirmDialog open={showCreditConfirm} onOpenChange={setShowCreditConfirm}>
        <ConfirmDialogContent>
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>{t('credits.confirmTitle', 'Confirmar uso de créditos')}</ConfirmDialogTitle>
          </ConfirmDialogHeader>
          <div className="py-4">
            {t('credits.confirmCompareIdeas', 'Esta ação irá deduzir 1 crédito da sua conta. Deseja continuar?')}
          </div>
          <ConfirmDialogFooter>
            <Button variant="outline" onClick={() => setShowCreditConfirm(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { setShowCreditConfirm(false); pendingAction && pendingAction(); }}>{t('common.confirm', 'Confirmar')}</Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>
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
  const [showResults, setShowResults] = useState(false);
  const [comparisonInsights, setComparisonInsights] = useState<any>(null);
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { addPoints, checkAndAwardAchievements } = useGamification();

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

  // MOCK: Gera dados de comparação fake para visualização
  const generateMockComparison = (titles: string[]) => ({
    competitiveAdvantage: `A ideia "${titles[0]}" possui maior vantagem competitiva, mas "${titles[1]}" apresenta maior potencial de crescimento a longo prazo.`,
    marketPotential: ["Alto", "Muito Alto"],
    executionDifficulty: ["Média", "Alta"],
    investmentRequired: ["Baixo", "Médio"],
    scalabilityPotential: ["Alta", "Muito Alta"],
    innovationLevel: ["Alta", "Média"],
    riskLevel: ["Baixo", "Médio"],
    keyStrengthComparison: `A principal força de "${titles[0]}" é a execução, enquanto "${titles[1]}" se destaca pela inovação.`,
    keyWeaknessComparison: `A fraqueza de "${titles[0]}" é o risco de mercado, já "${titles[1]}" demanda alto investimento inicial.`,
    recommendedFocus: `Foque em "${titles[1]}" se busca inovação, ou "${titles[0]}" para execução mais rápida.`,
    overallRecommendation: `Recomenda-se priorizar "${titles[1]}" para maior potencial de crescimento.`
  });

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
      // Simula delay e gera dados mockados
      await new Promise(resolve => setTimeout(resolve, 1200));
      const selectedTitles = ideas.filter(idea => selectedIdeaIds.includes(idea.id)).map(i => i.title);
      setComparisonInsights(generateMockComparison(selectedTitles));
      setShowResults(true);
      // Gamificação: Pontuação ao comparar ideias
      addPoints(10, 'Comparação de ideias');
      // Checagem de conquistas automáticas (badges)
      try {
        const { count: totalComparisons } = await supabase
          .from('idea_comparisons')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authState.user.id);
        await checkAndAwardAchievements('compare_ideas', { totalComparisons });
      } catch {}
    } catch (error) {
      console.error("Error comparing ideas:", error);
      toast.error(t('errors.compareError', "Erro ao comparar ideias"));
    } finally {
      setComparing(false);
    }
  };

  const selectedIdeasData = ideas.filter(idea => selectedIdeaIds.includes(idea.id));

  return (
    <>
      <Dialog open={isOpen && !showResults} onOpenChange={() => onClose()}>
        <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('ideas.compare.title', "Comparar Ideias")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
            {selectedIdeasData.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ideas.compare.selectedIdeas', "Ideias selecionadas")}:</p>
                <ul className="space-y-2">
                  {selectedIdeasData.map(idea => (
                    <li key={idea.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate max-w-[60vw] sm:max-w-[350px] md:max-w-[500px]" title={idea.title}>{idea.title}</span>
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
            <p className="text-sm font-medium">{t('ideas.compare.addMoreIdeas', "Adicionar mais ideias")}:</p>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm max-w-full sm:max-w-xs truncate"
                value={selectedIdea || ""}
                onChange={(e) => setSelectedIdea(e.target.value)}
                title={t('ideas.compare.selectIdea', 'Selecione uma ideia')}
              >
                <option value="">{t('ideas.compare.selectIdea', "Selecione uma ideia")}</option>
                {ideas
                  .filter(idea => !selectedIdeaIds.includes(idea.id))
                  .map(idea => (
                    <option key={idea.id} value={idea.id} title={idea.title}>
                      {idea.title.length > 60 ? idea.title.slice(0, 57) + '...' : idea.title}
                    </option>
                  ))}
              </select>
              <Button 
                onClick={handleAddIdea} 
                disabled={!selectedIdea}
                className="whitespace-nowrap min-w-[100px]"
              >
                {t('common.add', "Adicionar")}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common.cancel', "Cancelar")}
            </Button>
            <Button 
              onClick={handleCompareIdeas} 
              disabled={selectedIdeaIds.length < 2 || comparing}
              className="bg-brand-purple hover:bg-brand-purple/90 w-full sm:w-auto"
            >
              <FileText className="h-4 w-4 mr-1" />
              {comparing 
                ? t('common.processing', "Processando...") 
                : t('ideas.compare.button', "Comparar")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de resultados da comparação */}
      <ComparisonResultsModal
        isOpen={showResults}
        onClose={() => { setShowResults(false); onClose(); }}
        insights={comparisonInsights}
        ideaTitles={selectedIdeasData.map(i => i.title)}
      />
    </>
  );
};
