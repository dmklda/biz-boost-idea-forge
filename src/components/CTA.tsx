
import { Button } from "./ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { useTranslation } from 'react-i18next';

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/90 via-brand-purple/90 to-indigo-700/90"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full backdrop-blur-md animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-white/5 rounded-full backdrop-blur-md animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-white/5 rounded-full backdrop-blur-md animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 inline-block">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center relative z-10 mx-auto">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-poppins text-white">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 font-inter leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-brand-purple hover:bg-white/90 font-medium relative overflow-hidden group"
              onClick={() => {
                const formElement = document.getElementById('form');
                if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative flex items-center">
                {t('cta.validateIdea')} <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 backdrop-blur-sm"
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
