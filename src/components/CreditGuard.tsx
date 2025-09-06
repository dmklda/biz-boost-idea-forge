import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreditGuardProps {
  feature: 'basic-analysis' | 'advanced-analysis' | 'regulatory-analysis' | 'simulator' | 'comparison' | 'reanalysis' | 'logo-generator' | 'prd-mvp' | 'pdf-export';
  onProceed?: () => void;
  children: React.ReactNode;
}

export const CreditGuard: React.FC<CreditGuardProps> = ({ 
  feature, 
  onProceed, 
  children 
}) => {
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost, userCredits, userPlan } = usePlanAccess();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleFeatureAccess = () => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user has credits for this feature
    if (!hasCredits(feature)) {
      setShowUpgradeModal(true);
      return;
    }

    // User has credits, proceed with the feature
    if (onProceed) {
      onProceed();
    }
  };

  const cost = getFeatureCost(feature);

  const plans = [
    {
      id: "entrepreneur",
      name: "Empreendedor",
      price: "R$ 4,99",
      credits: "50 créditos mensais",
      description: "Para empreendedores sérios",
      features: ["Marketplace", "Simulador de Cenários", "Análise Regulatória"],
      recommended: true
    },
    {
      id: "business", 
      name: "Empresarial",
      price: "R$ 9,99",
      credits: "200 créditos mensais",
      description: "Para empresas avançadas",
      features: ["Análise Avançada", "Benchmarks", "Suporte Prioritário", "PDF Ilimitado"],
      recommended: false
    }
  ];

  const handleUpgrade = (planId: string) => {
    navigate(`/planos?plan=${planId}`);
  };

  const handleBuyCredits = () => {
    navigate('/dashboard/creditos');
  };

  // Clone children and add onClick handler
  const childrenWithProps = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child, { onClick: handleFeatureAccess } as any)
      : child
  );

  return (
    <>
      {childrenWithProps}
      
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-brand-purple" />
              Créditos Insuficientes
            </DialogTitle>
            <DialogDescription>
              Você precisa de {cost} crédito{cost > 1 ? 's' : ''} para usar esta funcionalidade. 
              Você tem {userCredits} crédito{userCredits !== 1 ? 's' : ''} disponível{userCredits !== 1 ? 'is' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {userPlan === 'free' ? (
              <>
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold mb-2">Escolha seu plano e tenha créditos mensais</h3>
                  <p className="text-muted-foreground">
                    Upgrade para um plano pago e receba créditos todos os meses
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`relative cursor-pointer transition-all hover:scale-[1.02] ${
                        plan.recommended ? 'ring-2 ring-brand-purple/30' : ''
                      }`}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-brand-purple text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            Recomendado
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {plan.name}
                          <span className="text-2xl font-bold">{plan.price}</span>
                        </CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="text-brand-purple font-semibold">{plan.credits}</div>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-brand-purple" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <Button 
                          className="w-full mt-4"
                          variant={plan.recommended ? "default" : "outline"}
                        >
                          Escolher Plano
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold mb-2">Comprar Créditos Adicionais</h3>
                  <p className="text-muted-foreground">
                    Você pode comprar créditos adicionais para continuar usando as funcionalidades
                  </p>
                </div>
                
                <Card className="cursor-pointer transition-all hover:scale-[1.02]" onClick={handleBuyCredits}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand-purple" />
                      Comprar Créditos
                    </CardTitle>
                    <CardDescription>
                      Pacotes de créditos avulsos para usar quando precisar
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Button className="w-full">
                      Ver Pacotes de Créditos
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};