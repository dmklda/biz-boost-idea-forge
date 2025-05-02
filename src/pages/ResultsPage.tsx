import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { toast } from "@/components/ui/sonner";

const ResultsPage = () => {
  const { authState, updateUserCredits } = useAuth();
  const { getSavedIdeaData } = useIdeaForm();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      toast.error("Você precisa estar logado para ver os resultados");
      navigate("/login");
      return;
    }
    
    // Check if there's saved idea data
    const savedData = getSavedIdeaData();
    if (!savedData) {
      toast.error("Nenhuma ideia para analisar");
      navigate("/");
      return;
    }
    
    // If user is on free plan, check credits
    if (authState.user?.plan === "free") {
      if (authState.user.credits <= 0) {
        toast.error("Você não possui créditos suficientes");
        navigate("/dashboard/creditos");
        return;
      }
      
      // Deduct one credit for the analysis
      updateUserCredits(authState.user.credits - 1);
      toast.success("Um crédito foi utilizado para esta análise");
    }
    
    // Continue with the rest of the component...
  }, [authState, navigate, getSavedIdeaData, updateUserCredits]);
  
  // Dados mockados para simular os resultados da IA
  const analysisData = {
    idea: "Aplicativo de marketplace para conectar chefs amadores com pessoas que querem comida caseira",
    summary: {
      viabilityScore: 85,
      innovationScore: 78,
      marketOpportunityScore: 92,
      executionComplexityScore: 65,
    },
    businessName: {
      name: "HomePlate",
      slogan: "Sabor caseiro, direto para você",
      pitch: "HomePlate conecta chefs amadores talentosos com pessoas que querem comida caseira autêntica. Nossa plataforma permite que cozinheiros locais vendam suas criações diretamente para clientes próximos, criando uma comunidade alimentar única e gerando renda extra para apaixonados por culinária."
    },
    marketAnalysis: {
      targetAudience: "Consumidores urbanos de 25-45 anos que valorizam comida caseira e autêntica, mas têm pouco tempo para cozinhar. Profissionais com renda média a alta, que preferem refeições saudáveis e personalizadas.",
      persona: {
        name: "Marina, 32 anos",
        description: "Profissional ocupada que trabalha em tempo integral e valoriza alimentação saudável. Cansada de delivery tradicional e fast food, busca alternativas autênticas e com toque pessoal. Disposta a pagar mais por qualidade e conveniência."
      },
      problemSolved: "Dificuldade em encontrar comida caseira de qualidade, personalizada e com sabor autêntico no mercado de delivery dominado por grandes redes."
    },
    competition: {
      directCompetitors: ["iFood", "UberEats", "Rappi"],
      differentials: [
        "Foco exclusivo em cozinheiros amadores e comida caseira autêntica",
        "Sistema de curadoria de chefs com verificação de qualidade",
        "Opções de personalização de refeições não disponíveis em restaurantes tradicionais",
        "Conexão direta entre chefs e clientes, criando relacionamentos de longo prazo"
      ]
    },
    mvpRecommendation: {
      description: "Começar com um MVP focado em um único bairro ou região, com um número limitado de chefs verificados e cardápios selecionados.",
      keyFeatures: [
        "Aplicativo para iOS e Android com foco na experiência de busca e pedidos",
        "Sistema de avaliação e feedback para garantir qualidade",
        "Gerenciamento de pedidos e pagamentos integrados",
        "Perfis detalhados de chefs com histórias pessoais e especialidades"
      ],
      timeline: "3-4 meses para desenvolvimento do MVP e lançamento inicial"
    },
    techStack: {
      frontend: ["React Native para apps mobile", "React para plataforma web"],
      backend: ["Node.js com Express", "MongoDB para dados dinâmicos"],
      payment: ["Stripe para processamento de pagamentos"],
      logistics: ["Integração com APIs de entrega (opcional)"]
    },
    monetization: {
      models: [
        "Comissão de 15-20% sobre vendas realizadas na plataforma",
        "Taxa de assinatura opcional para chefs com recursos premium",
        "Assinatura para consumidores com benefícios como frete grátis e descontos"
      ],
      revenue: "Potencial de receita estimado em R$ 50-100 mil/mês após 12 meses, com 100 chefs ativos e 2000 usuários regulares."
    },
    actionPlan: [
      "Validar conceito com 10-15 chefs amadores dispostos a participar do piloto",
      "Desenvolver MVP com foco nas funcionalidades essenciais",
      "Testar em um bairro/região específico por 2-3 meses",
      "Implementar feedback e ajustar o modelo de negócios",
      "Expandir gradualmente para novas áreas geográficas"
    ]
  };
  
  return (
    <div>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow bg-brand-light py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => window.location.href = "/"}
              >
                <ArrowLeft size={20} />
                <span>Voltar para o início</span>
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 size={16} />
                  <span>Compartilhar</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Baixar PDF</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Exportar para Notion</span>
                </Button>
              </div>
            </div>
            
            <Card className="mb-8 border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-8 text-white">
                  <h1 className="text-3xl font-bold mb-4">{analysisData.businessName.name}</h1>
                  <p className="text-xl font-medium text-white/90 mb-2">"{analysisData.businessName.slogan}"</p>
                  <p className="text-white/80">{analysisData.idea}</p>
                </div>
                
                <div className="grid grid-cols-4 divide-x divide-gray-100 bg-white">
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-brand-blue">
                      {analysisData.summary.viabilityScore}%
                    </div>
                    <div className="text-sm text-gray-500">Viabilidade</div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-brand-purple">
                      {analysisData.summary.innovationScore}%
                    </div>
                    <div className="text-sm text-gray-500">Inovação</div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-brand-green">
                      {analysisData.summary.marketOpportunityScore}%
                    </div>
                    <div className="text-sm text-gray-500">Oportunidade</div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      {analysisData.summary.executionComplexityScore}%
                    </div>
                    <div className="text-sm text-gray-500">Complexidade</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-8">
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="market">Mercado</TabsTrigger>
                <TabsTrigger value="mvp">MVP</TabsTrigger>
                <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
                <TabsTrigger value="monetization">Monetização</TabsTrigger>
                <TabsTrigger value="plan">Plano de Ação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Pitch de 30 segundos</h3>
                        <p className="text-gray-700">{analysisData.businessName.pitch}</p>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Problema Resolvido</h3>
                        <p className="text-gray-700">{analysisData.marketAnalysis.problemSolved}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Nome e Slogan Sugeridos</h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-100 mb-6">
                          <h4 className="font-bold text-lg text-brand-blue">{analysisData.businessName.name}</h4>
                          <p className="text-gray-600 italic">"{analysisData.businessName.slogan}"</p>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-4">Diferenciais</h3>
                        <ul className="space-y-2">
                          {analysisData.competition.differentials.map((differential, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                              <span>{differential}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="market" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Público-Alvo</h3>
                        <p className="text-gray-700">{analysisData.marketAnalysis.targetAudience}</p>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Tamanho do Mercado</h3>
                        <p className="text-gray-700">O mercado de delivery de comida no Brasil movimenta mais de R$ 15 bilhões anualmente, com crescimento de 20% ao ano. O nicho de comida caseira e personalizada representa aproximadamente 8% desse mercado, com potencial de crescimento significativo.</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Persona Ideal</h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-bold text-lg">{analysisData.marketAnalysis.persona.name}</h4>
                          <p className="text-gray-700">{analysisData.marketAnalysis.persona.description}</p>
                        </div>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Tendências Relevantes</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                            <span>Valorização crescente de alimentação saudável e feita com ingredientes naturais</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                            <span>Movimento de economia compartilhada e valorização de produtores locais</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                            <span>Busca por experiências personalizadas e autênticas em alimentação</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mvp" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Recomendação de MVP</h3>
                        <p className="text-gray-700">{analysisData.mvpRecommendation.description}</p>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Funcionalidades Essenciais</h3>
                        <ul className="space-y-2">
                          {analysisData.mvpRecommendation.keyFeatures.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-brand-purple/10 text-brand-purple rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Stack Tecnológica Recomendada</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-brand-blue">Frontend:</h4>
                            <ul className="pl-4 mt-1 space-y-1">
                              {analysisData.techStack.frontend.map((tech, index) => (
                                <li key={index} className="text-gray-700">{tech}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-brand-blue">Backend:</h4>
                            <ul className="pl-4 mt-1 space-y-1">
                              {analysisData.techStack.backend.map((tech, index) => (
                                <li key={index} className="text-gray-700">{tech}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-brand-blue">Pagamentos:</h4>
                            <ul className="pl-4 mt-1 space-y-1">
                              {analysisData.techStack.payment.map((tech, index) => (
                                <li key={index} className="text-gray-700">{tech}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Timeline Estimada</h3>
                        <p className="text-gray-700">{analysisData.mvpRecommendation.timeline}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="competitors" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Concorrentes Diretos</h3>
                        <div className="space-y-4">
                          {analysisData.competition.directCompetitors.map((competitor, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                              <h4 className="font-medium">{competitor}</h4>
                              <p className="text-sm text-gray-600">Plataforma de delivery tradicional com foco em restaurantes estabelecidos.</p>
                            </div>
                          ))}
                        </div>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Desafios da Concorrência</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="bg-red-100 text-red-500 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">!</span>
                            <span>Grandes plataformas possuem base de usuários estabelecida</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-red-100 text-red-500 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">!</span>
                            <span>Concorrentes têm orçamentos altos para marketing e aquisição de usuários</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-red-100 text-red-500 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">!</span>
                            <span>Possibilidade de cópia do modelo por plataformas estabelecidas</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Seus Diferenciais</h3>
                        <ul className="space-y-2">
                          {analysisData.competition.differentials.map((differential, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                              <span>{differential}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Análise SWOT</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-green-700 mb-2">Forças</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>Modelo único e inovador</li>
                              <li>Foco em experiência autêntica</li>
                              <li>Potencial para forte conexão emocional</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <h4 className="font-medium text-red-700 mb-2">Fraquezas</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>Necessidade de controle de qualidade</li>
                              <li>Desafios logísticos de entrega</li>
                              <li>Marca nova no mercado</li>
                            </ul>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium text-blue-700 mb-2">Oportunidades</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>Mercado em crescimento</li>
                              <li>Valorização de autenticidade</li>
                              <li>Potencial para expansão de nicho</li>
                            </ul>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <h4 className="font-medium text-amber-700 mb-2">Ameaças</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>Grandes players podem copiar o modelo</li>
                              <li>Regulamentações de alimentos</li>
                              <li>Desafios de escalabilidade</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="monetization" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Modelos de Monetização</h3>
                        <ul className="space-y-4">
                          {analysisData.monetization.models.map((model, index) => (
                            <li key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center">
                                <span className="bg-brand-blue/10 text-brand-blue font-medium rounded-full h-6 w-6 flex items-center justify-center text-xs mr-3">
                                  {index + 1}
                                </span>
                                <span>{model}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        
                        <h3 className="text-xl font-semibold mt-8 mb-4">Receita Potencial</h3>
                        <p className="text-gray-700">{analysisData.monetization.revenue}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Sugestões de Preços</h3>
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-100">
                            <h4 className="font-medium">Comissão por Pedido</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              15-20% sobre o valor de cada pedido realizado pela plataforma.
                            </p>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500">Exemplo:</span>
                              <p className="text-sm">Pedido de R$ 100 = R$ 15-20 de receita para a plataforma</p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-100">
                            <h4 className="font-medium">Assinatura para Cozinheiros</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Plano mensal com recursos premium para chefs.
                            </p>
                            <div className="flex gap-2 mb-2">
                              <div className="bg-gray-50 p-2 rounded flex-1">
                                <p className="text-sm font-medium">Básico: R$ 0</p>
                                <p className="text-xs text-gray-500">Apenas comissão por pedido</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded flex-1">
                                <p className="text-sm font-medium">Pro: R$ 49/mês</p>
                                <p className="text-xs text-gray-500">+ recursos avançados</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-100">
                            <h4 className="font-medium">Assinatura para Consumidores</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Plano mensal com benefícios para usuários frequentes.
                            </p>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-sm font-medium">HomePlate Club: R$ 29,90/mês</p>
                              <p className="text-xs text-gray-500">Frete grátis, descontos exclusivos e acesso antecipado a novos chefs</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="plan" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Plano de Ação em 5 Passos</h3>
                    
                    <div className="space-y-6">
                      {analysisData.actionPlan.map((step, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4">
                            <div className="bg-brand-blue text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-100 flex-1">
                            <p className="text-gray-800">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-12 border-t border-gray-200 pt-8">
                      <h3 className="text-xl font-semibold mb-6">Próximos Passos Recomendados</h3>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-brand-blue mb-2">Imediato (1-2 semanas)</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Validar conceito com potenciais chefs</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Criar protótipos de telas principais</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-brand-blue/10 text-brand-blue rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Definir região para teste piloto</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-brand-purple mb-2">Curto Prazo (1-3 meses)</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="bg-brand-purple/10 text-brand-purple rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Desenvolver MVP da plataforma</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-brand-purple/10 text-brand-purple rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Selecionar e treinar primeiros chefs</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-brand-purple/10 text-brand-purple rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Iniciar testes com grupo fechado</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-brand-green mb-2">Médio Prazo (3-6 meses)</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Lançamento oficial em região piloto</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Implementar estratégia de marketing local</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-brand-green/10 text-brand-green rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">→</span>
                              <span>Obter feedback e otimizar processos</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-4">Quer uma análise mais detalhada?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Faça upgrade para o plano Empreendedor e tenha acesso a relatórios completos, 
                exportações para diversos formatos e mais análises de ideias por mês.
              </p>
              <Button 
                className="bg-brand-blue hover:bg-brand-blue/90"
                onClick={() => window.location.href = "/#planos"}
              >
                Ver Planos Premium
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default ResultsPage;
