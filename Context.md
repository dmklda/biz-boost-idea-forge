Descrição Completa do Projeto: Plataforma de Análise de Ideias de Negócios
Visão Geral
Este projeto é uma plataforma web sofisticada projetada para ajudar empreendedores e empresários a validar, analisar e desenvolver suas ideias de negócios. A plataforma utiliza inteligência artificial para fornecer análises detalhadas de viabilidade, potencial de mercado e recomendações estratégicas para ideias de negócios submetidas pelos usuários.

Funcionalidades Principais
## Análise de Ideias de Negócio ##
Formulário multi-etapas para submissão de ideias
Análise de viabilidade alimentada por IA
Pontuação e classificação de ideias (viável, moderado, desafiador)
Análise SWOT completa (pontos fortes, fracos, oportunidades, ameaças)
## Dashboard do Usuário ##
Visualização de todas as ideias do usuário
Sistema de favoritos para marcar ideias preferidas
Organização com tags personalizáveis
Histórico completo de ideias e análises
3. Análises Avançadas
Mapa mental interativo de ideias
Análise de mercado detalhada
Comparação entre múltiplas ideias
Sugestões de monetização e canais de venda
4. Sistema de Créditos
Modelo de negócios baseado em créditos
Diferentes planos de assinatura (free, premium)
Histórico de transações
Compra de créditos adicionais
5. Recursos Educacionais
Blog com conteúdo sobre empreendedorismo
Guias detalhados
Casos de sucesso
Webinars
6. Personalização e Gerenciamento
Configurações de usuário
Diferenciação visual com tags coloridas
Sistema de rascunhos para ideias em desenvolvimento
Reanálise de ideias existentes
Fluxo do Usuário
Entrada e Registro

Página inicial com apresentação do serviço
Registro ou login do usuário
Escolha de plano (free ou premium)
Submissão de Ideia

Formulário dividido em etapas:
Descrição da ideia
Definição de público-alvo e problema
Análise de concorrência
Orçamento e localização
Análise e Resultados

Processamento da ideia via IA
Apresentação dos resultados de análise
Pontuação de viabilidade
Recomendações detalhadas
Gerenciamento de Ideias

Dashboard com todas as ideias
Categorização com tags
Favoritos e filtragem
Edição e reanálise
Análises Avançadas

Solicitação de análise detalhada (consome créditos adicionais)
Visualização de mapas mentais e relatórios detalhados
Comparação entre ideias para identificar a mais promissora
Salvamento de análises avançadas para referência futura
Recursos e Suporte

Acesso a conteúdo educacional
Centro de recursos
Gerenciamento de créditos e plano
Tecnologias Utilizadas
Frontend
React: Framework JavaScript para construção de interfaces
TypeScript: Linguagem tipada para maior robustez
React Router: Gerenciamento de rotas e navegação
React Query: Gerenciamento de estado e requisições
Tailwind CSS: Framework de estilização
Shadcn UI: Componentes de interface reutilizáveis
i18next: Internacionalização (português, espanhol, inglês, japonês)
Lucide React: Biblioteca de ícones
React Hook Form: Gerenciamento de formulários
Zod: Validação de dados
Recharts: Visualização de dados e gráficos
Framer Motion: Animações e transições
Backend
Supabase: Plataforma backend como serviço
Autenticação de usuários
Banco de dados PostgreSQL
Edge Functions para lógica de negócio
Armazenamento de arquivos
Row Level Security para proteção de dados
Inteligência Artificial
OpenAI GPT: Integração com modelos avançados como GPT-4o-mini
Edge Functions: Processamento seguro das análises de IA
Banco de Dados
Tabelas principais:
ideas: Ideias de negócio dos usuários
idea_analyses: Análises geradas para as ideias
advanced_analyses: Análises avançadas e mapas mentais
idea_comparisons: Comparações entre ideias
tags: Sistema de etiquetas personalizadas
profiles: Dados dos usuários
credit_transactions: Registro de transações de créditos
Funcionalidades Detalhadas
Análise de Ideia
O usuário preenche um formulário multi-etapas com detalhes sobre sua ideia de negócio
O sistema usa uma Edge Function do Supabase para enviar os dados para a API da OpenAI
A IA analisa a viabilidade da ideia e gera um relatório estruturado
Os resultados são armazenados no banco de dados e apresentados ao usuário
Um crédito é deduzido da conta do usuário por análise
Análise Avançada
Para ideias já analisadas, o usuário pode solicitar uma análise avançada
O sistema gera um mapa mental da ideia, análise aprofundada de mercado, personas, monetização, etc.
Os resultados incluem visualizações interativas e recomendações estratégicas
O usuário pode salvar diferentes versões da análise avançada
Comparação de Ideias
O usuário seleciona 2-3 ideias para comparação
O sistema usa IA para analisar as diferenças, vantagens e desvantagens
Um relatório comparativo é gerado, destacando pontos fortes, fracos e recomendações
O usuário recebe uma recomendação sobre qual ideia parece mais promissora
Sistema de Créditos
Usuários recebem créditos iniciais ao se registrarem (3 créditos no plano gratuito)
Cada análise consome um crédito
Usuários podem comprar créditos adicionais ou fazer upgrade para planos premium
O histórico de transações é registrado para transparência
Planos e Diferenciais
Plano Free: 3 créditos iniciais, acesso às análises básicas
Plano Premium: Mais créditos, análises avançadas, comparações ilimitadas, suporte prioritário
Internacionalização
O sistema é totalmente multilíngue, suportando:

Português (padrão)
Inglês
Espanhol
Japonês
Potenciais Expansões
Integração com ferramentas de negócio (como CRM, ferramentas de marketing)
Comunidade de empreendedores para feedback e networking
Marketplace de serviços para empreendedores
Assistente de IA conversacional para consultas específicas
Integração com serviços de financiamento e investimento
Este projeto representa uma plataforma completa e robusta para empreendedores validarem e aperfeiçoarem suas ideias de negócio, utilizando tecnologia de ponta em IA para fornecer insights valiosos e orientação estratégica.