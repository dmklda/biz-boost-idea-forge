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
import { Loader2, Copy, Download, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface PostGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PostContent {
  platform: string;
  content: string;
  hashtags: string[];
  best_time: string;
  engagement_tips: string[];
}

interface PostResults {
  posts: PostContent[];
  strategy_summary: string;
  content_calendar: Array<{
    date: string;
    post_type: string;
    content: string;
  }>;
}

export const PostGeneratorModal = ({
  open,
  onOpenChange,
}: PostGeneratorModalProps) => {
  const { authState } = useAuth();
  const { getFeatureCost } = usePlanAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PostResults | null>(null);
  const [formData, setFormData] = useState({
    business_idea: '',
    target_audience: '',
    platforms: '',
    content_type: '',
    tone: '',
    goals: ''
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
      const { data, error } = await supabase.functions.invoke('generate-social-posts', {
        body: formData
      });

      if (error) throw error;

      setResults(data);
      toast.success("Posts gerados com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar posts:', error);
      toast.error("Erro ao gerar posts. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar texto");
    }
  };

  const handleReset = () => {
    setResults(null);
    setFormData({
      business_idea: '',
      target_audience: '',
      platforms: '',
      content_type: '',
      tone: '',
      goals: ''
    });
  };

  const cost = getFeatureCost('basic-analysis');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Gerador de Posts para Redes Sociais
          </DialogTitle>
          <DialogDescription>
            Crie posts otimizados para diferentes plataformas sociais baseado na sua ideia de negócio.
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
                <Label htmlFor="target_audience">Público-Alvo</Label>
                <Textarea
                  id="target_audience"
                  placeholder="Quem é seu público-alvo? (idade, interesses, problemas)"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platforms">Plataformas</Label>
                <Input
                  id="platforms"
                  placeholder="Ex: Instagram, LinkedIn, Facebook, TikTok"
                  value={formData.platforms}
                  onChange={(e) => setFormData(prev => ({ ...prev, platforms: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                <Input
                  id="content_type"
                  placeholder="Ex: educativo, promocional, storytelling, dicas"
                  value={formData.content_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tom de Voz</Label>
                <Input
                  id="tone"
                  placeholder="Ex: profissional, casual, divertido, inspirador"
                  value={formData.tone}
                  onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Objetivos</Label>
                <Input
                  id="goals"
                  placeholder="Ex: gerar leads, aumentar awareness, engajamento"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.business_idea.trim()}
              className="w-full md:w-auto md:min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Posts...
                </>
              ) : (
                `Gerar Posts (${cost} créditos)`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Posts Gerados</h3>
              <Button variant="outline" onClick={handleReset}>
                Gerar Novos Posts
              </Button>
            </div>

            {results.strategy_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo da Estratégia</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{results.strategy_summary}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {results.posts?.map((post, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {post.platform}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(post.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Conteúdo:</h4>
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                    
                    {post.hashtags?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Hashtags:</h4>
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {post.best_time && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Melhor Horário:</h4>
                        <p className="text-sm text-muted-foreground">{post.best_time}</p>
                      </div>
                    )}

                    {post.engagement_tips?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Dicas de Engajamento:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {post.engagement_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.content_calendar?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calendário de Conteúdo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.content_calendar.map((item, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <div className="font-medium text-sm">{item.date}</div>
                        <div className="text-xs text-muted-foreground mb-1">{item.post_type}</div>
                        <div className="text-sm">{item.content}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};