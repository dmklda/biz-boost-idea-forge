
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, BarChart3, Trash2, Download, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { FavoriteButton } from "@/components/ideas/FavoriteButton";
import { TagBadge } from "@/components/ideas/TagBadge";
import { TagsSelector } from "@/components/ideas/TagsSelector";
import { AdvancedAnalysisModal } from "@/components/advanced-analysis/AdvancedAnalysisModal";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface IdeaData {
  id: string;
  title: string;
  description: string;
  audience: string;
  problem: string;
  has_competitors: string;
  monetization: string;
  budget: number;
  location: string;
  created_at: string;
  is_favorite: boolean;
  tags: string[];
}

interface AnalysisData {
  id: string;
  score: number;
  status: string;
  market_analysis: any;
  competitor_analysis: any;
  financial_analysis: any;
  swot_analysis: any;
  recommendations: any;
  market_size: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string;
}

const IdeaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { t } = useTranslation();
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ideaTags, setIdeaTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !authState.user?.id) return;

      try {
        setLoading(true);
        
        // Fetch idea details
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', id)
          .eq('user_id', authState.user.id)
          .single();

        if (ideaError || !ideaData) {
          toast.error(t('ideaDetail.notFound', "Ideia não encontrada"));
          navigate('/dashboard/ideias');
          return;
        }

        // Fetch analysis data
        const { data: analysisData, error: analysisError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('idea_id', id)
          .eq('user_id', authState.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysisError) {
          console.error("Error fetching analysis:", analysisError);
        }

        // Fetch favorite status
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('idea_favorites')
          .select('id')
          .eq('user_id', authState.user.id)
          .eq('idea_id', id)
          .maybeSingle();

        if (favoriteError) {
          console.error("Error fetching favorite status:", favoriteError);
        }

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('idea_tags')
          .select('tags (name)')
          .eq('idea_id', id)
          .eq('user_id', authState.user.id);

        if (tagsError) {
          console.error("Error fetching tags:", tagsError);
        }

        setIdea({
          ...ideaData,
          is_favorite: !!favoriteData,
          tags: tagsData?.map((item: any) => item.tags.name) || []
        });
        
        if (analysisData) {
          setAnalysis(analysisData);
        }
        
        setIsFavorite(!!favoriteData);
        setIdeaTags(tagsData?.map((item: any) => item.tags.name) || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t('ideaDetail.errorLoading', "Erro ao carregar dados da ideia"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, authState.user?.id, navigate, t]);

  const handleDelete = async () => {
    if (!id || !authState.user?.id) return;

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user.id);

      if (error) throw error;

      toast.success(t('ideaDetail.deleteSuccess', "Ideia excluída com sucesso"));
      navigate('/dashboard/ideias');
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error(t('ideaDetail.deleteError', "Erro ao excluir ideia"));
    }
  };

  const handleFavoriteToggle = (newIsFavorite: boolean) => {
    setIsFavorite(newIsFavorite);
    if (idea) {
      setIdea({ ...idea, is_favorite: newIsFavorite });
    }
  };

  const handleTagsUpdate = (newTags: string[]) => {
    setIdeaTags(newTags);
    if (idea) {
      setIdea({ ...idea, tags: newTags });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'viable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not viable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const translations: Record<string, string> = {
      'viable': t('ideas.status.viable', 'Viável'),
      'moderate': t('ideas.status.moderate', 'Moderado'),
      'not viable': t('ideas.status.notViable', 'Não Viável')
    };
    return translations[status?.toLowerCase()] || status;
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

  const exportToPDF = async () => {
    const element = document.getElementById('idea-detail-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${idea?.title || 'ideia'}.pdf`);
      toast.success(t('ideaDetail.exportSuccess', "PDF exportado com sucesso"));
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error(t('ideaDetail.exportError', "Erro ao exportar PDF"));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>{t('ideaDetail.notFound', "Ideia não encontrada")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/ideias')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold break-words">{idea.title}</h1>
            <p className="text-muted-foreground">
              {t('ideaDetail.createdAt', "Criado em")} {formatDate(idea.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <FavoriteButton
            ideaId={idea.id}
            isFavorite={isFavorite}
            size="sm"
            onToggle={handleFavoriteToggle}
          />
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            {t('ideaDetail.exportPdf', "Exportar PDF")}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/ideias/edit?id=${idea.id}&reanalyze=true`}>
              <Edit className="h-4 w-4 mr-2" />
              {t('ideaDetail.reanalyze', "Reanalisar")}
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('ideaDetail.delete', "Excluir")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('ideaDetail.confirmDelete', "Confirmar exclusão")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('ideaDetail.deleteWarning', "Esta ação não pode ser desfeita. Isso excluirá permanentemente sua ideia e todos os dados relacionados.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel', "Cancelar")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  {t('ideaDetail.delete', "Excluir")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div id="idea-detail-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Idea Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('ideaDetail.ideaInfo', "Informações da Ideia")}
                {analysis && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                      {analysis.score}% viabilidade
                    </Badge>
                    {analysis.status && (
                      <Badge 
                        variant="outline" 
                        className={cn("px-3 py-1 border", getStatusColor(analysis.status))}
                      >
                        {getStatusText(analysis.status)}
                      </Badge>
                    )}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">{t('ideaDetail.description', "Descrição")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
              </div>
              
              {idea.audience && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">{t('ideaDetail.audience', "Público-alvo")}</h3>
                  <p className="text-sm text-muted-foreground">{idea.audience}</p>
                </div>
              )}
              
              {idea.problem && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">{t('ideaDetail.problem', "Problema")}</h3>
                  <p className="text-sm text-muted-foreground">{idea.problem}</p>
                </div>
              )}
              
              {idea.monetization && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">{t('ideaDetail.monetization', "Monetização")}</h3>
                  <p className="text-sm text-muted-foreground">{idea.monetization}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {idea.budget > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">{t('ideaDetail.budget', "Orçamento")}</h3>
                    <p className="text-sm text-muted-foreground">
                      R$ {idea.budget.toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                
                {idea.location && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">{t('ideaDetail.location', "Localização")}</h3>
                    <p className="text-sm text-muted-foreground">{idea.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t('ideaDetail.analysisResults', "Resultados da Análise")}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedModal(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('ideaDetail.advancedAnalysis', "Análise Avançada")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SWOT Analysis */}
                {analysis.swot_analysis && (
                  <div>
                    <h3 className="font-semibold mb-3">{t('ideaDetail.swotAnalysis', "Análise SWOT")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.swot_analysis.strengths && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">{t('ideaDetail.strengths', "Forças")}</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {analysis.swot_analysis.strengths.map((strength: string, index: number) => (
                              <li key={index}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.swot_analysis.weaknesses && (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-800 mb-2">{t('ideaDetail.weaknesses', "Fraquezas")}</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {analysis.swot_analysis.weaknesses.map((weakness: string, index: number) => (
                              <li key={index}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.swot_analysis.opportunities && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-2">{t('ideaDetail.opportunities', "Oportunidades")}</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {analysis.swot_analysis.opportunities.map((opportunity: string, index: number) => (
                              <li key={index}>• {opportunity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.swot_analysis.threats && (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-medium text-orange-800 mb-2">{t('ideaDetail.threats', "Ameaças")}</h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            {analysis.swot_analysis.threats.map((threat: string, index: number) => (
                              <li key={index}>• {threat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && (
                  <div>
                    <h3 className="font-semibold mb-3">{t('ideaDetail.recommendations', "Recomendações")}</h3>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <ul className="text-sm text-blue-800 space-y-2">
                        {analysis.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('ideaDetail.tags', "Tags")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TagsSelector
                ideaId={idea.id}
                selectedTags={ideaTags}
                onTagsUpdate={handleTagsUpdate}
              />
              {ideaTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {ideaTags.map((tag, index) => (
                    <TagBadge key={index} name={tag} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('ideaDetail.quickStats', "Estatísticas Rápidas")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.market_size && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">{t('ideaDetail.marketSize', "Tamanho do Mercado")}</h4>
                    <p className="text-sm text-muted-foreground">{analysis.market_size}</p>
                  </div>
                )}
                
                {analysis.differentiation && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">{t('ideaDetail.differentiation', "Diferenciação")}</h4>
                    <p className="text-sm text-muted-foreground">{analysis.differentiation}</p>
                  </div>
                )}
                
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t('ideaDetail.topStrengths', "Principais Forças")}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {analysis.strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('ideaDetail.actions', "Ações")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/dashboard/resultados/${idea.id}`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('ideaDetail.viewResults', "Ver Resultados Completos")}
                </Link>
              </Button>
              
              {analysis && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowAdvancedModal(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('ideaDetail.chatWithAi', "Conversar com IA")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Analysis Modal */}
      {analysis && (
        <AdvancedAnalysisModal
          isOpen={showAdvancedModal}
          onClose={() => setShowAdvancedModal(false)}
          ideaId={idea.id}
          analysisId={analysis.id}
        />
      )}
    </div>
  );
};

export default IdeaDetailPage;
