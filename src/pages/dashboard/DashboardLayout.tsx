
import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = () => {
  const { authState } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const location = useLocation();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Set page title based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/dashboard") setPageTitle(t('nav.dashboard'));
    else if (path.includes("/ideias")) setPageTitle(t('nav.ideas'));
    else if (path.includes("/creditos")) setPageTitle(t('nav.credits'));
    else if (path.includes("/configuracoes")) setPageTitle(t('nav.profile'));
    else if (path.includes("/recursos")) setPageTitle(t('nav.resources'));
    else setPageTitle("Startupideia");
  }, [location.pathname, t]);

  // Check if user has low credits to show notification badge
  useEffect(() => {
    if (authState.user && authState.user.credits < 2) {
      setHasNotifications(true);
    } else {
      setHasNotifications(false);
    }
  }, [authState.user]);
  
  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
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
          
          <div className="ml-auto flex items-center gap-3">
            {/* Search button - Mobile only */}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSearch}>
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Search input - Only show when search is open on mobile */}
            {isSearchOpen && isMobile && (
              <div className="absolute inset-x-0 top-0 bg-background z-50 p-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder={t('search.placeholder') || "Pesquisar ideias..."} 
                    autoFocus
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={toggleSearch}>
                    <span className="sr-only">Close</span>
                    <span aria-hidden="true">&times;</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* Notifications */}
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasNotifications && (
                      <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-red-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>{t('notifications.title') || "Notificações"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hasNotifications && (
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">{t('notifications.lowCredits') || "Créditos baixos"}</span>
                        <span className="text-xs text-muted-foreground">
                          {t('notifications.lowCreditsDesc') || "Seus créditos estão acabando. Adicione mais para continuar analisando ideias."}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {!hasNotifications && (
                    <div className="px-2 py-4 text-center text-muted-foreground">
                      {t('notifications.noNotifications') || "Nenhuma notificação no momento"}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* New Analysis button on desktop only */}
            {!isMobile && (
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-0 h-8 w-8 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00BFFF] to-[#8F00FF] flex items-center justify-center text-white font-bold">
                      {authState.user?.name.charAt(0)}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{authState.user?.name || ""}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/configuracoes">
                      {t('nav.profile') || "Perfil"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => authState.logout()}>
                    {t('nav.logout') || "Sair"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
