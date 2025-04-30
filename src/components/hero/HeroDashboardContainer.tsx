
import { Badge } from "../ui/badge";
import HeroDashboard from "./HeroDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePerspective } from "@/hooks/use-perspective";

const HeroDashboardContainer = () => {
  const isMobile = useIsMobile();
  usePerspective(); // Add the perspective styles
  
  // Don't render on mobile
  if (isMobile) return null;

  return (
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
      
      <HeroDashboard />
    </div>
  );
};

export default HeroDashboardContainer;
