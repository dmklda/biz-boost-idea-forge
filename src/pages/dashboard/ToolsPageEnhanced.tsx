/**
 * Exemplo de implementação da página de ferramentas com os modais melhorados
 * 
 * Este arquivo demonstra como substituir os modais antigos pelos novos modais
 * melhorados com responsividade e design mobile-first.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, FileText, Lightbulb, BarChart3, TrendingUp, Users, DollarSign, Target, 
  Presentation, Briefcase, Search, Calculator, MessageSquare, Zap, Globe, 
  PieChart, LineChart, Calendar, Megaphone, BookOpen, Settings2, Rocket, 
  Shield, Eye, Star, Edit, Receipt, ImageIcon, Package
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { CreditGuard } from "@/components/CreditGuard";

// Importando os modais melhorados
import {
  RoadmapGeneratorModalEnhanced,
  PRDMVPGeneratorModalEnhanced,
  InvestmentSimulatorModalEnhanced,
  StartupKitModalEnhanced,
  RevenueForecastModalEnhanced,
  BusinessPlanModalEnhanced,
  PitchDeckModalEnhanced,
  BusinessModelCanvasModalEnhanced
} from "@/components/tools/enhanced";

// Importando os modais originais para as ferramentas que ainda não foram melhoradas
import { LogoGeneratorModal } from "@/components/tools/LogoGeneratorModal";
import { BusinessNameGeneratorModal } from "@/components/tools/BusinessNameGeneratorModal";
import { MarketAnalysisModal } from "@/components/tools/MarketAnalysisModal";
import { FinancialAnalysisModal } from "@/components/tools/FinancialAnalysisModal";
import { CompetitorAnalysisModal } from "@/components/tools/CompetitorAnalysisModal";
import { ColorPaletteModal } from "@/components/tools/ColorPaletteModal";
import { UserResearchModal } from "@/components/tools/UserResearchModal";
import { ValuationCalculatorModal } from "@/components/tools/ValuationCalculatorModal";
import { MarketingStrategyModal } from "@/components/tools/MarketingStrategyModal";
import { SEOAnalyzerModal } from "@/components/tools/SEOAnalyzerModal";
import { LandingPageGeneratorModal } from "@/components/tools/LandingPageGeneratorModal";
import { ContentMarketingModal } from "@/components/tools/ContentMarketingModal";
import { TrendAnalysisModal } from "@/components/tools/TrendAnalysisModal";
import { SocialMediaPlannerModal } from "@/components/tools/SocialMediaPlannerModal";
import { ProcessAutomationModal } from "@/components/tools/ProcessAutomationModal";
import { InvoiceGeneratorModal } from "@/components/tools/InvoiceGeneratorModal";
import { PricingModelModal } from "@/components/tools/PricingModelModal";
import { MarketTimingModal } from "@/components/tools/MarketTimingModal";
import { CacLtvModal } from "@/components/tools/CacLtvModal";
import { AiImageEditorModal } from "@/components/tools/AiImageEditorModal";
import { ReportCreatorModal } from "@/components/tools/ReportCreatorModal";
import { toast } from "sonner";

const ToolsPageEnhanced = () => {
  const { authState } = useAuth();
  const { hasFeatureAccess, getFeatureCost, canAccessFeature, hasCredits } = usePlanAccess();
  
  // Estados para controlar a abertura dos modais
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

  const handleToolClick = (toolName: string, action: () => void) => {
    console.log(`Tool clicked: ${toolName}`);
    action();
  };

  // Definição das ferramentas
  const allTools = [
    // Design e Branding
    {
      title: "Gerador de Logo",
      description: "Crie logos profissionais para sua startup",
      icon: Palette,
      action: () => setIsLogoModalOpen(true),
      color: "from-pink-500 to-rose-500",
      category: "design",
      credits: 3,
      status: "available"
    },
    {
      title: "Gerador de Nome",
      description: "Encontre o nome perfeito para seu negócio",
      icon: Lightbulb,
      action: () => setIsBusinessNameModalOpen(true),
      color: "from-yellow-500 to-amber-500",
      category: "design",
      credits: 2,
      status: "available"
    },
    // Documentação
    {
      title: "PRD/MVP Generator",
      description: "Crie documentos de requisitos ou MVP",
      icon: FileText,
      action: () => setIsPRDModalOpen(true),
      color: "from-blue-500 to-indigo-500",
      category: "documentation",
      credits: 5,
      status: "available"
    },
    // Análise
    {
      title: "Análise de Mercado",
      description: "Entenda seu mercado e oportunidades",
      icon: BarChart3,
      action: () => setIsMarketAnalysisModalOpen(true),
      color: "from-green-500 to-emerald-500",
      category: "analysis",
      credits: 7,
      status: "available"
    },
    {
      title: "Business Model Canvas",
      description: "Crie um canvas completo para seu modelo de negócio",
      icon: Briefcase,
      action: () => setIsBusinessModelCanvasModalOpen(true),
      color: "from-orange-500 to-red-500",
      category: "business",
      credits: getFeatureCost('business-model-canvas'),
      status: "available",
      feature: "business-model-canvas"
    },
    // Ferramentas Melhoradas
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
      title: "Kit Completo de Startup",
      description: "Pacote completo para iniciar sua startup",
      icon: Package,
      action: () => setIsStartupKitModalOpen(true),
      color: "from-orange-500 to-amber-500",
      category: "business",
      credits: getFeatureCost('startup-kit'),
      status: "available",
      feature: "startup-kit"
    },
    {
      title: "Simulador de Investimento",
      description: "Simule rodadas de investimento e valuation",
      icon: Calculator,
      action: () => setIsInvestmentSimulatorModalOpen(true),
      color: "from-blue-500 to-sky-500",
      category: "business",
      credits: getFeatureCost('investment-simulator'),
      status: "available",
      feature: "investment-simulator"
    },
    {
      title: "Previsão de Receita",
      description: "Projete receitas futuras com base em dados",
      icon: LineChart,
      action: () => setIsRevenueForecastModalOpen(true),
      color: "from-green-500 to-emerald-500",
      category: "business",
      credits: getFeatureCost('revenue-forecast'),
      status: "available",
      feature: "revenue-forecast"
    },
  ];

  // Categorias de ferramentas
  const categories = [
    { id: "all", name: "Todas", shortName: "Todas", count: allTools.length },
    { id: "design", name: "Design", shortName: "Design", count: allTools.filter(t => t.category === "design").length },
    { id: "documentation", name: "Documentação", shortName: "Docs", count: allTools.filter(t => t.category === "documentation").length },
    { id: "analysis", name: "Análise", shortName: "Análise", count: allTools.filter(t => t.category === "analysis").length },
    { id: "business", name: "Negócios", shortName: "Negócios", count: allTools.filter(t => t.category === "business").length },
  ];

  // Filtragem de ferramentas
  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || tool.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Renderização de um card de ferramenta
  const renderToolCard = (tool: any, index: number) => {
    const hasEnoughCredits = tool.feature ? hasCredits(tool.feature) : authState.user?.credits >= tool.credits;

    return (
      <Card 
        key={index} 
        className="overflow-hidden relative hover:shadow-md transition-shadow"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-10 pointer-events-none`} />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-gradient-to-r ${tool.color}">
              <tool.icon className="h-5 w-5 text-white" />
            </div>
            <Badge variant="outline">{tool.credits} créditos</Badge>
          </div>
          <CardTitle className="text-lg mt-2">{tool.title}</CardTitle>
          <CardDescription>
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

      {/* Modais das Ferramentas */}
      
      {/* Modais Originais */}
      <LogoGeneratorModal 
        open={isLogoModalOpen} 
        onOpenChange={setIsLogoModalOpen} 
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
      <PitchDeckModalEnhanced 
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
      <BusinessPlanModalEnhanced 
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
      
      {/* Modais Melhorados */}
      <PRDMVPGeneratorModalEnhanced 
        open={isPRDModalOpen} 
        onOpenChange={setIsPRDModalOpen} 
      />
      <RoadmapGeneratorModalEnhanced 
        open={isRoadmapModalOpen} 
        onOpenChange={setIsRoadmapModalOpen} 
      />
      <StartupKitModalEnhanced 
        open={isStartupKitModalOpen} 
        onOpenChange={setIsStartupKitModalOpen} 
      />
      <InvestmentSimulatorModalEnhanced 
        open={isInvestmentSimulatorModalOpen} 
        onOpenChange={setIsInvestmentSimulatorModalOpen} 
      />
      <RevenueForecastModalEnhanced 
        open={isRevenueForecastModalOpen} 
        onOpenChange={setIsRevenueForecastModalOpen} 
      />
      {/* Nota: BusinessModelCanvasModalEnhanced, PitchDeckModalEnhanced e BusinessPlanModalEnhanced 
         já estão sendo usados acima na seção de modais originais */}
    </div>
  );
};

// Exportação padrão
export default ToolsPageEnhanced;