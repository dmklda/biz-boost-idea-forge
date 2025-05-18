
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANS } from "@/utils/creditSystem";
import { User } from "@/types/auth";

const PlansPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState, updateUserPlan } = useAuth();
  const { getSavedIdeaData } = useIdeaForm();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  
  const getPriceByPeriod = (plan: (typeof PLANS)[number]) => {
    switch(billingPeriod) {
      case 'quarterly': return plan.quarterlyPrice || plan.monthlyPrice;
      case 'annual': return plan.annualPrice || plan.monthlyPrice;
      default: return plan.monthlyPrice;
    }
  };
  
  const getDiscount = (period: 'quarterly' | 'annual') => {
    return period === 'quarterly' ? '10%' : '25%';
  };
  
  const handleSelectPlan = (planId: string) => {
    // In a real app, this would redirect to a payment gateway
    // For demo purposes, we'll just update the user's plan
    
    if (planId === "free" || planId === "basic" || planId === "pro") {
      updateUserPlan(planId as User['plan']);
      toast.success(`Plano ${planId} ativado!`);
    } else {
      toast.error("Plano inválido");
      return;
    }
    
    // Check if there's a saved idea to analyze
    const savedData = getSavedIdeaData();
    
    if (savedData) {
      // Redirect to results if there's saved data
      navigate("/resultados");
    } else {
      // Otherwise go to dashboard
      navigate("/dashboard");
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      <div className="container mx-auto px-4 py-16 z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
              Escolha seu plano
            </h1>
            <p className="text-xl text-muted-foreground">
              {authState.user ? `Olá ${authState.user.name}, ` : ""}
              Escolha o plano ideal para analisar suas ideias de negócio
            </p>
            
            <div className="flex justify-center mt-8">
              <Tabs 
                defaultValue="monthly" 
                className="w-full max-w-md"
                onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'quarterly' | 'annual')}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="monthly">Mensal</TabsTrigger>
                  <TabsTrigger value="quarterly">
                    Trimestral
                    <span className="ml-1.5 text-xs bg-green-500/20 text-green-700 px-1.5 py-0.5 rounded-full">-10%</span>
                  </TabsTrigger>
                  <TabsTrigger value="annual">
                    Anual
                    <span className="ml-1.5 text-xs bg-green-500/20 text-green-700 px-1.5 py-0.5 rounded-full">-25%</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                  plan.recommended ? 'ring-2 ring-brand-purple/30' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-20`} />
                
                {plan.recommended && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-brand-purple to-indigo-600 text-white px-6 py-1 rounded-bl-xl rounded-tr-lg shadow-md flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Recomendado
                    </div>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{getPriceByPeriod(plan)}</span>
                    <span className="text-muted-foreground ml-1">
                      {billingPeriod === 'monthly' ? '/mês' : 
                       billingPeriod === 'quarterly' ? '/trimestre' : '/ano'}
                    </span>
                    
                    {billingPeriod !== 'monthly' && plan.id !== 'free' && (
                      <div className="text-xs text-green-500 mt-1">
                        Economize {getDiscount(billingPeriod)}
                      </div>
                    )}
                  </div>
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
                    className={`w-full ${
                      plan.recommended 
                        ? "bg-brand-purple hover:bg-brand-purple/90" 
                        : plan.id === "basic"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                    }`}
                  >
                    {plan.id === "free" ? "Começar Grátis" : "Assinar Agora"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
