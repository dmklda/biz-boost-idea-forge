
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, FileText, Sparkles, Zap, TrendingUp, Users, Target, BarChart3, Star, TagIcon, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { IdeasTabs, useIdeasData } from "@/components/ideas";
import { useRefreshAnalyses } from "@/hooks/use-refresh-analyses";
import { IdeaForm } from "@/components/IdeaForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Input } from "@/components/ui/input";

// Modern Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
    <CardContent className="relative p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Modern Search Bar Component
const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder={t('ideas.searchPlaceholder', 'Buscar ideias...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

const IdeasPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const {
    ideas,
    favoriteIdeas,
    filteredIdeas,
    loading,
    allTags,
    selectedTags,
    handleTagsChange,
    fetchIdeas
  } = useIdeasData(authState.user?.id);

  // Use the refresh hook to update ideas when analysis is updated
  useRefreshAnalyses(fetchIdeas, []);

  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handler para impedir fechar o modal durante análise
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (isAnalyzing && !open) return; // Não permite fechar se analisando
    setIsAnalysisDialogOpen(open);
  }, [isAnalyzing]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  // Calculate stats
  const totalIdeas = ideas.length;
  const analyzedIdeas = ideas.filter(idea => idea.score !== null && idea.score !== undefined).length;
  const favoriteCount = favoriteIdeas.length;
  const analysisRate = totalIdeas > 0 ? Math.round((analyzedIdeas / totalIdeas) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {isAnalyzing ? (
        <LoadingScreen />
      ) : (
        <div className="max-w-7xl mx-auto p-4 space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center justify-between lg:justify-start gap-4 w-full">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      {t('ideas.title', "Suas Ideias")}
                    </h1>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {t('ideas.subtitle', 'Gerencie e analise suas ideias de negócio')}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 lg:ml-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/dashboard/rascunhos")}
                    className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('ideas.viewDrafts', "Ver Rascunhos")}</span>
                  </Button>
                  <Button 
                    onClick={() => setIsAnalysisDialogOpen(true)} 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('ideas.newIdea', "Nova Ideia")}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md hidden md:block">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Stats Cards - Hidden on Mobile */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title={t('ideas.stats.totalIdeas', 'Total de Ideias')}
              value={totalIdeas}
              icon={Lightbulb}
              color="from-blue-500 to-cyan-500"
              trend="up"
              trendValue="+12% este mês"
            />
            <StatsCard
              title={t('ideas.stats.analyzedIdeas', 'Ideias Analisadas')}
              value={analyzedIdeas}
              icon={BarChart3}
              color="from-green-500 to-emerald-500"
              trend="up"
              trendValue={`${analysisRate}% taxa`}
            />
            <StatsCard
              title={t('ideas.stats.favorites', 'Favoritas')}
              value={favoriteCount}
              icon={Star}
              color="from-yellow-500 to-orange-500"
              trend="up"
              trendValue="+5 esta semana"
            />
            <StatsCard
              title={t('ideas.stats.activeTags', 'Tags Ativas')}
              value={allTags.length}
              icon={TagIcon}
              color="from-purple-500 to-pink-500"
              trend="up"
              trendValue="+3 novas"
            />
          </div>

          {/* Ideas Tabs Section */}
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none" />
            <CardHeader className="relative hidden md:block">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t('ideas.management', 'Gerenciamento de Ideias')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <IdeasTabs
                ideas={ideas}
                favoriteIdeas={favoriteIdeas}
                filteredIdeas={filteredIdeas}
                loading={loading}
                allTags={allTags}
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
                fetchIdeas={fetchIdeas}
              />
            </CardContent>
          </Card>

          {/* Dialog for New Idea */}
          <Dialog 
            open={isAnalysisDialogOpen} 
            onOpenChange={handleDialogOpenChange}
          >
            <DialogContent className="sm:max-w-4xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t('ideaForm.title')}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  {t('ideaForm.subtitle')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <IdeaForm 
                  onAnalysisComplete={() => setIsAnalysisDialogOpen(false)}
                  onAnalysisStateChange={setIsAnalyzing}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default IdeasPage;
