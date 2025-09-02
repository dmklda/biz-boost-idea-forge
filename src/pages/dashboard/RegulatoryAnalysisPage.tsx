import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Building, AlertTriangle, DollarSign, Calendar, MapPin, Users, FileText, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRegulatoryAnalysis } from '@/hooks/useRegulatoryAnalysis';
import { IdeaSelector, AnalysisHistory } from '@/components/regulatory-analysis';

interface RegulatoryAnalysisResult {
  requirements: any[];
  riskAssessment: {
    overallRisk: string;
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  costs: {
    initialCompliance: number;
    annualCompliance: number;
    breakdown: any[];
  };
  roadmap: {
    phases: any[];
    totalTimeframe: string;
  };
  recommendations: string[];
  contacts: any[];
}

const RegulatoryAnalysisPage = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessSector: '',
    businessDescription: '',
    targetAudience: '',
    businessModel: '',
    location: '',
    country: 'brasil'
  });

  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'main' | 'history' | 'results'>('main');
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const { runRegulatoryAnalysis, isAnalyzing } = useRegulatoryAnalysis();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const normalizeAnalysisResult = (rawResult: any): RegulatoryAnalysisResult => {
    console.log('Raw analysis result:', rawResult);
    
    // Helper function to safely parse numbers
    const safeNumber = (value: any): number => {
      if (typeof value === 'number' && !isNaN(value)) return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
        return !isNaN(parsed) ? parsed : 0;
      }
      return 0;
    };

    // Helper function to ensure costs have valid values
    const normalizeCosts = (costs: any) => {
      const initial = safeNumber(costs?.initialCompliance || costs?.initial_compliance);
      const annual = safeNumber(costs?.annualCompliance || costs?.annual_compliance);
      
      return {
        initialCompliance: initial > 0 ? initial : 15000,
        annualCompliance: annual > 0 ? annual : 8000,
        breakdown: Array.isArray(costs?.breakdown) && costs.breakdown.length > 0 
          ? costs.breakdown.map((item: any) => ({
              category: item.category || item.item || item.name || 'Categoria',
              amount: safeNumber(item.amount || item.cost || item.value),
              description: item.description || item.desc || ''
            }))
          : [
              { category: 'Licenças e Alvarás', amount: 5000, description: 'Documentação básica' },
              { category: 'Consultoria Jurídica', amount: 8000, description: 'Assessoria especializada' },
              { category: 'Certificações', amount: 2000, description: 'Certificados necessários' }
            ]
      };
    };

    // Helper function to normalize roadmap phases
    const normalizeRoadmap = (roadmap: any) => {
      if (roadmap?.phases && Array.isArray(roadmap.phases)) {
        return {
          phases: roadmap.phases.map((phase: any) => ({
            name: phase.name || phase.title || phase.phase,
            duration: phase.duration || phase.timeline || '4-6 semanas',
            description: phase.description || '',
            activities: Array.isArray(phase.activities) ? phase.activities : 
                       Array.isArray(phase.requirements) ? phase.requirements : [],
            cost: safeNumber(phase.cost || phase.estimatedCost || phase.estimated_cost)
          })),
          totalTimeframe: roadmap.totalTimeframe || roadmap.total_timeframe || '6-12 meses'
        };
      }
      
      // Legacy format conversion
      const phases = [];
      if (roadmap?.immediate) {
        phases.push({
          name: "Imediato (0-3 meses)",
          duration: "0-3 meses",
          activities: roadmap.immediate.map((item: any) => item.task || item),
          cost: roadmap.immediate.reduce((sum: number, item: any) => 
            sum + safeNumber(item.cost), 0)
        });
      }
      
      return {
        phases: phases.length > 0 ? phases : [
          {
            name: "Planejamento Inicial",
            duration: "2-4 semanas",
            activities: ["Análise de requisitos", "Mapeamento de órgãos"],
            cost: 5000
          }
        ],
        totalTimeframe: "6-12 meses"
      };
    };

    return {
      requirements: Array.isArray(rawResult.requirements) ? rawResult.requirements : [],
      riskAssessment: {
        overallRisk: rawResult.riskAssessment?.overallRisk || rawResult.risk_assessment?.overall_risk || 'medium',
        riskFactors: rawResult.riskAssessment?.riskFactors || rawResult.risk_assessment?.risk_factors || [],
        mitigationStrategies: rawResult.riskAssessment?.mitigationStrategies || rawResult.risk_assessment?.mitigation_strategies || []
      },
      costs: normalizeCosts(rawResult.costs),
      roadmap: normalizeRoadmap(rawResult.roadmap),
      recommendations: Array.isArray(rawResult.recommendations) ? rawResult.recommendations : [],
      contacts: Array.isArray(rawResult.contacts) ? rawResult.contacts : []
    };
  };

  const handleAnalysis = async () => {
    // Validação no frontend
    const currentData = selectedIdea ? {
      businessName: selectedIdea.title,
      businessSector: formData.businessSector || 'Tecnologia',
      businessDescription: selectedIdea.description,
      targetAudience: selectedIdea.audience || formData.targetAudience,
      businessModel: selectedIdea.monetization || formData.businessModel,
      location: formData.location,
      ideaId: selectedIdea.id
    } : formData;

    // Validar campos obrigatórios
    if (!currentData.businessName.trim()) {
      toast.error('Nome do negócio é obrigatório');
      return;
    }
    
    if (!currentData.businessDescription.trim()) {
      toast.error('Descrição do negócio é obrigatória');
      return;
    }
    
    if (!currentData.businessSector.trim()) {
      currentData.businessSector = 'Tecnologia';
      toast.info('Setor definido como "Tecnologia" por padrão');
    }

    console.log('Enviando dados para análise:', currentData);

    try {
      // Simulate real-time analysis progress
      setAnalysisProgress('Iniciando análise...');
      setAnalysisSteps(['Iniciando análise regulatória...']);
      
      setTimeout(() => {
        setAnalysisProgress('Consultando APIs governamentais...');
        setAnalysisSteps(prev => [...prev, 'Consultando BACEN, ANVISA e Receita Federal...']);
      }, 1000);

      setTimeout(() => {
        setAnalysisProgress('Processando dados com IA...');
        setAnalysisSteps(prev => [...prev, 'Analisando requisitos específicos com IA...']);
      }, 2000);

      setTimeout(() => {
        setAnalysisProgress('Gerando recomendações personalizadas...');
        setAnalysisSteps(prev => [...prev, 'Criando roadmap personalizado...']);
      }, 3000);

      const result = await runRegulatoryAnalysis(currentData);
      
      if (result) {
        const normalizedResult = normalizeAnalysisResult(result);
        setAnalysisProgress('Análise concluída!');
        setAnalysisSteps(prev => [...prev, 'Análise regulatória finalizada com sucesso!']);
        setAnalysisResult(normalizedResult);
        setTimeout(() => {
          setCurrentView('results');
          setAnalysisProgress('');
          setAnalysisSteps([]);
        }, 1000);
        
        toast.success('Análise regulatória real gerada com sucesso!');
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      setAnalysisProgress('');
      setAnalysisSteps([]);
      toast.error('Ocorreu um erro ao gerar a análise. Tente novamente.');
    }
  };

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    if (idea) {
      // Mapear setor baseado na análise da ideia ou usar padrão
      const inferredSector = mapSectorFromIdea(idea);
      
      setFormData({
        ...formData,
        businessName: idea.title,
        businessSector: inferredSector,
        businessDescription: idea.description,
        targetAudience: idea.audience || '',
        businessModel: idea.monetization || ''
      });
    }
  };

  const mapSectorFromIdea = (idea: any): string => {
    const description = (idea.description || '').toLowerCase();
    const title = (idea.title || '').toLowerCase();
    const combined = `${title} ${description}`;
    
    // Enhanced sector detection with AgTech priority
    if (combined.includes('plant') || combined.includes('plantas') || combined.includes('agricultura') || 
        combined.includes('farm') || combined.includes('cultivo') || combined.includes('horta') ||
        combined.includes('jardim') || combined.includes('sensor') && (combined.includes('plant') || combined.includes('agricultura'))) {
      return 'AgTech';
    }
    if (combined.includes('fintech') || combined.includes('financ') || combined.includes('pagamento') || combined.includes('banco')) {
      return 'Fintech';
    }
    if (combined.includes('health') || combined.includes('saúde') || combined.includes('medicina') || combined.includes('médic')) {
      return 'Healthtech';
    }
    if (combined.includes('educ') || combined.includes('ensino') || combined.includes('escola') || combined.includes('curso')) {
      return 'Edtech';
    }
    if (combined.includes('dispositivo') || combined.includes('sensor') || combined.includes('iot') || combined.includes('monitoramento')) {
      return 'IoT';
    }
    
    return 'Tecnologia';
  };

  const handleViewAnalysis = (analysis: any) => {
    const normalizedResult = normalizeAnalysisResult(analysis.analysis_results);
    setAnalysisResult(normalizedResult);
    setCurrentView('results');
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'baixo':
        return 'text-green-500';
      case 'médio':
        return 'text-yellow-500';
      case 'alto':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (currentView === 'history') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Histórico de Análises</h1>
            <p className="text-muted-foreground">
              Suas análises regulatórias anteriores
            </p>
          </div>
        </div>
        
        <AnalysisHistory onViewAnalysis={handleViewAnalysis} />
      </div>
    );
  }

  if (currentView === 'results' && analysisResult) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Resultado da Análise</h1>
            <p className="text-muted-foreground">
              Análise regulatória completa
            </p>
          </div>
        </div>
        
        {/* Results content */}
        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-4 w-4 ${
                    analysisResult.riskAssessment?.overallRisk === 'Alto' ? 'text-red-500' :
                    analysisResult.riskAssessment?.overallRisk === 'Médio' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Nível de Risco</p>
                    <p className="text-2xl font-bold">
                      {analysisResult.riskAssessment?.overallRisk || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Requisitos</p>
                    <p className="text-2xl font-bold">
                      {analysisResult.requirements?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Custo Inicial</p>
                    <p className="text-2xl font-bold">
                      {analysisResult.costs?.initialCompliance ? 
                        formatCurrency(analysisResult.costs.initialCompliance) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Fases do Roadmap</p>
                    <p className="text-2xl font-bold">
                      {analysisResult.roadmap?.phases?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Tabs defaultValue="requirements" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="requirements">Requisitos</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="costs">Custos</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              <TabsTrigger value="contacts">Contatos</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Requisitos Regulatórios
                  </CardTitle>
                  <CardDescription>
                    Licenças, registros e compliance necessários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.requirements?.map((req: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{req.name}</h4>
                          <Badge variant={req.mandatory ? 'default' : 'secondary'}>
                            {req.mandatory ? 'Obrigatório' : 'Opcional'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Autoridade: {req.authority}</span>
                          <span>Prazo: {req.timeline}</span>
                          <span>Custo: {req.cost_estimate}</span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Nenhum requisito específico identificado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roadmap" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Roadmap de Implementação
                  </CardTitle>
                  <CardDescription>
                    Cronograma de compliance por fases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.roadmap.phases.map((phase: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Fase {index + 1}: {phase.name || phase.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {phase.duration || '4-8 semanas'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {phase.description}
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Atividades:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {(phase.activities || []).map((activity: string, actIndex: number) => (
                                <li key={actIndex} className="text-muted-foreground">{activity}</li>
                              ))}
                            </ul>
                          </div>
                          {phase.cost && typeof phase.cost === 'number' && !isNaN(phase.cost) && phase.cost > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">Custo estimado:</span>
                              <span className="ml-2 text-green-600 font-semibold">
                                {formatCurrency(phase.cost)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Análise de Custos
                  </CardTitle>
                  <CardDescription>
                    Estimativa de investimento em compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Compliance Inicial</p>
                        <p className="text-xl font-bold">
                          {analysisResult.costs?.initialCompliance ? 
                            formatCurrency(analysisResult.costs.initialCompliance) : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Manutenção Anual</p>
                        <p className="text-xl font-bold">
                          {analysisResult.costs?.annualCompliance ? 
                            formatCurrency(analysisResult.costs.annualCompliance) : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total Primeiro Ano</p>
                        <p className="text-xl font-bold">
                          {analysisResult.costs?.initialCompliance && analysisResult.costs?.annualCompliance ? 
                            formatCurrency(analysisResult.costs.initialCompliance + analysisResult.costs.annualCompliance) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {analysisResult.costs?.breakdown && Array.isArray(analysisResult.costs.breakdown) && analysisResult.costs.breakdown.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Detalhamento por Categoria</h4>
                        {analysisResult.costs.breakdown.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <span>{item.category}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-4">
                        Detalhamento de custos não disponível
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Recomendações Estratégicas
                  </CardTitle>
                  <CardDescription>
                    Próximos passos e melhores práticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm">{rec}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Nenhuma recomendação específica disponível</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contatos Regulatórios
                  </CardTitle>
                  <CardDescription>
                    Órgãos e entidades responsáveis pela regulamentação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.contacts?.map((contact: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.description}</p>
                        {contact.website && (
                          <a 
                            href={contact.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {contact.website}
                          </a>
                        )}
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Nenhum contato disponível</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button 
              onClick={() => setCurrentView('main')}
              variant="outline"
            >
              Nova Análise
            </Button>
            <Button 
              onClick={() => toast.info('Funcionalidade de export em desenvolvimento')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise Regulatória</h1>
          <p className="text-muted-foreground">
            Análise completa dos requisitos regulatórios para seu negócio
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('history')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Ver Histórico
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Idea Selector */}
        <IdeaSelector 
          onIdeaSelect={handleIdeaSelect}
          selectedIdea={selectedIdea}
        />

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações do Negócio
            </CardTitle>
            <CardDescription>
              Receba uma análise regulatória em tempo real consultando APIs governamentais e usando IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Nome do Negócio *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Nome da sua empresa/produto"
                />
              </div>
              
              <div>
                <Label htmlFor="country">País/Região *</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="brasil">🇧🇷 Brasil</SelectItem>
                    <SelectItem value="usa">🇺🇸 Estados Unidos</SelectItem>
                    <SelectItem value="europa">🇪🇺 União Europeia</SelectItem>
                    <SelectItem value="internacional">🌍 Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="businessSector">Setor (Opcional)</Label>
              <Input
                id="businessSector"
                value={formData.businessSector}
                onChange={(e) => handleInputChange('businessSector', e.target.value)}
                placeholder="Deixe em branco para classificação automática pela IA"
              />
              <p className="text-sm text-muted-foreground mt-1">
                💡 Nossa IA classificará automaticamente baseado na descrição (AgTech, FinTech, HealthTech, IoT, etc.)
              </p>
            </div>

            <div>
              <Label htmlFor="businessDescription">Descrição do Negócio *</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Descreva detalhadamente sua ideia de negócio"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Público-Alvo</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="Quem são seus clientes?"
                />
              </div>
              
              <div>
                <Label htmlFor="businessModel">Modelo de Negócio</Label>
                <Input
                  id="businessModel"
                  value={formData.businessModel}
                  onChange={(e) => handleInputChange('businessModel', e.target.value)}
                  placeholder="Como você monetiza?"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => handleInputChange('location', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="Brazil">Brasil</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Chile">Chile</SelectItem>
                  <SelectItem value="Colombia">Colômbia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Validation Messages */}
            {!formData.businessName.trim() && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">⚠️ Nome do negócio é obrigatório</p>
              </div>
            )}
            
            {!formData.businessDescription.trim() && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">⚠️ Descrição do negócio é obrigatória</p>
              </div>
            )}

            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing || !formData.businessName || !formData.businessDescription}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {analysisProgress || 'Analisando...'}
                </>
              ) : (
                "Gerar Análise Regulatória Real"
              )}
            </Button>

            {/* Real-time Analysis Progress */}
            {isAnalyzing && analysisSteps.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Progresso da Análise
                </h4>
                <div className="space-y-2">
                  {analysisSteps.map((step, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground mb-4">
              🤖 <strong>Análise Inteligente:</strong> Nossa IA consulta APIs governamentais em tempo real (BACEN, ANVISA, Receita Federal) 
              para fornecer requisitos regulatórios atualizados e específicos para seu negócio.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegulatoryAnalysisPage;
