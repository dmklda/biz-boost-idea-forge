
import { Button } from "./ui/button";
import { ArrowRight, Lightbulb, Rocket, Brain } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-brand-light">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins leading-tight mb-6">
              Transforme suas <span className="text-brand-blue">ideias</span> em 
              <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent"> negócios viáveis</span>
            </h1>
            
            <p className="text-lg text-gray-700 mb-8 font-inter">
              Descreva sua ideia e receba uma análise completa de viabilidade, sugestões de monetização, público-alvo e muito mais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-brand-blue hover:bg-brand-blue/90"
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
                onClick={() => {
                  const howItWorksElement = document.getElementById('como-funciona');
                  if (howItWorksElement) howItWorksElement.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Saiba Mais
              </Button>
            </div>
          </div>
          
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-96 h-96 bg-brand-purple/5 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-72 h-72 bg-brand-blue/5 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="bg-white p-5 rounded-xl shadow-lg relative mb-8 max-w-xs">
                <div className="flex items-center mb-2">
                  <Lightbulb className="text-brand-blue mr-2" size={20} />
                  <h3 className="font-medium font-poppins">Análise de Viabilidade</h3>
                </div>
                <p className="text-sm text-gray-600 font-inter">Receba insights baseados em mercado e tendências atuais</p>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-lg relative ml-24 mb-4 max-w-xs">
                <div className="flex items-center mb-2">
                  <Rocket className="text-brand-purple mr-2" size={20} />
                  <h3 className="font-medium font-poppins">Potencial de Crescimento</h3>
                </div>
                <p className="text-sm text-gray-600 font-inter">Descubra as melhores estratégias para escalar sua ideia</p>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-lg relative ml-12 max-w-xs">
                <div className="flex items-center mb-2">
                  <Brain className="text-brand-green mr-2" size={20} />
                  <h3 className="font-medium font-poppins">Perfil do Cliente</h3>
                </div>
                <p className="text-sm text-gray-600 font-inter">Identifique seu público-alvo ideal e como alcançá-lo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
