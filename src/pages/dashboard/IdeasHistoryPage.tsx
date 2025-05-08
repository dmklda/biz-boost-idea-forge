import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  Share2, 
  Download, 
  FileText,
  ArrowUp,
  ArrowDown,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

// Interfaces
interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  score: number | null;
  status: string | null;
}

interface SortConfig {
  key: keyof Idea | null;
  direction: 'ascending' | 'descending';
}

interface FilterOptions {
  date: DateRange | undefined;
  score: string;
  keywords: string;
}

const IdeasHistoryPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'created_at', 
    direction: 'descending' 
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    date: undefined,
    score: 'all',
    keywords: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!authState.user?.id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('ideas')
          .select(`
            id, title, description, created_at,
            idea_analyses (score, status)
          `)
          .eq('user_id', authState.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Process the data to get score and status
        const processedData: Idea[] = data.map((idea: any) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          created_at: idea.created_at,
          score: idea.idea_analyses && idea.idea_analyses[0]?.score,
          status: idea.idea_analyses && idea.idea_analyses[0]?.status,
        }));
        
        setIdeas(processedData);
        setFilteredIdeas(processedData);
      } catch (error) {
        console.error("Error fetching ideas:", error);
        toast.error(t('errors.fetchingIdeas') || "Erro ao buscar ideias");
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdeas();
  }, [authState.user?.id, t]);

  // Handle search and filtering
  useEffect(() => {
    let result = [...ideas];
    
    // Search by title or description
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        idea => 
          idea.title.toLowerCase().includes(query) || 
          idea.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by score
    if (filterOptions.score !== 'all') {
      if (filterOptions.score === 'high') {
        result = result.filter(idea => (idea.score || 0) >= 70);
      } else if (filterOptions.score === 'medium') {
        result = result.filter(idea => (idea.score || 0) >= 40 && (idea.score || 0) < 70);
      } else if (filterOptions.score === 'low') {
        result = result.filter(idea => (idea.score || 0) < 40);
      }
    }
    
    // Filter by keywords
    if (filterOptions.keywords) {
      const keywords = filterOptions.keywords.toLowerCase().split(',').map(k => k.trim());
      result = result.filter(idea => 
        keywords.some(keyword => 
          idea.title.toLowerCase().includes(keyword) || 
          idea.description.toLowerCase().includes(keyword)
        )
      );
    }
    
    // Filter by date range
    if (filterOptions.date?.from && filterOptions.date?.to) {
      const fromDate = new Date(filterOptions.date.from);
      const toDate = new Date(filterOptions.date.to);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      
      result = result.filter(idea => {
        const createdAt = new Date(idea.created_at);
        return createdAt >= fromDate && createdAt <= toDate;
      });
    }
    
    // Sort the results
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredIdeas(result);
  }, [ideas, searchQuery, filterOptions, sortConfig]);

  // Handle sorting
  const requestSort = (key: keyof Idea) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle navigation to idea details
  const handleViewIdea = (id: string) => {
    navigate(`/dashboard/ideias/${id}`);
  };

  // Get status badge
  const getStatusBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Pendente</Badge>;
    
    if (score >= 70) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500">Ótimo</Badge>;
    } else if (score >= 40) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500">Médio</Badge>;
    } else {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500">Baixo</Badge>;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterOptions({
      date: undefined,
      score: 'all',
      keywords: ''
    });
    setSearchQuery('');
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('ideas.history.title') || "Histórico de Ideias"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('ideas.history.description') || "Visualize e gerencie todas as suas ideias analisadas"}
        </p>
      </div>

      {/* Search and filter section */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.placeholder') || "Pesquisar por título ou descrição..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{t('ideas.history.filters') || "Filtros"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">{t('ideas.history.filterOptions') || "Opções de Filtro"}</h4>
                
                <div className="space-y-2">
                  <Label>{t('ideas.history.dateRange') || "Período"}</Label>
                  <DateRangePicker 
                    value={filterOptions.date}
                    onChange={(date) => setFilterOptions({...filterOptions, date})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('ideas.history.scoreFilter') || "Pontuação"}</Label>
                  <Select 
                    value={filterOptions.score}
                    onValueChange={(value) => setFilterOptions({...filterOptions, score: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('ideas.history.allScores') || "Todas as pontuações"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('ideas.history.allScores') || "Todas"}</SelectItem>
                      <SelectItem value="high">{t('ideas.history.highScore') || "Alta (70-100)"}</SelectItem>
                      <SelectItem value="medium">{t('ideas.history.mediumScore') || "Média (40-69)"}</SelectItem>
                      <SelectItem value="low">{t('ideas.history.lowScore') || "Baixa (0-39)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('ideas.history.keywords') || "Palavras-chave (separadas por vírgula)"}</Label>
                  <Input 
                    value={filterOptions.keywords}
                    onChange={(e) => setFilterOptions({...filterOptions, keywords: e.target.value})}
                    placeholder={t('ideas.history.keywordsPlaceholder') || "Ex: app, saúde, educação"}
                  />
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    {t('common.reset') || "Resetar"}
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    {t('common.apply') || "Aplicar"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                {t('common.export') || "Exportar"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('ideas.history.exportOptions') || "Opções de exportação"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>PDF</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Ideas history content */}
      {isMobile ? (
        // Mobile view - cards
        <div className="space-y-4">
          {loading ? (
            // Loading state
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredIdeas.length > 0 ? (
            filteredIdeas.map((idea) => (
              <Card key={idea.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <div className="font-medium line-clamp-2">{idea.title}</div>
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {new Date(idea.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {getStatusBadge(idea.score)}
                      <Button size="sm" variant="outline" onClick={() => handleViewIdea(idea.id)}>
                        {t('common.view') || "Visualizar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  {t('ideas.history.noIdeas') || "Nenhuma ideia encontrada"}
                </div>
                <Button variant="ghost" className="mt-2" asChild>
                  <Link to="/dashboard">{t('common.backToDashboard') || "Voltar para o Dashboard"}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Desktop view - table
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => requestSort('title')} className="cursor-pointer">
                    <div className="flex items-center">
                      {t('ideas.history.title') || "Título"}
                      {sortConfig.key === 'title' && (
                        sortConfig.direction === 'ascending' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => requestSort('score')} className="cursor-pointer">
                    <div className="flex items-center">
                      {t('ideas.history.score') || "Pontuação"}
                      {sortConfig.key === 'score' && (
                        sortConfig.direction === 'ascending' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    {t('ideas.history.status') || "Status"}
                  </TableHead>
                  <TableHead onClick={() => requestSort('created_at')} className="cursor-pointer">
                    <div className="flex items-center">
                      {t('ideas.history.date') || "Data"}
                      {sortConfig.key === 'created_at' && (
                        sortConfig.direction === 'ascending' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    {t('ideas.history.actions') || "Ações"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="animate-pulse">
                      <TableCell><div className="h-4 bg-muted rounded w-40"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded w-20"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                      <TableCell><div className="h-8 bg-muted rounded w-24"></div></TableCell>
                    </TableRow>
                  ))
                ) : filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {idea.title}
                      </TableCell>
                      <TableCell>
                        {idea.score !== null ? `${idea.score}%` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(idea.score)}
                      </TableCell>
                      <TableCell>
                        {new Date(idea.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewIdea(idea.id)}>
                            {t('common.view') || "Visualizar"}
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="text-muted-foreground">
                        {t('ideas.history.noIdeas') || "Nenhuma ideia encontrada"}
                      </div>
                      <Button variant="ghost" className="mt-2" asChild>
                        <Link to="/dashboard">{t('common.backToDashboard') || "Voltar para o Dashboard"}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IdeasHistoryPage;
