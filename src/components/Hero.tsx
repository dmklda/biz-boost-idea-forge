
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import TrustedBy from "./TrustedBy";

const Hero = () => {
  const { t } = useTranslation();

  const titleWithSpans = t('hero.title')
    .replace('<span>', '<span class="text-brand-purple">')
    .replace('<gradientSpan>', '<span class="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">');

  return (
    <section className="pt-20 pb-12 px-4 bg-gradient-to-b from-white dark:from-gray-900 to-brand-light dark:to-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-brand-light dark:bg-gray-800 rounded-full mb-6">
              <p className="text-sm text-brand-purple font-medium">
                {t('hero.badge')}
              </p>
            </div>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins leading-tight mb-6 tracking-tight"
              dangerouslySetInnerHTML={{ __html: titleWithSpans }}
            />
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 font-inter max-w-xl">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-brand-purple hover:bg-brand-purple/90 text-white"
                onClick={() => {
                  const formElement = document.getElementById('form');
                  if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('hero.validateIdea')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-gray-300 dark:border-gray-700 dark:text-white"
                onClick={() => {
                  const howItWorksElement = document.getElementById('como-funciona');
                  if (howItWorksElement) howItWorksElement.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('hero.learnMore')}
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-xl blur-3xl opacity-30 animate-pulse-glow"></div>
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 neo-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{t('hero.dashboard.title')}</h3>
                  <span className="text-green-500 text-sm">{t('hero.dashboard.status')}</span>
                </div>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-2 bg-brand-purple/20 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple rounded-full" style={{width: `${30 + item * 20}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <TrustedBy />
    </section>
  );
};

export default Hero;
