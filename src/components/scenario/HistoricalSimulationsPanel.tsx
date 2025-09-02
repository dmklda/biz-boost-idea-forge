import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Download, 
  Trash2, 
  Calendar, 
  BarChart3, 
  Search,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useScenarioSimulator } from "@/hooks/useScenarioSimulator";
import { supabase } from "@/integrations/supabase/client";
import { useSimulationPDFGenerator } from "@/hooks/useSimulationPDFGenerator";

interface SavedSimulation {
  id: string;
  simulation_name: string;
  revenue_model: string;
  created_at: string;
  financial_data: any;
  results: any;
  simulation_params: any;
}

interface HistoricalSimulationsPanelProps {
  onLoadSimulation?: (simulation: SavedSimulation) => void;
}

const HistoricalSimulationsPanel = ({ onLoadSimulation }: HistoricalSimulationsPanelProps) => {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [filteredSimulations, setFilteredSimulations] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { loadSimulations, exportResults } = useScenarioSimulator();
  const { generateSimulationPDF, isGeneratingPdf } = useSimulationPDFGenerator();

  useEffect(() => {
    fetchSimulations();
  }, []);

  useEffect(() => {
    const filtered = simulations.filter(sim => 
      sim.simulation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sim.financial_data?.idea_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sim.revenue_model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSimulations(filtered);
  }, [simulations, searchTerm]);

  const fetchSimulations = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Carregando simulações...');
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        toast.error('Você precisa estar logado para ver suas simulações');
        return;
      }
      
      const data = await loadSimulations();
      console.log('✅ Simulações carregadas:', data.length);
      setSimulations(data as SavedSimulation[]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar simulações:', error);
      toast.error(`Erro ao carregar simulações: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSimulation = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta simulação?')) return;
    
    setDeletingId(id);
    try {
      console.log('🗑️ Iniciando deleção da simulação:', id);
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        toast.error('Você precisa estar logado para deletar simulações');
        return;
      }
      
      console.log('✅ Usuário autenticado:', user.id);
      
      // Tentar deletar
      const { error } = await supabase
        .from('scenario_simulations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro no Supabase ao deletar:', error);
        throw error;
      }

      console.log('✅ Simulação deletada no banco');
      setSimulations(prev => prev.filter(sim => sim.id !== id));
      toast.success('Simulação excluída com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao deletar simulação:', error);
      toast.error(`Erro ao deletar simulação: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportSimulation = async (simulation: SavedSimulation) => {
    console.log('🔄 Starting PDF export for simulation:', simulation.id);
    
    // Validate simulation data
    if (!simulation.simulation_name || !simulation.results) {
      console.error('❌ No simulation data found');
      setError('Dados da simulação não encontrados');
      toast.error('Dados da simulação não estão disponíveis');
      return;
    }

    try {
      setExportingId(simulation.id);
      console.log('📥 Setting export state for ID:', simulation.id);
      
      // Validate user authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated');
        toast.error('Você precisa estar logado para exportar');
        return;
      }

      // Log simulation structure for debugging
      console.log('🔍 Simulation data structure:', {
        hasResults: !!simulation.results,
        resultsType: typeof simulation.results,
        resultsKeys: simulation.results ? Object.keys(simulation.results) : null,
        simulationKeys: Object.keys(simulation)
      });

      // Validate simulation data - check for scenarios directly
      if (!simulation.results) {
        console.error('❌ No results data found:', simulation);
        toast.error('Dados da simulação não encontrados');
        return;
      }

      // Check if we have at least one scenario with valid data
      const hasValidScenarios = simulation.results.optimistic || 
                               simulation.results.realistic || 
                               simulation.results.pessimistic;

      if (!hasValidScenarios) {
        console.error('❌ No valid scenarios found in:', simulation.results);
        toast.error('Cenários da simulação estão incompletos');
        return;
      }

      // Adapt data structure for PDF generator - pass scenarios directly
      await generateSimulationPDF({
        results: simulation.results, // Pass the results containing scenarios directly
        simulationName: simulation.simulation_name,
        companyName: simulation.financial_data?.idea_title || simulation.simulation_name
      });

      console.log('✅ PDF export completed successfully');

    } catch (error: any) {
      console.error('💥 PDF export error:', error);
      setError('Erro ao exportar simulação em PDF');
      toast.error('Ocorreu um erro ao gerar o relatório PDF');
    } finally {
      setExportingId(null);
      console.log('🏁 PDF export process finished');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRevenueModelBadge = (model: string) => {
    const models = {
      'subscription': { label: 'Assinatura', color: 'bg-blue-100 text-blue-800' },
      'freemium': { label: 'Freemium', color: 'bg-purple-100 text-purple-800' },
      'marketplace': { label: 'Marketplace', color: 'bg-green-100 text-green-800' },
      'advertising': { label: 'Publicidade', color: 'bg-yellow-100 text-yellow-800' },
      'one_time': { label: 'Pagamento Único', color: 'bg-gray-100 text-gray-800' }
    };
    
    const modelInfo = models[model as keyof typeof models] || models.one_time;
    return (
      <Badge className={modelInfo.color}>
        {modelInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Carregando simulações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          Simulações Salvas ({simulations.length})
        </CardTitle>
        <CardDescription>
          Acesse e gerencie suas simulações anteriores
        </CardDescription>
      </CardHeader>
      <CardContent>
        {simulations.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, ideia ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filteredSimulations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {simulations.length === 0 ? 'Nenhuma simulação salva' : 'Nenhuma simulação encontrada'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {simulations.length === 0 
                ? 'Execute uma simulação e salve para vê-la aqui'
                : 'Tente ajustar o termo de busca'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSimulations.map((simulation) => (
              <div
                key={simulation.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">
                      {simulation.simulation_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {simulation.financial_data?.idea_title || 'Simulação personalizada'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(simulation.created_at)}
                      </span>
                      {getRevenueModelBadge(simulation.revenue_model)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onLoadSimulation && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLoadSimulation(simulation)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Carregar
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportSimulation(simulation)}
                      disabled={exportingId === simulation.id || isGeneratingPdf}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {(exportingId === simulation.id || isGeneratingPdf) ? 'Exportando...' : 'PDF'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSimulation(simulation.id)}
                      disabled={deletingId === simulation.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deletingId === simulation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Quick stats preview */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Cenários</p>
                    <p className="font-semibold text-sm">
                      {simulation.results ? Object.keys(simulation.results).length : 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Iterações</p>
                    <p className="font-semibold text-sm">
                      {simulation.simulation_params?.iterations || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Horizonte</p>
                    <p className="font-semibold text-sm">
                      {simulation.simulation_params?.timeHorizon ? 
                        `${simulation.simulation_params.timeHorizon} meses` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalSimulationsPanel;