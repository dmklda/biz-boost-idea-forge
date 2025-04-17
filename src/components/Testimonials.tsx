
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "A análise que recebi foi surpreendentemente precisa. Consegui identificar problemas no meu modelo de negócio que eu nem tinha percebido.",
      author: "Marina Silva",
      role: "Fundadora da TechStart",
      avatar: "/placeholder.svg"
    },
    {
      quote: "Economizei meses de pesquisa e milhares de reais com a validação da minha ideia. O relatório me ajudou a pivotar minha estratégia.",
      author: "Pedro Santos",
      role: "CEO da DeliveryPro",
      avatar: "/placeholder.svg"
    },
    {
      quote: "Como investidor-anjo, uso o IdeiaForge para fazer uma pré-análise das startups que chegam até mim. É uma ferramenta indispensável.",
      author: "Carlos Mendes",
      role: "Investidor-anjo",
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">O que nossos usuários dizem</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Empreendedores, investidores e criadores de conteúdo estão transformando suas ideias em negócios de sucesso
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <svg width="45" height="36" className="text-brand-blue/20" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 0C6.04662 0 0 6.04662 0 13.5C0 20.9534 6.04662 27 13.5 27H18V36H9C4.02944 36 0 31.9706 0 27V13.5C0 6.04662 6.04662 0 13.5 0ZM40.5 0C33.0466 0 27 6.04662 27 13.5C27 20.9534 33.0466 27 40.5 27H45V36H36C31.0294 36 27 31.9706 27 27V13.5C27 6.04662 33.0466 0 40.5 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <p className="text-gray-700 mb-6 flex-grow">"{testimonial.quote}"</p>
                  
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
