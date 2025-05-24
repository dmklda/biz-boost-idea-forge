
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import IdeaForm from "../components/IdeaForm";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import { IntelligentRedirect } from "../components/onboarding/IntelligentRedirect";

const Index = () => {
  return (
    <IntelligentRedirect>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
        {/* Background element */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
        
        <Header />
        <main className="relative pt-16">
          <Hero />
          <HowItWorks />
          <Features />
          <Testimonials />
          <Pricing />
          <div id="form">
            <IdeaForm />
          </div>
          <CTA />
        </main>
        <Footer />
      </div>
    </IntelligentRedirect>
  );
};

export default Index;
