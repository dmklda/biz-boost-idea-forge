
import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Bell, Search, Trophy, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIdeasData } from "@/components/ideas";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const DashboardLayout = () => {
  // Extract both authState and logout function
  const { authState, logout } = useAuth();
  const { userLevel } = useGamification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const location = useLocation();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { ideas, loading: ideasLoading } = useIdeasData(authState.user?.id);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, ideas]);

  const handleSearchSelect = (id: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    window.scrollTo(0, 0);
    window.location.href = `/dashboard/ideias/${id}`;
  };

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
  
  return <div className="flex flex-col h-screen bg-background">
      {/* Dashboard layout with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar on non-mobile */}
        {!isMobile && <DashboardSidebar collapsed={sidebarCollapsed} />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b flex items-center px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
            {!isMobile && <Button variant="ghost" size="icon" className="mr-4" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <Menu className="h-5 w-5" />
              </Button>}
            
            <div className="flex items-center">
              {isMobile && (
                <Link to="/">
                  <img src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png" alt="Startup Ideia" className="h-8 w-auto" />
                </Link>
              )}
            </div>
            
            <div className="ml-auto flex items-center gap-3">
              {/* Search button - Mobile only */}

              {isMobile && (
                <>
                  <Button variant="ghost" size="icon" onClick={toggleSearch}>
                    <Search className="h-5 w-5" />
                  </Button>
                  <ThemeToggle />
                </>
              )}

              {/* Notifications button - For mobile */}
              {isMobile && <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {hasNotifications && <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-red-500" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>{t('notifications.title')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hasNotifications && <DropdownMenuItem>
                        <div className="flex flex-col">
                          <span className="font-medium">{t('notifications.lowCredits')}</span>
                          <span className="text-xs text-muted-foreground">
                            {t('notifications.lowCreditsDesc')}
                          </span>
                        </div>
                      </DropdownMenuItem>}
                    {!hasNotifications && <div className="px-2 py-4 text-center text-muted-foreground">
                        {t('notifications.noNotifications')}
                      </div>}
                  </DropdownMenuContent>
                </DropdownMenu>}

              {isSearchOpen && isMobile && (
                <div className="absolute inset-x-0 top-0 bg-background z-50 p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('search.placeholder')}
                      autoFocus
                      className="flex-1"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={toggleSearch}>
                      <span className="sr-only">Close</span>
                      <span aria-hidden="true">&times;</span>
                    </Button>
                  </div>
                  <div className="mt-2 bg-white dark:bg-zinc-900 rounded shadow max-h-72 overflow-y-auto border">
                    {ideasLoading ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">Carregando ideias...</div>
                    ) : searchQuery.trim().length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">Digite para buscar suas ideias</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">Nenhuma ideia encontrada</div>
                    ) : (
                      <ul>
                        {searchResults.map((idea) => (
                          <li key={idea.id}>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-brand-purple/10 focus:bg-brand-purple/20 transition rounded"
                              onClick={() => handleSearchSelect(idea.id)}
                            >
                              <div className="font-medium truncate">{idea.title}</div>
                              <div className="text-xs text-muted-foreground truncate">{idea.description}</div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notifications - Desktop */}
              {!isMobile && <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {hasNotifications && <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-red-500" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>{t('notifications.title')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hasNotifications && <DropdownMenuItem>
                        <div className="flex flex-col">
                          <span className="font-medium">{t('notifications.lowCredits')}</span>
                          <span className="text-xs text-muted-foreground">
                            {t('notifications.lowCreditsDesc')}
                          </span>
                        </div>
                      </DropdownMenuItem>}
                    {!hasNotifications && <div className="px-2 py-4 text-center text-muted-foreground">
                        {t('notifications.noNotifications')}
                      </div>}
                  </DropdownMenuContent>
                </DropdownMenu>}
              
              {/* New Analysis button on desktop only */}
              {!isMobile && <Button variant="ghost" size="icon" onClick={() => setIsAnalysisDialogOpen(true)} className="text-brand-purple">
                  <Plus className="h-5 w-5" />
                </Button>}
              
              {!isMobile && <LanguageSwitcher />}
              {!isMobile && <ThemeToggle />}
              
              <div className="flex items-center gap-2">
                {/* Nome e plano (mantém o layout do dashboard) */}
                {!isMobile && <div className="text-sm hidden md:block">
                    <span className="font-medium">{authState.user?.display_name || authState.user?.name}</span>
                    <div className="text-xs text-muted-foreground">
                      {authState.user?.plan === "free" ? "Plano Free" : "Plano Premium"} • Nível {userLevel?.current_level || 1}
                    </div>
                  </div>}
                {/* Avatar consistente com landing */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-0 h-8 w-8 md:h-10 md:w-10 rounded-full">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
                        {authState.user?.photo_url && (
                          <AvatarImage src={authState.user.photo_url} alt={authState.user.display_name || authState.user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-[#00BFFF] to-[#8F00FF] text-white">
                          {(authState.user?.display_name || authState.user?.name)?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{authState.user?.display_name || authState.user?.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {authState.user?.plan === "free" ? "Plano Free" : "Plano Premium"} • Nível {userLevel?.current_level || 1}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/gamificacao" className="flex items-center cursor-pointer">
                        <Trophy className="mr-2 h-4 w-4" />
                        Progresso
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/configuracoes" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
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
                <IdeaForm onAnalysisComplete={() => setIsAnalysisDialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>;
};

export default DashboardLayout;
