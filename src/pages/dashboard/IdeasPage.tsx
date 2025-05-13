import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Lightbulb, Star, TagIcon, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { SavedAnalysesList } from "@/components/advanced-analysis";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TagsFilter } from "@/components/ideas/TagsFilter";
import { TagType } from "@/components/ideas/TagsSelector";

interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite?: boolean;
  score?: number;
  status?: string;
  tags?: string[];
}

// Placeholder components until real ones are available
const IdeaCard = ({ idea, onUpdate }: { idea: Idea, onUpdate: () => void }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold">{idea.title}</h3>
        <p className="text-sm text-muted-foreground">{idea.description}</p>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action: React.ReactNode 
}) => {
  return (
    <div className="text-center py-10">
      <div className="inline-flex justify-center mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action}
    </div>
  );
};

const TagsFilter = ({
  allTags, 
  selectedTags, 
  onTagsChange
}: {
  allTags: any[];
  selectedTags: any[];
  onTagsChange: (tags: any[]) => void;
}) => {
  return (
    <div>
      <p>Tags filter placeholder</p>
    </div>
  );
};

const IdeasPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [favoriteIdeas, setFavoriteIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchIdeas();
      fetchTags();
    }
  }, [authState.isAuthenticated]);
  
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      
      // Fetch all ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          created_at,
          idea_analyses (score, status)
        `)
        .eq('user_id', authState.user?.id)
        .order('created_at', { ascending: false });
        
      if (ideasError) throw ideasError;
      
      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('idea_favorites')
        .select('idea_id')
        .eq('user_id', authState.user?.id);
        
      if (favoritesError) throw favoritesError;
      
      // Fetch tags for each idea
      const { data: ideaTagsData, error: ideaTagsError } = await supabase
        .from('idea_tags')
        .select('idea_id, tag_id, tags (id, name, color)')
        .eq('user_id', authState.user?.id);
        
      if (ideaTagsError) throw ideaTagsError;
      
      // Process the data
      const favoriteIdeaIds = new Set(favoritesData?.map((fav: any) => fav.idea_id) || []);
      
      // Create a map of idea_id to tags
      const ideaTagsMap: Record<string, string[]> = {};
      ideaTagsData?.forEach((ideaTag: any) => {
        if (!ideaTagsMap[ideaTag.idea_id]) {
          ideaTagsMap[ideaTag.idea_id] = [];
        }
        ideaTagsMap[ideaTag.idea_id].push(ideaTag.tags.name);
      });
      
      // Process ideas with their analysis data and favorite status
      const processedIdeas = ideasData?.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        created_at: idea.created_at,
        is_favorite: favoriteIdeaIds.has(idea.id),
        score: idea.idea_analyses?.[0]?.score || null,
        status: idea.idea_analyses?.[0]?.status || null,
        tags: ideaTagsMap[idea.id] || []
      }));
      
      setIdeas(processedIdeas || []);
      setFavoriteIdeas(processedIdeas?.filter(idea => idea.is_favorite) || []);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', authState.user?.id);
        
      if (error) throw error;
      
      setAllTags(data.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })));
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  
  const handleTagsChange = (tags: TagType[]) => {
    setSelectedTags(tags);
  };
  
  const filteredIdeas = selectedTags.length > 0
    ? ideas.filter(idea => 
        selectedTags.every(tag => 
          idea.tags?.includes(tag.name)
        )
      )
    : ideas;
  
  const renderIdeasGrid = (ideasToRender: Idea[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      );
    }
    
    if (ideasToRender.length === 0) {
      return (
        <EmptyState
          icon={<Lightbulb className="h-10 w-10 text-muted-foreground" />}
          title={t('ideas.noIdeas', "Nenhuma ideia encontrada")}
          description={t('ideas.createFirst', "Crie sua primeira ideia para começar")}
          action={
            <Button onClick={() => navigate("/new-idea")} className="bg-brand-purple hover:bg-brand-purple/90">
              <Plus className="mr-2 h-4 w-4" />
              {t('ideas.createNew', "Nova Ideia")}
            </Button>
          }
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideasToRender.map(idea => (
          <IdeaCard 
            key={idea.id} 
            idea={idea} 
            onUpdate={fetchIdeas}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">
          {t('ideas.title', "Suas Ideias")}
        </h1>
        <Button onClick={() => navigate("/new-idea")} className="bg-brand-purple hover:bg-brand-purple/90">
          <Plus className="mr-2 h-4 w-4" />
          {t('ideas.createNew', "Nova Ideia")}
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
          <TabsTrigger value="all">
            <Lightbulb className="mr-2 h-4 w-4" />
            {t('ideas.tabs.all', "Todas")}
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="mr-2 h-4 w-4" />
            {t('ideas.tabs.favorites', "Favoritas")}
          </TabsTrigger>
          <TabsTrigger value="tags">
            <TagIcon className="mr-2 h-4 w-4" />
            {t('ideas.tabs.tags', "Tags")}
          </TabsTrigger>
          <TabsTrigger value="advanced-analyses">
            <FileText className="mr-2 h-4 w-4" />
            {t('ideas.tabs.analyses', "Análises Avançadas")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderIdeasGrid(ideas)}
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-0">
          {renderIdeasGrid(favoriteIdeas)}
        </TabsContent>
        
        <TabsContent value="tags" className="mt-0">
          <Card className="mb-6">
            <CardContent className="p-4">
              <TagsFilter 
                allTags={allTags} 
                selectedTags={selectedTags} 
                onTagsChange={handleTagsChange} 
              />
            </CardContent>
          </Card>
          {renderIdeasGrid(filteredIdeas)}
        </TabsContent>
        
        <TabsContent value="advanced-analyses" className="mt-0">
          <SavedAnalysesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdeasPage;
