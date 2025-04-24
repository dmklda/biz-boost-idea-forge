
import { Button } from "./ui/button";
import { ArrowRight, Lightbulb, Rocket, Brain } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-20 pb-24 px-4 bg-gradient-to-b from-white dark:from-gray-900 to-brand-light dark:to-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins leading-tight mb-6">
              Transforme <span className="text-brand-blue">ideias</span> em 
              <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent"> negócios</span>
            </h1>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 font-inter">
              Descubra a viabilidade da sua ideia e receba um plano de ação completo para transformá-la em um negócio de sucesso.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-brand-blue hover:bg-brand-blue/90 text-white"
                onClick={() => {
                  const formElement = document.getElementById('form');
                  if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Validar Minha Ideia <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-gray-300 dark:border-gray-700 dark:text-white"
                onClick={() => {
                  const howItWorksElement = document.getElementById('como-funciona');
                  if (howItWorksElement) howItWorksElement.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Saiba Mais
              </Button>
            </div>
          </div>
          
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 rounded-full blur-3xl opacity-30 animate-pulse-glow"></div>
            <div className="relative z-10 space-y-6">
              <div className="glass-card p-6 rounded-xl max-w-xs ml-auto">
                <div className="flex items-center mb-2">
                  <Lightbulb className="text-brand-blue mr-2" size={20} />
                  <h3 className="font-medium font-poppins">Análise de Viabilidade</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">Descubra se sua ideia tem potencial baseado em dados de mercado</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl max-w-xs transform translate-x-8">
                <div className="flex items-center mb-2">
                  <Rocket className="text-brand-purple mr-2" size={20} />
                  <h3 className="font-medium font-poppins">Potencial de Crescimento</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">Estratégias personalizadas para escalar seu negócio</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl max-w-xs ml-12">
                <div className="flex items-center mb-2">
                  <Brain className="text-brand-green mr-2" size={20} />
                  <h3 className="font-medium font-poppins">Perfil do Cliente</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">Identifique seu público-alvo ideal e como alcançá-lo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
