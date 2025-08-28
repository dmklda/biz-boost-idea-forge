
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MenuIcon, X, ArrowRight, LogIn, User, LayoutDashboard, Settings, LogOut, Trophy } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { LanguageSwitcher } from "./ui/language-switcher";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGamification } from "@/hooks/useGamification";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  hideNavLinks?: boolean;
}

const Header = ({ hideNavLinks = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { authState, logout } = useAuth();
  const { userLevel } = useGamification();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      // On mobile, smart redirect based on auth state - never go to landing page
      if (authState.isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
    // On desktop, normal behavior (Link to="/")
  };

  return (
    <header className={`border-b ${scrolled ? 'border-border/30' : 'border-transparent'} fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-background/60 dark:bg-background/60 backdrop-blur-xl shadow-sm' : 'py-5 bg-transparent'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          {isMobile ? (
            <button
              onClick={handleLogoClick}
              className={`transition-all duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}
            >
              <img src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png" alt="Startup Ideia Logo" className="h-8 md:h-8 w-auto" />
            </button>
          ) : (
            <Link to="/" className={`transition-all duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
              <img src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png" alt="Startup Ideia Logo" className="h-8 md:h-8 w-auto" />
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {!hideNavLinks && (
            <>
              <a href="#como-funciona" className="text-foreground/70 hover:text-brand-purple transition-colors text-sm relative group">
                {t('header.howItWorks')}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </a>
              <a href="#beneficios" className="text-foreground/70 hover:text-brand-purple transition-colors text-sm relative group">
                {t('header.benefits')}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </a>
              <a href="#planos" className="text-foreground/70 hover:text-brand-purple transition-colors text-sm relative group">
                {t('header.plans')}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </a>
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          
          {/* Conditional rendering based on authentication status */}
          {authState.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
                    {authState.user?.photo_url && (
                      <AvatarImage src={authState.user.photo_url} alt={authState.user.display_name || authState.user.name} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-[#00BFFF] to-[#8F00FF] text-white">
                      {(authState.user?.display_name || authState.user?.name)?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm">{authState.user?.display_name || authState.user?.name}</span>
                    <div className="text-xs text-muted-foreground">
                      {authState.user?.plan === "free" ? "Plano Free" : "Plano Premium"} • Nível {userLevel?.current_level || 1}
                    </div>
                  </div>
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
                  <Link to="/dashboard" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                </DropdownMenuItem>
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
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
              
              <Button className="btn-premium" onClick={() => {
                const formElement = document.getElementById('form');
                if (formElement) formElement.scrollIntoView({
                  behavior: 'smooth'
                });
              }}>
                {t('header.startNow')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          
          {/* Show user avatar if logged in */}
          {authState.isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="p-0 h-8 w-8 rounded-full">
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
                  <Link to="/dashboard" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                </DropdownMenuItem>
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
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"} className="relative z-30">
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-6 px-4 fixed inset-0 z-20 bg-background/95 dark:bg-black/95 backdrop-blur-lg animate-fade-in pt-24">
          <nav className="flex flex-col space-y-6">
            {!hideNavLinks && (
              <>
                <a href="#como-funciona" className="text-foreground hover:text-brand-purple transition-colors py-3 text-xl font-semibold" onClick={() => setIsMenuOpen(false)}>
                  {t('header.howItWorks')}
                </a>
                <a href="#beneficios" className="text-foreground hover:text-brand-purple transition-colors py-3 text-xl font-semibold" onClick={() => setIsMenuOpen(false)}>
                  {t('header.benefits')}
                </a>
                <a href="#planos" className="text-foreground hover:text-brand-purple transition-colors py-3 text-xl font-semibold" onClick={() => setIsMenuOpen(false)}>
                  {t('header.plans')}
                </a>
              </>
            )}
            
            {/* Conditional rendering based on authentication status for mobile */}
            {authState.isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 py-3 text-xl font-semibold text-foreground hover:text-brand-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {t('nav.dashboard')}
                </Link>
                <Link 
                  to="/dashboard/gamificacao" 
                  className="flex items-center gap-2 py-3 text-xl font-semibold text-foreground hover:text-brand-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Trophy className="h-5 w-5" />
                  Progresso
                </Link>
                <Link 
                  to="/dashboard/configuracoes" 
                  className="flex items-center gap-2 py-3 text-xl font-semibold text-foreground hover:text-brand-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  {t('nav.profile')}
                </Link>
                <button 
                  className="flex items-center gap-2 py-3 text-xl font-semibold text-foreground hover:text-brand-purple transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 py-3 text-xl font-semibold text-foreground hover:text-brand-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
                
                <Button className="bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-brand-purple/90 hover:to-indigo-600/90 text-white w-full mt-2 py-6 text-lg" onClick={() => {
                  const formElement = document.getElementById('form');
                  if (formElement) {
                    formElement.scrollIntoView({
                      behavior: 'smooth'
                    });
                    setIsMenuOpen(false);
                  }
                }}>
                  {t('header.startNow')}
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
