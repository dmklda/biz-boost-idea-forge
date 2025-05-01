
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Code, FileCode, Terminal, Laptop, Package, Headphones } from "lucide-react";

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
          
          <div className="mb-16">
            <Tabs defaultValue="documentation" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="documentation" className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  <span className="hidden md:inline">{t("api.documentation.title")}</span>
                </TabsTrigger>
                <TabsTrigger value="authentication" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="hidden md:inline">{t("api.authentication.title")}</span>
                </TabsTrigger>
                <TabsTrigger value="endpoints" className="flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  <span className="hidden md:inline">{t("api.endpoints.title")}</span>
                </TabsTrigger>
                <TabsTrigger value="sdks" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden md:inline">{t("api.sdks.title")}</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documentation" className="prose prose-lg max-w-none dark:prose-invert">
                <h2>{t("api.documentation.title")}</h2>
                <p>{t("api.documentation.description")}</p>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 mt-6 mb-8">
                  <h3 className="text-xl font-semibold mb-2">{t("api.pricing.title")}</h3>
                  <p className="mb-4">{t("api.pricing.description")}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t("api.pricing.entrepreneur")}</li>
                    <li>{t("api.pricing.business")}</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="authentication" className="prose prose-lg max-w-none dark:prose-invert">
                <h2>{t("api.authentication.title")}</h2>
                <p>{t("api.authentication.description")}</p>
                <pre className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 overflow-x-auto">
                  <code>curl -X POST https://api.startupideia.com/auth/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials"</code>
                </pre>
                <p className="mt-4">Response:</p>
                <pre className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 overflow-x-auto">
                  <code>{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}`}</code>
                </pre>
              </TabsContent>
              
              <TabsContent value="endpoints" className="prose prose-lg max-w-none dark:prose-invert">
                <h2>{t("api.endpoints.title")}</h2>
                <p>{t("api.endpoints.description")}</p>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg mt-4 divide-y divide-border">
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">GET /ideas</h3>
                    <p className="text-muted-foreground">{t("api.endpoints.getIdeas")}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">POST /ideas/analyze</h3>
                    <p className="text-muted-foreground">{t("api.endpoints.analyzeIdea")}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">GET /ideas/{'{id}'}</h3>
                    <p className="text-muted-foreground">{t("api.endpoints.getIdeaById")}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">GET /reports</h3>
                    <p className="text-muted-foreground">{t("api.endpoints.getReports")}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sdks" className="prose prose-lg max-w-none dark:prose-invert">
                <h2>{t("api.sdks.title")}</h2>
                <p>{t("api.sdks.description")}</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">JavaScript/TypeScript</h3>
                    <pre className="bg-black/20 p-2 rounded text-sm">
                      <code>npm install startupideia-sdk</code>
                    </pre>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Python</h3>
                    <pre className="bg-black/20 p-2 rounded text-sm">
                      <code>pip install startupideia-sdk</code>
                    </pre>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">PHP</h3>
                    <pre className="bg-black/20 p-2 rounded text-sm">
                      <code>composer require startupideia/sdk</code>
                    </pre>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Ruby</h3>
                    <pre className="bg-black/20 p-2 rounded text-sm">
                      <code>gem install startupideia-sdk</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-purple/20">
                <Headphones className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("api.support.title")}</h3>
                <p className="text-muted-foreground mb-4">{t("api.support.description")}</p>
                <ul className="space-y-2 text-sm">
                  <li>• {t("api.support.email")}</li>
                  <li>• {t("api.support.docs")}</li>
                  <li>• {t("api.support.community")}</li>
                </ul>
                <Button className="mt-6">Get API Key</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiPage;
