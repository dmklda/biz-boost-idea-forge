
import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout = () => {
  const { authState } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // On mobile, always collapse sidebar by default
  const effectiveCollapsed = isMobile ? true : sidebarCollapsed;
  
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar collapsed={effectiveCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-4" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center md:hidden">
            <img 
              src="/lovable-uploads/87bedc4a-87c0-4400-983d-123220e6de66.png"
              alt="Startup Ideia" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            
            <div className="hidden sm:block text-sm">
              <span className="font-medium">{authState.user?.name}</span>
              <div className="text-xs text-muted-foreground">
                {authState.user?.plan === "free" ? "Plano Gratuito" : "Plano Pro"}
              </div>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#8F00FF] flex items-center justify-center text-white font-bold">
              {authState.user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
