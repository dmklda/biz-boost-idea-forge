
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client';
import LandingPage from './pages/Index';
import PlansPage from './pages/plans/PlansPage';
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
import { MyContentPage } from "@/pages/dashboard/MyContentPage";
import { CompareIdeasModalProvider } from './components/ideas/CompareIdeasModal';

function App() {
  return (
    <CompareIdeasModalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route
            path="/login"
            element={
              <div className="flex justify-center items-center h-screen">
                <div className="w-full max-w-md">
                  <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']}
                    redirectTo={`${window.location.origin}/dashboard`}
                  />
                </div>
              </div>
            }
          />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="ideias" element={<IdeasPage />} />
            <Route path="ideias/:id" element={<IdeaDetailPage />} />
            <Route path="ideias/:id/edit" element={<EditIdeaPage />} />
            <Route path="rascunhos" element={<DraftsPage />} />
            <Route path="ferramentas" element={<ToolsPage />} />
            <Route path="conteudos" element={<MyContentPage />} />
            <Route path="configuracoes" element={<UserSettingsPage />} />
            <Route path="analise-avancada" element={<AdvancedAnalysisPage />} />
            <Route path="metricas-avancadas" element={<AdvancedMetricsPage />} />
            <Route path="central-recursos" element={<ResourceCenterPage />} />
            <Route path="resultados/:id" element={<ResultsPage />} />
          </Route>
        </Routes>
      </Router>
    </CompareIdeasModalProvider>
  );
}

export default App;
