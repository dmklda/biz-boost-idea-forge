
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart, Target, Lightbulb, Calendar } from "lucide-react";
import { useDailyInsights } from "@/hooks/useDailyInsights";
import { useTranslation } from "react-i18next";

const iconMap = {
  TrendingUp,
  BarChart,
  Target,
  Lightbulb,
  Calendar,
};

export const InsightsCard = () => {
  const { t } = useTranslation();
  const { insights, isLoading, error } = useDailyInsights();

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Lightbulb;
    return IconComponent;
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'activity_trend': return 'bg-brand-purple/10';
      case 'performance': return 'bg-blue-500/10';
      case 'engagement': return 'bg-green-500/10';
      default: return 'bg-muted/50';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'activity_trend': return 'text-brand-purple';
      case 'performance': return 'text-blue-500';
      case 'engagement': return 'text-green-500';
      default: return 'text-brand-purple';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 md:pb-4">
        <div>
          <CardTitle className="text-lg md:text-xl">
            {t('dashboard.insights.title') || "Insights Inteligentes"}
          </CardTitle>
          <CardDescription>
            {t('dashboard.insights.description') || "Análise personalizada gerada por IA baseada na sua atividade"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
              Gerando insights personalizados...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
            {insights.slice(0, 3).map((insight, index) => {
              const IconComponent = getIconComponent(insight.icon);
              return (
                <div 
                  key={index}
                  className={`${getInsightBgColor(insight.type)} p-3 md:p-4 rounded-lg flex items-start space-x-3`}
                >
                  <div className={`${getInsightBgColor(insight.type)} rounded-full p-2 mt-1`}>
                    <IconComponent className={`h-5 w-5 ${getInsightIconColor(insight.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{insight.title}</h3>
                    <p className="text-muted-foreground text-xs mb-2 leading-relaxed">
                      {insight.description}
                    </p>
                    <p className="text-xs font-medium text-brand-purple">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
