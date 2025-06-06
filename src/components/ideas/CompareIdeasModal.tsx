import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import { ComparisonResultsModal } from "./ComparisonResultsModal";

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
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
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
    setComparisonResults(null);
    setShowResults(false);
  };

  const fetchIdeas = async () => {
    if (!authState.isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          id, 
          title, 
          description, 
          audience, 
          problem, 
          monetization,
          idea_analyses (
            score,
            status,
            strengths,
            weaknesses,
            market_size,
            differentiation
          )
        `)
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
    if (selectedIdea && !ideaIds.includes(selectedIdea) && ideaIds.length < 3) {
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
      // Deduzir crédito antes de comparar
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

      // Preparar dados das ideias para comparação
      const selectedIdeasData = ideas.filter(idea => ideaIds.includes(idea.id));
      const ideasForComparison = selectedIdeasData.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        audience: idea.audience || "Não especificado",
        problem: idea.problem || "Não especificado",
        monetization: idea.monetization || "Não especificado",
        score: idea.idea_analyses?.[0]?.score || 0,
        status: idea.idea_analyses?.[0]?.status || "Pendente",
        strengths: idea.idea_analyses?.[0]?.strengths || [],
        weaknesses: idea.idea_analyses?.[0]?.weaknesses || [],
        market_size: idea.idea_analyses?.[0]?.market_size || "Não especificado",
        differentiation: idea.idea_analyses?.[0]?.differentiation || "Não especificado"
      }));

      // Chamar edge function para comparação
      const { data, error } = await supabase.functions.invoke('compare-ideas', {
        body: {
          ideas: ideasForComparison
        }
      });

      if (error) {
        console.error("Error comparing ideas:", error);
        toast.error(t('errors.compareError', "Erro ao comparar ideias"));
        setComparing(false);
        return;
      }

      console.log("Comparison result:", data);
      setComparisonResults({
        insights: data.insights,
        ideaTitles: selectedIdeasData.map(idea => idea.title)
      });
      setShowResults(true);
      setIsOpen(false);
      
      toast.success(t('ideas.compareSuccess', "Comparação de ideias realizada com sucesso"));
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
      
      <Dialog open={isOpen} onOpenChange={() => !comparing && setIsOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ideas.compare.title', "Comparar Ideias")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedIdeas.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ideas.compare.selectedIdeas', "Ideias selecionadas")}:</p>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedIdeas.map(idea => (
                    <li key={idea.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate pr-2" title={idea.title}>
                        {idea.title}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveIdea(idea.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        disabled={comparing}
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
            
            {ideaIds.length < 3 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ideas.compare.addMoreIdeas', "Adicionar mais ideias")}:</p>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedIdea || ""}
                    onChange={(e) => setSelectedIdea(e.target.value)}
                    disabled={comparing}
                  >
                    <option value="">{t('ideas.compare.selectIdea', "Selecione uma ideia")}</option>
                    {ideas
                      .filter(idea => !ideaIds.includes(idea.id))
                      .map(idea => (
                        <option key={idea.id} value={idea.id}>
                          {idea.title.length > 40 ? `${idea.title.substring(0, 40)}...` : idea.title}
                        </option>
                      ))}
                  </select>
                  <Button 
                    onClick={handleAddIdea} 
                    disabled={!selectedIdea || comparing}
                    className="whitespace-nowrap"
                  >
                    {t('common.add', "Adicionar")}
                  </Button>
                </div>
              </div>
            )}

            {ideaIds.length >= 3 && (
              <p className="text-xs text-muted-foreground text-center">
                {t('ideas.compare.maxIdeas', "Máximo de 3 ideias para comparação")}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={closeCompareModal}
              disabled={comparing}
            >
              {t('common.cancel', "Cancelar")}
            </Button>
            <Button 
              onClick={handleCompareIdeas} 
              disabled={ideaIds.length < 2 || comparing}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {comparing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.processing', "Processando...")}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-1" />
                  {t('ideas.compare.button', "Comparar")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <ComparisonResultsModal
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          setComparisonResults(null);
        }}
        insights={comparisonResults?.insights}
        ideaTitles={comparisonResults?.ideaTitles || []}
      />
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

// Standalone modal component (keeping backward compatibility)
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
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
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
        .select(`
          id, 
          title, 
          description, 
          audience, 
          problem, 
          monetization,
          idea_analyses (
            score,
            status,
            strengths,
            weaknesses,
            market_size,
            differentiation
          )
        `)
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
    if (selectedIdea && !selectedIdeaIds.includes(selectedIdea) && selectedIdeaIds.length < 3) {
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
      // Deduzir crédito antes de comparar
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

      // Preparar dados das ideias para comparação
      const selectedIdeasData = ideas.filter(idea => selectedIdeaIds.includes(idea.id));
      const ideasForComparison = selectedIdeasData.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        audience: idea.audience || "Não especificado",
        problem: idea.problem || "Não especificado",
        monetization: idea.monetization || "Não especificado",
        score: idea.idea_analyses?.[0]?.score || 0,
        status: idea.idea_analyses?.[0]?.status || "Pendente",
        strengths: idea.idea_analyses?.[0]?.strengths || [],
        weaknesses: idea.idea_analyses?.[0]?.weaknesses || [],
        market_size: idea.idea_analyses?.[0]?.market_size || "Não especificado",
        differentiation: idea.idea_analyses?.[0]?.differentiation || "Não especificado"
      }));

      // Chamar edge function para comparação
      const { data, error } = await supabase.functions.invoke('compare-ideas', {
        body: {
          ideas: ideasForComparison
        }
      });

      if (error) {
        console.error("Error comparing ideas:", error);
        toast.error(t('errors.compareError', "Erro ao comparar ideias"));
        setComparing(false);
        return;
      }

      console.log("Comparison result:", data);
      setComparisonResults({
        insights: data.insights,
        ideaTitles: selectedIdeasData.map(idea => idea.title)
      });
      setShowResults(true);
      onClose();
      
      toast.success(t('ideas.compareSuccess', "Comparação de ideias realizada com sucesso"));
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
      <Dialog open={isOpen} onOpenChange={() => !comparing && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ideas.compare.title', "Comparar Ideias")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedIdeasData.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ideas.compare.selectedIdeas', "Ideias selecionadas")}:</p>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedIdeasData.map(idea => (
                    <li key={idea.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate pr-2" title={idea.title}>
                        {idea.title}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveIdea(idea.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        disabled={comparing}
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
            
            {selectedIdeaIds.length < 3 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ideas.compare.addMoreIdeas', "Adicionar mais ideias")}:</p>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedIdea || ""}
                    onChange={(e) => setSelectedIdea(e.target.value)}
                    disabled={comparing}
                  >
                    <option value="">{t('ideas.compare.selectIdea', "Selecione uma ideia")}</option>
                    {ideas
                      .filter(idea => !selectedIdeaIds.includes(idea.id))
                      .map(idea => (
                        <option key={idea.id} value={idea.id}>
                          {idea.title.length > 40 ? `${idea.title.substring(0, 40)}...` : idea.title}
                        </option>
                      ))}
                  </select>
                  <Button 
                    onClick={handleAddIdea} 
                    disabled={!selectedIdea || comparing}
                    className="whitespace-nowrap"
                  >
                    {t('common.add', "Adicionar")}
                  </Button>
                </div>
              </div>
            )}

            {selectedIdeaIds.length >= 3 && (
              <p className="text-xs text-muted-foreground text-center">
                {t('ideas.compare.maxIdeas', "Máximo de 3 ideias para comparação")}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={comparing}
            >
              {t('common.cancel', "Cancelar")}
            </Button>
            <Button 
              onClick={handleCompareIdeas} 
              disabled={selectedIdeaIds.length < 2 || comparing}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {comparing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.processing', "Processando...")}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-1" />
                  {t('ideas.compare.button', "Comparar")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <ComparisonResultsModal
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          setComparisonResults(null);
        }}
        insights={comparisonResults?.insights}
        ideaTitles={comparisonResults?.ideaTitles || []}
      />
    </>
  );
};
