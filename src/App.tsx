
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { supabase } from './integrations/supabase/client';
import Index from './pages/Index';
import PlansPage from './pages/plans/PlansPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import IdeasPage from './pages/dashboard/IdeasPage';
import IdeaDetailPage from './pages/dashboard/IdeaDetailPage';
import EditIdeaPage from './pages/dashboard/EditIdeaPage';
import UserSettingsPage from './pages/dashboard/UserSettingsPage';
import AdvancedAnalysisPage from './pages/dashboard/AdvancedAnalysisPage';
import AdvancedMetricsPage from './pages/dashboard/AdvancedMetricsPage';
import ResourceCenterPage from './pages/dashboard/ResourceCenterPage';
import ResultsPage from './pages/dashboard/ResultsPage';
import ToolsPage from './pages/dashboard/ToolsPage';
import DraftsPage from './pages/dashboard/DraftsPage';
import GamificationPage from './pages/dashboard/GamificationPage';
import MarketplacePage from './pages/dashboard/MarketplacePage';
import ScenarioSimulatorPage from './pages/dashboard/ScenarioSimulatorPage';
import RegulatoryAnalysisPage from './pages/dashboard/RegulatoryAnalysisPage';
import BenchmarksPage from './pages/dashboard/BenchmarksPage';
import { MyContentPage } from "@/pages/dashboard/MyContentPage";
import { MoreFeaturesPage } from "@/pages/dashboard/MoreFeaturesPage";
import { CompareIdeasModalProvider } from './components/ideas/CompareIdeasModal';
import { AuthProvider } from './hooks/useAuth';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import TermsOfUsePage from './pages/company/TermsOfUsePage';
import PrivacyPolicyPage from './pages/company/PrivacyPolicyPage';
import AboutUsPage from './pages/company/AboutUsPage';
import ContactPage from './pages/company/ContactPage';
import NotFound from './pages/NotFound';
import IdeasHistoryPage from './pages/dashboard/IdeasHistoryPage';
import CreditsPage from './pages/dashboard/CreditsPage';
import BlogPage from './pages/resources/BlogPage';
import BlogPostPage from './pages/resources/BlogPostPage';
import GuidesPage from './pages/resources/GuidesPage';
import GuideDetailPage from './pages/resources/GuideDetailPage';
import SuccessCasesPage from './pages/resources/SuccessCasesPage';
import SuccessCaseDetailPage from './pages/resources/SuccessCaseDetailPage';
import WebinarsPage from './pages/resources/WebinarsPage';
import WebinarDetailPage from './pages/resources/WebinarDetailPage';
import ApiPage from './pages/platform/ApiPage';
import ResultsPageStandalone from './pages/ResultsPage';
import ExampleAnalysisResult from './pages/ExampleAnalysisResult';
import AdminLayout from './pages/admin/AdminLayout';
import EarlyAdopterDashboard from './pages/dashboard/EarlyAdopterDashboard';

function App() {
  return (
    <AuthProvider>
      <CompareIdeasModalProvider>
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/planos" element={<PlansPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />

              {/* Páginas institucionais */}
              <Route path="/company/TermsOfUsePage" element={<TermsOfUsePage />} />
              <Route path="/company/PrivacyPolicyPage" element={<PrivacyPolicyPage />} />
              <Route path="/company/AboutUsPage" element={<AboutUsPage />} />
              <Route path="/company/ContactPage" element={<ContactPage />} />

              {/* Recursos e Blog */}
              <Route path="/recursos/blog" element={<BlogPage />} />
              <Route path="/recursos/blog/:slug" element={<BlogPostPage />} />
              <Route path="/recursos/guias" element={<GuidesPage />} />
              <Route path="/recursos/guias/:slug" element={<GuideDetailPage />} />
              <Route path="/recursos/casos-de-sucesso" element={<SuccessCasesPage />} />
              <Route path="/recursos/casos-de-sucesso/:slug" element={<SuccessCaseDetailPage />} />
              <Route path="/recursos/webinars" element={<WebinarsPage />} />
              <Route path="/recursos/webinars/:slug" element={<WebinarDetailPage />} />

              {/* Página de API */}
              <Route path="/plataforma/api" element={<ApiPage />} />

              {/* Página de resultados standalone (fora do dashboard) */}
              <Route path="/resultados" element={<ResultsPageStandalone />} />

              {/* Página de exemplo de análise de resultados */}
              <Route path="/example-analysis-result" element={<ExampleAnalysisResult />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="ideias" element={<IdeasPage />} />
                <Route path="ideias/:id" element={<IdeaDetailPage />} />
                <Route path="ideias/:id/edit" element={<EditIdeaPage />} />
                <Route path="historico" element={<IdeasHistoryPage />} />
                <Route path="rascunhos" element={<DraftsPage />} />
                <Route path="ferramentas" element={<ToolsPage />} />
                <Route path="conteudos" element={<MyContentPage />} />
                <Route path="gamificacao" element={<GamificationPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="simulador" element={<ScenarioSimulatorPage />} />
                <Route path="analise-regulatoria" element={<RegulatoryAnalysisPage />} />
                <Route path="benchmarks" element={<BenchmarksPage />} />
                <Route path="creditos" element={<CreditsPage />} />
                <Route path="configuracoes" element={<UserSettingsPage />} />
                <Route path="mais-recursos" element={<MoreFeaturesPage />} />
                <Route path="analise-avancada" element={<AdvancedAnalysisPage />} />
                <Route path="metricas-avancadas" element={<AdvancedMetricsPage />} />
                <Route path="central-recursos" element={<ResourceCenterPage />} />
                <Route path="resultados/:id" element={<ResultsPage />} />
                <Route path="early-adopter" element={<EarlyAdopterDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />} />

              {/* Fallback para 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </TooltipProvider>
      </CompareIdeasModalProvider>
    </AuthProvider>
  );
}

export default App;
