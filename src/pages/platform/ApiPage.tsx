
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Rocket, Code } from "lucide-react";

const ApiPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("api.tagline")}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("api.title")}</h1>
          <p className="text-lg text-muted-foreground mb-12">{t("api.subtitle")}</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                <Code className="h-5 w-5 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("api.restApi.title")}</h3>
              <p className="text-muted-foreground">{t("api.restApi.description")}</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                <Rocket className="h-5 w-5 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("api.websockets.title")}</h3>
              <p className="text-muted-foreground">{t("api.websockets.description")}</p>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2>{t("api.documentation.title")}</h2>
            <p>{t("api.documentation.description")}</p>
            
            <h3>{t("api.authentication.title")}</h3>
            <p>{t("api.authentication.description")}</p>
            <pre className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 overflow-x-auto">
              <code>curl -X POST https://api.startupideia.com/auth/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials"</code>
            </pre>
            
            <h3>{t("api.endpoints.title")}</h3>
            <p>{t("api.endpoints.description")}</p>
            <ul>
              <li><strong>GET /ideas</strong> - {t("api.endpoints.getIdeas")}</li>
              <li><strong>POST /ideas/analyze</strong> - {t("api.endpoints.analyzeIdea")}</li>
              <li><strong>GET /ideas/{'{id}'}</strong> - {t("api.endpoints.getIdeaById")}</li>
              <li><strong>GET /reports</strong> - {t("api.endpoints.getReports")}</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiPage;
