
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Home, BarChart, CreditCard, Settings, LogOut, Calendar, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useState } from "react";

export const DashboardSidebar = ({
  collapsed = false
}: {
  collapsed?: boolean;
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);

  const handleNewAnalysis = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnalysisDialogOpen(true);
  };

  const menuItems = [
    {
      title: t('nav.dashboard'),
      icon: Home,
      path: '/dashboard',
      onClick: undefined
    }, 
    {
      title: t('nav.ideas'),
      icon: Calendar,
      path: '/dashboard/ideias',
      onClick: undefined
    }, 
    {
      title: t('dashboard.newAnalysis'),
      icon: PlusCircle,
      path: '#',
      onClick: handleNewAnalysis
    }, 
    {
      title: t('nav.credits'),
      icon: CreditCard,
      path: '/dashboard/creditos',
      onClick: undefined
    }, 
    {
      title: t('header.plans'),
      icon: BarChart,
      path: '/planos',
      onClick: undefined
    }, 
    {
      title: t('nav.profile'),
      icon: Settings,
      path: '/dashboard/configuracoes',
      onClick: undefined
    }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className={cn("flex flex-col h-full bg-background border-r px-2", collapsed ? "w-[70px]" : "w-[240px]")}>
      <div className="py-4">
        <div className={cn("flex items-center", collapsed ? "justify-center px-2" : "px-4")}>
          {collapsed ? (
            <Link to="/">
              <img src="/lovable-uploads/1d922337-e8ee-440b-afed-32d32a6a045a.png" alt="Startup Ideia" className="h-8 w-auto" />
            </Link>
          ) : (
            <div className="flex items-center">
              <Link to="/">
                <img src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png" alt="Startup Ideia" className="h-8 w-auto" />
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <nav className="flex flex-col gap-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path + item.title} 
                to={item.path} 
                className={cn(
                  "flex items-center py-2 px-3 rounded-md transition-colors", 
                  isActive ? "bg-brand-purple/10 text-brand-purple" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed ? "justify-center" : ""
                )}
                onClick={item.onClick}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="py-4">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full flex items-center text-muted-foreground hover:text-foreground", 
            collapsed ? "justify-center p-2" : "justify-start p-3"
          )} 
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </Button>
      </div>

      {/* New Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('ideaForm.title')}</DialogTitle>
            <DialogDescription>
              {t('ideaForm.subtitle')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <IdeaForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
