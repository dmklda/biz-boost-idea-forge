
import { Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from 'react-i18next';
import { useCurrency } from "@/hooks/use-currency";
import { useState } from "react";
import { Badge } from "./ui/badge";

const Pricing = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [annualBilling, setAnnualBilling] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Explicitly define the plan features as a string array
  interface PlanFeatures {
    name: string;
    price: string;
    monthlyPrice: number;
    annualPrice: number;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
    gradient?: string;
  }

  const plans: PlanFeatures[] = [
    {
      name: t('pricing.free.name'),
      price: formatPrice(0),
      monthlyPrice: 0,
      annualPrice: 0,
      description: t('pricing.free.description'),
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      cta: t('pricing.free.cta'),
      popular: false,
      gradient: "from-gray-400/20 to-gray-500/30"
    },
    {
      name: t('pricing.entrepreneur.name'),
      price: formatPrice(annualBilling ? 14.90 : 19.90),
      monthlyPrice: 19.90,
      annualPrice: 14.90,
      period: t('pricing.period'),
      description: t('pricing.entrepreneur.description'),
      features: t('pricing.entrepreneur.features', { returnObjects: true }) as string[],
      cta: t('pricing.entrepreneur.cta'),
      popular: true,
      gradient: "from-brand-purple/20 via-indigo-500/20 to-brand-purple/30"
    },
    {
      name: t('pricing.business.name'),
      price: formatPrice(annualBilling ? 39.90 : 49.90),
      monthlyPrice: 49.90,
      annualPrice: 39.90,
      period: t('pricing.period'),
      description: t('pricing.business.description'),
      features: t('pricing.business.features', { returnObjects: true }) as string[],
      cta: t('pricing.business.cta'),
      popular: false,
      gradient: "from-blue-600/20 via-indigo-600/20 to-blue-600/30"
    }
  ];

  return (
    <section id="planos" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-premium opacity-80"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full mb-4">
            {t('pricing.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            {t('pricing.subtitle')}
          </p>
          
          <div className="flex items-center justify-center mb-12">
            <span className={`mr-4 text-sm font-medium ${!annualBilling ? 'text-brand-purple' : 'text-muted-foreground'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${
                annualBilling ? 'bg-brand-purple' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform ${
                  annualBilling ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-4 text-sm font-medium flex items-center ${annualBilling ? 'text-brand-purple' : 'text-muted-foreground'}`}>
              {t('pricing.annually')} 
              <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30" variant="secondary">
                -25%
              </Badge>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
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
                    {t('pricing.mostPopular')}
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
                
                {/* Button moved here after the description */}
                <div className="mt-4">
                  <Button 
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
                  {plan.features.map((feature, i) => (
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
              
              {/* Removed the CardFooter with button since it's now in the CardHeader */}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
