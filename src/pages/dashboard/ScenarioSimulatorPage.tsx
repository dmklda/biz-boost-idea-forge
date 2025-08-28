import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Target, Zap } from "lucide-react";
import ScenarioBuilder from "@/components/scenario/ScenarioBuilder";
import SensitivityAnalysisPanel from "@/components/scenario/SensitivityAnalysisPanel";
import ScenarioSimulatorResults from "@/components/scenario/ScenarioSimulatorResults";
import { useScenarioSimulator, SimulationVariable, ScenarioType } from "@/hooks/useScenarioSimulator";
import { toast } from "@/components/ui/sonner";

const ScenarioSimulatorPage = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [simulationResults, setSimulationResults] = useState(null);
  const [variables, setVariables] = useState<SimulationVariable[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const { runSimulation, createDefaultVariables } = useScenarioSimulator();

  const handleRunSimulation = async (scenarios: ScenarioType[]) => {
    try {
      setIsSimulating(true);
      
      // Create default variables if none exist
      let currentVariables = variables;
      if (currentVariables.length === 0) {
        const defaultVars = createDefaultVariables({
          title: 'Default Idea',
          description: 'Default description',
          monetization: 'SaaS',
          target_market_size: 1000000,
          initial_investment: 100000,
          monthly_costs: 10000,
          revenue_model: 'Subscription',
          pricing: 99
        });
        setVariables(defaultVars);
        currentVariables = defaultVars;
      }
      
      // Create mock idea data for simulation
      const ideaData = {
        title: 'Simulação de Cenários',
        description: 'Análise Monte Carlo para validação de negócio',
        monetization: 'SaaS',
        target_market_size: 1000000,
        initial_investment: 100000,
        monthly_costs: 10000,
        revenue_model: 'Subscription',
        pricing: 99
      };
      
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
      const ideaData = {
        title: 'Análise de Sensibilidade',
        description: 'Teste de variáveis para análise de sensibilidade',
        monetization: 'SaaS',
        target_market_size: 1000000,
        initial_investment: 100000,
        monthly_costs: 10000,
        revenue_model: 'Subscription',
        pricing: 99
      };
      
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
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
              Crie cenários otimistas, realistas e pessimistas para sua ideia de negócio e execute simulações avançadas Monte Carlo.
            </p>
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