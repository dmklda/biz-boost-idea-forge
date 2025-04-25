
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { useTranslation } from "react-i18next";

const trustedCompanies = [
  { name: "TechVentures", logo: "/placeholder.svg" },
  { name: "InnovateLabs", logo: "/placeholder.svg" },
  { name: "GlobalStart", logo: "/placeholder.svg" },
  { name: "FutureWorks", logo: "/placeholder.svg" },
  { name: "NextGen Solutions", logo: "/placeholder.svg" },
  { name: "SmartCorp", logo: "/placeholder.svg" },
  { name: "VisionTech", logo: "/placeholder.svg" },
  { name: "DataFlow", logo: "/placeholder.svg" }
];

const TrustedBy = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-background/50 backdrop-blur-sm py-12 border-y border-border/50 relative mt-20">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm md:text-base text-muted-foreground mb-8 font-medium">
          {t('hero.trustedBy')}
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10" />
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              skipSnaps: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4 animate-carousel">
              {[...trustedCompanies, ...trustedCompanies].map((company, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="p-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-8 w-auto mx-auto opacity-40 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 transform hover:scale-110"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
