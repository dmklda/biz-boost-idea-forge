
import { Button } from "./ui/button";
import { ArrowRight, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TrustedBy from "./TrustedBy";
import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";

const Hero = () => {
  const { t } = useTranslation();
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const badgeRef = useRef<HTMLDivElement>(null);

  const badges = [
    "Validação inteligente de ideias de negócio",
    "Análise completa de viabilidade",
    "Insights baseados em dados do mercado",
    "Planejamento estratégico automatizado"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (badgeRef.current) {
        badgeRef.current.style.opacity = '0';
        badgeRef.current.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          setCurrentBadgeIndex((prev) => (prev + 1) % badges.length);
          
          setTimeout(() => {
            if (badgeRef.current) {
              badgeRef.current.style.opacity = '1';
              badgeRef.current.style.transform = 'translateY(0)';
            }
          }, 50);
        }, 300);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const titleWithSpans = t('hero.title')
    .replace('<span>', '<span class="text-gradient-premium font-bold">')
    .replace('<gradientSpan>', '<span class="bg-gradient-to-r from-brand-blue via-brand-purple to-indigo-400 bg-clip-text text-transparent">');

  const trustAvatars = [
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&h=64&auto=format&fit=crop", name: "Alex K." },
    { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=64&h=64&auto=format&fit=crop", name: "Maria S." },
    { src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=64&h=64&auto=format&fit=crop", name: "John D." },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&h=64&auto=format&fit=crop", name: "Sara M." }
  ];

  return (
    <section className="pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-pattern opacity-50 dark:opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-premium"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-blur-in">
            <div className="relative inline-block w-full max-w-md">
              <div className="px-6 py-3 glassmorphism rounded-full mb-6 h-12 flex items-center justify-center overflow-hidden shadow-md backdrop-blur-sm border-glow">
                <p 
                  ref={badgeRef}
                  className="text-sm md:text-base text-brand-purple dark:text-indigo-300 font-medium text-center truncate transition-all duration-300"
                >
                  {badges[currentBadgeIndex]}
                </p>
              </div>
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
                className="btn-premium"
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
                className="border-gray-300/50 dark:border-gray-700/50 dark:text-white backdrop-blur-sm hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
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
                  <Avatar 
                    key={index} 
                    className="border-2 border-background dark:border-gray-900 w-8 h-8 transition-transform hover:translate-y-[-2px] hover:scale-110"
                  >
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
                <span className="ml-2 text-sm text-muted-foreground">{t('hero.trustedBy')}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block relative perspective-3d">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-xl blur-3xl opacity-30"></div>
            
            <div className="absolute -top-8 -right-8 hidden md:block">
              <Badge 
                variant="outline" 
                className="badge-premium py-2 px-4 text-xs bg-purple-500/10"
              >
                AI Powered
              </Badge>
            </div>
            
            <div className="absolute -left-5 -bottom-5 hidden md:block">
              <div className="rounded-full bg-green-500/20 dark:bg-green-500/10 backdrop-blur-sm border border-green-500/20 w-16 h-16 flex items-center justify-center animate-pulse-soft">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7L13 15L9 11L3 17M21 7H15M21 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="perspective-card glassmorphism rounded-xl overflow-hidden transform hover:-rotate-y-2 hover:scale-[1.01] transition-all duration-500">
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16V21M12 16L18 21M12 16L6 21M18 8V3M18 8L12 3M18 8L21 10.5M6 8V3M6 8L12 3M6 8L3 10.5M3 10.5V16.5L12 12L21 16.5V10.5M3 10.5L12 6L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg">{t('hero.dashboard.title')}</h3>
                    </div>
                    <span className="text-green-500 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {t('hero.dashboard.status')}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-lg border border-white/10 dark:border-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-brand-purple/20 to-brand-purple rounded-lg flex items-center justify-center">
                            <div className="h-4 w-4 bg-gradient-to-br from-brand-purple to-indigo-500 rounded-full"></div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Análise de Mercado</h4>
                            <p className="text-xs text-muted-foreground">Em progresso</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-brand-purple/20 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-brand-purple to-indigo-500 rounded-full transition-all duration-1000"></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-lg border border-white/10 dark:border-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-brand-blue/20 to-brand-blue rounded-lg flex items-center justify-center">
                            <div className="h-4 w-4 bg-gradient-to-br from-brand-blue to-blue-500 rounded-full"></div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Viabilidade Financeira</h4>
                            <p className="text-xs text-muted-foreground">Em análise</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <div className="h-2 bg-brand-blue/20 rounded-full overflow-hidden">
                        <div className="h-full w-[62%] bg-gradient-to-r from-brand-blue to-sky-500 rounded-full transition-all duration-1000"></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-lg border border-white/10 dark:border-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-purple-500/20 to-purple-500 rounded-lg flex items-center justify-center">
                            <div className="h-4 w-4 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full"></div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Análise Competitiva</h4>
                            <p className="text-xs text-muted-foreground">Concluída</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-1000"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100/10 dark:border-gray-700/30">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gradient-premium mb-1">92%</div>
                      <div className="text-xs text-muted-foreground">Precisão</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gradient-premium mb-1">15k+</div>
                      <div className="text-xs text-muted-foreground">Análises</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gradient-premium mb-1">24h</div>
                      <div className="text-xs text-muted-foreground">Média</div>
                    </div>
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
