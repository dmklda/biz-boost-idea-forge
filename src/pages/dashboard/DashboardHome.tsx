import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  CheckCircle2, 
  TrendingUp, 
  Lightbulb,
  AlertTriangle
} from "lucide-react";

const DashboardHome = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [ideaCount, setIdeaCount] = useState(0);
  const [availableAnalysis, setAvailableAnalysis] = useState(0);
  
  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setIdeaCount(5);
      setAvailableAnalysis(10);
    }, 500);
  }, []);
  
  const percentUsed = ideaCount > 0 ? Math.round((ideaCount / availableAnalysis) * 100) : 0;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.lastLogin')}: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('dashboard.ideasCreated')}</span>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideaCount}</div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.ideasCreatedDesc')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('dashboard.analysisAvailable')}</span>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableAnalysis}</div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.analysisAvailableDesc')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('dashboard.planStatus')}</span>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {authState.user?.plan === "free" ? t('plans.free') : t('plans.pro')}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.planStatusDesc')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('dashboard.usage')}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={percentUsed} />
            <p className="text-sm text-muted-foreground">
              {t('dashboard.usageDesc')}: {percentUsed}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('dashboard.alerts')}</span>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('dashboard.noAlerts')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
