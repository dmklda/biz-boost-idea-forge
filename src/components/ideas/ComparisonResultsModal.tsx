
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Lightbulb } from "lucide-react";

interface ComparisonInsights {
  competitiveAdvantage: string;
  marketPotential: string[];
  executionDifficulty: string[];
  investmentRequired: string[];
  scalabilityPotential: string[];
  innovationLevel: string[];
  riskLevel: string[];
  keyStrengthComparison: string;
  keyWeaknessComparison: string;
  recommendedFocus: string;
  overallRecommendation: string;
}

interface ComparisonResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: ComparisonInsights | null;
  ideaTitles: string[];
}

export const ComparisonResultsModal = ({ 
  isOpen, 
  onClose, 
  insights,
  ideaTitles 
}: ComparisonResultsModalProps) => {
  const { t } = useTranslation();

  if (!insights) return null;

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'alto':
      case 'alta':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'baixo':
      case 'baixa':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'alto':
      case 'alta':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'baixo':
      case 'baixa':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const MetricCard = ({ title, values, icon }: { title: string; values: string[]; icon: React.ReactNode }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium truncate pr-2">
              {ideaTitles[index] || `Ideia ${index + 1}`}
            </span>
            <Badge variant="outline" className={`text-xs ${getLevelColor(value)} flex items-center gap-1`}>
              {getLevelIcon(value)}
              {value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-purple" />
            {t('ideas.compare.results', "Resultados da Comparação")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Competitive Advantage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                {t('ideas.compare.competitiveAdvantage', "Vantagem Competitiva")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{insights.competitiveAdvantage}</p>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title={t('ideas.compare.marketPotential', "Potencial de Mercado")}
              values={insights.marketPotential}
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            />
            
            <MetricCard
              title={t('ideas.compare.executionDifficulty', "Dificuldade de Execução")}
              values={insights.executionDifficulty}
              icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
            />
            
            <MetricCard
              title={t('ideas.compare.investmentRequired', "Investimento Necessário")}
              values={insights.investmentRequired}
              icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
            />
            
            <MetricCard
              title={t('ideas.compare.scalabilityPotential', "Potencial de Escalabilidade")}
              values={insights.scalabilityPotential}
              icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
            />
            
            <MetricCard
              title={t('ideas.compare.innovationLevel', "Nível de Inovação")}
              values={insights.innovationLevel}
              icon={<Lightbulb className="h-4 w-4 text-yellow-600" />}
            />
            
            <MetricCard
              title={t('ideas.compare.riskLevel', "Nível de Risco")}
              values={insights.riskLevel}
              icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
            />
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  {t('ideas.compare.keyStrengths', "Principais Forças")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{insights.keyStrengthComparison}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <TrendingDown className="h-4 w-4" />
                  {t('ideas.compare.keyWeaknesses', "Principais Fraquezas")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{insights.keyWeaknessComparison}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                {t('ideas.compare.recommendedFocus', "Foco Recomendado")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{insights.recommendedFocus}</p>
            </CardContent>
          </Card>

          {/* Overall Recommendation */}
          <Card className="border-brand-purple/20 bg-brand-purple/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-brand-purple">
                <Award className="h-4 w-4" />
                {t('ideas.compare.overallRecommendation', "Recomendação Final")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed font-medium">{insights.overallRecommendation}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>
            {t('common.close', "Fechar")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
