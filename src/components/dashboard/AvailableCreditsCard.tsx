
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { PLAN_FEATURES } from "@/utils/creditSystem";

export const AvailableCreditsCard = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { user } = authState;

  // Calculate plan features based on user's plan
  const planFeatures = user ? PLAN_FEATURES[user.plan as keyof typeof PLAN_FEATURES] : PLAN_FEATURES.free;
  
  // Format the monthly analyses limit for display
  const analysesLimit = typeof planFeatures.analysesPerMonth === 'number' 
    ? planFeatures.analysesPerMonth 
    : t("credits.unlimited", "Ilimitado");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("credits.availableCredits.title", "Créditos Disponíveis")}</CardTitle>
        <CardDescription>
          {t("credits.availableCredits.description", "Seus créditos para usar funcionalidades premium")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-brand-purple" />
          </div>
          <div>
            <div className="text-3xl font-bold">{user?.credits || 0}</div>
            <p className="text-sm text-muted-foreground">
              {user?.plan === "free" 
                ? t("credits.availableCredits.freePlan", "Plano Gratuito") 
                : user?.plan === "basic"
                  ? t("credits.availableCredits.basicPlan", "Plano Basic")
                  : t("credits.availableCredits.proPlan", "Plano Pro")}
            </p>
          </div>
        </div>
        
        {/* Plan features summary */}
        <div className="space-y-4 mt-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t("credits.features.analysesPerMonth", "Análises por mês")}</span>
              <span className="font-medium">{analysesLimit}</span>
            </div>
            {typeof planFeatures.analysesPerMonth === 'number' && (
              <Progress value={0} className="h-1" /> // In a real app, we would track usage
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("credits.features.compareIdeas", "Comparar Ideias")}</span>
                <span>{planFeatures.compareIdeas ? "✓" : "✕"}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("credits.features.advancedAnalysis", "Análise Avançada")}</span>
                <span>{planFeatures.advancedAnalysis ? "✓" : "✕"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("credits.features.pdfDownload", "Download PDF")}</span>
                <span>{planFeatures.pdfDownload ? "✓" : "✕"}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("credits.features.aiChat", "Chat com IA")}</span>
                <span>{planFeatures.aiChat ? "✓" : "✕"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {user?.plan !== "pro" && (
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="default" className="w-full bg-brand-purple hover:bg-brand-purple/90" asChild>
            <a href="/planos">{t("credits.availableCredits.upgradeBtn", "Fazer Upgrade")}</a>
          </Button>
          {user?.plan === "free" && (
            <p className="text-xs text-muted-foreground text-center">
              {t("credits.freePlanLimitation", "O plano gratuito permite apenas 1 análise básica grátis")}
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
