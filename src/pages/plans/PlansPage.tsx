
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";

const PlansPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState, updateUserPlan } = useAuth();
  const { formatPrice } = useCurrency();
  
  // Define billing cycles and discounts
  type BillingCycle = 'monthly' | 'quarterly' | 'annual';
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  
  const ANNUAL_DISCOUNT = 0.25; // 25% discount
  const QUARTERLY_DISCOUNT = 0.1; // 10% discount
  
  // Plan base prices (monthly)
  const basePrices = {
    free: 0,
    basic: 19.90,
    pro: 49.90
  };
  
  // Calculate price based on billing cycle
  const calculatePrice = (basePrice: number, cycle: BillingCycle): { price: number, period: string, savings?: string } => {
    switch(cycle) {
      case 'annual':
        return {
          price: basePrice * (1 - ANNUAL_DISCOUNT),
          period: t('pricing.perMonth', '/mês') + ' ' + t('pricing.billedAnnually', '(cobrado anualmente)'),
          savings: t('pricing.save', 'Economize') + ' 25%'
        };
      case 'quarterly':
        return {
          price: basePrice * (1 - QUARTERLY_DISCOUNT),
          period: t('pricing.perMonth', '/mês') + ' ' + t('pricing.billedQuarterly', '(cobrado trimestralmente)'),
          savings: t('pricing.save', 'Economize') + ' 10%'
        };
      default:
        return {
          price: basePrice,
          period: t('pricing.perMonth', '/mês')
        };
    }
  };
  
  // Credit packages
  const creditPackages = [
    { id: 1, amount: 5, price: "$24.90", savings: "" },
    { id: 2, amount: 10, price: "$44.90", savings: "10% de desconto" },
    { id: 3, amount: 25, price: "$99.90", savings: "20% de desconto" },
  ];
  
  // Plans with features
  const plans = [
    {
      id: "free",
      name: t('pricing.free.name', 'Free'),
      ...calculatePrice(basePrices.free, billingCycle),
      features: [
        t('pricing.free.feature1', '1 análise básica grátis'),
        t('pricing.free.feature2', 'Compartilhamento de ideias'),
        t('pricing.free.feature3', 'Acesso à comunidade')
      ],
      buttonText: t('pricing.free.cta', 'Começar Grátis'),
      recommended: false,
      color: "from-gray-400/20 to-gray-500/30"
    },
    {
      id: "basic",
      name: t('pricing.basic.name', 'Basic'),
      ...calculatePrice(basePrices.basic, billingCycle),
      features: [
        t('pricing.basic.feature1', '5 análises básicas por mês'),
        t('pricing.basic.feature2', 'Comparação de ideias com IA'),
        t('pricing.basic.feature3', 'Chat com IA para aprimoramento'),
        t('pricing.basic.feature4', 'Compartilhamento de ideias'),
        t('pricing.basic.feature5', 'Acesso à comunidade')
      ],
      buttonText: t('pricing.basic.cta', 'Assinar Agora'),
      recommended: true,
      color: "from-brand-purple/20 via-indigo-500/20 to-brand-purple/30"
    },
    {
      id: "pro",
      name: t('pricing.pro.name', 'Pro'),
      ...calculatePrice(basePrices.pro, billingCycle),
      features: [
        t('pricing.pro.feature1', 'Análises básicas ilimitadas'),
        t('pricing.pro.feature2', 'Análises avançadas detalhadas'),
        t('pricing.pro.feature3', 'Comparação de ideias com IA'),
        t('pricing.pro.feature4', 'Download de PDF gratuito'),
        t('pricing.pro.feature5', 'Chat com IA ilimitado'),
        t('pricing.pro.feature6', 'Suporte prioritário'),
        t('pricing.pro.feature7', 'Acesso a webinars exclusivos')
      ],
      buttonText: t('pricing.pro.cta', 'Upgrade para Pro'),
      recommended: false,
      color: "from-blue-600/20 via-indigo-600/20 to-blue-600/30"
    }
  ];
  
  const handleSelectPlan = (planId: string) => {
    // In a real app, this would redirect to a payment gateway
    
    updateUserPlan(planId as 'free' | 'basic' | 'pro' | 'enterprise');
    toast.success(t('pricing.planActivated', 'Plano ativado com sucesso!'));
    navigate("/dashboard");
  };

  const handleBuyCredits = (packageId: number, amount: number) => {
    // In a real app, this would redirect to a payment gateway
    toast.success(t('credits.buySuccess', `${amount} créditos adicionados com sucesso!`));
    navigate("/dashboard/creditos");
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      <div className="container mx-auto px-4 py-16 z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
              {t('pricing.chooseYourPlan', 'Escolha seu plano')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {authState.user ? `${t('pricing.hello', 'Olá')} ${authState.user.name}, ` : ""}
              {t('pricing.choosePlanDescription', 'Escolha o plano ideal para analisar suas ideias de negócio')}
            </p>
          </div>
          
          {/* Billing cycle selector */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-brand-purple text-white' 
                  : 'bg-foreground/5 hover:bg-foreground/10'
              }`}
            >
              {t('pricing.monthly', 'Mensal')}
            </button>
            
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'quarterly' 
                  ? 'bg-brand-purple text-white' 
                  : 'bg-foreground/5 hover:bg-foreground/10'
              }`}
            >
              {t('pricing.quarterly', 'Trimestral')}
              <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30" variant="secondary">
                -10%
              </Badge>
            </button>
            
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'annual' 
                  ? 'bg-brand-purple text-white' 
                  : 'bg-foreground/5 hover:bg-foreground/10'
              }`}
            >
              {t('pricing.annually', 'Anual')}
              <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30" variant="secondary">
                -25%
              </Badge>
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
                      {t('pricing.recommended', 'Recomendado')}
                    </div>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <Badge className="mt-2 bg-green-500/20 text-green-500" variant="secondary">
                      {plan.savings}
                    </Badge>
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
                    className={`w-full ${
                      plan.recommended 
                        ? "bg-brand-purple hover:bg-brand-purple/90" 
                        : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                    }`}
                    disabled={authState.user?.plan === plan.id}
                  >
                    {authState.user?.plan === plan.id 
                      ? t('pricing.currentPlan', 'Plano atual') 
                      : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="pt-12">
            <h2 className="text-2xl font-bold text-center mb-6">
              {t('pricing.creditsTitle', 'Pacotes de Créditos')}
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('pricing.creditsDescription', 'Compre créditos adicionais para usar recursos específicos sem precisar atualizar seu plano')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {creditPackages.map((pkg) => (
                <Card key={pkg.id} className="backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.amount} {t('pricing.credits', 'Créditos')}</CardTitle>
                    <div className="text-3xl font-bold mt-2">{pkg.price}</div>
                    {pkg.savings && (
                      <Badge className="mt-2 bg-green-500/20 text-green-500" variant="secondary">
                        {pkg.savings}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={() => handleBuyCredits(pkg.id, pkg.amount)}
                      className="w-full bg-brand-purple hover:bg-brand-purple/90"
                    >
                      {t('pricing.buyCredits', 'Comprar Créditos')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
