import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IdeaForm from '@/components/IdeaForm';
import AdvancedAnalysisButton from '@/components/advanced-analysis/AdvancedAnalysisButton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Lock } from 'lucide-react';
import { useState } from 'react';

const mock = {
  title: 'Delivery de Pets',
  description: 'Um serviço de transporte especializado para levar animais de estimação com conforto e segurança.',
  audience: 'Donos de pets urbanos, clínicas veterinárias, pet shops',
  problem: 'Dificuldade de transporte seguro e confortável para animais de estimação.',
  score: 87,
  status: 'Viável',
  swot: {
    strengths: ['Mercado em crescimento', 'Baixa concorrência especializada', 'Alto valor percebido'],
    weaknesses: ['Necessidade de logística complexa', 'Custos iniciais elevados'],
    opportunities: ['Parcerias com clínicas e pet shops', 'Expansão para cidades vizinhas'],
    threats: ['Regulamentação de transporte animal', 'Concorrentes tradicionais'],
  },
  market: {
    size: 'R$ 40 bilhões/ano no Brasil',
    audience: 'Donos de pets de classe média/alta',
    growth: 'Crescimento anual de 13% no setor pet',
  },
  competitors: ['Uber Pet', 'PetDriver', 'Táxi Dog'],
  differentials: ['Foco em bem-estar animal', 'Equipe treinada', 'Atendimento personalizado'],
  financial: {
    revenue: 'Potencial de faturamento de R$ 500 mil/ano',
    investment: 'Investimento inicial estimado em R$ 80 mil',
    breakEven: 'Previsão de break-even em 18 meses',
  },
  recommendations: {
    nextSteps: ['Validar demanda em bairros piloto', 'Buscar parcerias estratégicas', 'Investir em marketing digital'],
    challenges: ['Regulamentação', 'Gestão de frota', 'Treinamento de equipe'],
    resources: ['ABINPET', 'Sebrae', 'Mentoria com especialistas do setor'],
  },
};

const ExampleAnalysisResult = () => {
  const { t } = useTranslation();
  const [showLockModal, setShowLockModal] = useState(false);

  // Função para scrollar até o IdeaForm
  const handleGoToIdeaForm = () => {
    setShowLockModal(false);
    setTimeout(() => {
      const form = document.getElementById('idea-form-anchor');
      if (form) form.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-100 via-fuchsia-100 to-pink-100">
      <Header />
      <main className="flex-1 flex flex-col items-center pt-24 pb-8 px-2 sm:px-4 bg-background text-foreground transition-colors duration-300">
        <div className="w-full px-0 sm:px-2">
          <div className="max-w-3xl w-full mx-auto">
            {/* Barra de ações */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 w-full">
              <h1 className="text-2xl font-bold text-brand-blue text-center md:text-left w-full md:w-auto mb-4 md:mb-0">{t('results.exampleAnalysisTitle', 'Exemplo de Análise de Ideia')}</h1>
              <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 md:gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex items-center"><LogIn size={16} /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex items-center"><UserPlus size={16} /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Baixar PDF</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex items-center"><UserPlus size={16} /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Exportar para Notion</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="default" 
                      size="icon" 
                      className="!p-2 !rounded-lg md:w-auto w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 transition-all"
                      onClick={() => setShowLockModal(true)}
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Análise Avançada</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Painel de métricas */}
            <Card className="mb-8 border-0 shadow-lg overflow-hidden w-full">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-4 md:p-8 text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{mock.title}</h1>
                  <p className="text-white/80 text-base md:text-lg break-words">{mock.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 bg-white">
                  <div className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-brand-blue">{mock.score}%</div>
                    <div className="text-sm md:text-base text-gray-500">{t('results.viability', 'Viabilidade')}</div>
                  </div>
                  <div className="p-4 md:p-6 text-center">
                    <div className="text-xl md:text-2xl font-bold text-green-600">{mock.status}</div>
                    <div className="text-sm md:text-base text-gray-500">{t('results.status.label', 'Status')}</div>
                  </div>
                  <div className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-brand-green">{mock.swot.strengths.length}</div>
                    <div className="text-sm md:text-base text-gray-500">{t('results.strengths', 'Pontos Fortes')}</div>
                  </div>
                  <div className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-500">{mock.swot.weaknesses.length}</div>
                    <div className="text-sm md:text-base text-gray-500">{t('results.weaknesses', 'Pontos Fracos')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs de conteúdo */}
            <Tabs defaultValue="summary" className="w-full mb-8">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-8 overflow-x-auto w-full">
                <TabsTrigger value="summary" className="text-xs sm:text-sm">{t('results.tabs.summary', 'Resumo')}</TabsTrigger>
                <TabsTrigger value="swot" className="text-xs sm:text-sm">SWOT</TabsTrigger>
                <TabsTrigger value="market" className="text-xs sm:text-sm">{t('results.tabs.market', 'Mercado')}</TabsTrigger>
                <TabsTrigger value="competitors" className="text-xs sm:text-sm">{t('results.tabs.competitors', 'Concorrentes')}</TabsTrigger>
                <TabsTrigger value="financial" className="text-xs sm:text-sm">{t('results.tabs.financial', 'Financeiro')}</TabsTrigger>
                <TabsTrigger value="recommendations" className="text-xs sm:text-sm">{t('results.tabs.recommendations', 'Recomendações')}</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <Card><CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">{t('results.summaryTitle', 'Resumo da Análise')}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">{t('results.ideaDescription', 'Descrição da Ideia')}</h3>
                      <p className="text-muted-foreground mb-4 break-words">{mock.description}</p>
                      <h3 className="font-semibold mb-2">{t('results.targetAudience', 'Público-Alvo')}</h3>
                      <p className="text-muted-foreground mb-4 break-words">{mock.audience}</p>
                      <h3 className="font-semibold mb-2">{t('results.problemSolved', 'Problema Resolvido')}</h3>
                      <p className="text-muted-foreground break-words">{mock.problem}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{t('results.overallScore', 'Pontuação Geral')}</h3>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center text-white text-lg md:text-2xl font-bold mr-4 shrink-0">
                          {mock.score}%
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate text-green-600">{mock.status}</p>
                          <p className="text-sm text-muted-foreground">{t('results.scoreExplanation', 'Baseado na análise geral da ideia')}</p>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{t('results.keyStrengths', 'Principais Pontos Fortes')}</h3>
                      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                        {mock.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                      <h3 className="font-semibold mb-2">{t('results.keyWeaknesses', 'Principais Pontos Fracos')}</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {mock.swot.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="swot">
                <Card><CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{t('results.swotAnalysis', 'Análise SWOT')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">{t('results.swot.strengths', 'Forças')}</h3>
                      <ul className="list-disc list-inside">
                        {mock.swot.strengths.map((item, i) => <li key={i} className="text-muted-foreground break-words">{item}</li>)}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">{t('results.swot.weaknesses', 'Fraquezas')}</h3>
                      <ul className="list-disc list-inside">
                        {mock.swot.weaknesses.map((item, i) => <li key={i} className="text-muted-foreground break-words">{item}</li>)}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">{t('results.swot.opportunities', 'Oportunidades')}</h3>
                      <ul className="list-disc list-inside">
                        {mock.swot.opportunities.map((item, i) => <li key={i} className="text-muted-foreground break-words">{item}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-amber-800 mb-2">{t('results.swot.threats', 'Ameaças')}</h3>
                      <ul className="list-disc list-inside">
                        {mock.swot.threats.map((item, i) => <li key={i} className="text-muted-foreground break-words">{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="market">
                <Card><CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{t('results.marketAnalysis', 'Análise de Mercado')}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">{t('results.market.size', 'Tamanho do Mercado')}</h3>
                      <p className="text-muted-foreground mb-4 break-words">{mock.market.size}</p>
                      <h3 className="font-semibold mb-2">{t('results.market.audience', 'Perfil do Público-Alvo')}</h3>
                      <p className="text-muted-foreground mb-4 break-words">{mock.market.audience}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{t('results.market.growth', 'Potencial de Crescimento')}</h3>
                      <p className="text-muted-foreground mb-4 break-words">{mock.market.growth}</p>
                    </div>
                  </div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="competitors">
                <Card><CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{t('results.competitorAnalysis', 'Análise de Concorrentes')}</h2>
                  <h3 className="font-semibold mb-2">{t('results.competitors', 'Principais Concorrentes')}</h3>
                  <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                    {mock.competitors.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <h3 className="font-semibold mb-2">{t('results.differentials', 'Diferenciais')}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {mock.differentials.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="financial">
                <Card><CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{t('results.financialAnalysis', 'Análise Financeira')}</h2>
                  <h3 className="font-semibold mb-2">{t('results.financial.revenue', 'Potencial de Receita')}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{mock.financial.revenue}</p>
                  <h3 className="font-semibold mb-2">{t('results.financial.investment', 'Investimento Inicial')}</h3>
                  <p className="text-muted-foreground mb-4 break-words">{mock.financial.investment}</p>
                  <h3 className="font-semibold mb-2">{t('results.financial.breakEven', 'Ponto de Equilíbrio')}</h3>
                  <p className="text-muted-foreground break-words">{mock.financial.breakEven}</p>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="recommendations">
                <Card><CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{t('results.recommendations', 'Recomendações')}</h2>
                  <h3 className="font-semibold mb-2">{t('results.nextSteps', 'Próximos Passos')}</h3>
                  <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                    {mock.recommendations.nextSteps.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                  <h3 className="font-semibold mb-2">{t('results.challenges', 'Desafios')}</h3>
                  <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                    {mock.recommendations.challenges.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <h3 className="font-semibold mb-2">{t('results.resources', 'Recursos Sugeridos')}</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {mock.recommendations.resources.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </CardContent></Card>
              </TabsContent>
            </Tabs>

            {/* Chamada para análise avançada */}
            <div className="mt-12 text-center px-2">
              <h3 className="text-xl font-semibold mb-4">{t('results.wantAdvanced', 'Quer uma análise mais detalhada?')}</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{t('results.tryAdvanced', 'Experimente nossa nova Análise Avançada, que inclui sugestão de nome, logotipo, análise de mercado detalhada e muito mais.')}</p>
              <Button
                variant="default"
                size="lg"
                className="mx-auto flex items-center gap-2 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 transition-all"
                onClick={() => setShowLockModal(true)}
              >
                <BarChart3 className="h-5 w-5" />
                {t('advancedAnalysis.button', "Análise Avançada")}
              </Button>
            </div>

            {/* Modal de bloqueio da análise avançada */}
            <Dialog open={showLockModal} onOpenChange={setShowLockModal}>
              <DialogContent className="w-full max-w-xs sm:max-w-md p-4 sm:p-6 rounded-lg text-center bg-background text-foreground shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="flex flex-col items-center justify-center gap-2 text-lg sm:text-xl">
                    <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-brand-purple mb-2" />
                    {t('advancedAnalysis.lockedTitle', 'Análise Avançada disponível apenas para ideias próprias!')}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mb-6 text-sm sm:text-base">
                    {t('advancedAnalysis.lockedDesc', 'Para acessar a análise avançada, analise sua própria ideia. É rápido, gratuito e você terá acesso a recomendações personalizadas!')}
                  </DialogDescription>
                </DialogHeader>
                <Button onClick={handleGoToIdeaForm} className="w-full" size="lg">
                  {t('advancedAnalysis.analyzeMyIdea', 'Analisar minha ideia')}
                </Button>
              </DialogContent>
            </Dialog>

            {/* IdeaForm ao final */}
            <div className="w-full mt-16 mb-16 flex flex-col items-center" id="idea-form-anchor">
              <div className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border-2 border-brand-purple/60 p-4 sm:p-8 relative transition-colors duration-300">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-60 sm:w-72 h-10 sm:h-16 bg-gradient-to-r from-brand-purple/30 to-brand-blue/20 dark:from-brand-purple/40 dark:to-brand-blue/30 blur-2xl rounded-full opacity-70 pointer-events-none"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-brand-purple text-center mb-2 z-10 relative">{t('ideaForm.ctaTitle', 'Analise sua ideia agora!')}</h2>
                <p className="text-center text-brand-blue dark:text-brand-purple font-medium mb-6 z-10 relative">{t('ideaForm.ctaDesc', 'Receba uma análise gratuita, personalizada e descubra o potencial do seu negócio!')}</p>
                <IdeaForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExampleAnalysisResult; 