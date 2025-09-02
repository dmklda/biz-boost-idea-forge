import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, Plus, Calendar, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Idea {
  id: string;
  title: string;
  description: string;
  audience?: string;
  monetization?: string;
  created_at: string;
  status: string;
}

interface IdeaSelectorProps {
  onIdeaSelect: (idea: Idea | null) => void;
  selectedIdea: Idea | null;
}

export const IdeaSelector = ({ onIdeaSelect, selectedIdea }: IdeaSelectorProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'new' | 'existing'>('existing');

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, description, audience, monetization, created_at, status')
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar ideias:', error);
        toast.error('Erro ao carregar ideias');
        return;
      }

      setIdeas(data || []);
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
      toast.error('Erro ao carregar ideias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: 'new' | 'existing') => {
    setMode(newMode);
    if (newMode === 'new') {
      onIdeaSelect(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Selecionar Ideia para Análise
        </CardTitle>
        <CardDescription>
          Escolha uma ideia existente ou crie uma nova análise do zero
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'existing' ? 'default' : 'outline'}
            onClick={() => handleModeChange('existing')}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Lightbulb className="h-4 w-4" />
            Ideia Existente
          </Button>
          <Button
            variant={mode === 'new' ? 'default' : 'outline'}
            onClick={() => handleModeChange('new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Análise
          </Button>
        </div>

        {mode === 'existing' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando ideias...</p>
              </div>
            ) : ideas.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma ideia encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie uma ideia primeiro ou faça uma nova análise
                </p>
              </div>
            ) : (
              <>
                {/* Select Dropdown */}
                <Select 
                  value={selectedIdea?.id || ''} 
                  onValueChange={(value) => {
                    const idea = ideas.find(i => i.id === value);
                    onIdeaSelect(idea || null);
                  }}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Selecione uma ideia..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {ideas.map((idea) => (
                      <SelectItem key={idea.id} value={idea.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{idea.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(idea.created_at)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Idea Details */}
                {selectedIdea && (
                  <Card className="border-primary/20">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{selectedIdea.title}</h4>
                          <Badge variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {selectedIdea.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {selectedIdea.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(selectedIdea.created_at)}
                          </div>
                          {selectedIdea.audience && (
                            <div>
                              <strong>Público:</strong> {selectedIdea.audience}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'new' && (
          <div className="text-center py-4">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Preencha o formulário abaixo para criar uma nova análise regulatória
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};