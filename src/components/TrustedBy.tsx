
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useTranslation } from "react-i18next";

const trustedCompanies = [
  { name: "Company 1", logo: "/placeholder.svg" },
  { name: "Company 2", logo: "/placeholder.svg" },
  { name: "Company 3", logo: "/placeholder.svg" },
  { name: "Company 4", logo: "/placeholder.svg" },
  { name: "Company 5", logo: "/placeholder.svg" },
  { name: "Company 6", logo: "/placeholder.svg" },
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
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {trustedCompanies.map((company, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/6">
                <div className="p-2">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-8 w-auto mx-auto opacity-50 hover:opacity-100 transition-opacity"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default TrustedBy;
