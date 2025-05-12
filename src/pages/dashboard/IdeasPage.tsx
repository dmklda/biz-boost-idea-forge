
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Save, Archive, ArrowLeftRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { FavoriteButton } from "@/components/ideas/FavoriteButton";
import { TagBadge } from "@/components/ideas/TagBadge";
import { type TagType } from "@/components/ideas/TagsSelector";
import { CompareIdeasModal } from "@/components/ideas/CompareIdeasModal";
import { Checkbox } from "@/components/ui/checkbox";

// Typing for ideas
interface Idea {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  created_at: string;
  score?: number;
  status?: string;
  is_favorite?: boolean;
  tags?: TagType[];
}

const IdeasPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userHasCredits, setUserHasCredits] = useState(false);
  
  // State for idea comparison
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Fetch user's ideas and check credits
  useEffect(() => {
    const fetchData = async () => {
      if (!authState.isAuthenticated) return;

      try {
        setLoading(true);
        
        // Fetch ideas from the current user
        const { data, error } = await supabase
          .from('ideas')
          .select(`
            *,
            idea_analyses (score, status)
          `)
          .eq('user_id', authState.user?.id)
          .eq('is_draft', false)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }

        // Fetch favorites
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('idea_favorites')
          .select('idea_id')
          .eq('user_id', authState.user?.id);
          
        if (favoritesError) throw favoritesError;
        
        const favoriteIds = new Set(favoritesData.map(fav => fav.idea_id));
        
        // Fetch tags for all ideas
        const { data: tagsData, error: tagsError } = await supabase
          .from('idea_tags')
          .select('idea_id, tags(id, name, color)')
          .eq('user_id', authState.user?.id);
          
        if (tagsError) throw tagsError;
        
        // Group tags by idea_id
        const tagsByIdeaId = tagsData.reduce((acc: {[key: string]: TagType[]}, item) => {
          if (item.tags) {
            if (!acc[item.idea_id]) acc[item.idea_id] = [];
            acc[item.idea_id].push(item.tags as TagType);
          }
          return acc;
        }, {});

        // Format the data to include analyses and favorite status
        const formattedIdeas = data.map(idea => {
          // Find the corresponding analysis (if it exists)
          const analysis = idea.idea_analyses && idea.idea_analyses.length > 0 
            ? idea.idea_analyses[0] 
            : null;

          return {
            id: idea.id,
            title: idea.title,
            description: idea.description,
            audience: idea.audience,
            problem: idea.problem,
            created_at: idea.created_at,
            score: analysis ? analysis.score : 0,
            status: analysis ? analysis.status : t('ideas.statuses.pending'),
            is_favorite: favoriteIds.has(idea.id),
            tags: tagsByIdeaId[idea.id] || []
          };
        });

        setIdeas(formattedIdeas);
        
        // Check if user has credits for reanalysis
        const { data: profileData } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', authState.user?.id)
          .single();
          
        if (profileData && profileData.credits > 0) {
          setUserHasCredits(true);
        }
        
      } catch (error) {
        console.error("Error fetching ideas:", error);
        toast.error(t('ideas.errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authState.isAuthenticated, authState.user?.id, t]);

  // Filter ideas based on search query
  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter favorite ideas
  const favoriteIdeas = filteredIdeas.filter(idea => idea.is_favorite);
  
  // Filter viable ideas (score >= 70)
  const viableIdeas = filteredIdeas.filter(idea => (idea.score || 0) >= 70);
  
  // Filter moderate ideas (score < 70 and > 0)
  const moderateIdeas = filteredIdeas.filter(idea => (idea.score || 0) < 70 && (idea.score || 0) > 0);

  // Handler for favorite status changes
  const handleFavoriteChange = (ideaId: string, isFavorite: boolean) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId ? { ...idea, is_favorite: isFavorite } : idea
    ));
  };

  // Handler for reanalyze action
  const handleReanalyze = (ideaId: string) => {
    if (!userHasCredits) {
      toast.error(t('ideas.reanalyze.noCredits'), {
        action: {
          label: t('ideas.reanalyze.buyCredits'),
          onClick: () => navigate("/dashboard/creditos")
        }
      });
      return;
    }
    
    navigate(`/dashboard/ideias/editar?id=${ideaId}&reanalyze=true`);
  };

  // Link to drafts page
  const handleViewDrafts = () => {
    navigate("/dashboard/rascunhos");
  };
  
  // Handler for idea selection for comparison
  const handleIdeaSelectionChange = (ideaId: string, isSelected: boolean) => {
    if (isSelected) {
      if (selectedIdeas.length >= 3) {
        toast.warning(t('ideas.compare.maxSelected'));
        return;
      }
      setSelectedIdeas([...selectedIdeas, ideaId]);
    } else {
      setSelectedIdeas(selectedIdeas.filter(id => id !== ideaId));
    }
  };
  
  // Handler for comparing selected ideas
  const handleCompareIdeas = () => {
    if (selectedIdeas.length < 2) {
      toast.warning(t('ideas.compare.needMoreIdeas'));
      return;
    }
    setIsCompareModalOpen(true);
  };

  // Rendering conditional for loading and empty states
  const renderTableContent = (ideasToShow: Idea[]) => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            {t('ideas.loading')}
          </TableCell>
        </TableRow>
      );
    }

    if (ideasToShow.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            {t('ideas.noIdeasFound')}
          </TableCell>
        </TableRow>
      );
    }

    return ideasToShow.map((idea) => (
      <TableRow key={idea.id}>
        <TableCell>
          <Checkbox 
            checked={selectedIdeas.includes(idea.id)}
            onCheckedChange={(checked) => 
              handleIdeaSelectionChange(idea.id, checked === true)
            }
            aria-label={t('ideas.compare.selectForComparison')}
          />
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FavoriteButton 
                ideaId={idea.id} 
                onFavoriteChange={(isFavorite) => handleFavoriteChange(idea.id, isFavorite)}
                variant="ghost" 
                size="icon"
              />
              <Link to={`/resultados?id=${idea.id}`} className="hover:underline">
                {idea.title}
              </Link>
            </div>
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {idea.tags.map((tag) => (
                  <TagBadge key={tag.id} name={tag.name} color={tag.color} className="text-xs" />
                ))}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`
            ${(idea.score || 0) > 80 ? "border-green-500 bg-green-500/10 text-green-600" : 
              (idea.score || 0) > 65 ? "border-amber-500 bg-amber-500/10 text-amber-600" :
              (idea.score || 0) > 0 ? "border-red-500 bg-red-500/10 text-red-600" :
              "border-gray-500 bg-gray-500/10 text-gray-600"}
          `}>
            {idea.status}
          </Badge>
        </TableCell>
        <TableCell>
          {(idea.score || 0) > 0 ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-gray-200">
                <div 
                  className={`h-full rounded-full ${
                    (idea.score || 0) > 80 ? "bg-green-500" : 
                    (idea.score || 0) > 65 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${idea.score || 0}%` }}
                />
              </div>
              <span>{idea.score || 0}%</span>
            </div>
          ) : (
            <span>{t('ideas.statuses.pending')}</span>
          )}
        </TableCell>
        <TableCell>{new Date(idea.created_at).toLocaleDateString()}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/resultados?id=${idea.id}`}>{t('ideas.table.view')}</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => handleReanalyze(idea.id)}
              disabled={!userHasCredits}
            >
              <Archive className="h-3.5 w-3.5" />
              {t('ideas.reanalyze.button')}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('ideas.title')}</h1>
          <p className="text-muted-foreground">
            {t('ideas.subtitle')}
          </p>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleViewDrafts} 
            className="flex items-center gap-2 flex-1 sm:flex-auto justify-center"
          >
            <Save className="h-4 w-4" />
            {t('ideas.viewDrafts')}
          </Button>
          <Link to="/" className="flex-1 sm:flex-auto">
            <Button className="bg-brand-purple hover:bg-brand-purple/90 w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('ideas.newIdea')}
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('ideas.search')}
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={selectedIdeas.length < 2}
          onClick={handleCompareIdeas}
        >
          <ArrowLeftRight className="h-4 w-4" />
          {t('ideas.compare.button')} ({selectedIdeas.length}/3)
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('ideas.filters.all')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('ideas.filters.favorites')}</TabsTrigger>
          <TabsTrigger value="viable">{t('ideas.filters.viable')}</TabsTrigger>
          <TabsTrigger value="moderate">{t('ideas.filters.moderate')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>{t('ideas.table.name')}</TableHead>
                    <TableHead>{t('ideas.table.status')}</TableHead>
                    <TableHead>{t('ideas.table.score')}</TableHead>
                    <TableHead>{t('ideas.table.createdAt')}</TableHead>
                    <TableHead>{t('ideas.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent(filteredIdeas)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>{t('ideas.table.name')}</TableHead>
                    <TableHead>{t('ideas.table.status')}</TableHead>
                    <TableHead>{t('ideas.table.score')}</TableHead>
                    <TableHead>{t('ideas.table.createdAt')}</TableHead>
                    <TableHead>{t('ideas.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent(favoriteIdeas)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="viable" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>{t('ideas.table.name')}</TableHead>
                    <TableHead>{t('ideas.table.status')}</TableHead>
                    <TableHead>{t('ideas.table.score')}</TableHead>
                    <TableHead>{t('ideas.table.createdAt')}</TableHead>
                    <TableHead>{t('ideas.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent(viableIdeas)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="moderate" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>{t('ideas.table.name')}</TableHead>
                    <TableHead>{t('ideas.table.status')}</TableHead>
                    <TableHead>{t('ideas.table.score')}</TableHead>
                    <TableHead>{t('ideas.table.createdAt')}</TableHead>
                    <TableHead>{t('ideas.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent(moderateIdeas)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Compare Ideas Modal */}
      <CompareIdeasModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        ideaIds={selectedIdeas}
      />
    </div>
  );
};

export default IdeasPage;
