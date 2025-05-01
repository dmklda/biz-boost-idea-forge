
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PrivacyPolicyPage = () => {
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
              {t("privacyPolicy.tagline")}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{t("privacyPolicy.title")}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t("privacyPolicy.lastUpdated")}: May 1, 2025</p>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>{t("privacyPolicy.introduction")}</p>
            
            <h2>{t("privacyPolicy.sections.dataCollection.title")}</h2>
            <p>{t("privacyPolicy.sections.dataCollection.content1")}</p>
            <p>{t("privacyPolicy.sections.dataCollection.content2")}</p>
            <ul>
              <li>{t("privacyPolicy.sections.dataCollection.items.item1")}</li>
              <li>{t("privacyPolicy.sections.dataCollection.items.item2")}</li>
              <li>{t("privacyPolicy.sections.dataCollection.items.item3")}</li>
              <li>{t("privacyPolicy.sections.dataCollection.items.item4")}</li>
              <li>{t("privacyPolicy.sections.dataCollection.items.item5")}</li>
            </ul>
            
            <h2>{t("privacyPolicy.sections.useOfData.title")}</h2>
            <p>{t("privacyPolicy.sections.useOfData.content1")}</p>
            <ul>
              <li>{t("privacyPolicy.sections.useOfData.items.item1")}</li>
              <li>{t("privacyPolicy.sections.useOfData.items.item2")}</li>
              <li>{t("privacyPolicy.sections.useOfData.items.item3")}</li>
              <li>{t("privacyPolicy.sections.useOfData.items.item4")}</li>
              <li>{t("privacyPolicy.sections.useOfData.items.item5")}</li>
            </ul>
            
            <h2>{t("privacyPolicy.sections.dataSecurity.title")}</h2>
            <p>{t("privacyPolicy.sections.dataSecurity.content1")}</p>
            <p>{t("privacyPolicy.sections.dataSecurity.content2")}</p>
            
            <h2>{t("privacyPolicy.sections.thirdPartyServices.title")}</h2>
            <p>{t("privacyPolicy.sections.thirdPartyServices.content1")}</p>
            <p>{t("privacyPolicy.sections.thirdPartyServices.content2")}</p>
            
            <h2>{t("privacyPolicy.sections.cookies.title")}</h2>
            <p>{t("privacyPolicy.sections.cookies.content1")}</p>
            <p>{t("privacyPolicy.sections.cookies.content2")}</p>
            
            <h2>{t("privacyPolicy.sections.userRights.title")}</h2>
            <p>{t("privacyPolicy.sections.userRights.content")}</p>
            <ul>
              <li>{t("privacyPolicy.sections.userRights.items.item1")}</li>
              <li>{t("privacyPolicy.sections.userRights.items.item2")}</li>
              <li>{t("privacyPolicy.sections.userRights.items.item3")}</li>
              <li>{t("privacyPolicy.sections.userRights.items.item4")}</li>
              <li>{t("privacyPolicy.sections.userRights.items.item5")}</li>
            </ul>
            
            <h2>{t("privacyPolicy.sections.changes.title")}</h2>
            <p>{t("privacyPolicy.sections.changes.content")}</p>
            
            <h2>{t("privacyPolicy.sections.contact.title")}</h2>
            <p>{t("privacyPolicy.sections.contact.content")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
