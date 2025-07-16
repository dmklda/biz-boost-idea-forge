
import { useTranslation } from 'react-i18next';
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import HeroBadgeCarousel from "./HeroBadgeCarousel";
import HeroAvatars from "./HeroAvatars";

const HeroContent = () => {
  const { t } = useTranslation();

  const titleWithSpans = t('hero.title')
    ?.replace('<span>', '<span class="text-gradient-premium font-bold">')
    ?.replace('<gradientSpan>', '<span class="bg-gradient-to-r from-brand-blue via-brand-purple to-indigo-400 bg-clip-text text-transparent">') || 
    t('hero.titleFallback', 'Transforme sua <span>ideia</span> em um <gradientSpan>negócio validado</gradientSpan>');

  return (
    <div className="animate-blur-in">
      <HeroBadgeCarousel />
      
      <h1 
        className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins leading-tight mb-6 tracking-tight"
        dangerouslySetInnerHTML={{ __html: titleWithSpans }}
      />
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 font-inter max-w-xl">
        {t('hero.subtitle', 'Nossa plataforma utiliza IA para analisar e validar sua ideia de negócio, fornecendo insights valiosos para o seu sucesso.')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button 
          size="lg" 
          className="btn-premium"
          onClick={() => {
            const formElement = document.getElementById('form');
            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {t('hero.validateIdea', 'Validar minha ideia')} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="border-gray-300/50 dark:border-gray-700/50 dark:text-white backdrop-blur-sm hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => {
            const howItWorksElement = document.getElementById('como-funciona');
            if (howItWorksElement) howItWorksElement.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {t('hero.learnMore', 'Saiba mais')}
        </Button>
      </div>

      <HeroAvatars />
    </div>
  );
};

export default HeroContent;
