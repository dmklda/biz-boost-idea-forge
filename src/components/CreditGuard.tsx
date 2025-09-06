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
  feature: 'basic-analysis' | 'advanced-analysis' | 'regulatory-analysis' | 'simulator' | 'comparison' | 'reanalysis' | 'logo-generator' | 'prd-mvp' | 'pdf-export' | 'marketplace' | 'benchmarks';
  onProceed?: () => void;
  children: React.ReactNode;
}

export const CreditGuard: React.FC<CreditGuardProps> = ({ 
  feature, 
  onProceed, 
  children 
}) => {
  const { authState } = useAuth();
  const { hasCredits, getFeatureCost, canAccessFeature, hasFeatureAccess, userCredits, userPlan } = usePlanAccess();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleFeatureAccess = () => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user has enough credits for this feature
    if (!hasCredits(feature)) {
      setShowUpgradeModal(true);
      return;
    }

    // User has access and credits, proceed with the feature
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
        <DialogContent className="sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle className="flex items-center justify-center sm:justify-start gap-3 text-xl sm:text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Créditos Insuficientes
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left text-sm sm:text-base mt-2">
              Você precisa de <span className="font-semibold text-brand-purple">{cost} crédito{cost > 1 ? 's' : ''}</span> para usar esta funcionalidade. 
              <br />
              Você tem <span className="font-semibold">{userCredits} crédito{userCredits !== 1 ? 's' : ''}</span> disponível{userCredits !== 1 ? 'is' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 mt-6">
            {userPlan === 'free' ? (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border border-brand-purple/20 mb-4">
                    <Zap className="h-4 w-4 text-brand-purple" />
                    <span className="text-sm font-medium text-brand-purple">Upgrade Recomendado</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Escolha seu plano e tenha créditos mensais</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Upgrade para um plano pago e receba créditos todos os meses automaticamente
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
                        plan.recommended 
                          ? 'ring-2 ring-brand-purple/30 shadow-lg border-brand-purple/20' 
                          : 'hover:border-brand-purple/20'
                      }`}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg px-3 py-1">
                            <Zap className="h-3 w-3 mr-1.5" />
                            Mais Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="pb-4">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-xl font-bold">{plan.name}</span>
                          <div className="text-right">
                            <span className="text-2xl sm:text-3xl font-bold text-brand-purple">{plan.price}</span>
                            <span className="text-sm text-muted-foreground block">/mês</span>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-sm">{plan.description}</CardDescription>
                        <div className="inline-flex items-center gap-2 mt-3 p-2 rounded-lg bg-brand-purple/5 border border-brand-purple/10">
                          <CreditCard className="h-4 w-4 text-brand-purple" />
                          <span className="text-brand-purple font-semibold text-sm">{plan.credits}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                              <div className="mt-0.5 p-0.5 rounded-full bg-brand-purple/10">
                                <ArrowRight className="h-3 w-3 text-brand-purple" />
                              </div>
                              <span className="leading-5">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Button 
                          className={`w-full h-11 font-semibold transition-all ${
                            plan.recommended 
                              ? "bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 shadow-lg" 
                              : ""
                          }`}
                          variant={plan.recommended ? "default" : "outline"}
                        >
                          {plan.recommended ? "Escolher Plano Recomendado" : "Escolher Plano"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 border border-brand-blue/20 mb-4">
                    <CreditCard className="h-4 w-4 text-brand-blue" />
                    <span className="text-sm font-medium text-brand-blue">Opções de Crédito</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Como deseja obter mais créditos?</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Escolha entre comprar créditos avulsos ou fazer upgrade do seu plano
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Credit Purchase Option */}
                  <Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-brand-blue/30 group" onClick={handleBuyCredits}>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center mb-3">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">💳 Comprar Créditos</CardTitle>
                      <CardDescription className="text-sm">
                        Compre apenas os créditos que precisa agora
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="space-y-2 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                          <span className="text-xs font-medium text-brand-blue">A partir de R$ 2,99</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pagamento único • Sem compromisso mensal
                        </p>
                      </div>
                      <Button className="w-full h-10 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 font-semibold">
                        Ver Pacotes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Upgrade Option */}
                  <Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-brand-purple/30 group relative" onClick={() => handleUpgrade('entrepreneur')}>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg px-2 py-1 text-xs">
                        Melhor Valor
                      </Badge>
                    </div>
                    
                    <CardHeader className="text-center pt-6">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center mb-3">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">🚀 Fazer Upgrade</CardTitle>
                      <CardDescription className="text-sm">
                        Tenha créditos mensais inclusos
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="space-y-2 mb-4">
                        <div className="text-lg font-bold text-brand-purple">R$ 47/mês</div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20">
                          <span className="text-xs font-medium text-brand-purple">100 créditos mensais</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Renovação automática • Cancele quando quiser
                        </p>
                      </div>
                      <Button className="w-full h-10 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 font-semibold">
                        Fazer Upgrade
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)} 
                className="flex-1 h-11"
              >
                Talvez Depois
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};