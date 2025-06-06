import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Lightbulb, Plus, Wrench, User, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { authState } = useAuth();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = React.useState(false);
  const [hasNotifications, setHasNotifications] = React.useState(false);

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
      title: t('nav.dashboard'),
      icon: LayoutDashboard,
      path: '/dashboard',
      onClick: undefined,
      badge: false
    }, 
    {
      title: t('nav.ideas'),
      icon: Lightbulb,
      path: '/dashboard/ideias',
      onClick: undefined,
      badge: false
    }, 
    {
      title: t('nav.tools', 'Ferramentas'),
      icon: Wrench,
      path: '/dashboard/ferramentas',
      onClick: undefined,
      badge: false
    },
    {
      title: "Conteúdos",
      icon: Archive,
      path: '/dashboard/conteudos',
      onClick: undefined,
      badge: false
    }, 
    {
      title: t('nav.profile'),
      icon: User,
      path: '/dashboard/configuracoes',
      onClick: undefined,
      badge: hasNotifications
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
            <IdeaForm onAnalysisComplete={() => setIsAnalysisDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
