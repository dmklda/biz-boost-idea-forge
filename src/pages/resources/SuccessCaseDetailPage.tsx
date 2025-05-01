
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";

const SuccessCaseDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data for success cases
  const successCases = [
    {
      id: "1",
      company: t("successCases.cases.case1.company"),
      description: t("successCases.cases.case1.description"),
      result: t("successCases.cases.case1.result"),
      image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "2",
      company: t("successCases.cases.case2.company"),
      description: t("successCases.cases.case2.description"),
      result: t("successCases.cases.case2.result"),
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "3",
      company: t("successCases.cases.case3.company"),
      description: t("successCases.cases.case3.description"),
      result: t("successCases.cases.case3.result"),
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=700&auto=format&fit=crop"
    }
  ];

  const caseItem = successCases.find(caseItem => caseItem.id === id);

  if (!caseItem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">{t("successCases.caseNotFound")}</h1>
        <Button onClick={() => navigate("/recursos/casos-de-sucesso")}>{t("successCases.backToCases")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/recursos/casos-de-sucesso")}
          className="mb-6 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("successCases.backToCases")}
        </Button>

        <div className="max-w-4xl mx-auto">
          <img 
            src={caseItem.image} 
            alt={caseItem.company}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
          />
          
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-brand-purple/20 mb-6">
            <Users className="h-8 w-8 text-brand-purple" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">{caseItem.company}</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg whitespace-pre-line mb-8">
              {caseItem.description}
            </p>
            
            <div className="bg-secondary/50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-2">{t("successCases.results")}</h3>
              <p>{caseItem.result}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessCaseDetailPage;
