
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsOfUsePage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl pt-20">
        <h1 className="text-3xl font-bold mb-4">{t('terms.title')}</h1>
        <p className="text-muted-foreground mb-2 text-sm">{t('terms.lastUpdated', { date: '2024-05-20' })}</p>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.acceptanceTitle')}</h2>
          <p>{t('terms.acceptanceContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.usageTitle')}</h2>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>{t('terms.usageItem1')}</li>
            <li>{t('terms.usageItem2')}</li>
            <li>{t('terms.usageItem3')}</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.intellectualPropertyTitle')}</h2>
          <p>{t('terms.intellectualPropertyContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.userObligationsTitle')}</h2>
          <ul className="list-disc ml-6 text-muted-foreground">
            <li>{t('terms.userObligationsItem1')}</li>
            <li>{t('terms.userObligationsItem2')}</li>
            <li>{t('terms.userObligationsItem3')}</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.paymentsTitle')}</h2>
          <p>{t('terms.paymentsContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.cancellationTitle')}</h2>
          <p>{t('terms.cancellationContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.limitationTitle')}</h2>
          <p>{t('terms.limitationContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.changesTitle')}</h2>
          <p>{t('terms.changesContent')}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{t('terms.contactTitle')}</h2>
          <p>{t('terms.contactContent')}</p>
        </section>
        <div className="mt-8">
          <a href="/company/PrivacyPolicyPage" className="text-brand-purple underline">{t('terms.privacyLink')}</a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUsePage;
