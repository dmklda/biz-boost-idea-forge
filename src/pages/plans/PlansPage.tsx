import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/auth";

const PlansPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState, updateUserPlan } = useAuth();
  const { getSavedIdeaData } = useIdeaForm();
  
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "R$0",
      period: "/mês",
      features: [
        "3 análises de ideias por mês",
        "Relatório básico",
        "Acesso à comunidade",
      ],
      buttonText: "Começar Grátis",
      recommended: false,
      color: "from-gray-400/20 to-gray-500/30"
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$49,90",
      period: "/mês",
      features: [
        "Análises ilimitadas",
        "Relatórios detalhados",
        "Suporte prioritário",
        "Ferramentas avançadas",
        "Acesso a webinars exclusivos",
      ],
      buttonText: "Assinar Agora",
      recommended: true,
      color: "from-brand-purple/20 via-indigo-500/20 to-brand-purple/30"
    }
  ];
  
  const handleSelectPlan = (planId: string) => {
    // In a real app, this would redirect to a payment gateway
    // For demo purposes, we'll just update the user's plan
    
    if (planId === "free") {
      updateUserPlan("free");
      toast.success("Plano gratuito ativado!");
    } else {
      updateUserPlan("pro");
      toast.success("Plano Pro ativado!");
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
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
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
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
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
                        : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                    }`}
                  >
                    {plan.buttonText}
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
