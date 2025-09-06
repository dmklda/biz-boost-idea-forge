import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lightbulb, LogIn, UserPlus, CreditCard, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import IdeaForm from './IdeaForm';

interface SmartIdeaFormProps {
  ideaId?: string;
  isReanalyzing?: boolean;
  onAnalysisStateChange?: (isAnalyzing: boolean) => void;
  onAnalysisComplete?: () => void;
}

export const SmartIdeaForm: React.FC<SmartIdeaFormProps> = (props) => {
  const { authState } = useAuth();
  const { hasCredits, userCredits, userPlan } = usePlanAccess();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const feature = props.isReanalyzing ? 'reanalysis' : 'basic-analysis';

  // If user is not authenticated, show auth options
  if (!authState.isAuthenticated) {
    return (
      <section id="form" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Lightbulb className="h-6 w-6 text-brand-purple" />
                  Analise sua Ideia
                </CardTitle>
                <CardDescription>
                  Faça login ou registre-se para analisar suas ideias gratuitamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="h-16 flex flex-col gap-1"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Fazer Login</span>
                    <span className="text-xs text-muted-foreground">Já tem conta</span>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/register')}
                    className="h-16 flex flex-col gap-1"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Criar Conta</span>
                    <span className="text-xs opacity-80">É grátis!</span>
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-brand-purple/10 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-brand-purple font-semibold mb-2">
                    <Zap className="h-4 w-4" />
                    Primeira análise gratuita
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Registre-se agora e ganhe sua primeira análise completa gratuitamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // If user doesn't have credits, show upgrade options
  if (!hasCredits(feature)) {
    return (
      <section id="form" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <CreditCard className="h-6 w-6 text-brand-purple" />
                  Créditos Insuficientes
                </CardTitle>
                <CardDescription>
                  Você tem {userCredits} crédito{userCredits !== 1 ? 's' : ''} disponível{userCredits !== 1 ? 'is' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userPlan === 'free' ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Faça upgrade para um plano pago e receba créditos mensais
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => navigate('/planos?plan=entrepreneur')}
                        variant="outline"
                        className="h-20 flex flex-col gap-1"
                      >
                        <span className="font-semibold">Empreendedor</span>
                        <span className="text-sm text-brand-purple">R$ 4,99/mês</span>
                        <span className="text-xs text-muted-foreground">50 créditos mensais</span>
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/planos?plan=business')}
                        className="h-20 flex flex-col gap-1 relative"
                      >
                        <Badge className="absolute -top-2 right-2 text-xs">
                          Melhor
                        </Badge>
                        <span className="font-semibold">Empresarial</span>
                        <span className="text-sm opacity-80">R$ 9,99/mês</span>
                        <span className="text-xs opacity-70">200 créditos mensais</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Compre créditos adicionais para continuar
                    </p>
                    
                    <Button 
                      onClick={() => navigate('/dashboard/creditos')}
                      className="w-full h-16"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Comprar Créditos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // User is authenticated and has credits, show the normal form
  return <IdeaForm {...props} />;
};