import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageLoading } from "@/components/ui/message-loading";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

function SpiralLoader() {
  const dots = 8;
  const radius = 20;
  const colors = [
    "bg-brand-purple",
    "bg-brand-blue",
    "bg-brand-green",
    "bg-brand-purple",
    "bg-brand-blue",
    "bg-brand-green",
    "bg-brand-purple",
    "bg-brand-blue"
  ];
  return (
    <div className="relative h-16 w-16">
      {[...Array(dots)].map((_, index) => {
        const angle = (index / dots) * (2 * Math.PI);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return (
          <motion.div
            key={index}
            className={`absolute h-3 w-3 rounded-full ${colors[index % colors.length]}`}
            style={{
              left: `calc(50% + ${x}px)` ,
              top: `calc(50% + ${y}px)` ,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: (index / dots) * 1.5,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * LoadingScreen - tela de loading moderna e multilíngue.
 * @param message Mensagem principal (ex: "Analisando sua ideia...")
 * @param subMessage Mensagem secundária (ex: "Isso pode levar alguns segundos. Por favor, aguarde...")
 * @param tips Array de dicas/mensagens motivacionais para exibir ciclicamente durante o loading
 *
 * Exemplo de uso:
 * <LoadingScreen message={t('ideaForm.analyzing')} subMessage={t('loading.wait')} />
 */
interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  tips?: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, subMessage, tips }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const tipsArray = tips && tips.length > 0
    ? tips
    : [
        t('loading.tip1', 'Dica: Foque no problema real do seu cliente!'),
        t('loading.tip2', 'Motivação: Grandes negócios começam com pequenas ideias.'),
        t('loading.tip3', 'Dica: Valide sua ideia com pessoas reais.'),
        t('loading.tip4', 'Motivação: Persistência é o segredo do sucesso!'),
        t('loading.tip5', 'Dica: Analise seus concorrentes para se diferenciar.'),
        t('loading.tip6', 'Motivação: Cada passo é um avanço rumo ao seu sonho!'),
      ];
  const [tipIndex, setTipIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tipsArray.length);
    }, 3000);
    
    // Safety timeout for mobile - automatically hide after 30 seconds
    timeoutRef.current = setTimeout(() => {
      console.warn("LoadingScreen: Safety timeout reached, hiding loading screen");
      setIsVisible(false);
    }, 30000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tipsArray.length]);

  // Hide loading screen when navigation happens (especially important for mobile)
  useEffect(() => {
    if (location.pathname.includes('/resultados/')) {
      console.log("LoadingScreen: Navigation to results detected, hiding loading screen");
      setIsVisible(false);
    }
  }, [location.pathname]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-brand-purple/10 via-background to-brand-blue/10 p-4 pt-20">
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center gap-6 border border-brand-purple/10 w-full max-w-md sm:max-w-none">
        {/* Spiral loader */}
        <SpiralLoader />
        <p className="text-xl font-semibold text-brand-purple text-center animate-fade-in">
          {message || t('common.loading', 'Carregando')}
        </p>
        <p className="text-sm text-muted-foreground text-center animate-fade-in-slow mt-2">
          {subMessage || t('loading.wait', 'Isso pode levar alguns segundos. Por favor, aguarde...')}
        </p>
        <div className="mt-4 min-h-[32px]">
          <p className="text-base text-brand-blue text-center animate-fade-in" key={tipIndex}>
            {tipsArray[tipIndex]}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-slow { animation: fade-in 1.5s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 