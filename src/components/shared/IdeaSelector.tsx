import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lightbulb, Plus, ChevronDown, ChevronUp } from "lucide-react";
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
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea | null) => void;
  customIdea: string;
  onCustomIdeaChange: (value: string) => void;
  useCustom: boolean;
  onUseCustomChange: (value: boolean) => void;
  label?: string;
  placeholder?: string;
}

export const IdeaSelector: React.FC<IdeaSelectorProps> = ({
  selectedIdea,
  onSelectIdea,
  customIdea,
  onCustomIdeaChange,
  useCustom,
  onUseCustomChange,
  label = "Escolha uma ideia",
  placeholder = "Descreva sua ideia aqui..."
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllIdeas, setShowAllIdeas] = useState(false);

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

  const displayedIdeas = showAllIdeas ? ideas : ideas.slice(0, 3);

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{label}</Label>
      
      <RadioGroup 
        value={useCustom ? "custom" : selectedIdea?.id || ""} 
        onValueChange={(value) => {
          if (value === "custom") {
            onUseCustomChange(true);
            onSelectIdea(null);
          } else {
            onUseCustomChange(false);
            const idea = ideas.find(i => i.id === value);
            onSelectIdea(idea || null);
          }
        }}
        className="space-y-3"
      >
        {/* Custom Idea Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar nova descrição
            </Label>
          </div>
          
          {useCustom && (
            <Textarea
              value={customIdea}
              onChange={(e) => onCustomIdeaChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[100px]"
              maxLength={500}
            />
          )}
        </div>

        {/* Existing Ideas */}
        {!isLoading && ideas.length > 0 && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Ou escolha uma ideia existente:
            </Label>
            
            <div className="space-y-2">
              {displayedIdeas.map((idea) => (
                <Card key={idea.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value={idea.id} id={idea.id} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={idea.id} className="cursor-pointer">
                          <div className="font-medium">{idea.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {idea.description}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {ideas.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllIdeas(!showAllIdeas)}
                className="w-full mt-2"
              >
                {showAllIdeas ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Ver mais {ideas.length - 3} ideias
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </RadioGroup>

      {isLoading && (
        <div className="text-center py-4">
          <div className="text-sm text-muted-foreground">Carregando suas ideias...</div>
        </div>
      )}
    </div>
  );
};
