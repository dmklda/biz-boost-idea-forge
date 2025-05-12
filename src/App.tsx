
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n/config';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from "@/components/ui/sonner";

// Import page components
import LandingPage from './pages/Index';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import IdeasPage from './pages/dashboard/IdeasPage';
import IdeasHistoryPage from './pages/dashboard/IdeasHistoryPage';
import UserSettingsPage from './pages/dashboard/UserSettingsPage';
import CreditsPage from './pages/dashboard/CreditsPage';
import ResourceCenterPage from './pages/dashboard/ResourceCenterPage';
import AdvancedMetricsPage from './pages/dashboard/AdvancedMetricsPage';
import PricingPage from './pages/plans/PlansPage';
import IdeaDetailPage from './pages/dashboard/IdeaDetailPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import NotFound from './pages/NotFound';

// Adicionar essas importações
import DraftsPage from "./pages/dashboard/DraftsPage";
import EditDraftPage from "./pages/dashboard/EditDraftPage";
import ReanalyzeIdeaPage from "./pages/dashboard/ReanalyzeIdeaPage";

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const { authState } = useAuth();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage && i18n.language !== storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]);

  // Authentication wrapper
  const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return authState.isAuthenticated ? (
      <>{children}</>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="planos" element={<PricingPage />} />
          </Route>

          {/* Dashboard Routes - Protected */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="ideias" element={<IdeasPage />} />
            <Route path="historico" element={<IdeasHistoryPage />} />
            <Route path="configuracoes" element={<UserSettingsPage />} />
            <Route path="creditos" element={<CreditsPage />} />
            <Route path="recursos" element={<ResourceCenterPage />} />
            <Route path="metricas" element={<AdvancedMetricsPage />} />
            <Route path="ideias/:id" element={<IdeaDetailPage />} />
            
            {/* Novas rotas */}
            <Route path="rascunhos" element={<DraftsPage />} />
            <Route path="rascunho/:draftId" element={<EditDraftPage />} />
            <Route path="idea/:ideaId/reanalise" element={<ReanalyzeIdeaPage />} />
          </Route>
          
          {/* Catch all routes - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
    </Router>
  );
};

export default App;
