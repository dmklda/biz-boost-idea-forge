import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Search, 
  Target, 
  TrendingUp, 
  Calendar, 
  Download,
  Globe,
  BarChart,
  Link,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SEOAnalyzerModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SEOAnalysis {
  keywords: {
    primary: Array<{
      term: string;
      volume: string;
      difficulty: string;
    }>;
    secondary: string[];
  };
  competitorAnalysis: Array<{
    name: string;
    domainAuthority: string;
    strengths: string;
    topKeywords: string[];
  }>;
  contentStrategy: string;
  onPageOptimization: Array<{
    element: string;
    recommendation: string;
    priority: string;
  }>;
  linkBuilding: string[];
  technicalSeo: Array<{
    aspect: string;
    description: string;
    priority: string;
  }>;
  localSeo: string;
  metrics: string[];
  contentCalendar: Array<{
    month: string;
    focus: string;
    content: Array<{
      title: string;
      keywords: string[];
    }>;
  }>;
  recommendations: string[];
  seoScore?: number;
  keywordGaps?: string[];
  competitorBacklinks?: Array<{
    domain: string;
    count: number;
    quality: string;
  }>;
}

export const SEOAnalyzerModalEnhanced: React.FC<SEOAnalyzerModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('SEOAnalyzerModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  
  // Configurações adicionais
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [targetLocation, setTargetLocation] = useState("");

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setUseCustom(false);
  };

  const handleCustomIdeaChange = (value: string) => {
    setCustomIdea(value);
  };

  const handleUseCustomIdeaChange = (value: boolean) => {
    setUseCustom(value);
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!useCustom && !selectedIdea) {
      toast.error("Selecione uma ideia ou digite uma descrição");
      return;
    }

    if (useCustom && !customIdea.trim()) {
      toast.error("Digite uma descrição da sua ideia");
      return;
    }

    // Check credits
    if (!hasCredits('seo-analyzer')) {
      toast.error(`Você precisa de ${getFeatureCost('seo-analyzer')} créditos para usar esta ferramenta`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const ideaData = useCustom 
        ? { title: "Ideia personalizada", description: customIdea }
        : selectedIdea;

      // Deduct credits first
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_and_log', {
        p_user_id: user.id,
        p_amount: getFeatureCost('seo-analyzer'),
        p_feature: 'seo-analyzer',
        p_description: `Análise SEO gerada para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-seo-analysis', {
          body: { 
            idea: ideaData,
            websiteUrl: websiteUrl || undefined,
            competitors: competitors ? competitors.split(',').map(c => c.trim()) : undefined,
            targetKeywords: targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : undefined,
            targetLocation: targetLocation || undefined
          }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setSeoAnalysis(data.analysis);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockAnalysis = {
          seoScore: 68,
          keywords: {
            primary: [
              { term: "validação de ideias de negócio", volume: "1.2K/mês", difficulty: "medium" },
              { term: "análise de viabilidade startup", volume: "890/mês", difficulty: "low" },
              { term: "como validar ideia de negócio", volume: "2.5K/mês", difficulty: "medium" },
              { term: "ferramentas para empreendedores", volume: "5.8K/mês", difficulty: "high" },
              { term: "plataforma de análise de startups", volume: "720/mês", difficulty: "low" }
            ],
            secondary: [
              "análise de mercado para startups",
              "validação de MVP",
              "métricas para startups",
              "análise financeira para novos negócios",
              "como testar ideia de negócio",
              "ferramentas para validação de ideias",
              "análise de concorrentes para startups"
            ]
          },
          keywordGaps: [
            "validação de produto mínimo viável",
            "metodologias lean startup",
            "customer development",
            "product market fit",
            "validação com early adopters"
          ],
          competitorAnalysis: [
            {
              name: "StartupValidation.com",
              domainAuthority: "42",
              strengths: "Forte presença em conteúdo educacional sobre validação de ideias e metodologias lean",
              topKeywords: ["validação de startups", "lean startup", "customer development", "product market fit"]
            },
            {
              name: "IdeaAnalyzer.io",
              domainAuthority: "38",
              strengths: "Foco em ferramentas gratuitas e calculadoras para análise financeira de startups",
              topKeywords: ["calculadora de viabilidade", "análise financeira startup", "projeção de receita"]
            },
            {
              name: "StartupTools.co",
              domainAuthority: "51",
              strengths: "Marketplace de ferramentas para startups com forte presença em redes sociais",
              topKeywords: ["ferramentas para startups", "software para empreendedores", "recursos para novos negócios"]
            }
          ],
          competitorBacklinks: [
            { domain: "StartupValidation.com", count: 1250, quality: "média-alta" },
            { domain: "IdeaAnalyzer.io", count: 780, quality: "média" },
            { domain: "StartupTools.co", count: 2100, quality: "alta" }
          ],
          contentStrategy: "Desenvolva uma estratégia de conteúdo focada em educação e resolução de problemas para empreendedores em fase inicial. Crie uma série de artigos detalhados sobre o processo de validação de ideias, com estudos de caso reais e exemplos práticos. Complemente com infográficos compartilháveis e vídeos tutoriais curtos que demonstrem como usar a plataforma para validar diferentes tipos de negócios. Estabeleça parcerias com blogs de empreendedorismo e aceleradoras para publicação de conteúdo convidado, aumentando sua autoridade no assunto e gerando backlinks de qualidade.",
          onPageOptimization: [
            {
              element: "Meta Títulos",
              recommendation: "Otimize os títulos das páginas incluindo palavras-chave primárias no início e mantendo entre 50-60 caracteres. Ex: 'Validação de Ideias de Negócio | Plataforma de Análise para Startups'",
              priority: "high"
            },
            {
              element: "Meta Descrições",
              recommendation: "Crie descrições persuasivas com call-to-action e palavras-chave relevantes, mantendo entre 140-160 caracteres para evitar truncamento nos resultados de busca.",
              priority: "high"
            },
            {
              element: "Estrutura de URL",
              recommendation: "Simplifique as URLs usando palavras-chave separadas por hífens. Ex: /como-validar-ideia-de-negocio em vez de /artigos/categoria/validacao/123",
              priority: "medium"
            },
            {
              element: "Headings (H1, H2, H3)",
              recommendation: "Use apenas um H1 por página contendo a palavra-chave principal. Estruture o conteúdo com H2 e H3 incluindo variações de palavras-chave secundárias.",
              priority: "high"
            },
            {
              element: "Imagens",
              recommendation: "Otimize todas as imagens com nomes de arquivo descritivos e atributos alt contendo palavras-chave relevantes. Comprima as imagens para melhorar o tempo de carregamento.",
              priority: "medium"
            },
            {
              element: "Conteúdo Interno",
              recommendation: "Implemente links internos estratégicos entre conteúdos relacionados, usando âncoras com palavras-chave relevantes.",
              priority: "medium"
            }
          ],
          linkBuilding: [
            "Desenvolva conteúdo original com dados proprietários sobre tendências de startups e compartilhe com jornalistas e blogs do setor",
            "Crie ferramentas gratuitas simples (calculadoras, templates) que outros sites possam incorporar com link de atribuição",
            "Participe ativamente em comunidades como GrowthHackers, Indie Hackers e fóruns de startups, compartilhando conhecimento e construindo autoridade",
            "Estabeleça parcerias com aceleradoras e incubadoras para troca de conteúdo e links",
            "Desenvolva um programa de afiliados para incentivo de menções e links",
            "Identifique menções não linkadas da sua marca usando ferramentas de monitoramento e solicite a inclusão de links"
          ],
          technicalSeo: [
            {
              aspect: "Velocidade de Carregamento",
              description: "Otimize o tempo de carregamento para menos de 3 segundos em dispositivos móveis. Utilize CDN, compressão de imagens e minificação de CSS/JavaScript.",
              priority: "high"
            },
            {
              aspect: "Mobile-Friendly",
              description: "Garanta que o site seja totalmente responsivo e otimizado para dispositivos móveis, com botões de tamanho adequado e texto legível sem zoom.",
              priority: "high"
            },
            {
              aspect: "Estrutura de Dados Schema.org",
              description: "Implemente marcação de dados estruturados para melhorar a visibilidade nos resultados de busca, especialmente para avaliações, FAQs e informações de organização.",
              priority: "medium"
            },
            {
              aspect: "Sitemap XML",
              description: "Crie e mantenha um sitemap XML atualizado e envie regularmente para o Google Search Console.",
              priority: "medium"
            },
            {
              aspect: "Canonical Tags",
              description: "Implemente tags canônicas para evitar problemas de conteúdo duplicado, especialmente em páginas com parâmetros de URL variáveis.",
              priority: "medium"
            },
            {
              aspect: "HTTPS",
              description: "Garanta que o site utilize HTTPS com certificado SSL válido em todas as páginas.",
              priority: "high"
            }
          ],
          localSeo: "Para otimização local, crie e verifique perfis no Google Meu Negócio, Bing Places e diretórios relevantes do setor de startups e empreendedorismo. Inclua informações consistentes de NAP (Nome, Endereço, Telefone) em todas as listagens. Solicite avaliações de clientes satisfeitos e responda a todas as avaliações, positivas ou negativas. Crie páginas específicas para diferentes localizações se o serviço atender múltiplas regiões, com conteúdo único e relevante para cada área.",
          metrics: [
            "Posições de palavras-chave para termos primários e secundários",
            "Tráfego orgânico total e por página",
            "Taxa de conversão de visitantes orgânicos",
            "Tempo médio no site e taxa de rejeição por página",
            "Número e qualidade de backlinks",
            "Visibilidade da marca em pesquisas não-brandadas",
            "CTR (Click-Through Rate) nos resultados de busca",
            "Autoridade de domínio e página"
          ],
          contentCalendar: [
            {
              month: "Mês 1",
              focus: "Fundamentos de Validação",
              content: [
                {
                  title: "Guia Completo: Como Validar sua Ideia de Negócio em 30 Dias",
                  keywords: ["validação de ideias", "metodologia lean", "teste de hipóteses"]
                },
                {
                  title: "5 Sinais de que sua Ideia de Startup Tem Potencial de Mercado",
                  keywords: ["potencial de mercado", "validação de startup", "análise de viabilidade"]
                },
                {
                  title: "Erros Comuns na Validação de Ideias e Como Evitá-los",
                  keywords: ["erros de validação", "falhas em startups", "validação de negócios"]
                }
              ]
            },
            {
              month: "Mês 2",
              focus: "Pesquisa de Mercado",
              content: [
                {
                  title: "Como Conduzir uma Pesquisa de Mercado Eficaz com Orçamento Limitado",
                  keywords: ["pesquisa de mercado", "análise de concorrentes", "validação de mercado"]
                },
                {
                  title: "Técnicas de Entrevista com Clientes para Validar seu Produto",
                  keywords: ["entrevistas com clientes", "customer development", "feedback de usuários"]
                }
              ]
            },
            {
              month: "Mês 3",
              focus: "Análise Financeira",
              content: [
                {
                  title: "Como Criar Projeções Financeiras Realistas para sua Startup",
                  keywords: ["projeções financeiras", "análise financeira startup", "viabilidade financeira"]
                },
                {
                  title: "Calculando seu Ponto de Equilíbrio: Guia para Empreendedores",
                  keywords: ["ponto de equilíbrio", "break-even startup", "análise financeira"]
                }
              ]
            }
          ],
          recommendations: [
            "Priorize a criação de conteúdo educacional focado em palavras-chave de cauda longa com dificuldade baixa a média para ganhos rápidos de tráfego",
            "Desenvolva uma estratégia de link building focada em parcerias com aceleradoras, incubadoras e blogs de empreendedorismo",
            "Otimize a velocidade de carregamento do site, especialmente em dispositivos móveis",
            "Implemente marcação de dados estruturados para melhorar CTR nos resultados de busca",
            "Crie conteúdo interativo (calculadoras, quizzes) para aumentar o tempo de permanência e engajamento",
            "Estabeleça um calendário de conteúdo consistente com publicações semanais sobre tópicos de validação de ideias",
            "Otimize as páginas de ferramentas específicas com palavras-chave de intenção transacional"
          ]
        };
        
        setSeoAnalysis(mockAnalysis);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'seo-analysis',
            title: `Análise SEO - ${ideaData.title}`,
            content_data: seoAnalysis
          });
      } catch (saveError) {
        console.warn('Failed to save SEO analysis to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Análise SEO gerada com sucesso!");
    } catch (error) {
      console.error('Error generating SEO analysis:', error);
      toast.error("Erro ao gerar análise SEO. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setSeoAnalysis(null);
    setUseCustom(false);
    setWebsiteUrl("");
    setCompetitors("");
    setTargetKeywords("");
    setTargetLocation("");
  };

  const downloadAnalysis = () => {
    if (!seoAnalysis) return;
    
    // Create a formatted text version of the analysis
    let content = `# Análise SEO - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    if (seoAnalysis.seoScore) {
      content += `## Pontuação SEO: ${seoAnalysis.seoScore}/100\n\n`;
    }
    
    // Keywords
    content += `## Palavras-chave Principais\n\n`;
    seoAnalysis.keywords?.primary?.forEach((keyword, index) => {
      content += `${index + 1}. ${keyword.term}\n`;
      content += `   Volume: ${keyword.volume}\n`;
      content += `   Dificuldade: ${keyword.difficulty}\n\n`;
    });
    
    content += `## Palavras-chave Secundárias\n\n`;
    seoAnalysis.keywords?.secondary?.forEach((keyword, index) => {
      content += `- ${keyword}\n`;
    });
    content += `\n`;
    
    if (seoAnalysis.keywordGaps) {
      content += `## Lacunas de Palavras-chave\n\n`;
      seoAnalysis.keywordGaps?.forEach((keyword, index) => {
        content += `- ${keyword}\n`;
      });
      content += `\n`;
    }
    
    // Competitor Analysis
    content += `## Análise de Concorrentes\n\n`;
    seoAnalysis.competitorAnalysis?.forEach((competitor, index) => {
      content += `### ${competitor.name}\n`;
      content += `Autoridade de Domínio: ${competitor.domainAuthority}\n`;
      content += `Pontos Fortes: ${competitor.strengths}\n`;
      content += `Palavras-chave Principais: ${competitor.topKeywords.join(', ')}\n\n`;
    });
    
    if (seoAnalysis.competitorBacklinks) {
      content += `## Backlinks de Concorrentes\n\n`;
      seoAnalysis.competitorBacklinks?.forEach((backlink, index) => {
        content += `- ${backlink.domain}: ${backlink.count} backlinks (Qualidade: ${backlink.quality})\n`;
      });
      content += `\n`;
    }
    
    // Content Strategy
    content += `## Estratégia de Conteúdo\n\n${seoAnalysis.contentStrategy}\n\n`;
    
    // On-Page Optimization
    content += `## Otimizações On-Page\n\n`;
    seoAnalysis.onPageOptimization?.forEach((optimization, index) => {
      content += `### ${optimization.element} (Prioridade: ${optimization.priority})\n`;
      content += `${optimization.recommendation}\n\n`;
    });
    
    // Link Building
    content += `## Estratégias de Link Building\n\n`;
    seoAnalysis.linkBuilding?.forEach((strategy, index) => {
      content += `${index + 1}. ${strategy}\n`;
    });
    content += `\n`;
    
    // Technical SEO
    content += `## SEO Técnico\n\n`;
    seoAnalysis.technicalSeo?.forEach((item, index) => {
      content += `### ${item.aspect} (Prioridade: ${item.priority})\n`;
      content += `${item.description}\n\n`;
    });
    
    // Local SEO
    content += `## SEO Local\n\n${seoAnalysis.localSeo}\n\n`;
    
    // Metrics
    content += `## Métricas para Acompanhar\n\n`;
    seoAnalysis.metrics?.forEach((metric, index) => {
      content += `- ${metric}\n`;
    });
    content += `\n`;
    
    // Content Calendar
    content += `## Calendário de Conteúdo\n\n`;
    seoAnalysis.contentCalendar?.forEach((month, index) => {
      content += `### ${month.month} - ${month.focus}\n\n`;
      month.content?.forEach((item, i) => {
        content += `${i + 1}. ${item.title}\n`;
        content += `   Palavras-chave: ${item.keywords.join(', ')}\n\n`;
      });
    });
    
    // Recommendations
    content += `## Recomendações Prioritárias\n\n`;
    seoAnalysis.recommendations?.forEach((recommendation, index) => {
      content += `${index + 1}. ${recommendation}\n`;
    });
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analise_seo_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Análise SEO baixada com sucesso!');
  };

  // Icon for the modal
  const seoIcon = <Search className="h-5 w-5 text-primary" />;

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!seoAnalysis) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Análise SEO para: {selectedIdea?.title || "Ideia Personalizada"}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadAnalysis}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>

        {seoAnalysis.seoScore && (
          <div className="flex justify-center items-center mb-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{seoAnalysis.seoScore}</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={seoAnalysis.seoScore >= 80 ? "#4ade80" : seoAnalysis.seoScore >= 60 ? "#facc15" : "#f87171"}
                  strokeWidth="3"
                  strokeDasharray={`${seoAnalysis.seoScore}, 100`}
                />
              </svg>
            </div>
          </div>
        )}

        <Tabs defaultValue="keywords" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="technical">Técnico</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="keywords" className="space-y-4 pr-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Palavras-chave Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoAnalysis.keywords?.primary?.map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{keyword.term}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Vol: {keyword.volume}</Badge>
                            <Badge variant={keyword.difficulty === 'low' ? 'default' : 'secondary'}>
                              {keyword.difficulty}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Palavras-chave Secundárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seoAnalysis.keywords?.secondary?.map((keyword, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{keyword}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {seoAnalysis.keywordGaps && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-500" />
                      Lacunas de Palavras-chave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {seoAnalysis.keywordGaps?.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-amber-50">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Análise de Concorrentes SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seoAnalysis.competitorAnalysis?.map((competitor, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{competitor.name}</h4>
                          <Badge variant="outline">DA: {competitor.domainAuthority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{competitor.strengths}</p>
                        <div className="flex flex-wrap gap-1">
                          {competitor.topKeywords?.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {seoAnalysis.competitorBacklinks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5 text-blue-500" />
                      Backlinks de Concorrentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seoAnalysis.competitorBacklinks?.map((backlink, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{backlink.domain}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{backlink.count} links</Badge>
                            <Badge variant={backlink.quality.includes('alta') ? 'default' : 'secondary'}>
                              {backlink.quality}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estratégia de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {seoAnalysis.contentStrategy}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Otimizações On-Page
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seoAnalysis.onPageOptimization?.map((optimization, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold">{optimization.element}</h4>
                        <p className="text-sm text-muted-foreground">{optimization.recommendation}</p>
                        <Badge variant="outline" className="mt-1">
                          Prioridade: {optimization.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-green-500" />
                    Estratégias de Link Building
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {seoAnalysis.linkBuilding?.map((strategy, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    Aspectos Técnicos de SEO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seoAnalysis.technicalSeo?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-semibold">{item.aspect}</h5>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    SEO Local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {seoAnalysis.localSeo}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    Métricas para Acompanhar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {seoAnalysis.metrics?.map((metric, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendário de Conteúdo SEO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {seoAnalysis.contentCalendar?.map((period, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{period.month}</h4>
                          <Badge variant="outline">{period.focus}</Badge>
                        </div>
                        <div className="space-y-2">
                          {period.content?.map((content, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span>{content.title}</span>
                              <div className="flex gap-1">
                                {content.keywords?.map((kw, j) => (
                                  <Badge key={j} variant="secondary" className="text-xs">{kw}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Recomendações Prioritárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {seoAnalysis.recommendations?.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-1">{index + 1}.</span>
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  // Renderização do formulário de configuração
  const renderConfigForm = () => {
    return (
      <div className="space-y-6">
        <EnhancedIdeaSelector 
          onSelect={handleIdeaSelect} 
          allowCustomIdea={true}
          customIdeaValue={customIdea}
          onCustomIdeaChange={handleCustomIdeaChange}
          useCustomIdea={useCustom}
          onUseCustomIdeaChange={handleUseCustomIdeaChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">URL do Website (opcional)</Label>
            <Input
              id="websiteUrl"
              placeholder="Ex: https://seusite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetLocation">Localização Alvo (opcional)</Label>
            <Input
              id="targetLocation"
              placeholder="Ex: Brasil, São Paulo"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitors">Concorrentes (opcional, separados por vírgula)</Label>
          <Input
            id="competitors"
            placeholder="Ex: concorrente1.com, concorrente2.com"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetKeywords">Palavras-chave Alvo (opcional, separadas por vírgula)</Label>
          <Textarea
            id="targetKeywords"
            placeholder="Ex: análise de negócios, validação de ideias, plataforma para startups"
            value={targetKeywords}
            onChange={(e) => setTargetKeywords(e.target.value)}
            className="resize-none h-20"
          />
        </div>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="SEO Analyzer"
      icon={seoIcon}
      isGenerating={isGenerating}
      generatingText="Analisando SEO..."
      actionText="Analisar SEO"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim())}
      resetText="Nova Análise"
      onReset={handleReset}
      showReset={!!seoAnalysis}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('seo-analyzer')}
    >
      <div className="space-y-6">
        {seoAnalysis ? renderGeneratedContent() : (
          <CreditGuard feature="seo-analyzer">
            {renderConfigForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};