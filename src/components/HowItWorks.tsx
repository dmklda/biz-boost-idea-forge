
import { ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: t('howItWorks.step1.number'),
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description')
    },
    {
      number: t('howItWorks.step2.number'),
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description')
    },
    {
      number: t('howItWorks.step3.number'),
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description')
    },
    {
      number: t('howItWorks.step4.number'),
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description')
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-brand-light dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">{t('howItWorks.title')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="glass-card p-8 rounded-xl h-full flex flex-col animate-fade-in">
                <div className="text-6xl font-bold text-brand-purple/10 dark:text-brand-purple/20 mb-4 font-poppins">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex-grow font-inter">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 right-0 transform translate-x-1/2 translate-y-1/2 z-10">
                    <ArrowRight className="text-brand-blue h-8 w-8" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
