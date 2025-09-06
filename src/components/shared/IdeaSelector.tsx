import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface IdeaSelectorProps {
  onSelect: (idea: Idea | null) => void;
}

export const IdeaSelector: React.FC<IdeaSelectorProps> = ({ onSelect }) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  useEffect(() => {
    if (user) {
      loadIdeas();
    }
  }, [user]);

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, description, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast.error("Erro ao carregar ideias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    onSelect(idea);
  };

  const displayedIdeas = showAllIdeas ? ideas : ideas.slice(0, 5);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-muted-foreground">Carregando suas ideias...</div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-8">
        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma ideia encontrada</h3>
        <p className="text-muted-foreground">
          Crie uma ideia primeiro para usar esta ferramenta
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5" />
        <h3 className="font-semibold">Selecione uma ideia:</h3>
      </div>
      
      <div className="grid gap-3">
        {displayedIdeas.map((idea) => (
          <Card 
            key={idea.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedIdea?.id === idea.id ? 'ring-2 ring-primary bg-muted/50' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSelectIdea(idea)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">{idea.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {idea.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ideas.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllIdeas(!showAllIdeas)}
          className="w-full"
        >
          {showAllIdeas ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Ver mais {ideas.length - 5} ideias
            </>
          )}
        </Button>
      )}
    </div>
  );
};