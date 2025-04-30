
import { ArrowRight, BrainCircuit, Target, BarChart2, Rocket } from "lucide-react";
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: "1",
      title: t('howItWorks.step1.title') || "Descreva sua ideia",
      description: t('howItWorks.step1.description') || "Conte-nos sobre seu conceito de negócio em detalhes",
      icon: <BrainCircuit className="h-6 w-6 text-brand-purple" />
    },
    {
      number: "2",
      title: t('howItWorks.step2.title') || "Análise de mercado",
      description: t('howItWorks.step2.description') || "Nossa IA analisa dados de mercado e tendências atuais",
      icon: <Target className="h-6 w-6 text-brand-blue" />
    },
    {
      number: "3",
      title: t('howItWorks.step3.title') || "Relatório detalhado",
      description: t('howItWorks.step3.description') || "Receba insights sobre viabilidade e potencial de crescimento",
      icon: <BarChart2 className="h-6 w-6 text-indigo-400" />
    },
    {
      number: "4",
      title: t('howItWorks.step4.title') || "Plano de ação",
      description: t('howItWorks.step4.description') || "Obtenha um roteiro prático para implementar seu negócio",
      icon: <Rocket className="h-6 w-6 text-fuchsia-500" />
    }
  ];

  return (
    <section id="como-funciona" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-premium opacity-50"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-sm font-medium bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full mb-4">
            {t('howItWorks.tagline') || "Como funciona"}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
            {t('howItWorks.title') || "Como validamos sua ideia"}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">
            {t('howItWorks.subtitle') || "Um processo simples e eficiente para validar seu negócio"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="card-depth glassmorphism p-8 rounded-xl h-full flex flex-col animate-fade-in transition-all duration-300 group-hover:translate-y-[-8px] border border-white/10">
                <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-purple to-indigo-600 text-white font-medium text-lg shadow-lg z-10">
                  {step.number}
                </div>
                
                <div className="mb-6 flex justify-between items-center">
                  <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {step.icon}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block text-brand-purple opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-3 font-poppins group-hover:text-gradient-premium transition-colors">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex-grow font-inter">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-brand-blue z-10">
                    <ArrowRight className="rotate-90" size={20} />
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
