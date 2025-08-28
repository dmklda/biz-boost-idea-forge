import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminBlogManagement } from '@/components/admin/AdminBlogManagement';
import { 
  AdminGuidesManagement,
  AdminSuccessCasesManagement,
  AdminWebinarsManagement,
  AdminFinancialDashboard,
  AdminUserManagement,
  AdminAnalytics,
  AdminAnnouncements,
  AdminSettings
} from '@/components/admin/AdminPlaceholders';
import { AdminEarlyAdopters } from '@/components/admin/AdminEarlyAdopters';

export default function AdminLayout() {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!authState.user || authState.user.email !== 'marcior631@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'blog':
        return <AdminBlogManagement />;
      case 'guides':
        return <AdminGuidesManagement />;
      case 'success-cases':
        return <AdminSuccessCasesManagement />;
      case 'webinars':
        return <AdminWebinarsManagement />;
      case 'financial':
        return <AdminFinancialDashboard />;
      case 'users':
        return <AdminUserManagement />;
      case 'early-adopters':
        return <AdminEarlyAdopters />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}