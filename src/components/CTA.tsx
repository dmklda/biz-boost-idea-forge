
import { Button } from "./ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { useTranslation } from 'react-i18next';

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-br from-brand-blue to-brand-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Rocket className="h-12 w-12 mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8 font-inter">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-brand-purple hover:bg-white/90 font-medium"
              onClick={() => {
                const formElement = document.getElementById('form');
                if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('cta.validateIdea')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = "/resultados"}
            >
              {t('cta.seeExample')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
