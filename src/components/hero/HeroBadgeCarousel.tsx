import { useTranslation } from 'react-i18next';
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from 'react';
const HeroBadgeCarousel = () => {
  const {
    t
  } = useTranslation();
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const badgeRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const badges = [t('hero.badges.validation') || "Validação inteligente de ideias de negócio", t('hero.badges.analysis') || "Análise completa de viabilidade", t('hero.badges.insights') || "Insights baseados em dados do mercado", t('hero.badges.planning') || "Planejamento estratégico automatizado"];

  // Versões mais curtas para mobile
  const mobilesBadges = [t('hero.badges.mobile.validation') || "Validação inteligente", t('hero.badges.mobile.analysis') || "Análise de viabilidade", t('hero.badges.mobile.insights') || "Insights de mercado", t('hero.badges.mobile.planning') || "Planejamento estratégico"];
  useEffect(() => {
    const timer = setInterval(() => {
      if (badgeRef.current) {
        badgeRef.current.style.opacity = '0';
        badgeRef.current.style.transform = 'translateY(10px)';
        setTimeout(() => {
          setCurrentBadgeIndex(prev => (prev + 1) % badges.length);
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
  return <div className="relative inline-flex w-full max-w-md">
      <div className="sm:px-6 sm:py-3 glassmorphism rounded-full mb-6 flex items-center justify-center overflow-hidden shadow-md backdrop-blur-sm border-glow w-full py-[5px] px-[10px]">
        <p ref={badgeRef} className="text-sm md:text-base text-brand-purple dark:text-indigo-300 font-medium text-center transition-all duration-300 truncate">
          {isMobile ? mobilesBadges[currentBadgeIndex] : badges[currentBadgeIndex]}
        </p>
      </div>
    </div>;
};
export default HeroBadgeCarousel;