
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPlan } from "@/utils/creditSystem";

export const AvailableCreditsCard = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { user } = authState;
  
  // Get the current plan details
  const userPlan = user?.plan ? getPlan(user.plan) : getPlan("free");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("credits.availableCredits.title")}</CardTitle>
        <CardDescription>
          {t("credits.availableCredits.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-brand-purple" />
          </div>
          <div>
            <div className="text-3xl font-bold">{user?.credits || 0}</div>
            <p className="text-sm text-muted-foreground">
              {user?.plan === "pro" 
                ? t("credits.availableCredits.proPlan") 
                : user?.plan === "basic"
                ? t("credits.availableCredits.basicPlan", "Plano Basic")
                : t("credits.availableCredits.freePlan")}
            </p>
          </div>
        </div>
      </CardContent>
      {user?.plan !== "pro" && (
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a href="/planos">{t("credits.availableCredits.upgradeBtn")}</a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
