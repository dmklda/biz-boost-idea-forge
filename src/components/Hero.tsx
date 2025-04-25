
import { Button } from "./ui/button";
import { ArrowRight, Lightbulb, Rocket, Brain } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  // Parse the title with HTML spans
  const titleWithSpans = t('hero.title')
    .replace('<span>', '<span class="text-brand-blue">')
    .replace('<gradientSpan>', '<span class="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">');

  return (
    <section className="pt-20 pb-24 px-4 bg-gradient-to-b from-white dark:from-gray-900 to-brand-light dark:to-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins leading-tight mb-6"
              dangerouslySetInnerHTML={{ __html: titleWithSpans }}
            />
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 font-inter">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-brand-blue hover:bg-brand-blue/90 text-white"
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
          
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 rounded-full blur-3xl opacity-30 animate-pulse-glow"></div>
            <div className="relative z-10 space-y-6">
              <div className="glass-card p-6 rounded-xl max-w-xs ml-auto">
                <div className="flex items-center mb-2">
                  <Lightbulb className="text-brand-blue mr-2" size={20} />
                  <h3 className="font-medium font-poppins">{t('hero.viabilityAnalysis')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">{t('hero.viabilityDesc')}</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl max-w-xs transform translate-x-8">
                <div className="flex items-center mb-2">
                  <Rocket className="text-brand-purple mr-2" size={20} />
                  <h3 className="font-medium font-poppins">{t('hero.growthPotential')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">{t('hero.growthDesc')}</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl max-w-xs ml-12">
                <div className="flex items-center mb-2">
                  <Brain className="text-brand-green mr-2" size={20} />
                  <h3 className="font-medium font-poppins">{t('hero.customerProfile')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">{t('hero.customerDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
