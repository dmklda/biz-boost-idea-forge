import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Trophy, 
  DollarSign, 
  Users, 
  Star, 
  BarChart3, 
  Megaphone,
  Settings,
  ArrowLeft,
  BookOpen,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema'
  },
  {
    id: 'blog',
    label: 'Blog & Notícias',
    icon: FileText,
    description: 'Gerenciar posts do blog'
  },
  {
    id: 'guides',
    label: 'Guias',
    icon: BookOpen,
    description: 'Guias práticos e tutoriais'
  },
  {
    id: 'success-cases',
    label: 'Casos de Sucesso',
    icon: Trophy,
    description: 'Estudos de caso'
  },
  {
    id: 'webinars',
    label: 'Webinars',
    icon: Video,
    description: 'Webinars e eventos'
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: DollarSign,
    description: 'Receitas e métricas'
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    description: 'Gerenciar usuários'
  },
  {
    id: 'early-adopters',
    label: 'Early Adopters',
    icon: Star,
    description: 'Aprovar/gerenciar adopters'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Dados e relatórios'
  },
  {
    id: 'announcements',
    label: 'Anúncios',
    icon: Megaphone,
    description: 'Comunicados aos usuários'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    description: 'Configurações do sistema'
  }
];

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  return (
    <div className="w-80 bg-card border-r border-border p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Painel de administração avançado
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          Super Admin
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{item.label}</div>
                <div className={cn(
                  "text-xs mt-1 line-clamp-2",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 bg-accent/50 rounded-lg">
        <h3 className="font-medium text-sm mb-3">Status do Sistema</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sistema</span>
            <Badge variant="outline" className="text-xs">Online</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última atualização</span>
            <span>Agora</span>
          </div>
        </div>
      </div>
    </div>
  );
};