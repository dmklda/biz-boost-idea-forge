
import TrustedBy from "./TrustedBy";
import HeroContent from "./hero/HeroContent";
import HeroDashboardContainer from "./hero/HeroDashboardContainer";

const Hero = () => {
  return (
    <section className="pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-pattern opacity-50 dark:opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-premium"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <HeroContent />
          <HeroDashboardContainer />
        </div>
      </div>
      
      <TrustedBy />
    </section>
  );
};

export default Hero;
