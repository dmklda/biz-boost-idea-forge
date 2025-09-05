import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// Tipagem para pacotes de créditos
interface CreditPackage {
  id: number;
  amount: number;
  price: string;
  savings: string;
}

// Pacotes de crédito disponíveis (atualizados para USD)
const creditPackages: CreditPackage[] = [
  { id: 1, amount: 5, price: "$2.99", savings: "" },
  { id: 2, amount: 10, price: "$4.99", savings: "17% OFF" },
  { id: 3, amount: 25, price: "$9.99", savings: "20% OFF" },
  { id: 4, amount: 50, price: "$17.99", savings: "28% OFF" },
  { id: 5, amount: 100, price: "$29.99", savings: "40% OFF" },
];

export const BuyCreditsCard = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { createCheckoutSession, isCreatingCheckout } = useSubscription();
  const { user } = authState;
  
  const handleBuyCredits = async (amount: number) => {
    if (!user) return;
    await createCheckoutSession(amount.toString(), 'credits');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("credits.buyCredits.title")}</CardTitle>
        <CardDescription>
          {t("credits.buyCredits.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {creditPackages.map((pkg) => (
          <div 
            key={pkg.id}
            className="flex items-center justify-between p-4 border rounded-md hover:border-brand-purple/50 hover:bg-muted/50 transition-colors"
          >
            <div>
              <div className="font-medium">{pkg.amount} {t("credits.buyCredits.credits")}</div>
              <div className="text-sm text-muted-foreground">{pkg.price}</div>
              {pkg.savings && (
                <div className="text-xs text-green-500 mt-1">{pkg.savings}</div>
              )}
            </div>
            <Button 
              onClick={() => handleBuyCredits(pkg.amount)}
              disabled={isCreatingCheckout}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("credits.buyCredits.processing")}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t("credits.buyCredits.buy")}
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};