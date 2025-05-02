
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  BarChart, 
  CreditCard, 
  Settings, 
  LogOut,
  Calendar,
  PlusCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const DashboardSidebar = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
    },
    {
      title: 'Minhas Ideias',
      icon: Calendar,
      path: '/dashboard/ideias',
    },
    {
      title: 'Nova Análise',
      icon: PlusCircle,
      path: '/',
    },
    {
      title: 'Créditos',
      icon: CreditCard,
      path: '/dashboard/creditos',
    },
    {
      title: 'Planos',
      icon: BarChart,
      path: '/planos',
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/dashboard/configuracoes',
    },
  ];
  
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r px-2",
      collapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="py-4">
        <div className={cn("flex items-center", collapsed ? "justify-center px-2" : "px-4")}>
          {collapsed ? (
            <div className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold">
              I
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold">
                I
              </div>
              <span className="text-lg font-bold">IdeaAnalyzer</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center py-2 px-3 rounded-md transition-colors",
                  isActive 
                    ? "bg-brand-purple/10 text-brand-purple" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed ? "justify-center" : ""
                )}
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
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};
