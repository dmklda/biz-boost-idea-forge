
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// Credit package type definition
interface CreditPackage {
  id: number;
  amount: number;
  price: string;
  displayPrice: string;
  savings: string;
}

export const BuyCreditsCard = () => {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [isLoading, setIsLoading] = useState<number | null>(null);
  
  // Credit packages with savings
  const creditPackages: CreditPackage[] = [
    { id: 1, amount: 5, price: "24.90", displayPrice: "$24.90", savings: "" },
    { id: 2, amount: 10, price: "44.90", displayPrice: "$44.90", savings: "10% de desconto" },
    { id: 3, amount: 25, price: "99.90", displayPrice: "$99.90", savings: "20% de desconto" },
  ];
  
  const handleBuyCredits = async (packageId: number, amount: number) => {
    if (!user) return;
    
    // In a real app, this would redirect to a payment gateway
    setIsLoading(packageId);
    
    try {
      // Calculate new credit value
      const newCredits = user.credits + amount;
      
      // Call to update credits
      updateUserCredits(newCredits);
      
      // Record the transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          description: t("credits.transactions.purchaseDescription", "Compra de {{amount}} créditos", { amount })
        });
        
      toast.success(t("credits.transactions.addedSuccess", "Créditos adicionados com sucesso!"));
    } catch (error) {
      console.error("Error buying credits:", error);
      toast.error(t("credits.buyCredits.error", "Erro ao adicionar créditos"));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("credits.buyCredits.title", "Comprar Créditos")}</CardTitle>
        <CardDescription>
          {t("credits.buyCredits.description", "Compre créditos para utilizar funcionalidades premium")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {creditPackages.map((pkg) => (
          <div 
            key={pkg.id}
            className="flex items-center justify-between p-4 border rounded-md hover:border-brand-purple/50 hover:bg-muted/50 transition-colors"
          >
            <div>
              <div className="font-medium">{pkg.amount} {t("credits.buyCredits.credits", "créditos")}</div>
              <div className="text-sm text-muted-foreground">{pkg.displayPrice}</div>
              {pkg.savings && (
                <Badge variant="outline" className="mt-1 text-xs text-green-500 border-green-500/30">
                  {pkg.savings}
                </Badge>
              )}
            </div>
            <Button 
              onClick={() => handleBuyCredits(pkg.id, pkg.amount)}
              disabled={isLoading === pkg.id}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {isLoading === pkg.id ? (
                t("credits.buyCredits.processing", "Processando...")
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("credits.buyCredits.buy", "Comprar")}
                </>
              )}
            </Button>
          </div>
        ))}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>{t("credits.usageExamples", "Exemplos de uso:")}</p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>{t("credits.usageBasicAnalysis", "Análise básica: 1 crédito")}</li>
            <li>{t("credits.usageAdvancedAnalysis", "Análise avançada: 2 créditos")}</li>
            <li>{t("credits.usageComparison", "Comparar ideias: 1 crédito")}</li>
            <li>{t("credits.usagePDF", "Download de PDF: 1 crédito (Grátis para plano Pro)")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
