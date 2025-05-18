
import { Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from 'react-i18next';
import { useCurrency } from "@/hooks/use-currency";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Pricing = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [annualBilling, setAnnualBilling] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { authState, updateUserPlan } = useAuth();

  // Define the discount rates
  const ANNUAL_DISCOUNT = 0.25; // 25% discount for annual billing
  const QUARTERLY_DISCOUNT = 0.1; // 10% discount for quarterly billing
  
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

  // Define billing cycles
  type BillingCycle = 'monthly' | 'quarterly' | 'annual';
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  
  // Apply discount based on billing cycle
  const applyDiscount = (price: number): number => {
    if (billingCycle === 'annual') return price * (1 - ANNUAL_DISCOUNT);
    if (billingCycle === 'quarterly') return price * (1 - QUARTERLY_DISCOUNT);
    return price;
  };

  // Define plan prices
  const planPrices = {
    free: 0,
    basic: 19.90,
    pro: 49.90,
  };
  
  // Plans data with updated features
  const plans = [
    {
      id: "free",
      name: t('pricing.free.name', 'Free'),
      price: formatPrice(0),
      monthlyPrice: 0,
      quarterlyPrice: 0,
      annualPrice: 0,
      description: t('pricing.free.description', 'Para validar sua primeira ideia gratuitamente.'),
      features: [
        t('pricing.free.feature1', '1 análise básica grátis'),
        t('pricing.free.feature2', 'Compartilhamento de ideias'),
        t('pricing.free.feature3', 'Acesso à comunidade')
      ],
      cta: t('pricing.free.cta', 'Começar Grátis'),
      popular: false,
      gradient: "from-gray-400/20 to-gray-500/30"
    },
    {
      id: "basic",
      name: t('pricing.basic.name', 'Basic'),
      price: formatPrice(applyDiscount(planPrices.basic)),
      monthlyPrice: planPrices.basic,
      quarterlyPrice: planPrices.basic * 3 * (1 - QUARTERLY_DISCOUNT),
      annualPrice: planPrices.basic * 12 * (1 - ANNUAL_DISCOUNT),
      period: t('pricing.period', '/mês'),
      description: t('pricing.basic.description', 'Para empreendedores com múltiplas ideias.'),
      features: [
        t('pricing.basic.feature1', '5 análises básicas por mês'),
        t('pricing.basic.feature2', 'Comparação de ideias com IA'),
        t('pricing.basic.feature3', 'Chat com IA para aprimoramento'),
        t('pricing.basic.feature4', 'Compartilhamento de ideias'),
        t('pricing.basic.feature5', 'Acesso à comunidade')
      ],
      cta: t('pricing.basic.cta', 'Assinar Agora'),
      popular: true,
      gradient: "from-brand-purple/20 via-indigo-500/20 to-brand-purple/30"
    },
    {
      id: "pro",
      name: t('pricing.pro.name', 'Pro'),
      price: formatPrice(applyDiscount(planPrices.pro)),
      monthlyPrice: planPrices.pro,
      quarterlyPrice: planPrices.pro * 3 * (1 - QUARTERLY_DISCOUNT),
      annualPrice: planPrices.pro * 12 * (1 - ANNUAL_DISCOUNT),
      period: t('pricing.period', '/mês'),
      description: t('pricing.pro.description', 'Para profissionais e empresas que precisam de análises avançadas.'),
      features: [
        t('pricing.pro.feature1', 'Análises básicas ilimitadas'),
        t('pricing.pro.feature2', 'Análises avançadas detalhadas'),
        t('pricing.pro.feature3', 'Comparação de ideias com IA'),
        t('pricing.pro.feature4', 'Download de PDF gratuito'),
        t('pricing.pro.feature5', 'Chat com IA ilimitado'),
        t('pricing.pro.feature6', 'Suporte prioritário'),
        t('pricing.pro.feature7', 'Acesso a webinars exclusivos')
      ],
      cta: t('pricing.pro.cta', 'Upgrade para Pro'),
      popular: false,
      gradient: "from-blue-600/20 via-indigo-600/20 to-blue-600/30"
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (!authState.isAuthenticated) {
      navigate('/auth/login', { state: { redirect: '/planos', plan: planId } });
      return;
    }
    
    // In a real app, this would redirect to a payment gateway
    updateUserPlan(planId as 'free' | 'basic' | 'pro' | 'enterprise');
    navigate('/dashboard');
  };

  return (
    <section id="planos" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-premium opacity-80"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full mb-4">
            {t('pricing.tagline', 'Planos & Preços')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
            {t('pricing.title', 'Escolha o plano ideal para você')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            {t('pricing.subtitle', 'Escolha o plano que melhor se adapta às suas necessidades empreendedoras')}
          </p>

          {/* Billing cycle selector */}
          <div className="flex items-center justify-center gap-4 mb-12">
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
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            // Calculate price based on cycle
            let displayPrice = plan.monthlyPrice;
            let displayPeriod = t('pricing.perMonth', '/mês');
            
            if (billingCycle === 'quarterly') {
              displayPrice = plan.quarterlyPrice / 3;
              displayPeriod = t('pricing.perMonth', '/mês') + ' ' + t('pricing.billed', '(cobrado trimestralmente)');
            } else if (billingCycle === 'annual') {
              displayPrice = plan.annualPrice / 12;
              displayPeriod = t('pricing.perMonth', '/mês') + ' ' + t('pricing.billed', '(cobrado anualmente)');
            }
            
            // Format the display price
            const formattedPrice = plan.id === 'free' ? formatPrice(0) : formatPrice(displayPrice);
            
            return (
              <Card 
                key={index} 
                className={`relative backdrop-blur-sm shadow-xl transition-all duration-300 overflow-hidden ${
                  hoveredIndex === index ? 'scale-[1.02]' : 'scale-100'
                } ${
                  plan.popular ? 'border-brand-purple/50 ring-1 ring-brand-purple/30' : 'border-white/10 dark:border-white/5'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {plan.gradient && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-20 dark:opacity-30`}></div>
                )}
                
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-brand-purple to-indigo-600 text-white px-6 py-1 rounded-bl-xl rounded-tr-lg shadow-md flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {t('pricing.mostPopular', 'Mais Popular')}
                    </div>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl flex items-center">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-end gap-1 mt-4">
                    <span className="text-4xl font-bold">{formattedPrice}</span>
                    {plan.id !== 'free' && <span className="text-muted-foreground mb-1">{displayPeriod}</span>}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <Button 
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full ${
                        plan.popular 
                          ? "btn-premium" 
                          : "bg-foreground/10 hover:bg-foreground/20 text-foreground backdrop-blur-sm"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <ul className="space-y-4 mt-6">
                    {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className={`h-5 w-5 rounded-full ${
                          plan.popular ? 'bg-brand-purple/20' : 'bg-foreground/10'
                        } flex items-center justify-center mr-3 mt-0.5 shrink-0`}>
                          <Check className={`h-3 w-3 ${
                            plan.popular ? 'text-brand-purple' : 'text-foreground/70'
                          }`} />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">
            {t('pricing.creditsTitle', 'Pacotes de Créditos')}
          </h3>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('pricing.creditsDescription', 'Compre créditos adicionais para usar recursos específicos sem precisar atualizar seu plano')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { 
                amount: 5, 
                price: formatPrice(24.90), 
                savings: '' 
              },
              { 
                amount: 10, 
                price: formatPrice(44.90), 
                savings: t('pricing.discount10', '10% de desconto') 
              },
              { 
                amount: 25, 
                price: formatPrice(99.90), 
                savings: t('pricing.discount20', '20% de desconto') 
              }
            ].map((pkg, i) => (
              <Card key={i} className="backdrop-blur-sm">
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
                  <Button className="w-full bg-brand-purple hover:bg-brand-purple/90">
                    {t('pricing.buyCredits', 'Comprar Créditos')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
