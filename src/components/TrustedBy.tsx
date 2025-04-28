
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// Enhanced trusted companies with real-looking logos
const trustedCompanies = [
  { name: "TechVentures", logo: "/assets/logos/tech-ventures.svg" },
  { name: "InnovateLabs", logo: "/assets/logos/innovate-labs.svg" },
  { name: "GlobalStart", logo: "/assets/logos/global-start.svg" },
  { name: "FutureWorks", logo: "/assets/logos/future-works.svg" },
  { name: "NextGen Solutions", logo: "/assets/logos/nextgen-solutions.svg" },
  { name: "SmartCorp", logo: "/assets/logos/smart-corp.svg" },
  { name: "VisionTech", logo: "/assets/logos/vision-tech.svg" },
  { name: "DataFlow", logo: "/assets/logos/data-flow.svg" }
];

// Generate SVG logos for our companies
const generateLogoSVG = (name: string) => {
  // Create a simple SVG based on the company name
  const initials = name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40">
      <rect width="40" height="40" rx="8" fill="${color}" opacity="0.2" />
      <text x="20" y="26" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="currentColor">${initials}</text>
      <text x="70" y="26" font-family="Arial" font-size="16" font-weight="medium" fill="currentColor">${name}</text>
    </svg>
  `;
};

const TrustedBy = () => {
  const { t } = useTranslation();
  const [logos, setLogos] = useState<{ name: string; logoSvg: string }[]>([]);

  useEffect(() => {
    // Generate SVG logos for our trusted companies
    const generatedLogos = trustedCompanies.map(company => ({
      name: company.name,
      logoSvg: generateLogoSVG(company.name)
    }));
    
    setLogos(generatedLogos);
  }, []);

  return (
    <div className="w-full backdrop-blur-md py-16 border-t border-b border-border/10 relative mt-20 bg-gradient-to-b from-background/70 to-background/40">
      <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <p className="text-center text-base md:text-lg text-muted-foreground mb-10 font-medium">
          {t('hero.trustedBy')}
        </p>
        
        <div className="relative overflow-hidden">
          <div className="mask-fade-sides relative overflow-hidden">
            {/* First Carousel */}
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                skipSnaps: true,
              }}
              className="w-full max-w-7xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4 animate-carousel">
                {[...logos, ...logos].map((company, index) => (
                  <CarouselItem key={`first-${index}`} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <div className="p-4 flex items-center justify-center h-20">
                      <div 
                        className="h-10 w-auto mx-auto opacity-40 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 transform hover:scale-105 filter dark:brightness-150"
                        dangerouslySetInnerHTML={{ __html: company.logoSvg }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Second Carousel (moving in opposite direction for dynamic effect) */}
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                skipSnaps: true,
              }}
              className="w-full max-w-7xl mx-auto mt-6"
            >
              <CarouselContent 
                className="-ml-2 md:-ml-4" 
                style={{ 
                  animation: 'carousel 80s linear infinite reverse',
                  animationPlayState: 'running'
                }}
              >
                {[...logos.reverse(), ...logos].map((company, index) => (
                  <CarouselItem key={`second-${index}`} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <div className="p-4 flex items-center justify-center h-20">
                      <div 
                        className="h-10 w-auto mx-auto opacity-40 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 transform hover:scale-105 filter dark:brightness-150"
                        dangerouslySetInnerHTML={{ __html: company.logoSvg }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
