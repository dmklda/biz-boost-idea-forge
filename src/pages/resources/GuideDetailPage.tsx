
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { BookOpen } from "lucide-react";

const GuideDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log("Current guide ID:", id);
  
  // Mock data for guides
  const guides = [
    {
      id: "1",
      title: t("guides.items.guide1.title"),
      description: t("guides.items.guide1.description"),
      category: t("guides.items.guide1.category"),
      level: t("guides.items.guide1.level"),
      content: t("guides.items.guide1.content")
    },
    {
      id: "2",
      title: t("guides.items.guide2.title"),
      description: t("guides.items.guide2.description"),
      category: t("guides.items.guide2.category"),
      level: t("guides.items.guide2.level"),
      content: t("guides.items.guide2.content")
    },
    {
      id: "3",
      title: t("guides.items.guide3.title"),
      description: t("guides.items.guide3.description"),
      category: t("guides.items.guide3.category"),
      level: t("guides.items.guide3.level"),
      content: t("guides.items.guide3.content")
    },
    {
      id: "4",
      title: t("guides.items.guide4.title"),
      description: t("guides.items.guide4.description"),
      category: t("guides.items.guide4.category"),
      level: t("guides.items.guide4.level"),
      content: t("guides.items.guide4.content")
    }
  ];

  console.log("Available guides:", guides.map(g => g.id));
  const guide = guides.find(guide => guide.id === id);
  console.log("Found guide:", guide);

  if (!guide) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">{t("guides.guideNotFound")}</h1>
        <Button onClick={() => navigate("/recursos/guias")}>{t("guides.backToGuides")}</Button>
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
          onClick={() => navigate("/recursos/guias")}
          className="mb-6 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("guides.backToGuides")}
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
            <BookOpen className="h-8 w-8 text-brand-purple" />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">{guide.category}</span>
            <span className="text-sm bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full">
              {guide.level}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">{guide.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{guide.description}</p>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="whitespace-pre-line mb-8">{guide.content}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideDetailPage;
