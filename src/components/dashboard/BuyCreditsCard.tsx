import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

// Tipagem para pacotes de créditos
interface CreditPackage {
  id: number;
  amount: number;
  price: string;
  savings: string;
}

// Pacotes de crédito disponíveis
const creditPackages: CreditPackage[] = [
  { id: 1, amount: 5, price: "$24.90", savings: "" },
  { id: 2, amount: 10, price: "$44.90", savings: "10% de desconto" },
  { id: 3, amount: 25, price: "$99.90", savings: "20% de desconto" },
];

export const BuyCreditsCard = () => {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [isLoading, setIsLoading] = useState<number | null>(null);
  
  const handleBuyCredits = async (packageId: number, amount: number) => {
    if (!user) return;
    
    // Em um app real, isso redirecionaria para um gateway de pagamento
    setIsLoading(packageId);
    
    try {
      // Calcular novo valor de créditos
      const newCredits = user.credits + amount;
      
      // Chamada para atualizar créditos
      updateUserCredits(newCredits);
      
      toast.success(t("credits.transactions.addedSuccess"));
    } catch (error) {
      console.error("Error buying credits:", error);
      toast.error(t("credits.buyCredits.error", "Error adding credits"));
    } finally {
      setIsLoading(null);
    }
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
              onClick={() => handleBuyCredits(pkg.id, pkg.amount)}
              disabled={isLoading === pkg.id}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {isLoading === pkg.id ? (
                t("credits.buyCredits.processing")
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
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
