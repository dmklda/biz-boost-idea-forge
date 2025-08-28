import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/use-currency";
import { toast } from "@/components/ui/sonner";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

const PlansPage = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { authState, updateUserPlan } = useAuth();
  const { getSavedIdeaData } = useIdeaForm();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);
  
  // Helper function to safely get features with fallback
  const getFeaturesTranslation = (key: string): string[] => {
    try {
      const features = t(`${key}`, { returnObjects: true });
      if (Array.isArray(features)) {
        return features.filter((feature): feature is string => 
          typeof feature === 'string'
        );
      }
      return ['Feature 1', 'Feature 2', 'Feature 3'];
    } catch (error) {
      return ['Feature 1', 'Feature 2', 'Feature 3'];
    }
  };

  const plans = [
    {
      id: "free",
      name: t('pricing.free.name') || 'Gratuito',
      price: formatPrice(0),
      monthlyPrice: 0,
      annualPrice: 0,
      period: "",
      description: t('pricing.free.description') || 'Para iniciantes que querem validar sua primeira ideia.',
      features: getFeaturesTranslation('pricing.free.features'),
      buttonText: t('pricing.free.cta') || 'Começar Grátis',
      recommended: false,
      color: "from-gray-400/20 to-gray-500/30"
    },
    {
      id: "entrepreneur",
      name: t('pricing.entrepreneur.name') || 'Empreendedor',
      price: formatPrice(annualBilling ? 14.90 : 19.90),
      monthlyPrice: 19.90,
      annualPrice: 14.90,
      period: t('pricing.period') || '/mês',
      description: t('pricing.entrepreneur.description') || 'Para empreendedores sérios que querem análises detalhadas.',
      features: getFeaturesTranslation('pricing.entrepreneur.features'),
      buttonText: t('pricing.entrepreneur.cta') || 'Assinar Agora',
      recommended: true,
      color: "from-brand-purple/20 via-indigo-500/20 to-brand-purple/30"
    },
    {
      id: "business",
      name: t('pricing.business.name') || 'Empresarial',
      price: formatPrice(annualBilling ? 39.90 : 49.90),
      monthlyPrice: 49.90,
      annualPrice: 39.90,
      period: t('pricing.period') || '/mês',
      description: t('pricing.business.description') || 'Para empresas que precisam de análises avançadas e suporte prioritário.',
      features: getFeaturesTranslation('pricing.business.features'),
      buttonText: t('pricing.business.cta') || 'Falar com Vendas',
      recommended: false,
      color: "from-blue-600/20 via-indigo-600/20 to-blue-600/30"
    }
  ];
  
  const handleSelectPlan = async (planId: string) => {
    if (!authState.isAuthenticated) {
      toast.error("Você precisa estar logado para selecionar um plano");
      navigate("/login");
      return;
    }

    // Check if user is already on this plan
    const currentPlan = authState.user?.plan || "free";
    const userPlanId = currentPlan === "free" ? "free" : "entrepreneur";
    
    if (planId === userPlanId) {
      toast.info(`Você já está no plano ${plans.find(p => p.id === planId)?.name}!`);
      return;
    }

    if (planId === "free") {
      // Downgrade to free plan
      try {
        const updatedUser = {
          ...authState.user!,
          plan: "free" as const
        };
        
        updateUserPlan("free");
        toast.success("Plano alterado para Gratuito!");
      } catch (error) {
        console.error("Error downgrading plan:", error);
        toast.error("Erro ao alterar o plano. Tente novamente.");
      }
      return;
    }

    // Check if there's saved idea data to continue analysis
    const savedData = getSavedIdeaData();
    if (savedData) {
      setIsAnalyzing(true);
      
      try {
        // Simulate plan upgrade
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user plan
        const updatedUser = {
          ...authState.user!,
          plan: "pro" as const
        };
        
        updateUserPlan("pro");
        toast.success(`Plano ${plans.find(p => p.id === planId)?.name} ativado com sucesso!`);
        
        // Navigate to results page
        navigate("/resultados");
      } catch (error) {
        console.error("Error upgrading plan:", error);
        toast.error("Erro ao ativar o plano. Tente novamente.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // No saved data, just upgrade plan
      try {
        const updatedUser = {
          ...authState.user!,
          plan: "pro" as const
        };
        
        updateUserPlan("pro");
        toast.success(`Plano ${plans.find(p => p.id === planId)?.name} ativado com sucesso!`);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error upgrading plan:", error);
        toast.error("Erro ao ativar o plano. Tente novamente.");
      }
    }
  };

  // Get current user plan
  const getCurrentUserPlan = () => {
    if (!authState.isAuthenticated) return null;
    const currentPlan = authState.user?.plan || "free";
    return currentPlan === "free" ? "free" : "entrepreneur";
  };

  const currentUserPlan = getCurrentUserPlan();
  
  if (isAnalyzing) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-premium opacity-80"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
      
      <Header hideNavLinks={true} />
      
      <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="inline-block text-sm font-medium bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full mb-4">
              {t('pricing.tagline') || 'Preços'}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
              {t('pricing.title') || 'Planos e Preços'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
              {authState.user ? `Olá ${authState.user.name}, ` : ""}
              {t('pricing.subtitle') || 'Escolha o plano que melhor se adequa às suas necessidades empreendedoras'}
            </p>
            
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-4 text-sm font-medium ${!annualBilling ? 'text-brand-purple' : 'text-muted-foreground'}`}>
                {t('pricing.monthly') || 'Mensal'}
              </span>
              <button
                onClick={() => setAnnualBilling(!annualBilling)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 ${
                  annualBilling ? 'bg-brand-purple' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    annualBilling ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-4 text-sm font-medium ${annualBilling ? 'text-brand-purple' : 'text-muted-foreground'}`}>
                {t('pricing.annually') || 'Anual'}
              </span>
              {annualBilling && (
                <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30" variant="secondary">
                  -25%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                  currentUserPlan === plan.id 
                    ? 'ring-2 ring-green-500/50 bg-green-50/50 dark:bg-green-900/20' 
                    : plan.recommended 
                    ? 'ring-2 ring-brand-purple/30' 
                    : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-20`} />
                
                {currentUserPlan === plan.id && (
                  <div className="absolute top-0 left-0">
                    <div className="bg-green-500 text-white px-4 py-1 rounded-br-xl rounded-tl-lg shadow-md flex items-center space-x-1">
                      <Check className="h-4 w-4 mr-1" />
                      Plano Atual
                    </div>
                  </div>
                )}
                
                {plan.recommended && currentUserPlan !== plan.id && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-brand-purple to-indigo-600 text-white px-6 py-1 rounded-bl-xl rounded-tr-lg shadow-md flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {t('pricing.mostPopular') || 'Mais Popular'}
                    </div>
                  </div>
                )}
                
                {plan.recommended && currentUserPlan === plan.id && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-brand-purple to-indigo-600 text-white px-6 py-1 rounded-bl-xl shadow-md flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {t('pricing.mostPopular') || 'Mais Popular'}
                    </div>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl flex items-center">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-end gap-1 mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                  {annualBilling && plan.monthlyPrice > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(plan.monthlyPrice)}{plan.period}
                      </span>
                      <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30" variant="secondary">
                        -25%
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className={`h-5 w-5 rounded-full ${
                          plan.recommended ? 'bg-brand-purple/20' : 'bg-foreground/10'
                        } flex items-center justify-center mr-3 mt-0.5 shrink-0`}>
                          <Check className={`h-3 w-3 ${
                            plan.recommended ? 'text-brand-purple' : 'text-foreground/70'
                          }`} />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="relative z-10">
                  <Button 
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={currentUserPlan === plan.id}
                    className={`w-full ${
                      currentUserPlan === plan.id
                        ? "bg-green-500/20 text-green-500 cursor-not-allowed"
                        : plan.recommended 
                        ? "bg-brand-purple hover:bg-brand-purple/90" 
                        : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                    }`}
                  >
                    {currentUserPlan === plan.id ? "Plano Atual" : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlansPage;
