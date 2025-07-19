
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Star, TagIcon, FileText, Sparkles, BarChart3, Users, Zap } from "lucide-react";
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
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-lg">
        <TabsTrigger 
          value="all"
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">{t('ideas.tabs.all', "Todas")}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="favorites"
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
        >
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">{t('ideas.tabs.favorites', "Favoritas")}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="tags"
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
        >
          <TagIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('ideas.tabs.tags', "Tags")}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="advanced-analyses"
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">{t('ideas.tabs.analyses', "Análises")}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <div className="space-y-6">
          {/* Header for All Ideas */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('ideas.tabs.allIdeas', 'Todas as Ideias')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {ideas.length} {t('ideas.tabs.ideasFound', 'ideias encontradas')}
              </p>
            </div>
          </div>
          <IdeasGrid 
            ideas={ideas} 
            loading={loading} 
            onUpdate={fetchIdeas}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="favorites" className="mt-0">
        <div className="space-y-6">
          {/* Header for Favorites */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('ideas.tabs.favoriteIdeas', 'Ideias Favoritas')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {favoriteIdeas.length} {t('ideas.tabs.favoritesFound', 'favoritas')}
              </p>
            </div>
          </div>
          <IdeasGrid 
            ideas={favoriteIdeas} 
            loading={loading} 
            onUpdate={fetchIdeas}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="tags" className="mt-0">
        <div className="space-y-6">
          {/* Header for Tags */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <TagIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('ideas.tabs.filterByTags', 'Filtrar por Tags')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {selectedTags.length > 0 
                  ? `${selectedTags.length} ${t('ideas.tabs.tagsSelected', 'tags selecionadas')}`
                  : t('ideas.tabs.selectTags', 'Selecione tags para filtrar')
                }
              </p>
            </div>
          </div>
          
          {/* Tags Filter Card */}
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-emerald-600/5 to-teal-600/5 pointer-events-none" />
            <CardContent className="relative p-6">
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
            onUpdate={fetchIdeas}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="advanced-analyses" className="mt-0">
        <div className="space-y-6">
          {/* Header for Advanced Analyses */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('ideas.tabs.advancedAnalyses', 'Análises Avançadas')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('ideas.tabs.savedAnalyses', 'Análises salvas e detalhadas')}
              </p>
            </div>
          </div>
          <SavedAnalysesList />
        </div>
      </TabsContent>
    </Tabs>
  );
};
