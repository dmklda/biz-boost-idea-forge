
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Lightbulb, Plus, CreditCard, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IdeaForm } from "@/components/IdeaForm";

export const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = React.useState(false);

  const menuItems = [
    {
      title: t('nav.dashboard'),
      icon: LayoutDashboard,
      path: '/dashboard',
      onClick: undefined
    }, 
    {
      title: t('nav.ideas'),
      icon: Lightbulb,
      path: '/dashboard/ideias',
      onClick: undefined
    }, 
    {
      title: t('dashboard.newAnalysis'),
      icon: Plus,
      path: '#',
      onClick: () => setIsAnalysisDialogOpen(true)
    }, 
    {
      title: t('nav.credits'),
      icon: CreditCard,
      path: '/dashboard/creditos',
      onClick: undefined
    }, 
    {
      title: t('nav.profile'),
      icon: User,
      path: '/dashboard/configuracoes',
      onClick: undefined
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
                to={item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                  isActive ? "text-brand-purple" : "text-muted-foreground",
                )}
                onClick={item.onClick}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.title}</span>
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
            <IdeaForm />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
