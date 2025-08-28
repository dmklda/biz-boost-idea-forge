import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Phone,
  ExternalLink,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RegulatoryAnalysisResult {
  sector: string;
  jurisdiction: string;
  requirements: any[];
  frameworks: any[];
  roadmap: any[];
  risk_assessment: {
    overall_risk: string;
    key_risks: string[];
    mitigation_strategies: string[];
  };
  estimated_costs: {
    initial_compliance: number;
    annual_maintenance: number;
    total_first_year: number;
  };
  recommendations: string[];
  next_steps: string[];
  regulatory_contacts: any[];
  generatedAt: string;
}

const RegulatoryAnalysisPage = () => {
  const { authState } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RegulatoryAnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sector: '',
    business_model: '',
    target_audience: '',
    location: 'brazil',
    data_handling: false,
    financial_transactions: false,
    health_data: false,
    minors_data: false,
    international_operations: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const runRegulatoryAnalysis = async () => {
    if (!formData.title || !formData.sector) {
      toast.error('Por favor, preencha pelo menos o título e setor');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('regulatory-analysis', {
        body: {
          ideaData: formData,
          analysisDepth: 'comprehensive',
          jurisdiction: 'brazil'
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast.success('Análise regulatória concluída!');
    } catch (error) {
      console.error('Error in regulatory analysis:', error);
      toast.error('Erro ao executar análise regulatória');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[risk as keyof typeof colors] || colors.medium;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
              Análise Regulatória Automática
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
              Identifique automaticamente os requisitos regulatórios, licenças e compliance necessários para sua ideia de negócio.
            </p>
          </div>

          {!analysisResult ? (
            /* Input Form */
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Informações do Negócio
                </CardTitle>
                <CardDescription>
                  Forneça detalhes sobre sua ideia para uma análise regulatória precisa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título da Ideia *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: App de Pagamentos Digitais"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sector">Setor *</Label>
                    <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fintech">FinTech</SelectItem>
                        <SelectItem value="healthtech">HealthTech</SelectItem>
                        <SelectItem value="edtech">EdTech</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva sua ideia de negócio em detalhes..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_model">Modelo de Negócio</Label>
                    <Input
                      id="business_model"
                      value={formData.business_model}
                      onChange={(e) => handleInputChange('business_model', e.target.value)}
                      placeholder="Ex: SaaS, Marketplace, Freemium"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target_audience">Público-Alvo</Label>
                    <Input
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => handleInputChange('target_audience', e.target.value)}
                      placeholder="Ex: Pequenas empresas, Consumidores finais"
                    />
                  </div>
                </div>

                {/* Características Especiais */}
                <div>
                  <Label className="text-base font-medium">Características do Negócio</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {[
                      { key: 'data_handling', label: 'Manipula dados pessoais' },
                      { key: 'financial_transactions', label: 'Processa transações financeiras' },
                      { key: 'health_data', label: 'Lida com dados de saúde' },
                      { key: 'minors_data', label: 'Coleta dados de menores' },
                      { key: 'international_operations', label: 'Operações internacionais' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={formData[item.key as keyof typeof formData] as boolean}
                          onChange={(e) => handleInputChange(item.key, e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={item.key} className="text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={runRegulatoryAnalysis}
                  disabled={isAnalyzing || !formData.title || !formData.sector}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analisando Requisitos Regulatórios...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Executar Análise Regulatória
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Risco Geral</p>
                        <Badge className={getRiskColor(analysisResult.risk_assessment.overall_risk)}>
                          {analysisResult.risk_assessment.overall_risk.toUpperCase()}
                        </Badge>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Requisitos</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {analysisResult.requirements.length}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Custo Inicial</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(analysisResult.estimated_costs.initial_compliance)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Fases do Roadmap</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {analysisResult.roadmap.length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Tabs defaultValue="requirements">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="requirements">Requisitos</TabsTrigger>
                  <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                  <TabsTrigger value="costs">Custos</TabsTrigger>
                  <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                  <TabsTrigger value="contacts">Contatos</TabsTrigger>
                </TabsList>

                <TabsContent value="requirements" className="mt-6">
                  <div className="space-y-4">
                    {analysisResult.requirements.map((req, index) => (
                      <Card key={index} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{req.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">{req.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <Badge variant={req.mandatory ? 'default' : 'secondary'}>
                                  {req.mandatory ? 'Obrigatório' : 'Opcional'}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {req.timeline}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {req.cost_estimate}
                                </span>
                              </div>
                            </div>
                            <Badge className={getRiskColor(req.complexity)}>
                              {req.complexity}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Autoridade:</strong> {req.authority}
                          </div>
                          {req.penalties && (
                            <div className="text-sm text-red-600 mt-2">
                              <strong>Penalidades:</strong> {req.penalties}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="roadmap" className="mt-6">
                  <div className="space-y-4">
                    {analysisResult.roadmap.map((phase, index) => (
                      <Card key={index} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{phase.phase}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={phase.critical_path ? 'default' : 'secondary'}>
                                {phase.critical_path ? 'Crítico' : 'Opcional'}
                              </Badge>
                              <span className="text-sm text-gray-600">{phase.timeline}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {phase.requirements.map((req: string, reqIndex: number) => (
                              <div key={reqIndex} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{req}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 text-sm text-gray-600">
                            <strong>Custo estimado:</strong> {phase.estimated_cost}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="costs" className="mt-6">
                  <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <h3 className="font-semibold mb-2">Compliance Inicial</h3>
                          <p className="text-3xl font-bold text-blue-600">
                            {formatCurrency(analysisResult.estimated_costs.initial_compliance)}
                          </p>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold mb-2">Manutenção Anual</h3>
                          <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(analysisResult.estimated_costs.annual_maintenance)}
                          </p>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold mb-2">Total Primeiro Ano</h3>
                          <p className="text-3xl font-bold text-purple-600">
                            {formatCurrency(analysisResult.estimated_costs.total_first_year)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Recomendações Estratégicas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Próximos Passos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.next_steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                {index + 1}
                              </div>
                              <span className="text-sm">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.regulatory_contacts.map((contact, index) => (
                      <Card key={index} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-2">{contact.authority}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{contact.purpose}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            <span>{contact.contact_info}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => setAnalysisResult(null)}
                  variant="outline"
                >
                  Nova Análise
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulatoryAnalysisPage;