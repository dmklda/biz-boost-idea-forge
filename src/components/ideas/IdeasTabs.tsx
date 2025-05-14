
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Star, TagIcon, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SavedAnalysesList } from "@/components/advanced-analysis";
import { TagsFilter, TagType } from "./TagsFilter";
import { IdeasGrid, Idea } from "./IdeasGrid";

interface IdeasTabsProps {
  ideas: Idea[];
  favoriteIdeas: Idea[];
  filteredIdeas: Idea[];
  loading: boolean;
  allTags: TagType[];
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  fetchIdeas: () => void;
}

export const IdeasTabs = ({
  ideas,
  favoriteIdeas,
  filteredIdeas,
  loading,
  allTags,
  selectedTags,
  onTagsChange,
  fetchIdeas
}: IdeasTabsProps) => {
  const { t } = useTranslation();

  return (
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
        <IdeasGrid 
          ideas={ideas} 
          loading={loading} 
        />
      </TabsContent>
      
      <TabsContent value="favorites" className="mt-0">
        <IdeasGrid 
          ideas={favoriteIdeas} 
          loading={loading} 
        />
      </TabsContent>
      
      <TabsContent value="tags" className="mt-0">
        <Card className="mb-6">
          <CardContent className="p-4">
            <TagsFilter 
              allTags={allTags} 
              selectedTags={selectedTags} 
              onTagsChange={onTagsChange} 
            />
          </CardContent>
        </Card>
        <IdeasGrid 
          ideas={filteredIdeas} 
          loading={loading} 
        />
      </TabsContent>
      
      <TabsContent value="advanced-analyses" className="mt-0">
        <SavedAnalysesList />
      </TabsContent>
    </Tabs>
  );
};
