
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronLeft, ChevronRight, ArrowLeftRight, BarChart3, Shield, Target, TrendingUp, Users, AlertTriangle, Award, Zap, DollarSign, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/ideas/TagBadge";
import { type TagType } from "@/components/ideas/TagsSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface Idea {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  monetization: string | null;
  created_at: string;
  score?: number;
  status?: string;
  tags?: TagType[];
  analysis?: {
    market_size?: string;
    strengths?: string[];
    weaknesses?: string[];
    differentiation?: string;
  };
}

interface CompareIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaIds: string[];
}

export function CompareIdeasModal({ isOpen, onClose, ideaIds }: CompareIdeasModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('viability');
  const [visibleIdeas, setVisibleIdeas] = useState<number[]>([0, 1]);
  
  // Fetch detailed idea data
  useEffect(() => {
    const fetchIdeasData = async () => {
      if (!ideaIds.length) return;
      
      try {
        setLoading(true);
        const promises = ideaIds.map(async (id) => {
          // First query to get the basic idea information
          const { data, error } = await supabase
            .from('ideas')
            .select(`
              id, title, description, audience, problem, monetization, created_at
            `)
            .eq('id', id)
            .single();
            
          if (error) throw error;
          if (!data) throw new Error("Idea not found");
          
          // Fetch idea analyses separately
          const { data: analysesData, error: analysesError } = await supabase
            .from('idea_analyses')
            .select('score, status, market_size, strengths, weaknesses, differentiation')
            .eq('idea_id', id)
            .maybeSingle();
            
          if (analysesError) {
            console.error("Error fetching analyses:", analysesError);
            // Continue without analysis data if there's an error
          }
          
          // Fetch tags
          const { data: tagsData, error: tagsError } = await supabase
            .from('idea_tags')
            .select('tags(id, name, color)')
            .eq('idea_id', id);
            
          if (tagsError) throw tagsError;
          
          // Format tags
          const tags = tagsData.map((tag) => tag.tags) as TagType[];
          
          // Format the idea with analysis data
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            audience: data.audience,
            problem: data.problem,
            monetization: data.monetization,
            created_at: data.created_at,
            score: analysesData?.score,
            status: analysesData?.status,
            tags,
            analysis: analysesData ? {
              market_size: analysesData.market_size,
              strengths: analysesData.strengths,
              weaknesses: analysesData.weaknesses,
              differentiation: analysesData.differentiation,
            } : undefined
          };
        });
        
        const ideasData = await Promise.all(promises);
        setIdeas(ideasData);
        
        // Set visible ideas based on screen size and available ideas
        if (isMobile) {
          setVisibleIdeas([0]);
        } else {
          setVisibleIdeas(ideasData.length > 1 ? [0, 1] : [0]);
        }
      } catch (error) {
        console.error("Error fetching idea details:", error);
        toast.error(t('ideas.compare.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchIdeasData();
    }
  }, [isOpen, ideaIds, isMobile, t]);
  
  // Navigate between ideas in mobile view
  const shiftVisibleIdeas = (direction: 'next' | 'prev') => {
    if (ideas.length <= 1) return;
    
    setVisibleIdeas(current => {
      if (isMobile) {
        // For mobile, just move one by one
        const currentIndex = current[0];
        if (direction === 'next') {
          return [(currentIndex + 1) % ideas.length];
        } else {
          return [(currentIndex - 1 + ideas.length) % ideas.length];
        }
      } else {
        // For desktop, show 2 or 3 at a time depending on screen size
        const firstVisible = current[0];
        const idealCount = ideas.length > 2 ? 3 : 2;
        const visibleCount = Math.min(idealCount, ideas.length);
        
        if (direction === 'next') {
          const nextFirst = (firstVisible + 1) % ideas.length;
          return Array.from({ length: visibleCount }, (_, i) => 
            (nextFirst + i) % ideas.length
          );
        } else {
          const prevFirst = (firstVisible - 1 + ideas.length) % ideas.length;
          return Array.from({ length: visibleCount }, (_, i) => 
            (prevFirst + i) % ideas.length
          );
        }
      }
    });
  };

  // Get status badge color based on score
  const getStatusBadgeClass = (score?: number) => {
    if (!score) return "border-gray-500 bg-gray-500/10 text-gray-600";
    if (score >= 70) return "border-green-500 bg-green-500/10 text-green-600";
    if (score >= 40) return "border-amber-500 bg-amber-500/10 text-amber-600";
    return "border-red-500 bg-red-500/10 text-red-600";
  };
  
  // Get comparable insights by comparing idea dimensions
  const getComparableInsights = (ideaIndex: number) => {
    if (!ideas[ideaIndex]) return null;
    
    const currentIdea = ideas[ideaIndex];
    const otherIdeas = ideas.filter((_, idx) => idx !== ideaIndex);
    
    const insights: {title: string, content: string, type: 'positive' | 'neutral' | 'negative', icon?: React.ReactNode}[] = [];
    
    // Compare scores
    if (currentIdea.score) {
      const avgOtherScore = otherIdeas.reduce((acc, idea) => acc + (idea.score || 0), 0) / otherIdeas.length;
      if (currentIdea.score >= avgOtherScore + 15) {
        insights.push({
          title: t('ideas.compare.highScoreAdvantage'),
          content: t('ideas.compare.scoreAdvantageDesc'),
          type: 'positive',
          icon: <Award className="h-4 w-4" />
        });
      } else if (currentIdea.score <= avgOtherScore - 15) {
        insights.push({
          title: t('ideas.compare.lowScoreDisadvantage'),
          content: t('ideas.compare.scoreDisadvantageDesc'),
          type: 'negative',
          icon: <TrendingDown className="h-4 w-4" />
        });
      }
    }
    
    // Compare market information
    if (currentIdea.analysis?.market_size && otherIdeas.some(idea => idea.analysis?.market_size)) {
      insights.push({
        title: t('ideas.compare.marketInsight'),
        content: currentIdea.analysis.market_size,
        type: 'neutral',
        icon: <Users className="h-4 w-4" />
      });
    }
    
    // Check for unique strengths
    if (currentIdea.analysis?.strengths?.length) {
      insights.push({
        title: t('ideas.compare.keyStrength'),
        content: currentIdea.analysis.strengths[0],
        type: 'positive',
        icon: <Zap className="h-4 w-4" />
      });
    }
    
    // Check for potential challenges
    if (currentIdea.analysis?.weaknesses?.length) {
      insights.push({
        title: t('ideas.compare.keyChallenge'),
        content: currentIdea.analysis.weaknesses[0],
        type: 'negative',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
    
    // Add monetization insight if available
    if (currentIdea.monetization) {
      insights.push({
        title: t('ideas.compare.marketPotential'),
        content: currentIdea.monetization,
        type: 'neutral',
        icon: <DollarSign className="h-4 w-4" />
      });
    }
    
    // Add competitive advantage if differentiation exists
    if (currentIdea.analysis?.differentiation) {
      insights.push({
        title: t('ideas.compare.competitiveAdvantage'),
        content: currentIdea.analysis.differentiation,
        type: 'positive',
        icon: <Target className="h-4 w-4" />
      });
    }
    
    return insights;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {t('ideas.compare.title')}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          
          <Tabs defaultValue="viability" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="viability" className="flex items-center gap-1">
                <Target className="h-4 w-4 hidden sm:block" />
                {t('ideas.compare.viability')}
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 hidden sm:block" />
                {t('ideas.compare.market')}
              </TabsTrigger>
              <TabsTrigger value="strengths" className="flex items-center gap-1">
                <Shield className="h-4 w-4 hidden sm:block" />
                {t('ideas.compare.strengthsWeaknesses')}
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 hidden sm:block" />
                {t('ideas.compare.insights')}
              </TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-32 bg-muted rounded mb-4"></div>
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="viability" className="mt-0">
                  <div className="relative">
                    {/* Navigation buttons */}
                    {ideas.length > (isMobile ? 1 : 2) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {visibleIdeas.map((idx) => {
                        const idea = ideas[idx];
                        if (!idea) return null;
                        
                        return (
                          <Card key={idea.id} className="h-full overflow-hidden">
                            <CardHeader className="border-b pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{idea.title}</CardTitle>
                                <Badge variant="outline" className={getStatusBadgeClass(idea.score)}>
                                  {idea.score ? `${idea.score}%` : t('ideas.statuses.pending')}
                                </Badge>
                              </div>
                              {idea.tags && idea.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {idea.tags.map((tag) => (
                                    <TagBadge key={tag.id} name={tag.name} color={tag.color} className="text-xs" />
                                  ))}
                                </div>
                              )}
                            </CardHeader>
                            
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.description')}</h3>
                                  <p className="text-sm">{idea.description}</p>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.audience')}</h3>
                                  <p className="text-sm">{idea.audience || t('ideas.compare.notSpecified')}</p>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.problem')}</h3>
                                  <p className="text-sm">{idea.problem || t('ideas.compare.notSpecified')}</p>
                                </div>
                                
                                <div className="pt-2">
                                  <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div 
                                      className={`h-full rounded-full ${
                                        (idea.score || 0) > 80 ? "bg-green-500" : 
                                        (idea.score || 0) > 65 ? "bg-amber-500" : 
                                        (idea.score || 0) > 0 ? "bg-red-500" : "bg-gray-400"
                                      }`}
                                      style={{ width: `${idea.score || 0}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {t('ideas.compare.viabilityScore')}: {idea.score || 0}%
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="market" className="mt-0">
                  <div className="relative">
                    {/* Navigation buttons (same as above) */}
                    {ideas.length > (isMobile ? 1 : 2) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {visibleIdeas.map((idx) => {
                        const idea = ideas[idx];
                        if (!idea) return null;
                        
                        return (
                          <Card key={idea.id} className="h-full overflow-hidden">
                            <CardHeader className="border-b pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{idea.title}</CardTitle>
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.marketSize')}</h3>
                                  <p className="text-sm">{idea.analysis?.market_size || t('ideas.compare.notAnalyzed')}</p>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.differentiation')}</h3>
                                  <p className="text-sm">{idea.analysis?.differentiation || t('ideas.compare.notAnalyzed')}</p>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.monetization')}</h3>
                                  <p className="text-sm">{idea.monetization || t('ideas.compare.notSpecified')}</p>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('ideas.compare.audience')}</h3>
                                  <p className="text-sm">{idea.audience || t('ideas.compare.notSpecified')}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="strengths" className="mt-0">
                  <div className="relative">
                    {/* Navigation buttons (same as above) */}
                    {ideas.length > (isMobile ? 1 : 2) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {visibleIdeas.map((idx) => {
                        const idea = ideas[idx];
                        if (!idea) return null;
                        
                        return (
                          <Card key={idea.id} className="h-full overflow-hidden">
                            <CardHeader className="border-b pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{idea.title}</CardTitle>
                                <Shield className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-green-600 mb-1">{t('ideas.compare.strengths')}</h3>
                                  {idea.analysis?.strengths && idea.analysis.strengths.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                      {idea.analysis.strengths.map((strength, idx) => (
                                        <li key={idx} className="text-sm">{strength}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm italic">{t('ideas.compare.notAnalyzed')}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-red-600 mb-1">{t('ideas.compare.weaknesses')}</h3>
                                  {idea.analysis?.weaknesses && idea.analysis.weaknesses.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                      {idea.analysis.weaknesses.map((weakness, idx) => (
                                        <li key={idx} className="text-sm">{weakness}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm italic">{t('ideas.compare.notAnalyzed')}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="mt-0">
                  <div className="relative">
                    {/* Navigation buttons (same as above) */}
                    {ideas.length > (isMobile ? 1 : 2) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full"
                          onClick={() => shiftVisibleIdeas('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {visibleIdeas.map((idx) => {
                        const idea = ideas[idx];
                        if (!idea) return null;
                        
                        const insights = getComparableInsights(idx);
                        
                        return (
                          <Card key={idea.id} className="h-full overflow-hidden">
                            <CardHeader className="border-b pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{idea.title}</CardTitle>
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                {insights && insights.length > 0 ? (
                                  insights.map((insight, i) => (
                                    <div key={i} className={cn(
                                      "rounded-md p-3",
                                      insight.type === 'positive' ? "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-900" : 
                                      insight.type === 'negative' ? "bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900" : 
                                      "bg-blue-50 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-900"
                                    )}>
                                      <div className="flex items-center gap-2 mb-1">
                                        {insight.icon && (
                                          <span className={cn(
                                            insight.type === 'positive' ? "text-green-700 dark:text-green-400" : 
                                            insight.type === 'negative' ? "text-red-700 dark:text-red-400" : 
                                            "text-blue-700 dark:text-blue-400"
                                          )}>
                                            {insight.icon}
                                          </span>
                                        )}
                                        <h3 className={cn(
                                          "text-sm font-semibold",
                                          insight.type === 'positive' ? "text-green-700 dark:text-green-400" : 
                                          insight.type === 'negative' ? "text-red-700 dark:text-red-400" : 
                                          "text-blue-700 dark:text-blue-400"
                                        )}>
                                          {insight.title}
                                        </h3>
                                      </div>
                                      <p className="text-sm">{insight.content}</p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center p-6">
                                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                                    <h3 className="text-sm font-medium">{t('ideas.compare.noInsights')}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {t('ideas.compare.completeAnalysis')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {/* The TabsContent components have been moved inside the Tabs component above */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
