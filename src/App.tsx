
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
import { MyContentPage } from "@/pages/dashboard/MyContentPage";
import { CompareIdeasModalProvider } from './components/ideas/CompareIdeasModal';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <CompareIdeasModalProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="ideias" element={<IdeasPage />} />
              <Route path="ideias/:id" element={<IdeaDetailPage />} />
              <Route path="ideias/:id/edit" element={<EditIdeaPage />} />
              <Route path="rascunhos" element={<DraftsPage />} />
              <Route path="ferramentas" element={<ToolsPage />} />
              <Route path="conteudos" element={<MyContentPage />} />
              <Route path="gamificacao" element={<GamificationPage />} />
              <Route path="configuracoes" element={<UserSettingsPage />} />
              <Route path="analise-avancada" element={<AdvancedAnalysisPage />} />
              <Route path="metricas-avancadas" element={<AdvancedMetricsPage />} />
              <Route path="central-recursos" element={<ResourceCenterPage />} />
              <Route path="resultados/:id" element={<ResultsPage />} />
            </Route>
          </Routes>
        </Router>
      </CompareIdeasModalProvider>
    </AuthProvider>
  );
}

export default App;
