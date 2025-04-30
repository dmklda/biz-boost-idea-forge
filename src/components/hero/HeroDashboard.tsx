
import { useTranslation } from 'react-i18next';
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";

const HeroDashboard = () => {
  const { t } = useTranslation();
  
  return (
    <div className="perspective-card glassmorphism rounded-xl overflow-hidden transform hover:-rotate-y-2 hover:scale-[1.01] transition-all duration-500">
      <div className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V21M12 16L18 21M12 16L6 21M18 8V3M18 8L12 3M18 8L21 10.5M6 8V3M6 8L12 3M6 8L3 10.5M3 10.5V16.5L12 12L21 16.5V10.5M3 10.5L12 6L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-medium text-lg">{t('hero.dashboard.title')}</h3>
            </div>
            <span className="text-green-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('hero.dashboard.status')}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-lg border border-white/10 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-brand-purple/20 to-brand-purple rounded-lg flex items-center justify-center">
                    <div className="h-4 w-4 bg-gradient-to-br from-brand-purple to-indigo-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Análise de Mercado</h4>
                    <p className="text-xs text-muted-foreground">Em progresso</p>
                  </div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="h-2 bg-brand-purple/20 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-brand-purple to-indigo-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-lg border border-white/10 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-brand-blue/20 to-brand-blue rounded-lg flex items-center justify-center">
                    <div className="h-4 w-4 bg-gradient-to-br from-brand-blue to-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Viabilidade Financeira</h4>
                    <p className="text-xs text-muted-foreground">Em análise</p>
                  </div>
                </div>
                <span className="text-sm font-medium">62%</span>
              </div>
              <div className="h-2 bg-brand-blue/20 rounded-full overflow-hidden">
                <div className="h-full w-[62%] bg-gradient-to-r from-brand-blue to-sky-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-md rounded-lg border border-white/10 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500/20 to-purple-500 rounded-lg flex items-center justify-center">
                    <div className="h-4 w-4 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Análise Competitiva</h4>
                    <p className="text-xs text-muted-foreground">Concluída</p>
                  </div>
                </div>
                <span className="text-sm font-medium">100%</span>
              </div>
              <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100/10 dark:border-gray-700/30">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gradient-premium mb-1">92%</div>
              <div className="text-xs text-muted-foreground">Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gradient-premium mb-1">15k+</div>
              <div className="text-xs text-muted-foreground">Análises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gradient-premium mb-1">24h</div>
              <div className="text-xs text-muted-foreground">Média</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
