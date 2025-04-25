
import { Button } from "./ui/button";
import { ArrowRight, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TrustedBy from "./TrustedBy";

const Hero = () => {
  const { t } = useTranslation();

  const titleWithSpans = t('hero.title')
    .replace('<span>', '<span class="text-brand-purple">')
    .replace('<gradientSpan>', '<span class="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">');

  const trustAvatars = [
    { src: "/placeholder.svg", name: "Alex K." },
    { src: "/placeholder.svg", name: "Maria S." },
    { src: "/placeholder.svg", name: "John D." },
    { src: "/placeholder.svg", name: "Sara M." }
  ];

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
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

            <div className="flex items-center gap-4 mb-12">
              <div className="flex -space-x-3">
                {trustAvatars.map((avatar, index) => (
                  <Avatar key={index} className="border-2 border-white dark:border-gray-800 w-8 h-8">
                    <AvatarImage src={avatar.src} alt={avatar.name} />
                    <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex items-center">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-brand-purple text-brand-purple" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">+10k usuarios satisfeitos</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-xl blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{t('hero.dashboard.title')}</h3>
                  <span className="text-green-500 text-sm">{t('hero.dashboard.status')}</span>
                </div>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded bg-brand-purple/10 flex items-center justify-center">
                          <div className="h-4 w-4 rounded-full bg-brand-purple/20"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-2 bg-brand-purple/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-purple rounded-full transition-all duration-1000"
                        style={{width: `${30 + item * 20}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((stat) => (
                      <div key={stat} className="text-center">
                        <div className="text-2xl font-semibold text-brand-purple mb-1">
                          {stat * 28}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Metric {stat}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
