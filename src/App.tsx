
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResultsPage from "./pages/ResultsPage";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import '@/i18n/config';

const queryClient = new QueryClient();

const LanguageInitializer = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem("i18nextLng");
    if (savedLanguage && savedLanguage.length > 1) {
      console.log("Inicializando idioma:", savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      console.log("Nenhum idioma salvo encontrado, usando padrão");
    }
  }, [i18n]);
  
  return <>{children}</>;
};

// Obtendo o tema armazenado para inicialização
const getStoredTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("startupideia-theme") as "dark" | "light" | "system" || "system";
  }
  return "system";
};

const App = () => {
  // Aplicando o tema no corpo do documento para evitar flash ao carregar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = getStoredTheme();
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={getStoredTheme()} storageKey="startupideia-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner theme="system" />
          <LanguageInitializer>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/resultados" element={<ResultsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LanguageInitializer>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
