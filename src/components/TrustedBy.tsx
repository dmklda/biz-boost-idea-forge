
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { useTranslation } from "react-i18next";

// Import all the generated logos
import techVenturesLogo from "../assets/logos/tech-ventures.png";
import innovateLabsLogo from "../assets/logos/innovate-labs.png";
import globalStartLogo from "../assets/logos/global-start.png";
import futureWorksLogo from "../assets/logos/future-works.png";
import nextgenSolutionsLogo from "../assets/logos/nextgen-solutions.png";
import smartCorpLogo from "../assets/logos/smart-corp.png";
import visionTechLogo from "../assets/logos/vision-tech.png";
import dataFlowLogo from "../assets/logos/data-flow.png";
import cloudSyncLogo from "../assets/logos/cloud-sync.png";
import quantumEdgeLogo from "../assets/logos/quantum-edge.png";
import ecoFlowLogo from "../assets/logos/eco-flow.png";
import digitalMindLogo from "../assets/logos/digital-mind.png";
import flexCodeLogo from "../assets/logos/flex-code.png";
import rocketBaseLogo from "../assets/logos/rocket-base.png";

// Enhanced trusted companies with AI-generated logos
const trustedCompanies = [
  { name: "TechVentures", logo: techVenturesLogo },
  { name: "InnovateLabs", logo: innovateLabsLogo },
  { name: "GlobalStart", logo: globalStartLogo },
  { name: "FutureWorks", logo: futureWorksLogo },
  { name: "NextGen Solutions", logo: nextgenSolutionsLogo },
  { name: "SmartCorp", logo: smartCorpLogo },
  { name: "VisionTech", logo: visionTechLogo },
  { name: "DataFlow", logo: dataFlowLogo },
  { name: "CloudSync", logo: cloudSyncLogo },
  { name: "QuantumEdge", logo: quantumEdgeLogo },
  { name: "EcoFlow", logo: ecoFlowLogo },
  { name: "DigitalMind", logo: digitalMindLogo },
  { name: "FlexCode", logo: flexCodeLogo },
  { name: "RocketBase", logo: rocketBaseLogo }
];

const TrustedBy = () => {
  const { t } = useTranslation();

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
              <CarouselContent className="-ml-1 md:-ml-2 animate-carousel">
                {[...trustedCompanies, ...trustedCompanies].map((company, index) => (
                  <CarouselItem key={`first-${index}`} className="pl-1 md:pl-2 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                    <div className="p-2 md:p-3 flex items-center justify-center h-16 md:h-20">
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="h-8 md:h-10 w-auto mx-auto opacity-40 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 transform hover:scale-105 filter dark:brightness-150"
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
                className="-ml-1 md:-ml-2" 
                style={{ 
                  animation: 'carousel 80s linear infinite reverse',
                  animationPlayState: 'running'
                }}
              >
                {[...trustedCompanies.reverse(), ...trustedCompanies].map((company, index) => (
                  <CarouselItem key={`second-${index}`} className="pl-1 md:pl-2 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                    <div className="p-2 md:p-3 flex items-center justify-center h-16 md:h-20">
                      <img 
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="h-8 md:h-10 w-auto mx-auto opacity-40 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 transform hover:scale-105 filter dark:brightness-150"
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
