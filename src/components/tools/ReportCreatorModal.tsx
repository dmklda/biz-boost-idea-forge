import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface ReportCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportSection {
  title: string;
  content: string;
  charts_data?: any[];
  tables?: any[];
}

interface ReportResults {
  report_title: string;
  executive_summary: string;
  sections: ReportSection[];
  recommendations: string[];
  appendices: string[];
  report_html: string;
  report_metadata: {
    pages: number;
    word_count: number;
    generation_time: string;
    report_type: string;
  };
}

export const ReportCreatorModal = ({
  open,
  onOpenChange,
}: ReportCreatorModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ReportResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    report_type: '',
    target_audience: '',
    data_sources: '',
    key_metrics: '',
    analysis_period: '',
    report_objectives: '',
    format_preferences: ''
  });

  const handleSubmit = async () => {
    if (!authState.user) {
      toast.error("Você precisa estar logado para usar esta ferramenta");
      return;
    }

    if (!formData.business_idea.trim()) {
      toast.error("Por favor, descreva sua ideia de negócio");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      report_type: '',
      target_audience: '',
      data_sources: '',
      key_metrics: '',
      analysis_period: '',
      report_objectives: '',
      format_preferences: ''
    });
  };

  const handleDownload = () => {
    if (!results?.report_html) return;

    const blob = new Blob([results.report_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${results.report_title?.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Relatório baixado com sucesso!");
  };

  const handlePreview = () => {
    if (!results?.report_html) return;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(results.report_html);
      newWindow.document.close();
    }
  };

  const cost = 7;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Criador de Relatórios
          </DialogTitle>
          <DialogDescription>
            Gere relatórios executivos e analíticos profissionais para sua startup.
            <Badge variant="secondary" className="ml-2">{cost} créditos</Badge>
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_idea">Ideia de Negócio *</Label>
                <Textarea
                  id="business_idea"
                  placeholder="Descreva sua ideia de negócio..."
                  value={formData.business_idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_idea: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_type">Tipo de Relatório</Label>
                <Input
                  id="report_type"
                  placeholder="Ex: executivo, financeiro, marketing, operacional"
                  value={formData.report_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, report_type: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Público-Alvo</Label>
                <Input
                  id="target_audience"
                  placeholder="Ex: investidores, board, equipe, stakeholders"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_sources">Fontes de Dados</Label>
                <Input
                  id="data_sources"
                  placeholder="Ex: Google Analytics, CRM, pesquisas, financeiro"
                  value={formData.data_sources}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_sources: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key_metrics">Métricas Principais</Label>
                <Textarea
                  id="key_metrics"
                  placeholder="Liste as métricas e KPIs que devem ser incluídos no relatório"
                  value={formData.key_metrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, key_metrics: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis_period">Período de Análise</Label>
                <Input
                  id="analysis_period"
                  placeholder="Ex: último trimestre, anual, mensal"
                  value={formData.analysis_period}
                  onChange={(e) => setFormData(prev => ({ ...prev, analysis_period: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_objectives">Objetivos do Relatório</Label>
                <Textarea
                  id="report_objectives"
                  placeholder="Qual o objetivo principal deste relatório? Que decisões ele deve apoiar?"
                  value={formData.report_objectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, report_objectives: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format_preferences">Preferências de Formato</Label>
                <Input
                  id="format_preferences"
                  placeholder="Ex: gráficos, tabelas, visual, conciso"
                  value={formData.format_preferences}
                  onChange={(e) => setFormData(prev => ({ ...prev, format_preferences: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.business_idea.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                `Gerar Relatório (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Relatório Gerado</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar HTML
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Novo Relatório
                </Button>
              </div>
            </div>

            {/* Informações do Relatório */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{results.report_title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Resumo Executivo:</h5>
                  <p className="text-sm text-muted-foreground">{results.executive_summary}</p>
                </div>

                {results.report_metadata && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-sm mb-2">Detalhes do Relatório:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Páginas:</span>
                        <div className="font-medium">{results.report_metadata.pages}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Palavras:</span>
                        <div className="font-medium">{results.report_metadata.word_count}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <div className="font-medium">{results.report_metadata.report_type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tempo:</span>
                        <div className="font-medium">{results.report_metadata.generation_time}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seções do Relatório */}
            {results.sections?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Estrutura do Relatório</h4>
                <div className="space-y-4">
                  {results.sections.map((section, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {section.content.substring(0, 300)}...
                        </p>
                        
                        {section.charts_data?.length > 0 && (
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {section.charts_data.length} gráfico(s) incluído(s)
                            </Badge>
                          </div>
                        )}
                        
                        {section.tables?.length > 0 && (
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {section.tables.length} tabela(s) incluída(s)
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações */}
            {results.recommendations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recomendações Principais</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">💡</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Apêndices */}
            {results.appendices?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Apêndices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.appendices.map((appendix, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">📎</span>
                        {appendix}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};