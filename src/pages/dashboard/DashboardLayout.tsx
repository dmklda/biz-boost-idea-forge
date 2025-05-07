
import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useTranslation } from "react-i18next";

const DashboardLayout = () => {
  const { authState } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const location = useLocation();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  
  // Set page title based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/dashboard") setPageTitle(t('nav.dashboard'));
    else if (path.includes("/ideias")) setPageTitle(t('nav.ideas'));
    else if (path.includes("/creditos")) setPageTitle(t('nav.credits'));
    else if (path.includes("/configuracoes")) setPageTitle(t('nav.profile'));
    else setPageTitle("Startupideia");
  }, [location.pathname, t]);
  
  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Only show sidebar on non-mobile */}
      {!isMobile && (
        <DashboardSidebar collapsed={sidebarCollapsed} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-4" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center">
            {isMobile ? (
              <h1 className="font-semibold text-lg">{pageTitle}</h1>
            ) : (
              <img 
                src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png"
                alt="Startup Ideia" 
                className="h-8 w-auto"
              />
            )}
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAnalysisDialogOpen(true)}
                className="text-brand-purple"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
            
            {!isMobile && <LanguageSwitcher />}
            {!isMobile && <ThemeToggle />}
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <div className="text-sm hidden md:block">
                  <span className="font-medium">{authState.user?.name}</span>
                  <div className="text-xs text-muted-foreground">
                    {authState.user?.plan === "free" ? "Plano Gratuito" : "Plano Pro"}
                  </div>
                </div>
              )}
              
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#8F00FF] flex items-center justify-center text-white font-bold">
                {authState.user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* New Analysis Dialog - This is for header button */}
        <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('ideaForm.title')}</DialogTitle>
              <DialogDescription>
                {t('ideaForm.subtitle')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <IdeaForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DashboardLayout;
