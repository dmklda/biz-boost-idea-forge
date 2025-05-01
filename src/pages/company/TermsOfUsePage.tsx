
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const TermsOfUsePage = () => {
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
              {t("termsOfUse.tagline")}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{t("termsOfUse.title")}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t("termsOfUse.lastUpdated")}: May 1, 2025</p>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>{t("termsOfUse.introduction")}</p>
            
            <h2>{t("termsOfUse.sections.acceptance.title")}</h2>
            <p>{t("termsOfUse.sections.acceptance.content")}</p>
            
            <h2>{t("termsOfUse.sections.accountRegistration.title")}</h2>
            <p>{t("termsOfUse.sections.accountRegistration.content1")}</p>
            <p>{t("termsOfUse.sections.accountRegistration.content2")}</p>
            
            <h2>{t("termsOfUse.sections.services.title")}</h2>
            <p>{t("termsOfUse.sections.services.content1")}</p>
            <p>{t("termsOfUse.sections.services.content2")}</p>
            
            <h2>{t("termsOfUse.sections.payment.title")}</h2>
            <p>{t("termsOfUse.sections.payment.content1")}</p>
            <p>{t("termsOfUse.sections.payment.content2")}</p>
            
            <h2>{t("termsOfUse.sections.intellectualProperty.title")}</h2>
            <p>{t("termsOfUse.sections.intellectualProperty.content1")}</p>
            <p>{t("termsOfUse.sections.intellectualProperty.content2")}</p>
            
            <h2>{t("termsOfUse.sections.userContent.title")}</h2>
            <p>{t("termsOfUse.sections.userContent.content1")}</p>
            <p>{t("termsOfUse.sections.userContent.content2")}</p>
            
            <h2>{t("termsOfUse.sections.prohibited.title")}</h2>
            <p>{t("termsOfUse.sections.prohibited.content")}</p>
            <ul>
              <li>{t("termsOfUse.sections.prohibited.items.item1")}</li>
              <li>{t("termsOfUse.sections.prohibited.items.item2")}</li>
              <li>{t("termsOfUse.sections.prohibited.items.item3")}</li>
              <li>{t("termsOfUse.sections.prohibited.items.item4")}</li>
              <li>{t("termsOfUse.sections.prohibited.items.item5")}</li>
              <li>{t("termsOfUse.sections.prohibited.items.item6")}</li>
            </ul>
            
            <h2>{t("termsOfUse.sections.termination.title")}</h2>
            <p>{t("termsOfUse.sections.termination.content")}</p>
            
            <h2>{t("termsOfUse.sections.disclaimer.title")}</h2>
            <p>{t("termsOfUse.sections.disclaimer.content")}</p>
            
            <h2>{t("termsOfUse.sections.limitation.title")}</h2>
            <p>{t("termsOfUse.sections.limitation.content")}</p>
            
            <h2>{t("termsOfUse.sections.changes.title")}</h2>
            <p>{t("termsOfUse.sections.changes.content")}</p>
            
            <h2>{t("termsOfUse.sections.governingLaw.title")}</h2>
            <p>{t("termsOfUse.sections.governingLaw.content")}</p>
            
            <h2>{t("termsOfUse.sections.contact.title")}</h2>
            <p>{t("termsOfUse.sections.contact.content")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUsePage;
