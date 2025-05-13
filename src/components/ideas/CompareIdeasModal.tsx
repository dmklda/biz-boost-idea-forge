import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Compare, Loader2, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

interface Idea {
  id: string;
  title: string;
  description: string;
}

export interface CompareIdeasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIdeaId: string;
}

export function CompareIdeasModal({ open, onOpenChange, currentIdeaId }: CompareIdeasModalProps) {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  
  // Add current idea to selected ideas initially
  useEffect(() => {
    if (open && currentIdeaId) {
      setSelectedIdeas([currentIdeaId]);
    } else {
      setSelectedIdeas([]);
    }
  }, [open, currentIdeaId]);
  
  // Fetch all ideas except current one
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!open || !authState.isAuthenticated) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('ideas')
          .select('id, title, description')
          .eq('user_id', authState.user?.id)
          .neq('id', currentIdeaId)
          .eq('is_draft', false)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setIdeas(data || []);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdeas();
  }, [open, authState.isAuthenticated, authState.user?.id, currentIdeaId]);
  
  const handleSelectIdea = (ideaId: string, position: number) => {
    let newSelectedIdeas = [...selectedIdeas];
    
    // If idea already selected, remove it
    if (newSelectedIdeas.includes(ideaId)) {
      newSelectedIdeas = newSelectedIdeas.filter(id => id !== ideaId);
    } else {
      // If position is specified, set idea at that position
      if (position === 1 && newSelectedIdeas.length > 0) {
        newSelectedIdeas[1] = ideaId;
      } else if (position === 2 && newSelectedIdeas.length > 1) {
        newSelectedIdeas[2] = ideaId;
      } else {
        // Otherwise just add it to the array
        newSelectedIdeas.push(ideaId);
      }
    }
    
    // Make sure we don't have more than 3 ideas total
    if (newSelectedIdeas.length > 3) {
      newSelectedIdeas = newSelectedIdeas.slice(0, 3);
    }
    
    setSelectedIdeas(newSelectedIdeas);
  };
  
  const handleCompare = async () => {
    if (selectedIdeas.length < 2) {
      toast.error(t('ideaComparison.minimumIdeas', "Selecione pelo menos 2 ideias para comparar"));
      return;
    }
    
    try {
      setComparing(true);
      
      // Fetch full details of selected ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          audience,
          problem,
          has_competitors,
          monetization,
          idea_analyses (score, status, strengths, weaknesses, market_size, differentiation)
        `)
        .in('id', selectedIdeas);
        
      if (ideasError) throw ideasError;
      
      // Format ideas data for comparison
      const formattedIdeas = ideasData.map(idea => ({
        id: idea.id,
        title: idea.title, 
        description: idea.description,
        audience: idea.audience,
        problem: idea.problem,
        has_competitors: idea.has_competitors,
        monetization: idea.monetization,
        score: idea.idea_analyses?.[0]?.score || 0,
        status: idea.idea_analyses?.[0]?.status || "Não analisado",
        strengths: idea.idea_analyses?.[0]?.strengths || [],
        weaknesses: idea.idea_analyses?.[0]?.weaknesses || [],
        market_size: idea.idea_analyses?.[0]?.market_size || "",
        differentiation: idea.idea_analyses?.[0]?.differentiation || ""
      }));
      
      // Call the Edge Function
      const { data: comparisonResult, error: comparisonError } = await supabase.functions
        .invoke('compare-ideas', {
          body: { ideas: formattedIdeas }
        });
        
      if (comparisonError) throw comparisonError;
      
      // Close the dialog
      onOpenChange(false);
      
      // Navigate to the comparison results page
      if (comparisonResult?.comparison_id) {
        // Navigate to the results page
        navigate(`/dashboard/resultados?comparison=${comparisonResult.comparison_id}`);
        
        toast.success(t('ideaComparison.success', "Comparação concluída com sucesso!"));
      } else {
        throw new Error("Falha ao obter ID da comparação");
      }
      
    } catch (error) {
      console.error("Error comparing ideas:", error);
      toast.error(t('ideaComparison.error', "Erro ao comparar ideias. Tente novamente."));
    } finally {
      setComparing(false);
    }
  };
  
  const getIdeaDetail = (id: string) => {
    if (id === currentIdeaId) {
      return { title: t('ideaComparison.currentIdea', "Ideia atual"), subtitle: "" };
    }
    
    const idea = ideas.find(idea => idea.id === id);
    return { 
      title: idea?.title || "", 
      subtitle: idea?.description || ""
    };
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ideaComparison.title', "Comparar ideias")}</DialogTitle>
          <DialogDescription>
            {t('ideaComparison.description', "Selecione até 2 ideias para comparar com a ideia atual.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Idea (already selected) */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center text-white">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium">{t('ideaComparison.currentIdea', "Ideia atual")}</p>
            </div>
            <Check className="h-5 w-5 text-brand-purple" />
          </div>
          
          {/* Second Idea Selection */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              2
            </div>
            <div className="flex-1">
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open1}
                  className="w-full justify-between"
                  onClick={() => setOpen1(!open1)}
                  disabled={loading}
                >
                  {selectedIdeas.length > 1 
                    ? getIdeaDetail(selectedIdeas[1]).title 
                    : t('ideaComparison.selectIdea', "Selecione uma ideia")}
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-70" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
                <Command className={cn(
                  "absolute z-50 w-full border rounded-md bg-white dark:bg-slate-950 shadow-md",
                  !open1 && "hidden"
                )}>
                  <CommandInput placeholder={t('ideaComparison.search', "Buscar ideias...")} />
                  <CommandList>
                    <CommandEmpty>{t('ideaComparison.noResults', "Nenhuma ideia encontrada")}</CommandEmpty>
                    <CommandGroup>
                      {ideas.map(idea => (
                        <CommandItem
                          key={idea.id}
                          onSelect={() => {
                            handleSelectIdea(idea.id, 1);
                            setOpen1(false);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex-1 truncate">
                            <p>{idea.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{idea.description}</p>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4 ml-2",
                              selectedIdeas.includes(idea.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>
          </div>
          
          {/* Third Idea Selection (Optional) */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              3
            </div>
            <div className="flex-1">
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open2}
                  className="w-full justify-between"
                  onClick={() => setOpen2(!open2)}
                  disabled={loading || selectedIdeas.length < 2}
                >
                  {selectedIdeas.length > 2 
                    ? getIdeaDetail(selectedIdeas[2]).title 
                    : t('ideaComparison.selectIdea', "Selecione uma ideia (opcional)")}
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-70" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
                <Command className={cn(
                  "absolute z-50 w-full border rounded-md bg-white dark:bg-slate-950 shadow-md",
                  !open2 && "hidden"
                )}>
                  <CommandInput placeholder={t('ideaComparison.search', "Buscar ideias...")} />
                  <CommandList>
                    <CommandEmpty>{t('ideaComparison.noResults', "Nenhuma ideia encontrada")}</CommandEmpty>
                    <CommandGroup>
                      {ideas
                        .filter(idea => !selectedIdeas.includes(idea.id) || selectedIdeas[2] === idea.id)
                        .map(idea => (
                          <CommandItem
                            key={idea.id}
                            onSelect={() => {
                              handleSelectIdea(idea.id, 2);
                              setOpen2(false);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex-1 truncate">
                              <p>{idea.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{idea.description}</p>
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4 ml-2",
                                selectedIdeas.includes(idea.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleCompare}
            disabled={selectedIdeas.length < 2 || comparing}
            className="bg-brand-purple hover:bg-brand-purple/90 w-full"
          >
            {comparing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('ideaComparison.comparing', "Comparando...")}
              </>
            ) : (
              <>
                <BarChart className="mr-2 h-4 w-4" />
                {t('ideaComparison.compare', "Comparar ideias")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
