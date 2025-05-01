
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Video } from "lucide-react";

const WebinarsPage = () => {
  const { t } = useTranslation();

  // Mock data for webinars
  const webinars = [
    {
      id: 1,
      title: t("webinars.items.webinar1.title"),
      description: t("webinars.items.webinar1.description"),
      date: t("webinars.items.webinar1.date"),
      speaker: t("webinars.items.webinar1.speaker"),
      thumbnail: "https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?q=80&w=700&auto=format&fit=crop",
      duration: "45:32"
    },
    {
      id: 2,
      title: t("webinars.items.webinar2.title"),
      description: t("webinars.items.webinar2.description"),
      date: t("webinars.items.webinar2.date"),
      speaker: t("webinars.items.webinar2.speaker"),
      thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=700&auto=format&fit=crop",
      duration: "38:17"
    },
    {
      id: 3,
      title: t("webinars.items.webinar3.title"),
      description: t("webinars.items.webinar3.description"),
      date: t("webinars.items.webinar3.date"),
      speaker: t("webinars.items.webinar3.speaker"),
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=700&auto=format&fit=crop",
      duration: "52:08"
    }
  ];

  const upcomingWebinars = [
    {
      id: 4,
      title: t("webinars.upcoming.webinar1.title"),
      date: t("webinars.upcoming.webinar1.date"),
      speaker: t("webinars.upcoming.webinar1.speaker"),
      time: t("webinars.upcoming.webinar1.time")
    },
    {
      id: 5,
      title: t("webinars.upcoming.webinar2.title"),
      date: t("webinars.upcoming.webinar2.date"),
      speaker: t("webinars.upcoming.webinar2.speaker"),
      time: t("webinars.upcoming.webinar2.time")
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
              {t("webinars.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("webinars.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("webinars.subtitle")}</p>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t("webinars.pastWebinars")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars.map((webinar) => (
              <Card key={webinar.id} className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
                <div className="relative">
                  <img 
                    src={webinar.thumbnail} 
                    alt={webinar.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-brand-purple/90 flex items-center justify-center">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {webinar.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">{webinar.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{webinar.title}</h3>
                  <p className="text-muted-foreground mb-3">{webinar.description}</p>
                  <div className="text-sm text-muted-foreground">
                    {t("webinars.presenter")}: <span className="font-medium text-foreground">{webinar.speaker}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" className="w-full">{t("webinars.watchNow")}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t("webinars.upcomingWebinars")}</h2>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
            <div className="space-y-6">
              {upcomingWebinars.map((webinar) => (
                <div key={webinar.id} className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold mb-1">{webinar.title}</h3>
                    <p className="text-muted-foreground mb-2">{t("webinars.presenter")}: {webinar.speaker}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{webinar.date}</span>
                      <span>•</span>
                      <span>{webinar.time}</span>
                    </div>
                  </div>
                  <Button>{t("webinars.registerNow")}</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">{t("webinars.cta.title")}</h3>
          <p className="text-muted-foreground mb-6">{t("webinars.cta.subtitle")}</p>
          <Button className="btn-premium">{t("webinars.cta.button")}</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WebinarsPage;
