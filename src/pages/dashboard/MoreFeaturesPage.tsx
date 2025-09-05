import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { PlanGate } from "@/components/ui/plan-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  BarChart3, 
  Scale, 
  TrendingUp,
  BarChart4,
  Puzzle,
  Monitor,
  Palette
} from "lucide-react";

export const MoreFeaturesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasFeatureAccess, getRequiredPlan } = usePlanAccess();

  const availableFeatures = [
    {
      id: "marketplace",
      title: "Marketplace",
      description: "Validação com Early Adopters da comunidade",
      icon: Store,
      path: "/dashboard/marketplace",
      status: "available"
    },
    {
      id: "simulator",
      title: "Simulador de Cenários",
      description: "Projeções financeiras e análise de sensibilidade",
      icon: BarChart3,
      path: "/dashboard/simulador-cenarios",
      status: "available"
    },
    {
      id: "regulatory",
      title: "Análise Regulatória",
      description: "Compliance e requisitos legais para sua ideia",
      icon: Scale,
      path: "/dashboard/analise-regulatoria",
      status: "available"
    },
    {
      id: "benchmarks",
      title: "Benchmarks",
      description: "Comparação setorial e métricas da indústria",
      icon: TrendingUp,
      path: "/dashboard/benchmarks",
      status: "available"
    }
  ];

  const comingSoonFeatures = [
    {
      id: "advanced-metrics",
      title: "Métricas Avançadas",
      description: "Analytics e insights detalhados",
      icon: BarChart4,
      status: "coming-soon"
    },
    {
      id: "integrations",
      title: "Integrações",
      description: "Conectar com ferramentas externas",
      icon: Puzzle,
      status: "coming-soon"
    },
    {
      id: "executive-dashboard",
      title: "Dashboard Executivo",
      description: "Visão estratégica do negócio",
      icon: Monitor,
      status: "coming-soon"
    },
    {
      id: "personalization",
      title: "Personalização",
      description: "Customização da interface",
      icon: Palette,
      status: "coming-soon"
    }
  ];

  const handleFeatureClick = (feature: any) => {
    if (feature.status === "available" && feature.path) {
      // Check feature access for premium features
      const premiumFeatures = ['marketplace', 'simulator', 'regulatory', 'benchmarks'];
      if (premiumFeatures.includes(feature.id)) {
        const featureMap = {
          'marketplace': 'marketplace',
          'simulator': 'simulator', 
          'regulatory': 'regulatory-analysis',
          'benchmarks': 'benchmarks'
        };
        const mappedFeature = featureMap[feature.id as keyof typeof featureMap];
        if (!hasFeatureAccess(mappedFeature as any)) {
          return; // Block access, let the card show plan gate
        }
      }
      navigate(feature.path);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "available" ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Disponível
      </Badge>
    ) : (
      <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-400">
        Em Breve
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mais Recursos</h1>
        <p className="text-muted-foreground">
          Explore todas as funcionalidades avançadas da plataforma
        </p>
      </div>

      {/* Recursos Disponíveis */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6">Recursos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableFeatures.map((feature) => {
            const IconComponent = feature.icon;
            const premiumFeatures = ['marketplace', 'simulator', 'regulatory', 'benchmarks'];
            const isPremium = premiumFeatures.includes(feature.id);
            const featureMap = {
              'marketplace': 'marketplace',
              'simulator': 'simulator', 
              'regulatory': 'regulatory-analysis',
              'benchmarks': 'benchmarks'
            };
            const mappedFeature = featureMap[feature.id as keyof typeof featureMap];
            const hasAccess = !isPremium || hasFeatureAccess(mappedFeature as any);

            if (!hasAccess) {
              return (
                <PlanGate
                  key={feature.id}
                  requiredPlan={getRequiredPlan(mappedFeature as any)}
                  feature={feature.title}
                  description={feature.description}
                />
              );
            }

            return (
              <Card 
                key={feature.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-border/50"
                onClick={() => handleFeatureClick(feature)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recursos em Breve */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Em Desenvolvimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comingSoonFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id}
                className="opacity-75 border-border/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg text-muted-foreground">{feature.title}</CardTitle>
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};