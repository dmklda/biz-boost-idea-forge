
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const SuccessCasesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock data for success cases
  const successCases = [
    {
      id: 1,
      company: t("successCases.cases.case1.company"),
      description: t("successCases.cases.case1.description"),
      result: t("successCases.cases.case1.result"),
      image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 2,
      company: t("successCases.cases.case2.company"),
      description: t("successCases.cases.case2.description"),
      result: t("successCases.cases.case2.result"),
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 3,
      company: t("successCases.cases.case3.company"),
      description: t("successCases.cases.case3.description"),
      result: t("successCases.cases.case3.result"),
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=700&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("successCases.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("successCases.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("successCases.subtitle")}</p>
        </div>
        
        <div className="space-y-12 mb-16">
          {successCases.map((caseItem, index) => (
            <Card key={caseItem.id} className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
              <div className={`grid md:grid-cols-2 gap-6 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="h-64 md:h-auto">
                  <img 
                    src={caseItem.image} 
                    alt={caseItem.company}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 flex flex-col justify-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                    <Users className="h-5 w-5 text-brand-purple" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{caseItem.company}</h2>
                  <p className="text-muted-foreground mb-4">
                    {`${caseItem.description.substring(0, 120)}...`}
                  </p>
                  <Button 
                    className="mt-2 self-start"
                    onClick={() => navigate(`/recursos/casos-de-sucesso/${caseItem.id}`)}
                  >
                    {t("successCases.readFullCase")}
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">{t("successCases.cta.title")}</h3>
          <p className="text-muted-foreground mb-6">{t("successCases.cta.subtitle")}</p>
          <Button className="btn-premium">{t("successCases.cta.button")}</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessCasesPage;
