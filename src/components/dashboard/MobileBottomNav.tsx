
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Lightbulb, Plus, Wrench, MoreHorizontal, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/ui/LoadingScreen";

export const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { authState } = useAuth();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Handler para impedir fechar o modal durante análise
  const handleDialogOpenChange = (open: boolean) => {
    if (isAnalyzing && !open) return;
    setIsAnalysisDialogOpen(open);
  };

  // Check if user has low credits to show notification badge
  React.useEffect(() => {
    if (authState.user && authState.user.credits < 2) {
      setHasNotifications(true);
    } else {
      setHasNotifications(false);
    }
  }, [authState.user]);

  const menuItems = [
    {
      title: t('ideas.nav.dashboard'),
      icon: LayoutDashboard,
      path: '/dashboard',
      onClick: undefined,
      badge: false
    }, 
    {
      title: t('ideas.nav.ideas'),
      icon: Lightbulb,
      path: '/dashboard/ideias',
      onClick: undefined,
      badge: false
    }, 
    {
      title: t('ideas.nav.tools', 'Ferramentas'), 
      icon: Wrench,
      path: '/dashboard/ferramentas',
      onClick: undefined,
      badge: false
    },
    {
      title: t('ideas.nav.content', "Meus Conteúdos"),
      icon: Archive,
      path: '/dashboard/conteudos',
      onClick: undefined,
      badge: false
    }, 
    {
      title: t('ideas.nav.more', "Ver Mais"),
      icon: MoreHorizontal,
      path: '/dashboard/mais-recursos',
      onClick: undefined,
      badge: false
    }
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.title}
                to={item.onClick ? "#" : item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                  isActive ? "text-brand-purple" : "text-muted-foreground",
                )}
                onClick={item.onClick}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-red-500" />
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-[60px] text-center">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating New Analysis Button - Mobile Only */}
      <Button
        onClick={() => setIsAnalysisDialogOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-brand-purple hover:bg-brand-purple/90 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {isAnalyzing ? (
        <LoadingScreen />
      ) : (
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
      )}
    </>
  );
};
