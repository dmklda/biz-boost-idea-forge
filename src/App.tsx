
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResultsPage from "./pages/ResultsPage";
import '@/i18n/config';
import { I18nextProvider } from "react-i18next";
import i18n from './i18n/config';
import { AuthProvider } from "./hooks/useAuth";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import PlansPage from "./pages/plans/PlansPage";

// Dashboard pages
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import IdeasPage from "./pages/dashboard/IdeasPage";
import CreditsPage from "./pages/dashboard/CreditsPage";

// Platform pages
import ApiPage from "./pages/platform/ApiPage";

// Resources pages
import BlogPage from "./pages/resources/BlogPage";
import BlogPostPage from "./pages/resources/BlogPostPage";
import GuidesPage from "./pages/resources/GuidesPage";
import GuideDetailPage from "./pages/resources/GuideDetailPage";
import SuccessCasesPage from "./pages/resources/SuccessCasesPage";
import SuccessCaseDetailPage from "./pages/resources/SuccessCaseDetailPage";
import WebinarsPage from "./pages/resources/WebinarsPage";

// Company pages
import AboutUsPage from "./pages/company/AboutUsPage";
import ContactPage from "./pages/company/ContactPage";
import PrivacyPolicyPage from "./pages/company/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/company/TermsOfUsePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1
    }
  }
});

// Obtendo o tema armazenado para inicialização
const getStoredTheme = (): "dark" | "light" | "system" => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("theme") as "dark" | "light" | "system" || "system";
  }
  return "system";
};

const App = () => {
  // Aplicando o tema no corpo do documento para evitar flash ao carregar
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme={getStoredTheme()} storageKey="theme">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner theme="system" />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/resultados" element={<ResultsPage />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/registro" element={<RegisterPage />} />
                  <Route path="/planos" element={<PlansPage />} />
                  
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="ideias" element={<IdeasPage />} />
                    <Route path="creditos" element={<CreditsPage />} />
                  </Route>
                  
                  {/* Platform Pages */}
                  <Route path="/plataforma/api" element={<ApiPage />} />
                  
                  {/* Resources Pages */}
                  <Route path="/recursos/blog" element={<BlogPage />} />
                  <Route path="/recursos/blog/:id" element={<BlogPostPage />} />
                  <Route path="/recursos/guias" element={<GuidesPage />} />
                  <Route path="/recursos/guias/:id" element={<GuideDetailPage />} />
                  <Route path="/recursos/casos-de-sucesso" element={<SuccessCasesPage />} />
                  <Route path="/recursos/casos-de-sucesso/:id" element={<SuccessCaseDetailPage />} />
                  <Route path="/recursos/webinars" element={<WebinarsPage />} />
                  
                  {/* Company Pages */}
                  <Route path="/empresa/sobre-nos" element={<AboutUsPage />} />
                  <Route path="/empresa/contato" element={<ContactPage />} />
                  <Route path="/empresa/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                  <Route path="/empresa/termos-de-uso" element={<TermsOfUsePage />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;
