
import { useTranslation } from "react-i18next";
import { AvailableCreditsCard } from "@/components/dashboard/AvailableCreditsCard";
import { BuyCreditsCard } from "@/components/dashboard/BuyCreditsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";

const CreditsPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("credits.title")}</h1>
        <p className="text-muted-foreground">
          {t("credits.subtitle")}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <AvailableCreditsCard />
        <BuyCreditsCard />
      </div>
      
      <TransactionsCard />
    </div>
  );
};

export default CreditsPage;
