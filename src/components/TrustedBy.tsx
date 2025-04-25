
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
    <div className="w-full bg-background/50 backdrop-blur-sm py-8 border-y border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-6">
          {t('hero.trustedBy')}
        </p>
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            containScroll: false,
            skipSnaps: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4 animate-carousel">
            {[...trustedCompanies, ...trustedCompanies].map((company, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="p-2">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-8 w-auto mx-auto opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default TrustedBy;
