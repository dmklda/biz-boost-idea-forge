
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Briefcase, 
  Code, 
  DollarSign, 
  LineChart 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Lightbulb className="h-8 w-8 text-brand-blue" />,
      title: "Análise de Viabilidade",
      description: "Avaliação detalhada baseada em mercado, tendências e aplicabilidade prática da sua ideia."
    },
    {
      icon: <Briefcase className="h-8 w-8 text-brand-purple" />,
      title: "Nome, Slogan e Pitch",
      description: "Sugestões criativas para apresentar seu negócio de forma impactante e memorável."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-brand-green" />,
      title: "Avaliação do Modelo",
      description: "Análise do seu modelo de negócio com pontos fortes e oportunidades de melhoria."
    },
    {
      icon: <Target className="h-8 w-8 text-brand-blue" />,
      title: "Nicho e Persona",
      description: "Identificação do seu público-alvo ideal e criação de uma persona detalhada."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-purple" />,
      title: "Sugestão de MVP",
      description: "Recomendações para criar um produto mínimo viável que valide sua ideia rapidamente."
    },
    {
      icon: <Code className="h-8 w-8 text-brand-green" />,
      title: "Stack Recomendada",
      description: "Sugestão das melhores ferramentas e tecnologias para desenvolvimento do seu projeto."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-brand-blue" />,
      title: "Potencial de Monetização",
      description: "Estratégias para gerar receita com seu negócio de forma sustentável."
    },
    {
      icon: <LineChart className="h-8 w-8 text-brand-purple" />,
      title: "Concorrência e Diferenciais",
      description: "Análise competitiva e identificação de fatores que destacam seu negócio no mercado."
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Valide sua ideia de forma completa</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-inter">
            Nossa plataforma fornece uma análise completa da viabilidade 
            e potencial do seu conceito de negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="neo-card p-6"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 font-inter">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
