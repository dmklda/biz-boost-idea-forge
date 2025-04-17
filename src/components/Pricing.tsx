
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

const Pricing = () => {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      description: "Para iniciantes que querem validar sua primeira ideia.",
      features: [
        "1 análise de ideia",
        "Resultados básicos",
        "Sugestão de nome e slogan",
        "Avaliação de viabilidade"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Empreendedor",
      price: "R$ 19,90",
      period: "/mês",
      description: "Ideal para quem está começando e tem múltiplas ideias.",
      features: [
        "5 análises de ideias por mês",
        "Relatórios detalhados em PDF",
        "Sugestões de MVP",
        "Análise da concorrência",
        "Plano de ação em 5 passos",
        "Exportação para Notion/Google Docs"
      ],
      cta: "Assinar Agora",
      popular: true
    },
    {
      name: "Negócio",
      price: "R$ 49,90",
      period: "/mês",
      description: "Para equipes e empresas que precisam de análises avançadas.",
      features: [
        "Análises ilimitadas",
        "Relatórios completos",
        "Modelos de negócio detalhados",
        "Consultoria personalizada (1h/mês)",
        "Comparação entre ideias",
        "Análise de tendências de mercado",
        "API para integração"
      ],
      cta: "Contrate Agora",
      popular: false
    }
  ];

  return (
    <section id="planos" className="py-16 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e preços</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha o plano que melhor se adapta às suas necessidades de empreendedorismo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border ${plan.popular ? 'border-brand-blue shadow-lg' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 mb-1">{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-green shrink-0 mr-2" />
                      <span>{feature}</span>
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
