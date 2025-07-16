
import { Button } from "./ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { useTranslation } from 'react-i18next';

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-fuchsia-500 to-pink-500"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10"></div>
      {/* Glow effect behind icon */}
      <div className="absolute left-1/2 top-32 -translate-x-1/2 -z-0">
        <div className="w-64 h-64 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_0%,_rgba(255,255,255,0)_70%)] blur-2xl"></div>
      </div>
      {/* Floating elements for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full backdrop-blur-md animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-white/10 rounded-full backdrop-blur-md animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-white/10 rounded-full backdrop-blur-md animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 pt-8">
          <div className="mb-8 inline-block animate-appear">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-white/30 blur-xl rounded-full"></div>
              <div className="bg-white/30 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center relative z-10 mx-auto shadow-lg">
                <img src="/lovable-uploads/1d922337-e8ee-440b-afed-32d32a6a045a.png" alt="Startup Ideia Ícone" className="h-12 w-12" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 font-poppins bg-gradient-to-r from-white via-white to-fuchsia-200 bg-clip-text text-transparent drop-shadow-2xl animate-appear">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 font-inter leading-relaxed drop-shadow animate-appear opacity-0 delay-100">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-appear mt-2">
            <a href="/dashboard/ideias">
              <Button 
                size="lg"
                className="bg-brand-purple text-white font-semibold hover:bg-fuchsia-600 transition-all duration-200 px-8 py-4 text-lg rounded-lg shadow-none border-none"
              >
                {t('cta.validateIdea')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="/example-analysis-result">
              <Button 
                size="lg"
                variant="outline"
                className="bg-white text-brand-purple border border-brand-purple font-semibold hover:bg-brand-purple/10 hover:text-fuchsia-700 transition-all duration-200 px-8 py-4 text-lg rounded-lg shadow-none"
              >
                {t('cta.seeExample')}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
