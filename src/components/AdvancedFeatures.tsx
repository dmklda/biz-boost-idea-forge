import { 
  Brain, 
  Zap, 
  Users, 
  TrendingUp, 
  Palette, 
  FileText, 
  BarChart3, 
  CreditCard,
  Sparkles,
  Shield,
  Building2,
  Target
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Badge } from "./ui/badge";

const AdvancedFeatures = () => {
  const { t } = useTranslation();
  
  const featureCategories = [
    {
      title: "Análise Inteligente",
      icon: <Brain className="h-6 w-6" />,
      gradient: "from-brand-blue/20 to-blue-600/30",
      features: [
        {
          title: "Análise Avançada com IA",
          description: "Análise profunda com dados de mercado em tempo real",
          status: "available",
          credits: 10,
          icon: <Sparkles className="h-5 w-5 text-brand-blue" />
        },
        {
          title: "Simulador de Cenários",
          description: "Simulações Monte Carlo para projeções financeiras",
          status: "available",
          credits: 8,
          icon: <BarChart3 className="h-5 w-5 text-brand-blue" />
        },
        {
          title: "Análise Regulatória",
          description: "Avaliação completa de requisitos legais e compliance",
          status: "available",
          credits: 12,
          icon: <Shield className="h-5 w-5 text-brand-blue" />
        },
        {
          title: "Benchmarks Setoriais",
          description: "Comparação com dados da indústria em tempo real",
          status: "soon",
          credits: 5,
          icon: <TrendingUp className="h-5 w-5 text-brand-blue" />
        }
      ]
    },
    {
      title: "Ferramentas de Criação",
      icon: <Palette className="h-6 w-6" />,
      gradient: "from-brand-purple/20 to-purple-600/30",
      features: [
        {
          title: "Gerador de Logo",
          description: "Criação de logos profissionais com IA",
          status: "available",
          credits: 5,
          icon: <Palette className="h-5 w-5 text-brand-purple" />
        },
        {
          title: "PRD/MVP Generator",
          description: "Documentos técnicos detalhados para desenvolvimento",
          status: "available",
          credits: 8,
          icon: <FileText className="h-5 w-5 text-brand-purple" />
        },
        {
          title: "Pitch Deck Generator",
          description: "Apresentações profissionais para investidores",
          status: "soon",
          credits: 10,
          icon: <FileText className="h-5 w-5 text-brand-purple" />
        },
        {
          title: "Business Model Canvas",
          description: "Modelo de negócio visual e interativo",
          status: "soon",
          credits: 6,
          icon: <Building2 className="h-5 w-5 text-brand-purple" />
        }
      ]
    },
    {
      title: "Marketplace & Comunidade",
      icon: <Users className="h-6 w-6" />,
      gradient: "from-brand-green/20 to-green-600/30",
      features: [
        {
          title: "Validação por Early Adopters",
          description: "Conecte-se com validadores especializados",
          status: "available",
          credits: 0,
          icon: <Users className="h-5 w-5 text-brand-green" />
        },
        {
          title: "Sistema de Gamificação",
          description: "Pontuação, badges e rankings da comunidade",
          status: "available",
          credits: 0,
          icon: <Zap className="h-5 w-5 text-brand-green" />
        },
        {
          title: "Networking de Empreendedores",
          description: "Conecte-se com outros founders e mentores",
          status: "soon",
          credits: 0,
          icon: <Users className="h-5 w-5 text-brand-green" />
        }
      ]
    },
    {
      title: "Insights de Mercado",
      icon: <Target className="h-6 w-6" />,
      gradient: "from-orange-500/20 to-orange-600/30",
      features: [
        {
          title: "Análise de Concorrentes",
          description: "Identificação e avaliação de competidores em tempo real",
          status: "available",
          credits: 0,
          icon: <Target className="h-5 w-5 text-orange-500" />
        },
        {
          title: "Dados de Mercado Atualizados",
          description: "Informações em tempo real via SerpAPI",
          status: "available",
          credits: 0,
          icon: <TrendingUp className="h-5 w-5 text-orange-500" />
        },
        {
          title: "Análise de Tendências",
          description: "Identificação de oportunidades emergentes",
          status: "soon",
          credits: 3,
          icon: <TrendingUp className="h-5 w-5 text-orange-500" />
        }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status === "available") {
      return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Disponível</Badge>;
    }
    return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Em Breve</Badge>;
  };

  const getCreditsBadge = (credits: number) => {
    if (credits === 0) {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Grátis</Badge>;
    }
    return (
      <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">
        <CreditCard className="h-3 w-3 mr-1" />
        {credits}
      </Badge>
    );
  };

  return (
    <section className="py-24 relative bg-gradient-to-b from-background to-background/95">
      <div className="absolute inset-0 bg-mesh-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent px-3 py-1 rounded-full mb-4 border border-brand-purple/20">
            Recursos Avançados
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple via-brand-blue to-indigo-500 bg-clip-text text-transparent">
            Ferramentas Premium para Acelerar seu Negócio
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-inter">
            Acesse recursos avançados com IA para validação profunda, criação de conteúdo e insights de mercado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {featureCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex}
              className="card-hover-effect backdrop-blur-sm border border-border/50 shadow-lg rounded-2xl overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 transition-opacity group-hover:opacity-30`}></div>
              
              <div className="p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border/50">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-poppins text-foreground">{category.title}</h3>
                </div>

                <div className="space-y-4">
                  {category.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30 hover:border-border/60 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/80 border border-border/40 flex-shrink-0 mt-1">
                          {feature.icon}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                            {getStatusBadge(feature.status)}
                            {getCreditsBadge(feature.credits)}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border border-brand-purple/20 rounded-full">
            <Sparkles className="h-4 w-4 text-brand-purple" />
            <span className="text-sm font-medium text-foreground">
              Mais recursos sendo desenvolvidos constantemente
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvancedFeatures;