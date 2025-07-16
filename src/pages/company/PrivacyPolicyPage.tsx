import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl pt-20">
        <h1 className="text-3xl font-bold mb-4">{t('privacy.title')}</h1>
        <p className="text-muted-foreground mb-2 text-sm">{t('privacy.lastUpdated', { date: '2024-05-20' })}</p>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.section1Title')}</h2>
          <p>{t('privacy.section1Content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.dataCollectionTitle')}</h2>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>{t('privacy.dataCollectionItem1')}</li>
            <li>{t('privacy.dataCollectionItem2')}</li>
            <li>{t('privacy.dataCollectionItem3')}</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.dataUsageTitle')}</h2>
          <p>{t('privacy.dataUsageContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.dataSharingTitle')}</h2>
          <p>{t('privacy.dataSharingContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.cookiesTitle')}</h2>
          <p>{t('privacy.cookiesContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.userRightsTitle')}</h2>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>{t('privacy.userRightsItem1')}</li>
            <li>{t('privacy.userRightsItem2')}</li>
            <li>{t('privacy.userRightsItem3')}</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.securityTitle')}</h2>
          <p>{t('privacy.securityContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.changesTitle')}</h2>
          <p>{t('privacy.changesContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('privacy.contactTitle')}</h2>
          <p>{t('privacy.contactContent')}</p>
        </section>
        <div className="mt-8">
          <a href="/company/TermsOfUsePage" className="text-brand-purple underline">{t('privacy.termsLink')}</a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
