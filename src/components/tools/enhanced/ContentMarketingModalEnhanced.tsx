import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { toast } from "sonner";
import { 
  Sparkles, 
  Copy, 
  Download, 
  FileText, 
  Mail, 
  Video, 
  MessageCircle,
  Newspaper,
  Lightbulb,
  Hash
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToolModalBase } from "@/components/shared/ToolModalBase";
import { EnhancedIdeaSelector } from "@/components/shared/EnhancedIdeaSelector";
import { CreditGuard } from "@/components/CreditGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ContentMarketingModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContentMarketing {
  contentPieces: string[];
  headlines: string[];
  hashtags: string[];
  callsToAction: string[];
  keyMessages: string[];
  contentCalendar?: Array<{
    date: string;
    platform: string;
    contentType: string;
    topic: string;
  }>;
  seoKeywords?: string[];
  audienceInsights?: string[];
}

export const ContentMarketingModalEnhanced: React.FC<ContentMarketingModalEnhancedProps> = ({
  open,
  onOpenChange
}) => {
  console.log('ContentMarketingModalEnhanced renderizado', { open });
  const { authState, updateUserCredits } = useAuth();
  const { hasCredits, getFeatureCost } = usePlanAccess();
  const user = authState.user;
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentMarketing | null>(null);
  
  // Configurações de conteúdo
  const [contentType, setContentType] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [contentGoal, setContentGoal] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");

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

    if (!contentType) {
      toast.error("Selecione um tipo de conteúdo");
      return;
    }

    if (!platform) {
      toast.error("Selecione uma plataforma");
      return;
    }

    // Check credits
    if (!hasCredits('content-marketing')) {
      toast.error(`Você precisa de ${getFeatureCost('content-marketing')} créditos para usar esta ferramenta`);
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
        p_amount: getFeatureCost('content-marketing'),
        p_feature: 'content-marketing',
        p_description: `Conteúdo de Marketing gerado para: ${ideaData.title}`
      });

      if (deductError) throw deductError;

      // Update local credits
      updateUserCredits(deductResult);

      // Simulação de dados para desenvolvimento
      try {
        const { data, error } = await supabase.functions.invoke('generate-content-marketing', {
          body: { 
            idea: ideaData,
            contentType,
            platform,
            tone,
            targetAudience,
            contentGoal,
            keywords
          }
        });

        if (error) throw error;
        
        // Se chegou aqui, use os dados reais
        setGeneratedContent(data.content);
      } catch (invokeError) {
        console.warn('Erro ao invocar função do Supabase, usando dados simulados:', invokeError);
        
        // Dados simulados para desenvolvimento
        const mockContent = {
          contentPieces: [
            "# Como Transformar sua Ideia em um Negócio de Sucesso\n\nVocê tem uma ideia brilhante, mas não sabe por onde começar? Neste artigo, vamos explorar os passos essenciais para transformar seu conceito em um negócio viável.\n\nPrimeiro, é fundamental validar sua ideia. Isso significa verificar se existe um mercado real para seu produto ou serviço. Converse com potenciais clientes, faça pesquisas online e analise a concorrência.\n\nEm seguida, crie um protótipo ou MVP (Produto Mínimo Viável). Esta versão simplificada do seu produto permite testar o conceito com usuários reais sem grandes investimentos iniciais.\n\nO próximo passo é desenvolver um plano de negócios sólido. Defina seu modelo de receita, estratégia de marketing e projeções financeiras. Um bom plano serve como seu roteiro para o sucesso.\n\nPor fim, não subestime a importância de construir uma rede de contatos. Conecte-se com mentores, potenciais investidores e outros empreendedores que possam oferecer insights valiosos.\n\nLembre-se: o caminho do empreendedorismo é desafiador, mas com planejamento adequado e persistência, sua ideia pode se transformar em um negócio próspero.",
            
            "Está pronto para transformar sua visão em realidade? Nossa plataforma oferece todas as ferramentas necessárias para validar sua ideia de negócio, desde análises de mercado até projeções financeiras detalhadas.\n\nCom nossa tecnologia de IA, você pode:\n- Identificar seu público-alvo ideal\n- Analisar a viabilidade do seu conceito\n- Criar um plano de negócios profissional\n- Desenvolver estratégias de marketing eficazes\n\nNão deixe que sua ideia brilhante fique apenas no papel. Dê o primeiro passo hoje mesmo e descubra o potencial do seu negócio!\n\nExperimente nossa plataforma gratuitamente por 7 dias e veja a diferença que uma análise profissional pode fazer para o sucesso do seu empreendimento."
          ],
          headlines: [
            "5 Passos Essenciais para Validar sua Ideia de Negócio",
            "Como Transformar um Conceito em um Negócio Lucrativo",
            "Da Ideia ao Mercado: O Guia Definitivo para Empreendedores",
            "Evite Estes 3 Erros Comuns ao Lançar sua Startup",
            "O Segredo para Criar um MVP que Realmente Atrai Clientes"
          ],
          hashtags: [
            "empreendedorismo",
            "startups",
            "inovação",
            "negócios",
            "planejamento",
            "validaçãodeideia",
            "mvp",
            "modelodenegócio"
          ],
          callsToAction: [
            "Comece sua jornada empreendedora hoje mesmo! Cadastre-se gratuitamente e valide sua ideia.",
            "Quer saber se sua ideia tem potencial? Faça uma análise completa em menos de 5 minutos.",
            "Não deixe sua ideia apenas no papel. Transforme-a em um negócio real com nossa plataforma.",
            "Junte-se a milhares de empreendedores de sucesso. Experimente nossa ferramenta agora!"
          ],
          keyMessages: [
            "Validação de ideias é o primeiro passo para reduzir riscos no empreendedorismo",
            "Um MVP bem construído permite testar o mercado com investimento mínimo",
            "Conhecer seu público-alvo é essencial para desenvolver um produto que resolva problemas reais",
            "Planejamento financeiro adequado evita surpresas desagradáveis no futuro do negócio"
          ],
          contentCalendar: [
            {
              date: "Segunda-feira",
              platform: "LinkedIn",
              contentType: "Artigo",
              topic: "Validação de Ideias"
            },
            {
              date: "Quarta-feira",
              platform: "Instagram",
              contentType: "Carrossel",
              topic: "Passos para Criar um MVP"
            },
            {
              date: "Sexta-feira",
              platform: "Email",
              contentType: "Newsletter",
              topic: "Casos de Sucesso de Startups"
            }
          ],
          seoKeywords: [
            "validação de ideias de negócio",
            "como criar um MVP",
            "plano de negócios para startups",
            "análise de mercado para empreendedores",
            "ferramentas para validar ideias"
          ],
          audienceInsights: [
            "Empreendedores iniciantes buscam principalmente orientação sobre os primeiros passos",
            "Profissionais corporativos que desejam empreender valorizam conteúdo sobre gestão de riscos",
            "Estudantes de administração e negócios procuram exemplos práticos e casos de estudo",
            "Empreendedores em série se interessam por inovação e novas metodologias"
          ]
        };
        
        setGeneratedContent(mockContent);
      }
      
      // Try to save to database, but don't let saving errors affect display
      try {
        await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            idea_id: useCustom ? null : selectedIdea?.id,
            content_type: 'content-marketing',
            title: `Conteúdo de Marketing - ${ideaData.title}`,
            content_data: generatedContent
          });
      } catch (saveError) {
        console.warn('Failed to save content marketing to database:', saveError);
        // Continue showing the content even if saving fails
      }
      toast.success("Conteúdo de marketing gerado com sucesso!");
    } catch (error) {
      console.error('Error generating content marketing:', error);
      toast.error("Erro ao gerar conteúdo de marketing. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedIdea(null);
    setCustomIdea("");
    setGeneratedContent(null);
    setUseCustom(false);
    setContentType("");
    setPlatform("");
    setTone("");
    setTargetAudience("");
    setContentGoal("");
    setKeywords("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    // Create a formatted text version of the content
    let content = `# Conteúdo de Marketing - ${selectedIdea?.title || 'Ideia Personalizada'}\n\n`;
    
    // Content Pieces
    content += `## Peças de Conteúdo\n\n`;
    generatedContent.contentPieces?.forEach((piece, index) => {
      content += `### Peça ${index + 1}\n${piece}\n\n`;
    });
    
    // Headlines
    content += `## Headlines/Títulos\n\n`;
    generatedContent.headlines?.forEach((headline, index) => {
      content += `- ${headline}\n`;
    });
    content += `\n`;
    
    // Hashtags
    content += `## Hashtags\n\n`;
    generatedContent.hashtags?.forEach((tag) => {
      content += `#${tag} `;
    });
    content += `\n\n`;
    
    // Calls to Action
    content += `## Chamadas para Ação\n\n`;
    generatedContent.callsToAction?.forEach((cta, index) => {
      content += `- ${cta}\n`;
    });
    content += `\n`;
    
    // Key Messages
    content += `## Mensagens-Chave\n\n`;
    generatedContent.keyMessages?.forEach((message, index) => {
      content += `- ${message}\n`;
    });
    content += `\n`;
    
    // Content Calendar
    if (generatedContent.contentCalendar) {
      content += `## Calendário de Conteúdo\n\n`;
      generatedContent.contentCalendar?.forEach((item) => {
        content += `- ${item.date}: ${item.contentType} sobre "${item.topic}" para ${item.platform}\n`;
      });
      content += `\n`;
    }
    
    // SEO Keywords
    if (generatedContent.seoKeywords) {
      content += `## Palavras-chave SEO\n\n`;
      generatedContent.seoKeywords?.forEach((keyword) => {
        content += `- ${keyword}\n`;
      });
      content += `\n`;
    }
    
    // Audience Insights
    if (generatedContent.audienceInsights) {
      content += `## Insights sobre o Público\n\n`;
      generatedContent.audienceInsights?.forEach((insight) => {
        content += `- ${insight}\n`;
      });
    }
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `conteudo_marketing_${selectedIdea?.title?.replace(/\s+/g, '_').toLowerCase() || 'ideia'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('Conteúdo de marketing baixado com sucesso!');
  };

  // Icon for the modal
  const contentIcon = <Sparkles className="h-5 w-5 text-primary" />;

  // Renderização do conteúdo gerado
  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Conteúdo para: {selectedIdea?.title || "Ideia Personalizada"}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadContent}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="headlines">Headlines</TabsTrigger>
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            <TabsTrigger value="seo">SEO & Insights</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="content" className="space-y-4 pr-4">
              {generatedContent.contentPieces?.map((piece, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-sm font-medium">
                      {contentType === 'blog-post' ? (
                        <FileText className="h-4 w-4 inline mr-2" />
                      ) : contentType === 'social-media' ? (
                        <MessageCircle className="h-4 w-4 inline mr-2" />
                      ) : contentType === 'email' ? (
                        <Mail className="h-4 w-4 inline mr-2" />
                      ) : contentType === 'video-script' ? (
                        <Video className="h-4 w-4 inline mr-2" />
                      ) : contentType === 'newsletter' ? (
                        <Newspaper className="h-4 w-4 inline mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 inline mr-2" />
                      )}
                      Peça de Conteúdo {index + 1}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(piece)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{piece}</div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-500" />
                    Hashtags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => copyToClipboard(`#${tag}`)}>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Chamadas para Ação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedContent.callsToAction?.map((cta, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md flex justify-between items-center">
                        <p className="text-sm">{cta}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(cta)}
                          className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headlines" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Headlines/Títulos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedContent.headlines?.map((headline, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md flex justify-between items-center">
                        <p className="text-sm font-medium">{headline}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(headline)}
                          className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Mensagens-Chave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedContent.keyMessages?.map((message, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge className="mt-1">{index + 1}</Badge>
                        <p className="text-sm">{message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4 pr-4">
              {generatedContent.contentCalendar && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Calendário de Conteúdo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedContent.contentCalendar?.map((item, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{item.date}</h4>
                            <Badge variant="outline">{item.platform}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.contentType} - {item.topic}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 pr-4">
              {generatedContent.seoKeywords && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-orange-500" />
                      Palavras-chave SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.seoKeywords?.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(keyword)}>
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedContent.audienceInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-500" />
                      Insights sobre o Público
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedContent.audienceInsights?.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">👥</Badge>
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Conteúdo</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog-post">Post de Blog</SelectItem>
                <SelectItem value="social-media">Redes Sociais</SelectItem>
                <SelectItem value="email">E-mail Marketing</SelectItem>
                <SelectItem value="video-script">Script de Vídeo</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Plataforma</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tom</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Amigável</SelectItem>
                <SelectItem value="authoritative">Autoritativo</SelectItem>
                <SelectItem value="playful">Descontraído</SelectItem>
                <SelectItem value="inspirational">Inspirador</SelectItem>
                <SelectItem value="educational">Educativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Público-Alvo</label>
            <Textarea 
              placeholder="Descreva seu público-alvo (opcional)" 
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="resize-none h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Objetivo do Conteúdo</label>
            <Select value={contentGoal} onValueChange={setContentGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Criar Conscientização</SelectItem>
                <SelectItem value="consideration">Consideração</SelectItem>
                <SelectItem value="conversion">Conversão</SelectItem>
                <SelectItem value="retention">Retenção</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="engagement">Engajamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Palavras-chave</label>
          <Input 
            placeholder="Palavras-chave separadas por vírgula (opcional)" 
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <ToolModalBase
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador de Conteúdo de Marketing"
      icon={contentIcon}
      isGenerating={isGenerating}
      generatingText="Gerando conteúdo de marketing..."
      actionText="Gerar Conteúdo"
      onAction={handleGenerate}
      actionDisabled={isGenerating || (!useCustom && !selectedIdea) || (useCustom && !customIdea.trim()) || !contentType || !platform}
      resetText="Novo Conteúdo"
      onReset={handleReset}
      showReset={!!generatedContent}
      maxWidth="5xl"
      showCreditWarning={true}
      creditCost={getFeatureCost('content-marketing')}
    >
      <div className="space-y-6">
        {generatedContent ? renderGeneratedContent() : (
          <CreditGuard feature="content-marketing">
            {renderConfigForm()}
          </CreditGuard>
        )}
      </div>
    </ToolModalBase>
  );
};

// Componentes adicionais
const Calendar = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const Search = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);