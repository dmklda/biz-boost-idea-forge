
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, FileText, Lightbulb, BarChart3, TrendingUp, Users, DollarSign, Target, 
  Presentation, Briefcase, Search, Calculator, MessageSquare, Zap, Globe, 
  PieChart, LineChart, Calendar, Megaphone, BookOpen, Settings2, Rocket, 
  Shield, Eye, Star, Edit, Receipt, ImageIcon
} from "lucide-react";
import { useState } from "react";
import { LogoGeneratorModal } from "@/components/tools/LogoGeneratorModal";
import { PRDMVPGeneratorModal } from "@/components/tools/PRDMVPGeneratorModal";
import { toast } from "sonner";

const ToolsPage = () => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleLogoOpen = () => {
    setIsLogoModalOpen(true);
  };

  const handlePRDOpen = () => {
    setIsPRDModalOpen(true);
  };

  const handleToolClick = (toolName: string, action: () => void) => {
    console.log(`Tool clicked: ${toolName}`);
    action();
  };

  const allTools = [
    // Design e Branding
    {
      title: "Gerador de Logo",
      description: "Crie logos profissionais para sua startup usando IA",
      icon: Palette,
      action: handleLogoOpen,
      color: "from-purple-500 to-pink-500",
      category: "design",
      credits: 5,
      status: "available"
    },
    {
      title: "Gerador de Nomes",
      description: "Encontre o nome perfeito para sua startup",
      icon: Lightbulb,
      action: () => console.log("Name generator - Coming soon"),
      color: "from-green-500 to-emerald-500",
      category: "design",
      credits: 3,
      status: "coming-soon"
    },
    {
      title: "Paleta de Cores",
      description: "Gere paletas de cores harmoniosas para sua marca",
      icon: Eye,
      action: () => console.log("Color Palette - Coming soon"),
      color: "from-cyan-500 to-blue-500",
      category: "design",
      credits: 2,
      status: "coming-soon"
    },
    {
      title: "Editor de Imagens com IA",
      description: "Edite e aprimore imagens usando inteligência artificial",
      icon: ImageIcon,
      action: () => console.log("AI Image Editor - Coming soon"),
      color: "from-violet-500 to-purple-500",
      category: "design",
      credits: 4,
      status: "coming-soon"
    },

    // Documentação
    {
      title: "PRD/MVP Generator",
      description: "Gere documentos técnicos detalhados para sua ideia",
      icon: FileText,
      action: handlePRDOpen,
      color: "from-blue-500 to-cyan-500",
      category: "documentation",
      credits: 8,
      status: "available"
    },
    {
      title: "Business Model Canvas",
      description: "Crie um modelo de negócio visual e estruturado",
      icon: Briefcase,
      action: () => console.log("Business Model Canvas - Coming soon"),
      color: "from-orange-500 to-red-500",
      category: "documentation",
      credits: 6,
      status: "coming-soon"
    },
    {
      title: "Pitch Deck Generator",
      description: "Gere apresentações profissionais para investidores",
      icon: Presentation,
      action: () => console.log("Pitch Deck - Coming soon"),
      color: "from-indigo-500 to-purple-500",
      category: "documentation",
      credits: 10,
      status: "coming-soon"
    },
    {
      title: "Plano de Negócios",
      description: "Crie um plano de negócios completo e detalhado",
      icon: BookOpen,
      action: () => console.log("Business Plan - Coming soon"),
      color: "from-teal-500 to-cyan-500",
      category: "documentation",
      credits: 12,
      status: "coming-soon"
    },
    {
      title: "Criador de Relatórios",
      description: "Gere relatórios executivos e analíticos profissionais",
      icon: BarChart3,
      action: () => console.log("Report Creator - Coming soon"),
      color: "from-emerald-500 to-green-500",
      category: "documentation",
      credits: 7,
      status: "coming-soon"
    },

    // Análise e Pesquisa
    {
      title: "Análise de Mercado",
      description: "Pesquise e analise seu mercado-alvo",
      icon: TrendingUp,
      action: () => console.log("Market Analysis - Coming soon"),
      color: "from-emerald-500 to-teal-500",
      category: "analysis",
      credits: 9,
      status: "coming-soon"
    },
    {
      title: "Análise Financeira",
      description: "Projete finanças e modelo de receita",
      icon: DollarSign,
      action: () => console.log("Financial Analysis - Coming soon"),
      color: "from-yellow-500 to-orange-500",
      category: "analysis",
      credits: 8,
      status: "coming-soon"
    },
    {
      title: "Análise de Concorrentes",
      description: "Identifique e analise seus principais concorrentes",
      icon: Shield,
      action: () => console.log("Competitor Analysis - Coming soon"),
      color: "from-red-500 to-pink-500",
      category: "analysis",
      credits: 7,
      status: "coming-soon"
    },
    {
      title: "Pesquisa de Usuários",
      description: "Entenda melhor seu público-alvo",
      icon: Users,
      action: () => console.log("User Research - Coming soon"),
      color: "from-cyan-500 to-blue-500",
      category: "analysis",
      credits: 6,
      status: "coming-soon"
    },

    // Marketing Digital
    {
      title: "Estratégia de Marketing",
      description: "Desenvolva estratégias de marketing digital",
      icon: Target,
      action: () => console.log("Marketing Strategy - Coming soon"),
      color: "from-pink-500 to-rose-500",
      category: "marketing",
      credits: 8,
      status: "coming-soon"
    },
    {
      title: "Gerador de Conteúdo",
      description: "Crie conteúdo para redes sociais e blog",
      icon: MessageSquare,
      action: () => console.log("Content Generator - Coming soon"),
      color: "from-violet-500 to-purple-500",
      category: "marketing",
      credits: 4,
      status: "coming-soon"
    },
    {
      title: "Gerador de Posts",
      description: "Crie posts otimizados para redes sociais",
      icon: Megaphone,
      action: () => console.log("Post Generator - Coming soon"),
      color: "from-blue-500 to-indigo-500",
      category: "marketing",
      credits: 3,
      status: "coming-soon"
    },
    {
      title: "SEO Analyzer",
      description: "Otimize sua presença online",
      icon: Search,
      action: () => console.log("SEO Analyzer - Coming soon"),
      color: "from-teal-500 to-green-500",
      category: "marketing",
      credits: 5,
      status: "coming-soon"
    },
    {
      title: "Social Media Planner",
      description: "Planeje e organize suas redes sociais",
      icon: Calendar,
      action: () => console.log("Social Media Planner - Coming soon"),
      color: "from-blue-500 to-indigo-500",
      category: "marketing",
      credits: 6,
      status: "coming-soon"
    },

    // Negócios e Estratégia
    {
      title: "Calculadora de Valuation",
      description: "Estime o valor da sua startup",
      icon: Calculator,
      action: () => console.log("Valuation Calculator - Coming soon"),
      color: "from-amber-500 to-yellow-500",
      category: "business",
      credits: 7,
      status: "coming-soon"
    },
    {
      title: "Automação de Processos",
      description: "Identifique oportunidades de automação",
      icon: Zap,
      action: () => console.log("Process Automation - Coming soon"),
      color: "from-sky-500 to-cyan-500",
      category: "business",
      credits: 9,
      status: "coming-soon"
    },
    {
      title: "Roadmap Generator",
      description: "Crie roadmaps de produto e desenvolvimento",
      icon: Rocket,
      action: () => console.log("Roadmap Generator - Coming soon"),
      color: "from-green-500 to-teal-500",
      category: "business",
      credits: 8,
      status: "coming-soon"
    },
    {
      title: "Gerador de Faturas",
      description: "Crie faturas e documentos financeiros profissionais",
      icon: Receipt,
      action: () => console.log("Invoice Generator - Coming soon"),
      color: "from-orange-500 to-amber-500",
      category: "business",
      credits: 4,
      status: "coming-soon"
    },

    // Ferramentas Avançadas
    {
      title: "Análise de Tendências",
      description: "Identifique tendências de mercado e oportunidades",
      icon: LineChart,
      action: () => console.log("Trend Analysis - Coming soon"),
      color: "from-orange-500 to-amber-500",
      category: "advanced",
      credits: 10,
      status: "coming-soon"
    },
    {
      title: "Previsão de Receita",
      description: "Projete receitas futuras com base em dados",
      icon: PieChart,
      action: () => console.log("Revenue Forecast - Coming soon"),
      color: "from-indigo-500 to-blue-500",
      category: "advanced",
      credits: 12,
      status: "coming-soon"
    },
    {
      title: "Modelo de Pricing",
      description: "Defina estratégias de precificação inteligentes",
      icon: Star,
      action: () => console.log("Pricing Model - Coming soon"),
      color: "from-rose-500 to-pink-500",
      category: "advanced",
      credits: 9,
      status: "coming-soon"
    }
  ];

  const categories = [
    { id: "all", name: "Todos", shortName: "Todos", count: allTools.length },
    { id: "design", name: "Design", shortName: "Design", count: allTools.filter(t => t.category === "design").length },
    { id: "documentation", name: "Documentação", shortName: "Docs", count: allTools.filter(t => t.category === "documentation").length },
    { id: "analysis", name: "Análise", shortName: "Análise", count: allTools.filter(t => t.category === "analysis").length },
    { id: "marketing", name: "Marketing", shortName: "Marketing", count: allTools.filter(t => t.category === "marketing").length },
    { id: "business", name: "Negócios", shortName: "Negócios", count: allTools.filter(t => t.category === "business").length },
    { id: "advanced", name: "Avançadas", shortName: "Avançadas", count: allTools.filter(t => t.category === "advanced").length }
  ];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || tool.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const renderToolCard = (tool: any, index: number) => (
    <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform`}>
              <tool.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base truncate">{tool.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={tool.status === "available" ? "default" : "secondary"} className="text-xs">
                  {tool.status === "available" ? "Disponível" : "Em breve"}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {tool.credits} créditos
                </span>
              </div>
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (tool.status === "coming-soon") {
              toast.info("Funcionalidade em breve!");
              return;
            }
            if (tool.credits > (user?.credits || 0)) {
              toast.error("Você não possui créditos suficientes para usar esta ferramenta.");
              return;
            }
            handleToolClick(tool.title, tool.action);
          }}
          className="w-full relative z-10" 
          disabled={tool.status === "coming-soon"}
          variant={tool.status === "available" ? "default" : "outline"}
        >
          {tool.status === "available" ? "Usar ferramenta" : "Em breve"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ferramentas</h1>
        <p className="text-muted-foreground">
          Utilize nossas ferramentas de IA para acelerar o desenvolvimento da sua startup
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Pesquisar ferramentas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-hide mb-6">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id} 
              className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-medium shrink-0"
            >
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.shortName}</span>
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4 min-w-[1.25rem] flex items-center justify-center">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            {filteredTools.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool, index) => renderToolCard(tool, index))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma ferramenta encontrada</h3>
                <p className="text-muted-foreground">
                  Tente ajustar sua pesquisa ou navegar por outras categorias
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      <LogoGeneratorModal 
        open={isLogoModalOpen} 
        onOpenChange={setIsLogoModalOpen} 
      />
      <PRDMVPGeneratorModal 
        open={isPRDModalOpen} 
        onOpenChange={setIsPRDModalOpen} 
      />
    </div>
  );
};

export default ToolsPage;
