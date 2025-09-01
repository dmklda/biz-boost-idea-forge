import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings, 
  Play, 
  Save, 
  Copy, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import { useScenarioSimulator } from "@/hooks/useScenarioSimulator";
import { ScenarioType } from "@/types/scenario";
import { toast } from "@/components/ui/sonner";

interface ScenarioConfig {
  name: string;
  description: string;
  marketGrowth: number;
  adoptionRate: number;
  competitionImpact: number;
  costEfficiency: number;
  economicConditions: number;
  regulatoryRisk: number;
  technologyRisk: number;
  customFactors: {
    name: string;
    value: number;
    impact: 'positive' | 'negative';
  }[];
  assumptions: string[];
  keyRisks: string[];
  opportunities: string[];
}

interface ScenarioComparison {
  metric: string;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  unit: string;
}

interface ScenarioBuilderProps {
  onScenariosChange?: (scenarios: { [key in ScenarioType]: ScenarioConfig }) => void;
  onRunSimulation?: (scenarios: ScenarioType[]) => void;
  isSimulating?: boolean;
}

const ScenarioBuilder = ({ onScenariosChange, onRunSimulation, isSimulating }: ScenarioBuilderProps) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('realistic');
  const [scenarios, setScenarios] = useState<{ [key in ScenarioType]: ScenarioConfig }>({
    optimistic: {
      name: 'Cenário Otimista',
      description: 'Condições favoráveis de mercado com crescimento acelerado',
      marketGrowth: 150, // 150% of baseline
      adoptionRate: 180,
      competitionImpact: 70, // Lower competition impact
      costEfficiency: 120, // Better cost efficiency
      economicConditions: 130,
      regulatoryRisk: 80, // Lower regulatory risk
      technologyRisk: 90,
      customFactors: [],
      assumptions: [
        'Crescimento econômico sustentado',
        'Adoção rápida da tecnologia',
        'Ambiente regulatório favorável',
        'Baixa resistência do mercado'
      ],
      keyRisks: [
        'Superestimação da demanda',
        'Entrada de grandes concorrentes',
        'Mudanças regulatórias inesperadas'
      ],
      opportunities: [
        'Expansão internacional acelerada',
        'Parcerias estratégicas',
        'Inovações disruptivas'
      ]
    },
    realistic: {
      name: 'Cenário Realista',
      description: 'Condições normais de mercado baseadas em dados históricos',
      marketGrowth: 100, // Baseline
      adoptionRate: 100,
      competitionImpact: 100,
      costEfficiency: 100,
      economicConditions: 100,
      regulatoryRisk: 100,
      technologyRisk: 100,
      customFactors: [],
      assumptions: [
        'Crescimento moderado do mercado',
        'Adoção gradual da solução',
        'Competição equilibrada',
        'Estabilidade regulatória'
      ],
      keyRisks: [
        'Flutuações econômicas',
        'Mudanças nas preferências do consumidor',
        'Pressão competitiva'
      ],
      opportunities: [
        'Otimização de processos',
        'Expansão de mercado',
        'Melhorias incrementais'
      ]
    },
    pessimistic: {
      name: 'Cenário Pessimista',
      description: 'Condições adversas com múltiplos desafios de mercado',
      marketGrowth: 70, // 70% of baseline
      adoptionRate: 60,
      competitionImpact: 140, // Higher competition impact
      costEfficiency: 80, // Lower cost efficiency
      economicConditions: 70,
      regulatoryRisk: 130, // Higher regulatory risk
      technologyRisk: 120,
      customFactors: [],
      assumptions: [
        'Recessão econômica',
        'Resistência à mudança',
        'Competição intensa',
        'Regulamentação restritiva'
      ],
      keyRisks: [
        'Contração do mercado',
        'Guerra de preços',
        'Mudanças regulatórias adversas',
        'Problemas de financiamento'
      ],
      opportunities: [
        'Consolidação do mercado',
        'Aquisição de concorrentes',
        'Foco em eficiência'
      ]
    }
  });
  
  const [comparisonData, setComparisonData] = useState<ScenarioComparison[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { getScenarioInfo } = useScenarioSimulator();

  useEffect(() => {
    updateComparisonData();
    if (onScenariosChange) {
      onScenariosChange(scenarios);
    }
  }, [scenarios]);

  const updateScenario = (scenario: ScenarioType, updates: Partial<ScenarioConfig>) => {
    setScenarios(prev => ({
      ...prev,
      [scenario]: { ...prev[scenario], ...updates }
    }));
  };

  const updateComparisonData = () => {
    const data: ScenarioComparison[] = [
      {
        metric: 'Crescimento de Mercado',
        optimistic: scenarios.optimistic.marketGrowth,
        realistic: scenarios.realistic.marketGrowth,
        pessimistic: scenarios.pessimistic.marketGrowth,
        unit: '%'
      },
      {
        metric: 'Taxa de Adoção',
        optimistic: scenarios.optimistic.adoptionRate,
        realistic: scenarios.realistic.adoptionRate,
        pessimistic: scenarios.pessimistic.adoptionRate,
        unit: '%'
      },
      {
        metric: 'Impacto da Competição',
        optimistic: scenarios.optimistic.competitionImpact,
        realistic: scenarios.realistic.competitionImpact,
        pessimistic: scenarios.pessimistic.competitionImpact,
        unit: '%'
      },
      {
        metric: 'Eficiência de Custos',
        optimistic: scenarios.optimistic.costEfficiency,
        realistic: scenarios.realistic.costEfficiency,
        pessimistic: scenarios.pessimistic.costEfficiency,
        unit: '%'
      }
    ];
    setComparisonData(data);
  };

  const addCustomFactor = (scenario: ScenarioType) => {
    const newFactor = {
      name: 'Novo Fator',
      value: 100,
      impact: 'positive' as const
    };
    
    updateScenario(scenario, {
      customFactors: [...scenarios[scenario].customFactors, newFactor]
    });
  };

  const removeCustomFactor = (scenario: ScenarioType, index: number) => {
    const updatedFactors = scenarios[scenario].customFactors.filter((_, i) => i !== index);
    updateScenario(scenario, { customFactors: updatedFactors });
  };

  const updateCustomFactor = (scenarioKey: ScenarioType, index: number, updates: Partial<{name: string; value: number; impact: 'positive' | 'negative'}>) => {
    const scenario = scenarios[scenarioKey];
    const updatedFactors = scenario.customFactors.map((factor, i) => 
      i === index ? { ...factor, ...updates } : factor
    );
    updateScenario(scenarioKey, { customFactors: updatedFactors });
  };

  const copyScenario = (fromScenario: ScenarioType, toScenario: ScenarioType) => {
    const scenarioToCopy = { ...scenarios[fromScenario] };
    scenarioToCopy.name = scenarios[toScenario].name;
    updateScenario(toScenario, scenarioToCopy);
    toast.success(`Cenário ${getScenarioInfo(fromScenario).name} copiado para ${getScenarioInfo(toScenario).name}`);
  };

  const resetScenario = (scenario: ScenarioType) => {
    // Reset to default values based on scenario type
    const defaults = {
      optimistic: { marketGrowth: 150, adoptionRate: 180, competitionImpact: 70, costEfficiency: 120 },
      realistic: { marketGrowth: 100, adoptionRate: 100, competitionImpact: 100, costEfficiency: 100 },
      pessimistic: { marketGrowth: 70, adoptionRate: 60, competitionImpact: 140, costEfficiency: 80 }
    };
    
    updateScenario(scenario, {
      ...defaults[scenario],
      customFactors: [],
      economicConditions: defaults[scenario].marketGrowth,
      regulatoryRisk: scenario === 'pessimistic' ? 130 : scenario === 'optimistic' ? 80 : 100,
      technologyRisk: scenario === 'pessimistic' ? 120 : scenario === 'optimistic' ? 90 : 100
    });
    
    toast.success(`Cenário ${getScenarioInfo(scenario).name} resetado`);
  };

  const getScenarioColor = (scenario: ScenarioType) => {
    const colors = {
      optimistic: '#10B981',
      realistic: '#3B82F6',
      pessimistic: '#EF4444'
    };
    return colors[scenario];
  };

  const currentScenario = scenarios[activeScenario];
  const scenarioInfo = getScenarioInfo(activeScenario);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Construtor de Cenários
          </CardTitle>
          <CardDescription>
            Configure parâmetros específicos para cada cenário de simulação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['optimistic', 'realistic', 'pessimistic'] as ScenarioType[]).map((scenario) => {
                const info = getScenarioInfo(scenario);
                return (
                  <button
                    key={scenario}
                    onClick={() => setActiveScenario(scenario)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeScenario === scenario
                        ? `${info.bgColor} ${info.color} shadow-sm`
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
                  >
                    {info.icon} {info.name}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Básico' : 'Avançado'}
              </Button>
              
              {onRunSimulation && (
                <Button
                  onClick={() => onRunSimulation(['optimistic', 'realistic', 'pessimistic'])}
                  disabled={isSimulating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Simulando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Executar Simulação
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`border-l-4`} style={{ borderLeftColor: getScenarioColor(activeScenario) }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {scenarioInfo.icon} {currentScenario.name}
                  </CardTitle>
                  <CardDescription>{currentScenario.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => resetScenario(activeScenario)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Crescimento de Mercado</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[currentScenario.marketGrowth]}
                      onValueChange={(value) => updateScenario(activeScenario, { marketGrowth: value[0] })}
                      max={200}
                      min={30}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{currentScenario.marketGrowth}%</span>
                  </div>
                </div>
                
                <div>
                  <Label>Taxa de Adoção</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[currentScenario.adoptionRate]}
                      onValueChange={(value) => updateScenario(activeScenario, { adoptionRate: value[0] })}
                      max={200}
                      min={30}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{currentScenario.adoptionRate}%</span>
                  </div>
                </div>
                
                <div>
                  <Label>Impacto da Competição</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[currentScenario.competitionImpact]}
                      onValueChange={(value) => updateScenario(activeScenario, { competitionImpact: value[0] })}
                      max={200}
                      min={30}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{currentScenario.competitionImpact}%</span>
                  </div>
                </div>
                
                <div>
                  <Label>Eficiência de Custos</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[currentScenario.costEfficiency]}
                      onValueChange={(value) => updateScenario(activeScenario, { costEfficiency: value[0] })}
                      max={150}
                      min={50}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{currentScenario.costEfficiency}%</span>
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              {showAdvanced && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Parâmetros Avançados
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Condições Econômicas</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[currentScenario.economicConditions]}
                          onValueChange={(value) => updateScenario(activeScenario, { economicConditions: value[0] })}
                          max={150}
                          min={50}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">{currentScenario.economicConditions}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Risco Regulatório</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[currentScenario.regulatoryRisk]}
                          onValueChange={(value) => updateScenario(activeScenario, { regulatoryRisk: value[0] })}
                          max={200}
                          min={50}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">{currentScenario.regulatoryRisk}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Risco Tecnológico</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[currentScenario.technologyRisk]}
                          onValueChange={(value) => updateScenario(activeScenario, { technologyRisk: value[0] })}
                          max={200}
                          min={50}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">{currentScenario.technologyRisk}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Factors */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Fatores Personalizados</h5>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCustomFactor(activeScenario)}
                      >
                        Adicionar Fator
                      </Button>
                    </div>
                    
                    {currentScenario.customFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Input
                          value={factor.name}
                          onChange={(e) => updateCustomFactor(activeScenario, index, { name: e.target.value })}
                          placeholder="Nome do fator"
                          className="flex-1"
                        />
                        <Slider
                          value={[factor.value]}
                          onValueChange={(value) => updateCustomFactor(activeScenario, index, { value: value[0] })}
                          max={200}
                          min={50}
                          step={5}
                          className="w-24"
                        />
                        <span className="text-sm w-12">{factor.value}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomFactor(activeScenario, index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div>
                <Label>Descrição do Cenário</Label>
                <Textarea
                  value={currentScenario.description}
                  onChange={(e) => updateScenario(activeScenario, { description: e.target.value })}
                  placeholder="Descreva as características deste cenário..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scenario Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(['optimistic', 'realistic', 'pessimistic'] as ScenarioType[])
                  .filter(s => s !== activeScenario)
                  .map(scenario => (
                    <Button
                      key={scenario}
                      variant="outline"
                      size="sm"
                      onClick={() => copyScenario(activeScenario, scenario)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Para {getScenarioInfo(scenario).name}
                    </Button>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          {/* Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Premissas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {currentScenario.assumptions.map((assumption, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Principais Riscos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {currentScenario.keyRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {currentScenario.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparação de Cenários
          </CardTitle>
          <CardDescription>
            Visualização comparativa dos parâmetros entre todos os cenários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Otimista"
              />
              <Line 
                type="monotone" 
                dataKey="realistic" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Realista"
              />
              <Line 
                type="monotone" 
                dataKey="pessimistic" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Pessimista"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioBuilder;