
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock idea data
const ideas = [
  { 
    id: 1, 
    name: "App de entrega de comida saudável", 
    status: "Viável", 
    score: 76, 
    date: "2023-05-01",
    audience: "Jovens profissionais preocupados com saúde",
    problem: "Dificuldade de acesso a comida saudável no dia a dia",
  },
  { 
    id: 2, 
    name: "Plataforma de educação online", 
    status: "Muito Promissor", 
    score: 92, 
    date: "2023-04-28",
    audience: "Estudantes universitários e profissionais",
    problem: "Acesso limitado a conteúdos educacionais de qualidade",
  },
  { 
    id: 3, 
    name: "Serviço de assinatura de plantas", 
    status: "Moderado", 
    score: 65, 
    date: "2023-04-25",
    audience: "Entusiastas de plantas e decoração",
    problem: "Dificuldade em manter plantas vivas e saudáveis",
  },
  { 
    id: 4, 
    name: "Aplicativo de treinamento personalizado", 
    status: "Viável", 
    score: 78, 
    date: "2023-04-20",
    audience: "Pessoas que querem se exercitar em casa",
    problem: "Falta de orientação profissional para exercícios em casa",
  },
  { 
    id: 5, 
    name: "Marketplace de produtos artesanais", 
    status: "Viável", 
    score: 72, 
    date: "2023-04-15",
    audience: "Consumidores interessados em produtos únicos e artesanais",
    problem: "Dificuldade de artesãos em alcançar clientes",
  },
];

const IdeasPage = () => {
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
                  {ideas.map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium">{idea.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${idea.score > 80 ? "border-green-500 bg-green-500/10 text-green-600" : 
                            idea.score > 65 ? "border-amber-500 bg-amber-500/10 text-amber-600" :
                            "border-red-500 bg-red-500/10 text-red-600"}
                        `}>
                          {idea.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-200">
                            <div 
                              className={`h-full rounded-full ${
                                idea.score > 80 ? "bg-green-500" : 
                                idea.score > 65 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${idea.score}%` }}
                            />
                          </div>
                          <span>{idea.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(idea.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/resultados?id=${idea.id}`}>Ver análise</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {ideas.filter(idea => idea.score >= 70).map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium">{idea.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-600">
                          {idea.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-200">
                            <div 
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${idea.score}%` }}
                            />
                          </div>
                          <span>{idea.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(idea.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/resultados?id=${idea.id}`}>Ver análise</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {ideas.filter(idea => idea.score < 70).map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium">{idea.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-600">
                          {idea.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-200">
                            <div 
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${idea.score}%` }}
                            />
                          </div>
                          <span>{idea.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(idea.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/resultados?id=${idea.id}`}>Ver análise</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
