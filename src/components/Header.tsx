
import { useState } from "react";
import { Button } from "./ui/button";
import { MenuIcon, X, Rocket } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { LanguageSwitcher } from "./ui/language-switcher";
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center">
            <Rocket className="text-brand-blue h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold font-poppins bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">
              Startupideia
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#como-funciona" className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors">
            {t('header.howItWorks')}
          </a>
          <a href="#beneficios" className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors">
            {t('header.benefits')}
          </a>
          <a href="#planos" className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors">
            {t('header.plans')}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <Button 
            className="bg-brand-blue hover:bg-brand-blue/90 text-white"
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
        <div className="md:hidden py-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <nav className="flex flex-col space-y-4">
            <a 
              href="#como-funciona" 
              className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.howItWorks')}
            </a>
            <a 
              href="#beneficios" 
              className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.benefits')}
            </a>
            <a 
              href="#planos" 
              className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.plans')}
            </a>
            <Button 
              className="bg-brand-blue hover:bg-brand-blue/90 text-white w-full"
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
