
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-brand-blue to-brand-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto para transformar sua ideia em realidade?
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
          Nossa IA está esperando para analisar o potencial do seu próximo grande negócio.
          Comece agora mesmo!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-white text-brand-blue hover:bg-white/90"
            onClick={() => {
              const formElement = document.getElementById('form');
              if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Analisar Minha Ideia <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
            onClick={() => window.location.href = "/resultados"}
          >
            Ver Exemplo de Análise
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
