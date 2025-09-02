import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRegulatoryAnalysis } from '@/hooks/useRegulatoryAnalysis';
import { Calendar, Download, Eye, Trash2, Building, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisHistoryProps {
  onViewAnalysis: (analysis: any) => void;
}

export const AnalysisHistory = ({ onViewAnalysis }: AnalysisHistoryProps) => {
  const { analyses, loadAnalyses, deleteAnalysis, isLoading } = useRegulatoryAnalysis();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'baixo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'médio':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'alto':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDelete = async (id: string, businessName: string) => {
    if (confirm(`Tem certeza que deseja excluir a análise de "${businessName}"?`)) {
      await deleteAnalysis(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises</CardTitle>
          <CardDescription>Suas análises regulatórias anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Carregando análises...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises</CardTitle>
          <CardDescription>Suas análises regulatórias anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma análise encontrada</p>
            <p className="text-sm text-muted-foreground">
              Suas análises regulatórias aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Análises</CardTitle>
        <CardDescription>
          {analyses.length} {analyses.length === 1 ? 'análise encontrada' : 'análises encontradas'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="border-l-4 border-l-primary/30">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{analysis.business_name}</h4>
                      <Badge variant="outline">{analysis.business_sector}</Badge>
                      {analysis.analysis_results?.riskAssessment && (
                        <Badge 
                          className={getRiskBadgeColor(analysis.analysis_results.riskAssessment.overallRisk)}
                        >
                          Risco: {analysis.analysis_results.riskAssessment.overallRisk}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {analysis.business_description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {analysis.location}
                      </div>
                      {analysis.analysis_results?.requirements && (
                        <div>
                          {analysis.analysis_results.requirements.length} requisitos
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAnalysis(analysis)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info('Funcionalidade de download em desenvolvimento');
                      }}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(analysis.id, analysis.business_name)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};