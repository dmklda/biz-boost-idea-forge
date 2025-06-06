
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, FileText, Lightbulb, BarChart3, TrendingUp, Users, DollarSign, Target, PresentationChart, Briefcase, Search, Calculator, MessageSquare, Brain, Zap, Globe, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { LogoGeneratorModal } from "@/components/tools/LogoGeneratorModal";
import { PRDMVPGeneratorModal } from "@/components/tools/PRDMVPGeneratorModal";

const ToolsPage = () => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);

  const handleLogoOpen = () => {
    console.log("Logo modal opening...");
    setIsLogoModalOpen(true);
  };

  const handlePRDOpen = () => {
    console.log("PRD modal opening...");
    setIsPRDModalOpen(true);
  };

  const designTools = [
    {
      title: "Gerador de Logo",
      description: "Crie logos profissionais para sua startup usando IA",
      icon: Palette,
      action: handleLogoOpen,
      color: "from-purple-500 to-pink-500",
      category: "design"
    },
    {
      title: "Gerador de Nomes",
      description: "Encontre o nome perfeito para sua startup",
      icon: Lightbulb,
      action: () => console.log("Name generator - Coming soon"),
      color: "from-green-500 to-emerald-500",
      disabled: true
    }
  ];

  const documentationTools = [
    {
      title: "PRD/MVP Generator",
      description: "Gere documentos técnicos detalhados para sua ideia",
      icon: FileText,
      action: handlePRDOpen,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Business Model Canvas",
      description: "Crie um modelo de negócio visual e estruturado",
      icon: Briefcase,
      action: () => console.log("Business Model Canvas - Coming soon"),
      color: "from-orange-500 to-red-500",
      disabled: true
    },
    {
      title: "Pitch Deck Generator",
      description: "Gere apresentações profissionais para investidores",
      icon: PresentationChart,
      action: () => console.log("Pitch Deck - Coming soon"),
      color: "from-indigo-500 to-purple-500",
      disabled: true
    }
  ];

  const analysisTools = [
    {
      title: "Análise de Mercado",
      description: "Pesquise e analise seu mercado-alvo",
      icon: TrendingUp,
      action: () => console.log("Market Analysis - Coming soon"),
      color: "from-emerald-500 to-teal-500",
      disabled: true
    },
    {
      title: "Análise Financeira",
      description: "Projete finanças e modelo de receita",
      icon: DollarSign,
      action: () => console.log("Financial Analysis - Coming soon"),
      color: "from-yellow-500 to-orange-500",
      disabled: true
    },
    {
      title: "Análise de Concorrentes",
      description: "Identifique e analise seus principais concorrentes",
      icon: BarChart3,
      action: () => console.log("Competitor Analysis - Coming soon"),
      color: "from-red-500 to-pink-500",
      disabled: true
    },
    {
      title: "Pesquisa de Usuários",
      description: "Entenda melhor seu público-alvo",
      icon: Users,
      action: () => console.log("User Research - Coming soon"),
      color: "from-cyan-500 to-blue-500",
      disabled: true
    }
  ];

  const marketingTools = [
    {
      title: "Estratégia de Marketing",
      description: "Desenvolva estratégias de marketing digital",
      icon: Target,
      action: () => console.log("Marketing Strategy - Coming soon"),
      color: "from-pink-500 to-rose-500",
      disabled: true
    },
    {
      title: "Gerador de Conteúdo",
      description: "Crie conteúdo para redes sociais e blog",
      icon: MessageSquare,
      action: () => console.log("Content Generator - Coming soon"),
      color: "from-violet-500 to-purple-500",
      disabled: true
    },
    {
      title: "SEO Analyzer",
      description: "Otimize sua presença online",
      icon: Search,
      action: () => console.log("SEO Analyzer - Coming soon"),
      color: "from-teal-500 to-green-500",
      disabled: true
    }
  ];

  const businessTools = [
    {
      title: "Calculadora de Valuation",
      description: "Estime o valor da sua startup",
      icon: Calculator,
      action: () => console.log("Valuation Calculator - Coming soon"),
      color: "from-amber-500 to-yellow-500",
      disabled: true
    },
    {
      title: "Gerador de Ideias",
      description: "Gere novas ideias de negócio com IA",
      icon: Brain,
      action: () => console.log("Idea Generator - Coming soon"),
      color: "from-lime-500 to-green-500",
      disabled: true
    },
    {
      title: "Automação de Processos",
      description: "Identifique oportunidades de automação",
      icon: Zap,
      action: () => console.log("Process Automation - Coming soon"),
      color: "from-sky-500 to-cyan-500",
      disabled: true
    }
  ];

  const renderToolCategory = (title: string, tools: any[], description: string) => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-5`} />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color}`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  console.log(`Clicked tool: ${tool.title}`);
                  tool.action();
                }} 
                className="w-full"
                disabled={tool.disabled}
              >
                {tool.disabled ? "Em breve" : "Usar ferramenta"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Ferramentas</h1>
        <p className="text-muted-foreground">
          Utilize nossas ferramentas de IA para acelerar o desenvolvimento da sua startup
        </p>
      </div>

      {renderToolCategory("Design e Branding", designTools, "Ferramentas para criar a identidade visual da sua startup")}
      
      {renderToolCategory("Documentação", documentationTools, "Gere documentos profissionais e estruturados")}
      
      {renderToolCategory("Análise e Pesquisa", analysisTools, "Analise mercado, concorrentes e oportunidades")}
      
      {renderToolCategory("Marketing Digital", marketingTools, "Desenvolva estratégias de marketing eficazes")}
      
      {renderToolCategory("Negócios e Estratégia", businessTools, "Ferramentas para planejamento e crescimento")}

      {/* Modals */}
      <LogoGeneratorModal 
        open={isLogoModalOpen} 
        onOpenChange={(open) => {
          console.log(`Logo modal state changing to: ${open}`);
          setIsLogoModalOpen(open);
        }} 
      />
      <PRDMVPGeneratorModal 
        open={isPRDModalOpen} 
        onOpenChange={(open) => {
          console.log(`PRD modal state changing to: ${open}`);
          setIsPRDModalOpen(open);
        }} 
      />
    </div>
  );
};

export default ToolsPage;
