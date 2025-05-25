
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image, 
  Share2, 
  BarChart3, 
  Receipt, 
  PenTool, 
  Globe, 
  Mail,
  Calendar,
  Users,
  Target,
  Zap
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  price: number;
  status: 'available' | 'coming-soon' | 'beta';
  features: string[];
}

const ToolsPage = () => {
  const { t } = useTranslation();

  const tools: Tool[] = [
    {
      id: 'post-generator',
      name: t('tools.postGenerator.name', 'Gerador de Posts'),
      description: t('tools.postGenerator.description', 'Crie posts profissionais para redes sociais com IA'),
      category: t('tools.categories.publishing', 'Publicação'),
      icon: Share2,
      price: 2,
      status: 'coming-soon',
      features: ['Instagram', 'LinkedIn', 'Facebook', 'Twitter']
    },
    {
      id: 'report-creator',
      name: t('tools.reportCreator.name', 'Criador de Relatórios'),
      description: t('tools.reportCreator.description', 'Gere relatórios empresariais completos e profissionais'),
      category: t('tools.categories.reports', 'Relatórios'),
      icon: BarChart3,
      price: 3,
      status: 'coming-soon',
      features: ['PDF Export', 'Charts', 'Templates', 'Analytics']
    },
    {
      id: 'invoice-generator',
      name: t('tools.invoiceGenerator.name', 'Gerador de Faturas'),
      description: t('tools.invoiceGenerator.description', 'Crie faturas e orçamentos profissionais rapidamente'),
      category: t('tools.categories.finance', 'Financeiro'),
      icon: Receipt,
      price: 1,
      status: 'coming-soon',
      features: ['PDF Download', 'Customização', 'Múltiplas Moedas', 'Templates']
    },
    {
      id: 'ai-image-editor',
      name: t('tools.aiImageEditor.name', 'Editor de Imagens IA'),
      description: t('tools.aiImageEditor.description', 'Edite e melhore imagens usando inteligência artificial'),
      category: t('tools.categories.design', 'Design'),
      icon: Image,
      price: 4,
      status: 'coming-soon',
      features: ['Background Removal', 'Upscaling', 'Filters', 'AI Enhancement']
    },
    {
      id: 'content-planner',
      name: t('tools.contentPlanner.name', 'Planejador de Conteúdo'),
      description: t('tools.contentPlanner.description', 'Organize e planeje seu conteúdo de marketing'),
      category: t('tools.categories.marketing', 'Marketing'),
      icon: Calendar,
      price: 2,
      status: 'coming-soon',
      features: ['Calendar View', 'Multi-platform', 'Analytics', 'Team Collaboration']
    },
    {
      id: 'email-campaigns',
      name: t('tools.emailCampaigns.name', 'Campanhas de Email'),
      description: t('tools.emailCampaigns.description', 'Crie campanhas de email marketing eficazes'),
      category: t('tools.categories.marketing', 'Marketing'),
      icon: Mail,
      price: 3,
      status: 'coming-soon',
      features: ['Templates', 'A/B Testing', 'Analytics', 'Automation']
    },
    {
      id: 'landing-page-builder',
      name: t('tools.landingPageBuilder.name', 'Construtor de Landing Pages'),
      description: t('tools.landingPageBuilder.description', 'Construa landing pages que convertem visitantes'),
      category: t('tools.categories.web', 'Web'),
      icon: Globe,
      price: 5,
      status: 'coming-soon',
      features: ['Drag & Drop', 'Mobile Responsive', 'SEO Optimized', 'Analytics']
    },
    {
      id: 'competitor-analysis',
      name: t('tools.competitorAnalysis.name', 'Análise de Concorrentes'),
      description: t('tools.competitorAnalysis.description', 'Analise seus concorrentes e identifique oportunidades'),
      category: t('tools.categories.analysis', 'Análise'),
      icon: Target,
      price: 4,
      status: 'coming-soon',
      features: ['Market Research', 'SWOT Analysis', 'Pricing Comparison', 'Strategy Insights']
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">{t('tools.status.available', 'Disponível')}</Badge>;
      case 'beta':
        return <Badge variant="outline">{t('tools.status.beta', 'Beta')}</Badge>;
      case 'coming-soon':
        return <Badge variant="secondary">{t('tools.status.comingSoon', 'Em Breve')}</Badge>;
    }
  };

  const handleToolClick = (tool: Tool) => {
    if (tool.status === 'available') {
      // Future: Navigate to tool or open modal
      toast.info(t('tools.openingTool', 'Abrindo ferramenta...'));
    } else {
      toast.info(t('tools.comingSoonMessage', 'Esta ferramenta estará disponível em breve!'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('tools.title', 'Ferramentas')}</h1>
        <p className="text-muted-foreground">
          {t('tools.subtitle', 'Potencialize seu negócio com nossas ferramentas especializadas')}
        </p>
      </div>

      {/* Categories */}
      {categories.map(category => {
        const categoryTools = tools.filter(tool => tool.category === category);
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category}</h2>
              <Badge variant="outline">{categoryTools.length}</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map(tool => {
                const IconComponent = tool.icon;
                
                return (
                  <Card 
                    key={tool.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleToolClick(tool)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-brand-purple/10">
                            <IconComponent className="h-5 w-5 text-brand-purple" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-brand-purple">
                                {tool.price} {tool.price === 1 ? t('tools.credit', 'crédito') : t('tools.credits', 'créditos')}
                              </span>
                              {getStatusBadge(tool.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('tools.features', 'Recursos')}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tool.features.map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant={tool.status === 'available' ? 'default' : 'outline'}
                        disabled={tool.status !== 'available'}
                      >
                        {tool.status === 'available' ? (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {t('tools.useTool', 'Usar Ferramenta')}
                          </>
                        ) : (
                          t('tools.notifyWhenReady', 'Notificar quando disponível')
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('tools.suggestTool.title', 'Precisa de uma ferramenta específica?')}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {t('tools.suggestTool.description', 'Envie sua sugestão e ajude-nos a priorizar o desenvolvimento de novas ferramentas.')}
          </p>
          <Button variant="outline">
            {t('tools.suggestTool.button', 'Sugerir Ferramenta')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolsPage;
