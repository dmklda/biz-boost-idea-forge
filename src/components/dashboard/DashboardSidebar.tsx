
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEarlyAdopter } from "@/hooks/useEarlyAdopter";
import { Home, BarChart, Settings, LogOut, Calendar, PlusCircle, Save, Wrench, Archive, Trophy, Users, BarChart3, Shield, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useState } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

export const DashboardSidebar = ({
  collapsed = false
}: {
  collapsed?: boolean;
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();
  const { isEarlyAdopter } = useEarlyAdopter();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handler para impedir fechar o modal durante análise
  const handleDialogOpenChange = (open: boolean) => {
    if (isAnalyzing && !open) return;
    setIsAnalysisDialogOpen(open);
  };

  const handleNewAnalysis = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnalysisDialogOpen(true);
  };

  const menuItems = [
    {
      title: t('ideas.nav.dashboard'),
      icon: Home,
      path: '/dashboard',
      onClick: undefined
    }, 
    {
      title: t('ideas.nav.ideas'),
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
      title: t('ideas.nav.drafts', "Drafts"),
      icon: Save,
      path: '/dashboard/rascunhos',
      onClick: undefined
    },
    {
      title: t('ideas.nav.tools', 'Tools'),
      icon: Wrench,
      path: '/dashboard/ferramentas',
      onClick: undefined
    },
    {
      title: t('ideas.nav.content', "Meus Conteúdos"),
      icon: Archive,
      path: '/dashboard/conteudos',
      onClick: undefined
    },
    {
      title: t('ideas.nav.gamification', "Gamification"),
      icon: Trophy,
      path: '/dashboard/gamificacao',
      onClick: undefined
    },
    {
      title: t('ideas.nav.marketplace', "Marketplace"),
      icon: Users,
      path: '/dashboard/marketplace',
      onClick: undefined
    },
    ...(isEarlyAdopter ? [{
      title: t('ideas.nav.earlyAdopter', "Early Adopter Dashboard"),
      icon: Star,
      path: '/dashboard/early-adopter',
      onClick: undefined
    }] : []),
    {
      title: t('ideas.nav.simulator', "Simulator"),
      icon: BarChart3,
      path: '/dashboard/simulador',
      onClick: undefined
    },
    {
      title: t('ideas.nav.regulatoryAnalysis', "Regulatory Analysis"),
      icon: Shield,
      path: '/dashboard/analise-regulatoria',
      onClick: undefined
    },
    {
      title: t('ideas.nav.benchmarks', "Benchmarks"),
      icon: Target,
      path: '/dashboard/benchmarks',
      onClick: undefined
    }, 
    {
      title: t('header.plans', "Plans"),
      icon: BarChart,
      path: '/planos',
      onClick: undefined
    }, 
    {
      title: t('ideas.nav.profile'),
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
    <div className={cn("flex flex-col h-full bg-background border-r", collapsed ? "w-[70px]" : "w-[240px]")}>
      <div className="py-4">
        <div className={cn("flex items-center justify-center px-2", collapsed ? "" : "px-4")}>
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
      
      <div className="flex-1 px-2 py-4">
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
      
      <div className="py-4 px-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full flex items-center text-muted-foreground hover:text-foreground", 
            collapsed ? "justify-center p-2" : "justify-start p-3"
          )} 
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
          {!collapsed && <span>{t('ideas.nav.logout')}</span>}
        </Button>
      </div>

      {isAnalyzing ? (
        <LoadingScreen />
      ) : (
        <>
          {/* New Analysis Dialog */}
          <Dialog open={isAnalysisDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('ideaForm.title')}</DialogTitle>
                <DialogDescription>
                  {t('ideaForm.subtitle')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <IdeaForm 
                  onAnalysisComplete={() => setIsAnalysisDialogOpen(false)}
                  onAnalysisStateChange={setIsAnalyzing}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
