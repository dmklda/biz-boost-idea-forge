
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-mesh-pattern opacity-5"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent"></div>
      
      {/* Top wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden -translate-y-1/2 opacity-10 pointer-events-none">
        <div className="w-[200%] h-full bg-brand-purple rounded-[100%] relative -top-3/4"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between mb-16">
            <div className="md:w-1/3 mb-10 md:mb-0 pr-4">
              <div className="flex items-center mb-6">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-brand-purple/20 blur-md rounded-full"></div>
                  <div className="relative h-10 w-10 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/f0d454ac-a2f6-40e5-843c-c4c7257679aa.png" 
                      alt="Startupideia Logo" 
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#3A8DFF] to-[#8F00FF] bg-clip-text text-transparent">
                  Startupideia
                </h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="flex space-x-5">
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:w-2/3">
              <div>
                <h4 className="font-semibold text-lg mb-6 text-white/90">{t('footer.platform')}</h4>
                <ul className="space-y-4">
                  <li>
                    <Link to="/como-funciona" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.howItWorks')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/beneficios" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.benefits')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/planos" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.plans')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/plataforma/api" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.api')}
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-6 text-white/90">{t('footer.resources')}</h4>
                <ul className="space-y-4">
                  <li>
                    <Link to="/recursos/blog" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.blog')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/recursos/guias" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.guides')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/recursos/casos-de-sucesso" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.successCases')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/recursos/webinars" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.webinars')}
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-6 text-white/90">{t('footer.company')}</h4>
                <ul className="space-y-4">
                  <li>
                    <Link to="/empresa/sobre-nos" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.aboutUs')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresa/contato" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresa/politica-de-privacidade" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.privacyPolicy')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/empresa/termos-de-uso" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex">
                      {t('footer.termsOfUse')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800/50 mt-10 pt-8 text-sm text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {currentYear} Startupideia. {t('footer.copyright')}</p>
              <div className="mt-4 md:mt-0 flex gap-6">
                <Link to="/empresa/politica-de-privacidade" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link>
                <span className="hidden md:inline">|</span>
                <Link to="/empresa/termos-de-uso" className="hover:text-white transition-colors">{t('footer.termsOfUse')}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
