
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  LineChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { PlusCircle, ArrowUp, ArrowDown, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for charts
const performanceData = [
  { name: 'Jan', análises: 4, consultas: 2 },
  { name: 'Fev', análises: 3, consultas: 5 },
  { name: 'Mar', análises: 2, consultas: 3 },
  { name: 'Abr', análises: 7, consultas: 4 },
  { name: 'Mai', análises: 5, consultas: 6 },
  { name: 'Jun', análises: 3, consultas: 4 },
];

const recentIdeas = [
  { id: 1, name: "App de entrega de comida saudável", status: "Viável", date: "2023-05-01" },
  { id: 2, name: "Plataforma de educação online", status: "Muito Promissor", date: "2023-04-28" },
  { id: 3, name: "Serviço de assinatura de plantas", status: "Moderado", date: "2023-04-25" },
];

const DashboardHome = () => {
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  
  const addCredits = () => {
    // In a real app, this would redirect to a payment gateway
    // For demo purposes, we'll just add credits directly
    if (user) {
      updateUserCredits(user.credits + 5);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/">
          <Button className="bg-brand-purple hover:bg-brand-purple/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </Link>
      </div>
      
      {/* Cards with Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Análises
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Viabilidade
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">
              +5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Créditos Disponíveis
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.credits || 0}</div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-brand-purple" onClick={addCredits}>
              Adicionar créditos
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Seu Plano
            </CardTitle>
            <Badge variant={user?.plan === "free" ? "outline" : "default"} className={user?.plan === "free" ? "" : "bg-brand-purple"}>
              {user?.plan === "free" ? "Free" : "Pro"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.plan === "free" ? "Gratuito" : "Premium"}
            </div>
            {user?.plan === "free" && (
              <Link to="/planos">
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-brand-purple">
                  Fazer upgrade
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Desempenho de Análises</CardTitle>
                <CardDescription>
                  Comparação mensal de análises e consultas
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="análises" fill="#9b87f5" />
                    <Bar dataKey="consultas" fill="#7E69AB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ideias Recentes</CardTitle>
                <CardDescription>
                  Suas últimas análises de ideias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIdeas.map((idea) => (
                    <div key={idea.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {idea.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {idea.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(idea.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/ideias">
                  <Button variant="outline" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Análises</CardTitle>
              <CardDescription>
                Evolução das suas análises ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="análises" stroke="#9b87f5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;
