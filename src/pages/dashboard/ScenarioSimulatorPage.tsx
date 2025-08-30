import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Target, Zap, Lightbulb } from "lucide-react";
import ScenarioBuilder from "@/components/scenario/ScenarioBuilder";
import SensitivityAnalysisPanel from "@/components/scenario/SensitivityAnalysisPanel";
import ScenarioSimulatorResults from "@/components/scenario/ScenarioSimulatorResults";
import { useScenarioSimulator, SimulationVariable, ScenarioType } from "@/hooks/useScenarioSimulator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface IdeaWithAnalysis {
  id: string;
  title: string;
  description: string;
  monetization?: string;
  budget?: number;
  location?: string;
  audience?: string;
  idea_analyses?: {
    financial_analysis?: any;
    market_analysis?: any;
  }[];
}

const ScenarioSimulatorPage = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [simulationResults, setSimulationResults] = useState(null);
  const [variables, setVariables] = useState<SimulationVariable[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [ideas, setIdeas] = useState<IdeaWithAnalysis[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const { authState } = useAuth();
  const { runSimulation, createDefaultVariables } = useScenarioSimulator();

  const fetchIdeas = async () => {
    if (!authState.user?.id) return;
    
    try {
      setLoadingIdeas(true);
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          monetization,
          budget,
          location,
          audience,
          idea_analyses (
            financial_analysis,
            market_analysis
          )
        `)
        .eq('user_id', authState.user.id)
        .not('idea_analyses', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
      toast.error('Erro ao carregar suas ideias');
    } finally {
      setLoadingIdeas(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [authState.user?.id]);

  const getSelectedIdeaData = () => {
    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (!selectedIdea || selectedIdeaId === 'custom') {
      return {
        title: 'Simulação Personalizada',
        description: 'Análise Monte Carlo personalizada',
        monetization: 'SaaS',
        target_market_size: 1000000,
        initial_investment: 100000,
        monthly_costs: 10000,
        revenue_model: 'Subscription',
        pricing: 99
      };
    }

    const analysis = selectedIdea.idea_analyses?.[0];
    const financialData = analysis?.financial_analysis;
    const marketData = analysis?.market_analysis;

    return {
      title: selectedIdea.title,
      description: selectedIdea.description,
      monetization: selectedIdea.monetization || 'SaaS',
      target_market_size: marketData?.target_market_size || selectedIdea.budget || 1000000,
      initial_investment: financialData?.initial_investment || selectedIdea.budget || 100000,
      monthly_costs: financialData?.monthly_costs || 10000,
      revenue_model: financialData?.revenue_model || 'Subscription',
      pricing: financialData?.pricing || 99
    };
  };

  const handleRunSimulation = async (scenarios: ScenarioType[]) => {
    try {
      setIsSimulating(true);
      
      // Create default variables if none exist
      let currentVariables = variables;
      if (currentVariables.length === 0) {
        const ideaData = getSelectedIdeaData();
        const defaultVars = createDefaultVariables(ideaData);
        setVariables(defaultVars);
        currentVariables = defaultVars;
      }
      
      // Get idea data for simulation
      const ideaData = getSelectedIdeaData();
      
      const simulationParams = {
        timeHorizon: 60,
        iterations: 10000,
        confidenceLevel: 95,
        variables: currentVariables
      };
      
      // Run simulation with correct parameters
      const result = await runSimulation(ideaData, simulationParams, scenarios);
      
      if (result) {
        setSimulationResults(result);
        setActiveTab('results');
        toast.success('Simulação concluída com sucesso!');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Erro ao executar simulação');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleVariableChange = (newVariables: SimulationVariable[]) => {
    setVariables(newVariables);
  };

  const handleRunAnalysis = async (testVariables: SimulationVariable[]) => {
    try {
      const ideaData = getSelectedIdeaData();
      
      const simulationParams = {
        timeHorizon: 60,
        iterations: 1000,
        confidenceLevel: 95,
        variables: testVariables
      };
      
      const result = await runSimulation(ideaData, simulationParams, ['realistic']);
      
      if (result && result.results && result.results.realistic) {
        return result.results.realistic.statistics.mean;
      }
      return 0;
    } catch (error) {
      console.error('Error in analysis:', error);
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
              Simulador de Cenários Monte Carlo
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mb-6">
              Crie cenários otimistas, realistas e pessimistas para sua ideia de negócio e execute simulações avançadas Monte Carlo.
            </p>
            
            {/* Idea Selector */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Selecionar Ideia para Simulação</CardTitle>
                </div>
                <CardDescription>
                  Escolha uma de suas ideias analisadas ou faça uma simulação personalizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedIdeaId} 
                  onValueChange={setSelectedIdeaId}
                  disabled={loadingIdeas}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      loadingIdeas ? "Carregando ideias..." : 
                      ideas.length === 0 ? "Nenhuma ideia analisada encontrada" :
                      "Selecione uma ideia ou faça simulação personalizada"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Simulação Personalizada</SelectItem>
                    {ideas.map((idea) => (
                      <SelectItem key={idea.id} value={idea.id}>
                        {idea.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedIdeaId && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Ideia selecionada:</strong> {ideas.find(i => i.id === selectedIdeaId)?.title || 'Simulação Personalizada'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Cenários Criados</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Variáveis Configuradas</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{variables.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Simulações Executadas</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {simulationResults ? simulationResults.length : 0}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder">Construtor de Cenários</TabsTrigger>
              <TabsTrigger value="sensitivity">Análise de Sensibilidade</TabsTrigger>
              <TabsTrigger value="results" disabled={!simulationResults}>
                Resultados
              </TabsTrigger>
            </TabsList>

            {/* Scenario Builder Tab */}
            <TabsContent value="builder" className="mt-6">
              <ScenarioBuilder
                onScenariosChange={(scenarios) => {
                  // Handle scenario configuration changes
                  console.log('Scenarios updated:', scenarios);
                }}
                onRunSimulation={handleRunSimulation}
                isSimulating={isSimulating}
              />
            </TabsContent>

            {/* Sensitivity Analysis Tab */}
            <TabsContent value="sensitivity" className="mt-6">
              <SensitivityAnalysisPanel
                variables={variables}
                baselineResult={simulationResults?.[0]?.expectedValue || 1000000}
                onVariableChange={handleVariableChange}
                onRunAnalysis={handleRunAnalysis}
              />
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="mt-6">
              {simulationResults ? (
                <ScenarioSimulatorResults
                  results={simulationResults}
                  onExport={() => {
                    toast.success('Resultados exportados com sucesso!');
                  }}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma simulação executada</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure seus cenários e execute uma simulação para ver os resultados aqui.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulatorPage;