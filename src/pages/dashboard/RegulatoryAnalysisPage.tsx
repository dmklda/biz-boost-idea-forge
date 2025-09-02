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
    location: 'Brazil'
  });

  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'main' | 'history' | 'results'>('main');
  const { runRegulatoryAnalysis, isAnalyzing } = useRegulatoryAnalysis();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalysis = async () => {
    // Se uma ideia foi selecionada, preencher dados automaticamente
    const analysisData = selectedIdea ? {
      businessName: selectedIdea.title,
      businessSector: formData.businessSector || 'Tecnologia',
      businessDescription: selectedIdea.description,
      targetAudience: selectedIdea.audience || formData.targetAudience,
      businessModel: selectedIdea.monetization || formData.businessModel,
      location: formData.location,
      ideaId: selectedIdea.id
    } : formData;

    const result = await runRegulatoryAnalysis(analysisData);
    
    if (result) {
      setAnalysisResult(result);
      setCurrentView('results');
    }
  };

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    if (idea) {
      setFormData({
        ...formData,
        businessName: idea.title,
        businessDescription: idea.description,
        targetAudience: idea.audience || '',
        businessModel: idea.monetization || ''
      });
    }
  };

  const handleViewAnalysis = (analysis: any) => {
    setAnalysisResult(analysis.analysis_results);
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
                    {analysisResult.roadmap?.phases?.map((phase: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{phase.phase}</h4>
                          <Badge variant={phase.critical_path ? 'default' : 'secondary'}>
                            {phase.timeline}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {phase.requirements?.map((req: string, reqIndex: number) => (
                            <div key={reqIndex} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{req}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Custo estimado:</strong> {phase.estimated_cost}
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">Roadmap não disponível</p>
                    )}
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
                    {analysisResult.costs?.breakdown && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Detalhamento por Categoria</h4>
                        {analysisResult.costs.breakdown.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <span>{item.category}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
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
              Preencha os dados para análise regulatória personalizada
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
                <Label htmlFor="businessSector">Setor *</Label>
                <Select 
                  value={formData.businessSector} 
                  onValueChange={(value) => handleInputChange('businessSector', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="edtech">EdTech</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing || !formData.businessName || !formData.businessSector || !formData.businessDescription}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  Realizar Análise Regulatória
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegulatoryAnalysisPage;