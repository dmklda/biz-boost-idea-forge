
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MenuIcon, X, Rocket } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { LanguageSwitcher } from "./ui/language-switcher";
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`border-b border-border/10 bg-background/70 dark:bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Rocket className="text-brand-purple h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold font-poppins bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            Startupideia
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#como-funciona" className="text-foreground/70 hover:text-brand-purple transition-colors text-sm">
            {t('header.howItWorks')}
          </a>
          <a href="#beneficios" className="text-foreground/70 hover:text-brand-purple transition-colors text-sm">
            {t('header.benefits')}
          </a>
          <a href="#planos" className="text-foreground/70 hover:text-brand-purple transition-colors text-sm">
            {t('header.plans')}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <Button 
            className="bg-brand-purple hover:bg-brand-purple/90 text-white"
            onClick={() => {
              const formElement = document.getElementById('form');
              if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('header.startNow')}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-card/95 dark:bg-card/95 backdrop-blur-md border-t border-border/10 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <a 
              href="#como-funciona" 
              className="text-foreground/80 hover:text-brand-purple transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.howItWorks')}
            </a>
            <a 
              href="#beneficios" 
              className="text-foreground/80 hover:text-brand-purple transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.benefits')}
            </a>
            <a 
              href="#planos" 
              className="text-foreground/80 hover:text-brand-purple transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.plans')}
            </a>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple/90 text-white w-full mt-2"
              onClick={() => {
                const formElement = document.getElementById('form');
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }
              }}
            >
              {t('header.startNow')}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
