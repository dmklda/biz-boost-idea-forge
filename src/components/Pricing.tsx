
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from 'react-i18next';
import { useCurrency } from "@/hooks/use-currency";

const Pricing = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Explicitly define the plan features as a string array
  interface PlanFeatures {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
  }

  const plans: PlanFeatures[] = [
    {
      name: t('pricing.free.name'),
      price: formatPrice(0),
      description: t('pricing.free.description'),
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      cta: t('pricing.free.cta'),
      popular: false
    },
    {
      name: t('pricing.entrepreneur.name'),
      price: formatPrice(19.90),
      period: t('pricing.period'),
      description: t('pricing.entrepreneur.description'),
      features: t('pricing.entrepreneur.features', { returnObjects: true }) as string[],
      cta: t('pricing.entrepreneur.cta'),
      popular: true
    },
    {
      name: t('pricing.business.name'),
      price: formatPrice(49.90),
      period: t('pricing.period'),
      description: t('pricing.business.description'),
      features: t('pricing.business.features', { returnObjects: true }) as string[],
      cta: t('pricing.business.cta'),
      popular: false
    }
  ];

  return (
    <section id="planos" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('pricing.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border ${plan.popular ? 'border-brand-blue shadow-lg' : 'border-input'} bg-card`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                  {t('pricing.mostPopular')}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-green shrink-0 mr-2" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={
                    plan.popular 
                      ? "w-full bg-brand-blue hover:bg-brand-blue/90" 
                      : "w-full bg-brand-purple hover:bg-brand-purple/90"
                  }
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
