import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  Image, 
  Share, 
  BarChart3, 
  Receipt, 
  Palette, 
  Calendar,
  Mail,
  Video,
  Zap,
  PenTool,
  Briefcase
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { PRDMVPGeneratorModal } from "@/components/tools/PRDMVPGeneratorModal";
import { LogoGeneratorModal } from "@/components/tools/LogoGeneratorModal";

interface Tool {
  id: string;
  name: string;
  description: string;
  price: number;
  status: "available" | "coming-soon";
  category: string;
  icon: React.ElementType;
  preview?: string;
}

const ToolsPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPRDMVPModalOpen, setIsPRDMVPModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const tools: Tool[] = [
    {
      id: "prd-mvp-generator",
      name: t('tools.prdMvpGenerator.name', 'Gerador de PRD/MVP'),
      description: t('tools.prdMvpGenerator.description', 'Crie documentos PRD e MVP profissionais a partir das suas ideias'),
      price: 5,
      status: "available",
      category: "documents",
      icon: Briefcase,
      preview: "📋 PRD completo com especificações técnicas e roadmap"
    },
    {
      id: "logo-generator",
      name: t('tools.logoGenerator.name', 'Gerador de Logotipos'),
      description: t('tools.logoGenerator.description', 'Crie logotipos únicos com IA baseados nas suas ideias'),
      price: 3,
      status: "available",
      category: "images",
      icon: PenTool,
      preview: "🎨 Logotipo vetorial profissional personalizado"
    },
    {
      id: "post-generator",
      name: t('tools.postGenerator.name', 'Gerador de Posts'),
      description: t('tools.postGenerator.description', 'Crie posts profissionais para redes sociais em segundos'),
      price: 2,
      status: "available",
      category: "publication",
      icon: Share,
      preview: "📱 Post criativo para Instagram, LinkedIn, Twitter..."
    },
    {
      id: "report-creator",
      name: t('tools.reportCreator.name', 'Criador de Relatórios'),
      description: t('tools.reportCreator.description', 'Gere relatórios profissionais e análises detalhadas'),
      price: 3,
      status: "available",
      category: "reports",
      icon: BarChart3,
      preview: "📊 Relatório executivo com gráficos e insights"
    },
    {
      id: "invoice-generator",
      name: t('tools.invoiceGenerator.name', 'Gerador de Faturas'),
      description: t('tools.invoiceGenerator.description', 'Crie faturas e documentos fiscais profissionais'),
      price: 1,
      status: "available",
      category: "documents",
      icon: Receipt,
      preview: "🧾 Fatura profissional com sua marca"
    },
    {
      id: "ai-image-editor",
      name: t('tools.aiImageEditor.name', 'Editor de Imagens IA'),
      description: t('tools.aiImageEditor.description', 'Edite e melhore imagens com inteligência artificial'),
      price: 4,
      status: "coming-soon",
      category: "images",
      icon: Image,
      preview: "🎨 Imagem editada com IA de última geração"
    },
    {
      id: "presentation-maker",
      name: t('tools.presentationMaker.name', 'Criador de Apresentações'),
      description: t('tools.presentationMaker.description', 'Apresentações profissionais em minutos'),
      price: 3,
      status: "coming-soon",
      category: "documents",
      icon: FileText
    },
    {
      id: "brand-kit",
      name: t('tools.brandKit.name', 'Kit de Marca'),
      description: t('tools.brandKit.description', 'Crie identidade visual completa para sua marca'),
      price: 5,
      status: "coming-soon",
      category: "images",
      icon: Palette
    },
    {
      id: "content-calendar",
      name: t('tools.contentCalendar.name', 'Calendário de Conteúdo'),
      description: t('tools.contentCalendar.description', 'Planeje e organize seu conteúdo'),
      price: 2,
      status: "coming-soon",
      category: "publication",
      icon: Calendar
    },
    {
      id: "email-campaigns",
      name: t('tools.emailCampaigns.name', 'Campanhas de Email'),
      description: t('tools.emailCampaigns.description', 'Crie campanhas de email marketing eficazes'),
      price: 3,
      status: "coming-soon",
      category: "publication",
      icon: Mail
    }
  ];

  const categories = [
    { id: "all", name: t('tools.categories.all', 'Todas'), icon: Zap },
    { id: "publication", name: t('tools.categories.publication', 'Publicação'), icon: Share },
    { id: "reports", name: t('tools.categories.reports', 'Relatórios'), icon: BarChart3 },
    { id: "documents", name: t('tools.categories.documents', 'Documentos'), icon: FileText },
    { id: "images", name: t('tools.categories.images', 'Imagens'), icon: Image }
  ];

  const filteredTools = selectedCategory === "all" 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const handleUseTool = (tool: Tool) => {
    if (tool.status === "coming-soon") {
      toast.info(t('tools.comingSoon', 'Esta ferramenta estará disponível em breve!'));
      return;
    }

    if (!authState.user || authState.user.credits < tool.price) {
      toast.error(t('tools.insufficientCredits', 'Créditos insuficientes'));
      window.location.href = "/dashboard/configuracoes?tab=credits";
      return;
    }

    // Handle specific tools
    switch (tool.id) {
      case "prd-mvp-generator":
        setIsPRDMVPModalOpen(true);
        break;
      case "logo-generator":
        setIsLogoModalOpen(true);
        break;
      default:
        toast.success(t('tools.toolActivated', 'Ferramenta ativada! Redirecionando...'));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('tools.title', 'Ferramentas')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('tools.subtitle', 'Potencialize seu negócio com nossas ferramentas inteligentes')}
        </p>
      </div>

      {/* Categories Filter */}
      <Card className="shadow-sm border-0 bg-muted/50">
        <CardContent className="p-1 sm:p-2">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1 sm:gap-2 ${
                  selectedCategory === category.id 
                    ? "bg-brand-purple hover:bg-brand-purple/90" 
                    : ""
                }`}
              >
                <category.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{category.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-purple/20 flex items-center justify-center">
                    <tool.icon className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={tool.status === "available" ? "default" : "outline"}
                        className={tool.status === "available" ? "bg-green-500" : ""}
                      >
                        {tool.status === "available" 
                          ? t('tools.status.available', 'Disponível')
                          : t('tools.status.comingSoon', 'Em Breve')
                        }
                      </Badge>
                      <span className="text-sm font-medium text-brand-purple">
                        {tool.price} {t('tools.credits', 'créditos')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-3">
                {tool.description}
              </CardDescription>
              {tool.preview && (
                <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground border-l-2 border-brand-purple/30">
                  {t('tools.preview', 'Preview')}: {tool.preview}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                onClick={() => handleUseTool(tool)}
                disabled={tool.status === "coming-soon"}
                className="w-full bg-brand-purple hover:bg-brand-purple/90"
                variant={tool.status === "available" ? "default" : "outline"}
              >
                {tool.status === "available" 
                  ? t('tools.useTool', 'Usar Ferramenta')
                  : t('tools.notifyWhenReady', 'Notificar quando pronto')
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-muted-foreground">
            <Zap className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium">
            {t('tools.noToolsFound', 'Nenhuma ferramenta encontrada')}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {t('tools.noToolsFoundDesc', 'Tente uma categoria diferente ou volte mais tarde.')}
          </p>
        </div>
      )}

      {/* Modals */}
      <PRDMVPGeneratorModal 
        open={isPRDMVPModalOpen} 
        onOpenChange={setIsPRDMVPModalOpen} 
      />
      <LogoGeneratorModal 
        open={isLogoModalOpen} 
        onOpenChange={setIsLogoModalOpen} 
      />
    </div>
  );
};

export default ToolsPage;
