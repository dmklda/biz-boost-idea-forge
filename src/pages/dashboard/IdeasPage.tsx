
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

// Tipagem para as ideias
interface Idea {
  id: string;
  title: string;
  description: string;
  audience: string | null;
  problem: string | null;
  created_at: string;
  score?: number;
  status?: string;
}

const IdeasPage = () => {
  const { authState } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar ideias do usuário
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!authState.isAuthenticated) return;

      try {
        setLoading(true);
        
        // Buscar ideias do usuário atual
        const { data, error } = await supabase
          .from('ideas')
          .select(`
            *,
            idea_analyses (score, status)
          `)
          .eq('user_id', authState.user?.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }

        // Formatar os dados para incluir análises
        const formattedIdeas = data.map(idea => {
          // Encontrar a análise correspondente (se existir)
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
            status: analysis ? analysis.status : "Pendente"
          };
        });

        setIdeas(formattedIdeas);
      } catch (error) {
        console.error("Error fetching ideas:", error);
        toast.error("Erro ao carregar ideias");
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [authState.isAuthenticated, authState.user?.id]);

  // Filtrar ideias baseado na busca
  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filtrar ideias viáveis (pontuação >= 70)
  const viableIdeas = filteredIdeas.filter(idea => (idea.score || 0) >= 70);
  
  // Filtrar ideias moderadas (pontuação < 70)
  const moderateIdeas = filteredIdeas.filter(idea => (idea.score || 0) < 70 && (idea.score || 0) > 0);

  // Renderização condicional para estados de loading e sem dados
  const renderTableContent = (ideasToShow: Idea[]) => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            Carregando ideias...
          </TableCell>
        </TableRow>
      );
    }

    if (ideasToShow.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            Nenhuma ideia encontrada.
          </TableCell>
        </TableRow>
      );
    }

    return ideasToShow.map((idea) => (
      <TableRow key={idea.id}>
        <TableCell className="font-medium">{idea.title}</TableCell>
        <TableCell>
          <Badge variant="outline" className={`
            ${(idea.score || 0) > 80 ? "border-green-500 bg-green-500/10 text-green-600" : 
              (idea.score || 0) > 65 ? "border-amber-500 bg-amber-500/10 text-amber-600" :
              (idea.score || 0) > 0 ? "border-red-500 bg-red-500/10 text-red-600" :
              "border-gray-500 bg-gray-500/10 text-gray-600"}
          `}>
            {idea.status || "Pendente"}
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
            <span>Pendente</span>
          )}
        </TableCell>
        <TableCell>{new Date(idea.created_at).toLocaleDateString()}</TableCell>
        <TableCell>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/resultados?id=${idea.id}`}>Ver análise</Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Ideias</h1>
          <p className="text-muted-foreground">
            Histórico e gerenciamento de suas análises de ideias
          </p>
        </div>
        <Link to="/">
          <Button className="bg-brand-purple hover:bg-brand-purple/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ideias..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas as Ideias</TabsTrigger>
          <TabsTrigger value="viable">Viáveis</TabsTrigger>
          <TabsTrigger value="moderate">Moderadas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ideia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent(filteredIdeas)}
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
                    <TableHead>Ideia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
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
                    <TableHead>Ideia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
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
    </div>
  );
};

export default IdeasPage;
