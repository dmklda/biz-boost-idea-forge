
import { useState } from "react";
import { Button } from "./ui/button";
import { MenuIcon, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">
            IdeiaForge
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#como-funciona" className="text-gray-600 hover:text-brand-blue transition-colors">
            Como Funciona
          </a>
          <a href="#beneficios" className="text-gray-600 hover:text-brand-blue transition-colors">
            Benefícios
          </a>
          <a href="#planos" className="text-gray-600 hover:text-brand-blue transition-colors">
            Planos
          </a>
          <Button 
            className="bg-brand-blue hover:bg-brand-blue/90"
            onClick={() => {
              const formElement = document.getElementById('form');
              if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Começar Agora
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
        <div className="md:hidden py-4 px-4 bg-white border-t border-gray-100">
          <nav className="flex flex-col space-y-4">
            <a 
              href="#como-funciona" 
              className="text-gray-600 hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </a>
            <a 
              href="#beneficios" 
              className="text-gray-600 hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Benefícios
            </a>
            <a 
              href="#planos" 
              className="text-gray-600 hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Planos
            </a>
            <Button 
              className="bg-brand-blue hover:bg-brand-blue/90 w-full"
              onClick={() => {
                const formElement = document.getElementById('form');
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }
              }}
            >
              Começar Agora
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
