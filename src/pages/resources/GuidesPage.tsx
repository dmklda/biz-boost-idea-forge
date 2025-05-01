
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const GuidesPage = () => {
  const { t } = useTranslation();

  // Mock data for guides
  const guides = [
    {
      id: 1,
      title: t("guides.items.guide1.title"),
      description: t("guides.items.guide1.description"),
      category: t("guides.items.guide1.category"),
      level: t("guides.items.guide1.level")
    },
    {
      id: 2,
      title: t("guides.items.guide2.title"),
      description: t("guides.items.guide2.description"),
      category: t("guides.items.guide2.category"),
      level: t("guides.items.guide2.level")
    },
    {
      id: 3,
      title: t("guides.items.guide3.title"),
      description: t("guides.items.guide3.description"),
      category: t("guides.items.guide3.category"),
      level: t("guides.items.guide3.level")
    },
    {
      id: 4,
      title: t("guides.items.guide4.title"),
      description: t("guides.items.guide4.description"),
      category: t("guides.items.guide4.category"),
      level: t("guides.items.guide4.level")
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
              {t("guides.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("guides.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("guides.subtitle")}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {guides.map((guide) => (
            <Card key={guide.id} className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                  <BookOpen className="h-5 w-5 text-brand-purple" />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{guide.category}</span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {guide.level}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                <p className="text-muted-foreground">{guide.description}</p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="outline" className="w-full">{t("guides.readGuide")}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline">{t("guides.exploreAll")}</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuidesPage;
