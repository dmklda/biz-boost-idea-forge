import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';
import { PlanType } from '@/hooks/usePlanAccess';

interface PlanGateProps {
  requiredPlan: PlanType;
  feature: string;
  description?: string;
  children?: React.ReactNode;
}

const PLAN_INFO = {
  entrepreneur: {
    name: 'Empreendedor',
    price: 'R$ 19,90/mês',
    icon: Crown,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
  },
  business: {
    name: 'Empresarial', 
    price: 'R$ 49,90/mês',
    icon: Zap,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  free: {
    name: 'Gratuito',
    price: 'R$ 0/mês',
    icon: Lock,
    color: 'bg-gradient-to-r from-gray-400 to-gray-600'
  }
};

export const PlanGate: React.FC<PlanGateProps> = ({ 
  requiredPlan, 
  feature, 
  description,
  children 
}) => {
  const { t } = useTranslation();
  const planInfo = PLAN_INFO[requiredPlan];
  const Icon = planInfo.icon;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Icon className="h-5 w-5" />
          {feature}
        </CardTitle>
        <CardDescription>
          {description || `Esta funcionalidade requer o plano ${planInfo.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Badge 
          variant="secondary" 
          className={`${planInfo.color} text-white px-4 py-2`}
        >
          Plano {planInfo.name} - {planInfo.price}
        </Badge>
        
        <div className="text-sm text-muted-foreground">
          {children}
        </div>
        
        <Button asChild className="w-full">
          <a href="/planos">
            Fazer Upgrade
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};