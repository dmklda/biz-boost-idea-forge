
import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Descreva sua ideia",
      description: "Responda algumas perguntas sobre sua ideia de negócio, como público-alvo, problema que resolve e modelo de monetização."
    },
    {
      number: "02",
      title: "Nossa IA analisa",
      description: "Algoritmos avançados processam sua ideia, analisando viabilidade, mercado e potencial de crescimento."
    },
    {
      number: "03",
      title: "Receba insights completos",
      description: "Obtenha uma análise detalhada com sugestões de nome, slogan, persona ideal, MVP e estratégias de monetização."
    },
    {
      number: "04",
      title: "Tome decisões informadas",
      description: "Use os insights para refinar sua ideia, criar um plano de ação e iniciar seu negócio com mais confiança."
    }
  ];

  return (
    <section id="como-funciona" className="py-16 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
          <p className="text-lg text-gray-600">
            Um processo simples e eficiente para transformar sua ideia em um plano de negócios viável
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-8 rounded-xl shadow-sm h-full flex flex-col">
                <div className="text-4xl font-bold text-brand-blue/10 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 flex-grow">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 right-0 transform translate-x-1/2 translate-y-1/2 z-10">
                    <ArrowRight className="text-brand-blue/30 h-8 w-8" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
