import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3, Target, Zap, Lightbulb, Save, History } from "lucide-react";
import ScenarioBuilder from "@/components/scenario/ScenarioBuilder";
import SensitivityAnalysisPanel from "@/components/scenario/SensitivityAnalysisPanel";
import ScenarioSimulatorResults from "@/components/scenario/ScenarioSimulatorResults";
import IdeaDataEditor from "@/components/scenario/IdeaDataEditor";
import SaveSimulationModal from "@/components/scenario/SaveSimulationModal";
import HistoricalSimulationsPanel from "@/components/scenario/HistoricalSimulationsPanel";
import { useScenarioSimulator, SimulationVariable, ScenarioType } from "@/hooks/useScenarioSimulator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { extractFinancialData, generateSmartDefaults, validateFinancialData } from "@/lib/financial-parser";

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
  const [customIdeaData, setCustomIdeaData] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState([]);
  const { authState } = useAuth();
  const { runSimulation, createDefaultVariables, saveSimulation, loadSimulations } = useScenarioSimulator();

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
    fetchSavedSimulations();
  }, [authState.user?.id]);

  const fetchSavedSimulations = async () => {
    try {
      const data = await loadSimulations();
      setSavedSimulations(data);
    } catch (error) {
      console.error('Error fetching saved simulations:', error);
    }
  };

  const getSelectedIdeaData = () => {
    // Se há dados customizados, usa eles
    if (customIdeaData) {
      return customIdeaData;
    }
    
    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (!selectedIdea || selectedIdeaId === 'custom') {
      // Para dados customizados, aplica validação
      if (customIdeaData) {
        return {
          ...customIdeaData,
          initial_investment: Math.max(1000, Math.min(customIdeaData.initial_investment || 100000, 10000000)),
          monthly_costs: Math.max(100, Math.min(customIdeaData.monthly_costs || 10000, 1000000)),
          pricing: Math.max(1, Math.min(customIdeaData.pricing || 99, 100000)),
          target_market_size: Math.max(1000, Math.min(customIdeaData.target_market_size || 1000000, 100000000))
        };
      }
      
      const defaultData = {
        title: 'Simulação Personalizada',
        description: 'Análise Monte Carlo personalizada',
        monetization: 'SaaS',
        target_market_size: 1000000,
        initial_investment: 100000,
        monthly_costs: 10000,
        revenue_model: 'Subscription',
        pricing: 99
      };
      
      // Se é simulação personalizada e não tem dados customizados, define os padrão
      if (selectedIdeaId === 'custom' && !customIdeaData) {
        setCustomIdeaData(defaultData);
      }
      
      return defaultData;
    }

    const analysis = selectedIdea.idea_analyses?.[0];
    
    // Usa o parser inteligente para extrair dados financeiros
    const extractedData = extractFinancialData(analysis);
    
    // Se não conseguir extrair dados válidos, usa valores padrão inteligentes
    let smartDefaults: any = {};
    if (extractedData.initial_investment === 0 && extractedData.monthly_costs === 0 && extractedData.pricing === 0) {
      smartDefaults = generateSmartDefaults(selectedIdea);
    }

    // Aplica validação e limites aos dados extraídos
    const validatedData = {
      title: selectedIdea.title,
      description: selectedIdea.description,
      monetization: selectedIdea.monetization || 'SaaS',
      target_market_size: Math.max(1000, Math.min(extractedData.target_market_size || smartDefaults.target_market_size || 1000000, 100000000)),
      initial_investment: Math.max(1000, Math.min(extractedData.initial_investment || smartDefaults.initial_investment || 100000, 10000000)),
      monthly_costs: Math.max(100, Math.min(extractedData.monthly_costs || smartDefaults.monthly_costs || 10000, 1000000)),
      revenue_model: analysis?.financial_analysis?.revenue_model || 'Subscription',
      pricing: Math.max(1, Math.min(extractedData.pricing || smartDefaults.pricing || 99, 100000))
    };
    
    console.log('Dados validados para simulação:', validatedData);
    return validatedData;
  };

  const handleRunSimulation = async (scenarios: ScenarioType[]) => {
    try {
      setIsSimulating(true);
      
      // Get idea data for simulation
      const ideaData = getSelectedIdeaData();
      
      // Valida dados financeiros
      const validation = validateFinancialData(ideaData);
      if (!validation.isValid) {
        validation.warnings.forEach(warning => toast.error(warning));
        return;
      }
      
      // Create default variables if none exist
      let currentVariables = variables;
      if (currentVariables.length === 0) {
        const defaultVars = createDefaultVariables(ideaData);
        setVariables(defaultVars);
        currentVariables = defaultVars;
      }
      
      const simulationParams = {
        timeHorizon: 36,
        iterations: 1000,
        confidenceLevel: 95,
        variables: currentVariables
      };
      
      console.log('Running simulation with data:', { ideaData, simulationParams });
      
      // Run simulation with correct parameters
      const result = await runSimulation(ideaData, simulationParams, scenarios);
      
      if (result) {
        console.log('Simulation result:', result);
        setSimulationResults(result);
        setActiveTab('results');
        toast.success('Simulação concluída com sucesso!');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Erro ao executar simulação: ' + error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleVariableChange = (newVariables: SimulationVariable[]) => {
    setVariables(newVariables);
  };

  const handleIdeaDataChange = (newData: any) => {
    setCustomIdeaData(newData);
    // Reset variables quando os dados da ideia mudam
    setVariables([]);
    setSimulationResults(null);
  };

  const handleRunAnalysis = async (testVariables: SimulationVariable[]) => {
    try {
      const ideaData = getSelectedIdeaData();
      
      const simulationParams = {
        timeHorizon: 24,
        iterations: 500,
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

  const handleSaveSimulation = async (simulationName: string) => {
    setIsSaving(true);
    try {
      const success = await saveSimulation(simulationName);
      if (success) {
        await fetchSavedSimulations(); // Refresh the list
      }
    } catch (error) {
      console.error('Error saving simulation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSimulation = (simulation: any) => {
    // Load historical simulation data
    setSimulationResults({
      ...simulation.results,
      ideaTitle: simulation.financial_data.idea_title,
      simulationParams: simulation.simulation_params,
      revenueModel: simulation.revenue_model
    });
    setActiveTab('results');
    toast.success('Simulação carregada com sucesso!');
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
                  onValueChange={(value) => {
                    setSelectedIdeaId(value);
                    setCustomIdeaData(null); // Reset dados customizados
                    setVariables([]); // Reset variáveis
                    setSimulationResults(null); // Reset resultados
                  }}
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">Simulações Salvas</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {savedSimulations.length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Idea Data Editor */}
          {selectedIdeaId && (
              <IdeaDataEditor
                ideaData={getSelectedIdeaData()}
                onSave={handleIdeaDataChange}
                isCustomSimulation={selectedIdeaId === 'custom'}
                allowEdit={true}
              />
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="builder">Construtor de Cenários</TabsTrigger>
              <TabsTrigger value="sensitivity">Análise de Sensibilidade</TabsTrigger>
              <TabsTrigger value="results" disabled={!simulationResults}>
                Resultados
              </TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
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
                baselineResult={simulationResults?.results?.realistic?.statistics?.mean || 0}
                onVariableChange={handleVariableChange}
                onRunAnalysis={handleRunAnalysis}
              />
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="mt-6">
              {simulationResults ? (
                <div className="space-y-6">
                  {/* Save Simulation Button */}
                  <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Gostou dos resultados?</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Salve esta simulação para acessá-la posteriormente
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowSaveModal(true)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Simulação
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <ScenarioSimulatorResults
                    results={simulationResults}
                    onExport={() => {
                      toast.success('Resultados exportados com sucesso!');
                    }}
                  />
                </div>
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

            {/* Historical Simulations Tab */}
            <TabsContent value="history" className="mt-6">
              <HistoricalSimulationsPanel onLoadSimulation={handleLoadSimulation} />
            </TabsContent>
          </Tabs>

          {/* Save Simulation Modal */}
          <SaveSimulationModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveSimulation}
            isLoading={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulatorPage;