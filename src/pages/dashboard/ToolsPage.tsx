
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
import { PRDMVPGeneratorModalEnhanced as PRDMVPGeneratorModal } from "@/components/tools/enhanced";
import { BusinessNameGeneratorModal } from "@/components/tools/BusinessNameGeneratorModal";
import { MarketAnalysisModal } from "@/components/tools/MarketAnalysisModal";
import { BusinessModelCanvasModalEnhanced } from "@/components/tools/enhanced";
import { FinancialAnalysisModal } from "@/components/tools/FinancialAnalysisModal";
import { PitchDeckModalEnhanced as PitchDeckModal } from "@/components/tools/enhanced";
import { CompetitorAnalysisModal } from "@/components/tools/CompetitorAnalysisModal";
import { ColorPaletteModalEnhanced as ColorPaletteModal } from "@/components/tools/enhanced";
import { UserResearchModal } from "@/components/tools/UserResearchModal";
import { ValuationCalculatorModal } from "@/components/tools/ValuationCalculatorModal";
import { MarketingStrategyModal } from "@/components/tools/MarketingStrategyModal";
import { BusinessPlanModalEnhanced as BusinessPlanModal } from "@/components/tools/enhanced";
import { SEOAnalyzerModal } from "@/components/tools/SEOAnalyzerModal";
import { LandingPageGeneratorModal } from "@/components/tools/LandingPageGeneratorModal";
import { ContentMarketingModal } from "@/components/tools/ContentMarketingModal";
import { TrendAnalysisModal } from "@/components/tools/TrendAnalysisModal";
// Importando as versões melhoradas das ferramentas
import { RevenueForecastModalEnhanced as RevenueForecastModal } from "@/components/tools/enhanced";
import { RoadmapGeneratorModalEnhanced as RoadmapGeneratorModal } from "@/components/tools/enhanced";
import { StartupKitModalEnhanced as StartupKitModal } from "@/components/tools/enhanced";
import { InvestmentSimulatorModalEnhanced as InvestmentSimulatorModal } from "@/components/tools/enhanced";
// Importando as ferramentas originais para as demais
import { PostGeneratorModal } from "@/components/tools/PostGeneratorModal";
import { SocialMediaPlannerModal } from "@/components/tools/SocialMediaPlannerModal";
import { ProcessAutomationModal } from "@/components/tools/ProcessAutomationModal";
import { InvoiceGeneratorModal } from "@/components/tools/InvoiceGeneratorModal";
import { PricingModelModal } from "@/components/tools/PricingModelModal";
import { MarketTimingModal } from "@/components/tools/MarketTimingModal";
import { CacLtvModal } from "@/components/tools/CacLtvModal";
import { AiImageEditorModal } from "@/components/tools/AiImageEditorModal";
import { ReportCreatorModal } from "@/components/tools/ReportCreatorModal";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { CreditGuard } from "@/components/CreditGuard";

const ToolsPage = () => {
  const { authState } = useAuth();
  const { hasFeatureAccess, getFeatureCost, canAccessFeature, hasCredits } = usePlanAccess();
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);
  const [isBusinessNameModalOpen, setIsBusinessNameModalOpen] = useState(false);
  const [isMarketAnalysisModalOpen, setIsMarketAnalysisModalOpen] = useState(false);
  const [isBusinessModelCanvasModalOpen, setIsBusinessModelCanvasModalOpen] = useState(false);
  const [isFinancialAnalysisModalOpen, setIsFinancialAnalysisModalOpen] = useState(false);
  const [isPitchDeckModalOpen, setIsPitchDeckModalOpen] = useState(false);
  const [isCompetitorAnalysisModalOpen, setIsCompetitorAnalysisModalOpen] = useState(false);
  const [isColorPaletteModalOpen, setIsColorPaletteModalOpen] = useState(false);
  const [isUserResearchModalOpen, setIsUserResearchModalOpen] = useState(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [isMarketingStrategyModalOpen, setIsMarketingStrategyModalOpen] = useState(false);
  const [isBusinessPlanModalOpen, setIsBusinessPlanModalOpen] = useState(false);
  const [isSEOModalOpen, setIsSEOModalOpen] = useState(false);
  const [isLandingPageModalOpen, setIsLandingPageModalOpen] = useState(false);
  const [isContentMarketingModalOpen, setIsContentMarketingModalOpen] = useState(false);
  const [isTrendAnalysisModalOpen, setIsTrendAnalysisModalOpen] = useState(false);
  const [isRevenueForecastModalOpen, setIsRevenueForecastModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [isStartupKitModalOpen, setIsStartupKitModalOpen] = useState(false);
  const [isInvestmentSimulatorModalOpen, setIsInvestmentSimulatorModalOpen] = useState(false);
  const [isPostGeneratorModalOpen, setIsPostGeneratorModalOpen] = useState(false);
  const [isSocialMediaPlannerModalOpen, setIsSocialMediaPlannerModalOpen] = useState(false);
  const [isProcessAutomationModalOpen, setIsProcessAutomationModalOpen] = useState(false);
  const [isInvoiceGeneratorModalOpen, setIsInvoiceGeneratorModalOpen] = useState(false);
  const [isPricingModelModalOpen, setIsPricingModelModalOpen] = useState(false);
  const [isMarketTimingModalOpen, setIsMarketTimingModalOpen] = useState(false);
  const [isCacLtvModalOpen, setIsCacLtvModalOpen] = useState(false);
  const [isAiImageEditorModalOpen, setIsAiImageEditorModalOpen] = useState(false);
  const [isReportCreatorModalOpen, setIsReportCreatorModalOpen] = useState(false);
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
      credits: getFeatureCost('logo-generator'),
      status: "available",
      feature: "logo-generator"
    },
    {
      title: "Gerador de Nomes",
      description: "Encontre o nome perfeito para sua startup",
      icon: Lightbulb,
      action: () => setIsBusinessNameModalOpen(true),
      color: "from-green-500 to-emerald-500",
      category: "design",
      credits: getFeatureCost('business-name-generator'),
      status: "available",
      feature: "business-name-generator"
    },
    {
      title: "Paleta de Cores",
      description: "Gere paletas de cores harmoniosas para sua marca",
      icon: Eye,
      action: () => setIsColorPaletteModalOpen(true),
      color: "from-cyan-500 to-blue-500",
      category: "design",
      credits: 2,
      status: "available"
    },

    // Documentação
    {
      title: "PRD/MVP Generator",
      description: "Gere documentos técnicos detalhados para sua ideia",
      icon: FileText,
      action: handlePRDOpen,
      color: "from-blue-500 to-cyan-500",
      category: "documentation",
      credits: getFeatureCost('prd-mvp'),
        status: "available",
      feature: "prd-mvp"
    },
    {
      title: "Business Model Canvas",
      description: "Crie um modelo de negócio visual e estruturado",
      icon: Briefcase,
      action: () => setIsBusinessModelCanvasModalOpen(true),
      color: "from-orange-500 to-red-500",
      category: "documentation",
      credits: getFeatureCost('business-model-canvas'),
      status: "available",
      feature: "business-model-canvas"
    },
    {
      title: "Pitch Deck Generator",
      description: "Gere apresentações profissionais para investidores",
      icon: Presentation,
      action: () => setIsPitchDeckModalOpen(true),
      color: "from-indigo-500 to-purple-500",
      category: "documentation",
      credits: 10,
      status: "available"
    },
    {
      title: "Plano de Negócios",
      description: "Crie um plano de negócios completo e detalhado",
      icon: BookOpen,
      action: () => setIsBusinessPlanModalOpen(true),
      color: "from-teal-500 to-cyan-500",
      category: "documentation",
      credits: 12,
      status: "available"
    },

    // Análise e Pesquisa
    {
      title: "Análise de Mercado",
      description: "Pesquise e analise seu mercado-alvo",
      icon: TrendingUp,
      action: () => setIsMarketAnalysisModalOpen(true),
      color: "from-emerald-500 to-teal-500",
      category: "analysis",
      credits: 9,
      status: "available"
    },
    {
      title: "Análise Financeira",
      description: "Projete finanças e modelo de receita",
      icon: DollarSign,
      action: () => setIsFinancialAnalysisModalOpen(true),
      color: "from-yellow-500 to-orange-500",
      category: "analysis",
      credits: 8,
      status: "available"
    },
    {
      title: "Análise de Concorrentes",
      description: "Identifique e analise seus principais concorrentes",
      icon: Shield,
      action: () => setIsCompetitorAnalysisModalOpen(true),
      color: "from-red-500 to-pink-500",
      category: "analysis",
      credits: 7,
      status: "available"
    },
    {
      title: "Pesquisa de Usuários",
      description: "Entenda melhor seu público-alvo",
      icon: Users,
      action: () => setIsUserResearchModalOpen(true),
      color: "from-cyan-500 to-blue-500",
      category: "analysis",
      credits: getFeatureCost('user-research'),
      status: "available",
      feature: "user-research"
    },

    // Marketing Digital
    {
      title: "Estratégia de Marketing",
      description: "Desenvolva estratégias de marketing digital",
      icon: Target,
      action: () => setIsMarketingStrategyModalOpen(true),
      color: "from-pink-500 to-rose-500",
      category: "marketing",
      credits: getFeatureCost('marketing-strategy'),
      status: "available",
      feature: "marketing-strategy"
    },
    {
      title: "Gerador de Conteúdo",
      description: "Crie conteúdo para redes sociais e blog",
      icon: MessageSquare,
      action: () => setIsContentMarketingModalOpen(true),
      color: "from-violet-500 to-purple-500",
      category: "marketing",
      credits: getFeatureCost('content-marketing'),
      status: "available",
      feature: "content-marketing"
    },
    {
      title: "Gerador de Posts",
      description: "Crie posts otimizados para redes sociais",
      icon: Megaphone,
      action: () => setIsPostGeneratorModalOpen(true),
      color: "from-blue-500 to-indigo-500",
      category: "marketing",
      credits: 3,
      status: "available"
    },
    {
      title: "SEO Analyzer",
      description: "Otimize sua presença online",
      icon: Search,
      action: () => setIsSEOModalOpen(true),
      color: "from-teal-500 to-green-500",
      category: "marketing",
      credits: 5,
      status: "available"
    },
    {
      title: "Social Media Planner",
      description: "Planeje e organize suas redes sociais",
      icon: Calendar,
      action: () => setIsSocialMediaPlannerModalOpen(true),
      color: "from-blue-500 to-indigo-500",
      category: "marketing",
      credits: 6,
      status: "available"
    },

    // Negócios e Estratégia
    {
      title: "Calculadora de Valuation",
      description: "Estime o valor da sua startup",
      icon: Calculator,
      action: () => setIsValuationModalOpen(true),
      color: "from-amber-500 to-yellow-500",
      category: "business",
      credits: 7,
      status: "available"
    },
    {
      title: "Automação de Processos",
      description: "Identifique oportunidades de automação",
      icon: Zap,
      action: () => setIsProcessAutomationModalOpen(true),
      color: "from-sky-500 to-cyan-500",
      category: "business",
      credits: 9,
      status: "available"
    },
    {
      title: "Roadmap Generator",
      description: "Crie roadmaps de produto e desenvolvimento",
      icon: Rocket,
      action: () => setIsRoadmapModalOpen(true),
      color: "from-green-500 to-teal-500",
      category: "business",
      credits: getFeatureCost('roadmap-generator'),
      status: "available",
      feature: "roadmap-generator"
    },
    {
      title: "Gerador de Faturas",
      description: "Crie faturas e documentos financeiros profissionais",
      icon: Receipt,
      action: () => setIsInvoiceGeneratorModalOpen(true),
      color: "from-orange-500 to-amber-500",
      category: "business",
      credits: 4,
      status: "available"
    },

    // Ferramentas Avançadas
    {
      title: "Análise de Tendências",
      description: "Identifique tendências de mercado e oportunidades",
      icon: LineChart,
      action: () => setIsTrendAnalysisModalOpen(true),
      color: "from-orange-500 to-amber-500",
      category: "advanced",
      credits: getFeatureCost('trend-analysis'),
      status: "available",
      feature: "trend-analysis"
    },
    {
      title: "Previsão de Receita",
      description: "Projete receitas futuras com base em dados",
      icon: PieChart,
      action: () => setIsRevenueForecastModalOpen(true),
      color: "from-indigo-500 to-blue-500",
      category: "advanced",
      credits: getFeatureCost('revenue-forecast'),
      status: "available",
      feature: "revenue-forecast"
    },
    {
      title: "Modelo de Pricing",
      description: "Defina estratégias de precificação inteligentes",
      icon: Star,
      action: () => setIsPricingModelModalOpen(true),
      color: "from-rose-500 to-pink-500",
      category: "advanced",
      credits: 9,
      status: "available"
    },

    // FERRAMENTAS ÚNICAS E INOVADORAS
    {
      title: "Kit Completo de Startup",
      description: "Gere nome, missão, visão, pitch e cronograma em um só lugar",
      icon: Rocket,
      action: () => setIsStartupKitModalOpen(true),
      color: "from-purple-600 to-pink-600",
      category: "unique",
      credits: getFeatureCost('startup-kit'),
      status: "available",
      feature: "startup-kit"
    },
    {
      title: "Simulador de Investimento",
      description: "Simule rounds de investimento e diluição de equity",
      icon: Calculator,
      action: () => setIsInvestmentSimulatorModalOpen(true),
      color: "from-green-600 to-emerald-600",
      category: "unique",
      credits: getFeatureCost('investment-simulator'),
      status: "available",
      feature: "investment-simulator"
    },
    {
      title: "Gerador de Landing Page",
      description: "Crie código HTML/CSS de landing pages otimizadas",
      icon: Globe,
      action: () => setIsLandingPageModalOpen(true),
      color: "from-blue-600 to-cyan-600",
      category: "unique",
      credits: 18,
      status: "available"
    },
    {
      title: "Análise de Timing de Mercado",
      description: "Determine o momento ideal para lançar sua startup",
      icon: TrendingUp,
      action: () => setIsMarketTimingModalOpen(true),
      color: "from-indigo-600 to-purple-600",
      category: "unique",
      credits: 14,
      status: "available"
    },
    {
      title: "Calculadora CAC/LTV",
      description: "Calcule métricas essenciais para startups",
      icon: Calculator,
      action: () => setIsCacLtvModalOpen(true),
      color: "from-orange-600 to-red-600",
      category: "unique",
      credits: 8,
      status: "available"
    },

  ];

  const categories = [
    { id: "all", name: "Todos", shortName: "Todos", count: allTools.length },
    { id: "design", name: "Design", shortName: "Design", count: allTools.filter(t => t.category === "design").length },
    { id: "documentation", name: "Documentação", shortName: "Docs", count: allTools.filter(t => t.category === "documentation").length },
    { id: "analysis", name: "Análise", shortName: "Análise", count: allTools.filter(t => t.category === "analysis").length },
    { id: "marketing", name: "Marketing", shortName: "Marketing", count: allTools.filter(t => t.category === "marketing").length },
    { id: "business", name: "Negócios", shortName: "Negócios", count: allTools.filter(t => t.category === "business").length },
    { id: "advanced", name: "Avançadas", shortName: "Avançadas", count: allTools.filter(t => t.category === "advanced").length },
    { id: "unique", name: "Exclusivas", shortName: "Exclusivas", count: allTools.filter(t => t.category === "unique").length }
  ];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || tool.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const renderToolCard = (tool: any, index: number) => {
    const hasEnoughCredits = tool.feature ? hasCredits(tool.feature) : true;
    
    return (
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
          {tool.feature && !hasEnoughCredits ? (
            <CreditGuard feature={tool.feature}>
              <Button 
                className="w-full relative z-10" 
                variant="outline"
              >
                Comprar Créditos ({tool.credits})
              </Button>
            </CreditGuard>
          ) : (
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tool.status === "coming-soon") {
                  toast.info("Funcionalidade em breve!");
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
          )}
        </CardContent>
      </Card>
    );
  };

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
      <BusinessNameGeneratorModal 
        open={isBusinessNameModalOpen} 
        onOpenChange={setIsBusinessNameModalOpen} 
      />
      <MarketAnalysisModal 
        open={isMarketAnalysisModalOpen} 
        onOpenChange={setIsMarketAnalysisModalOpen} 
      />
      <BusinessModelCanvasModalEnhanced 
        open={isBusinessModelCanvasModalOpen} 
        onOpenChange={setIsBusinessModelCanvasModalOpen} 
      />
      <FinancialAnalysisModal 
        open={isFinancialAnalysisModalOpen} 
        onOpenChange={setIsFinancialAnalysisModalOpen} 
      />
      <PitchDeckModal 
        open={isPitchDeckModalOpen} 
        onOpenChange={setIsPitchDeckModalOpen} 
      />
      <CompetitorAnalysisModal 
        open={isCompetitorAnalysisModalOpen} 
        onOpenChange={setIsCompetitorAnalysisModalOpen} 
      />
      <ColorPaletteModal 
        open={isColorPaletteModalOpen} 
        onOpenChange={setIsColorPaletteModalOpen} 
      />
      <UserResearchModal 
        open={isUserResearchModalOpen} 
        onOpenChange={setIsUserResearchModalOpen} 
      />
      <ValuationCalculatorModal 
        open={isValuationModalOpen} 
        onOpenChange={setIsValuationModalOpen} 
      />
      <MarketingStrategyModal 
        open={isMarketingStrategyModalOpen} 
        onOpenChange={setIsMarketingStrategyModalOpen} 
      />
      <BusinessPlanModal 
        open={isBusinessPlanModalOpen} 
        onOpenChange={setIsBusinessPlanModalOpen} 
      />
      <SEOAnalyzerModal 
        open={isSEOModalOpen} 
        onOpenChange={setIsSEOModalOpen} 
      />
      <LandingPageGeneratorModal 
        open={isLandingPageModalOpen} 
        onOpenChange={setIsLandingPageModalOpen} 
      />
      <ContentMarketingModal 
        open={isContentMarketingModalOpen} 
        onOpenChange={setIsContentMarketingModalOpen} 
      />
      <TrendAnalysisModal 
        open={isTrendAnalysisModalOpen} 
        onOpenChange={setIsTrendAnalysisModalOpen} 
      />
      <RevenueForecastModal 
        open={isRevenueForecastModalOpen} 
        onOpenChange={setIsRevenueForecastModalOpen} 
      />
      <RoadmapGeneratorModal 
        open={isRoadmapModalOpen} 
        onOpenChange={setIsRoadmapModalOpen} 
      />
      <StartupKitModal 
        open={isStartupKitModalOpen} 
        onOpenChange={setIsStartupKitModalOpen} 
      />
      <InvestmentSimulatorModal 
        open={isInvestmentSimulatorModalOpen} 
        onOpenChange={setIsInvestmentSimulatorModalOpen} 
      />
      <PostGeneratorModal 
        open={isPostGeneratorModalOpen} 
        onOpenChange={setIsPostGeneratorModalOpen} 
      />
      <SocialMediaPlannerModal 
        open={isSocialMediaPlannerModalOpen} 
        onOpenChange={setIsSocialMediaPlannerModalOpen} 
      />
      <ProcessAutomationModal 
        open={isProcessAutomationModalOpen} 
        onOpenChange={setIsProcessAutomationModalOpen} 
      />
      <InvoiceGeneratorModal 
        open={isInvoiceGeneratorModalOpen} 
        onOpenChange={setIsInvoiceGeneratorModalOpen} 
      />
      <PricingModelModal 
        open={isPricingModelModalOpen} 
        onOpenChange={setIsPricingModelModalOpen} 
      />
      <MarketTimingModal 
        open={isMarketTimingModalOpen} 
        onOpenChange={setIsMarketTimingModalOpen} 
      />
      <CacLtvModal 
        open={isCacLtvModalOpen} 
        onOpenChange={setIsCacLtvModalOpen} 
      />
      <AiImageEditorModal 
        open={isAiImageEditorModalOpen} 
        onOpenChange={setIsAiImageEditorModalOpen} 
      />
      <ReportCreatorModal 
        open={isReportCreatorModalOpen} 
        onOpenChange={setIsReportCreatorModalOpen} 
      />
    </div>
  );
};

export default ToolsPage;
