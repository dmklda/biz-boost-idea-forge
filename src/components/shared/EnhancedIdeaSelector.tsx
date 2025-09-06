import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface EnhancedIdeaSelectorProps {
  onSelect: (idea: Idea | null) => void;
  allowCustomIdea?: boolean;
  customIdeaValue?: string;
  onCustomIdeaChange?: (value: string) => void;
  useCustomIdea?: boolean;
  onUseCustomIdeaChange?: (value: boolean) => void;
}

export const EnhancedIdeaSelector: React.FC<EnhancedIdeaSelectorProps> = ({
  onSelect,
  allowCustomIdea = false,
  customIdeaValue = "",
  onCustomIdeaChange,
  useCustomIdea = false,
  onUseCustomIdeaChange
}) => {
  const { authState } = useAuth();
  const user = authState.user;
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"saved" | "custom">(useCustomIdea ? "custom" : "saved");

  useEffect(() => {
    if (user) {
      loadIdeas();
    }
  }, [user]);

  useEffect(() => {
    if (onUseCustomIdeaChange) {
      onUseCustomIdeaChange(activeTab === "custom");
    }
  }, [activeTab, onUseCustomIdeaChange]);

  const loadIdeas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, description, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

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
    if (activeTab === "custom" && onUseCustomIdeaChange) {
      setActiveTab("saved");
      onUseCustomIdeaChange(false);
    }
  };

  const handleCustomIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCustomIdeaChange) {
      onCustomIdeaChange(e.target.value);
    }
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-muted-foreground">Carregando suas ideias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allowCustomIdea ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "saved" | "custom")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              <span>Ideias Salvas</span>
              <Badge variant="secondary" className="ml-1">{ideas.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Ideia Personalizada</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="mt-4">
            {ideas.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma ideia encontrada</h3>
                <p className="text-muted-foreground">
                  Crie uma ideia primeiro para usar esta ferramenta
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar nas suas ideias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid gap-3">
                    {filteredIdeas.map((idea) => (
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
                            <div className="flex justify-between items-center">
                              <Badge variant="secondary" className="text-xs">
                                {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                              </Badge>
                              {selectedIdea?.id === idea.id && (
                                <Badge variant="default" className="text-xs">
                                  Selecionada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredIdeas.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Nenhuma ideia encontrada com este termo
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-idea" className="text-base font-medium">Descreva sua ideia</Label>
                <Textarea
                  id="custom-idea"
                  placeholder="Descreva sua ideia de negócio em detalhes..."
                  value={customIdeaValue}
                  onChange={handleCustomIdeaChange}
                  className="mt-2 min-h-[150px] resize-none"
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Dicas para uma boa descrição:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Explique o problema que sua ideia resolve</li>
                  <li>Descreva seu público-alvo</li>
                  <li>Mencione como pretende monetizar</li>
                  <li>Inclua diferenciais competitivos</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {ideas.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma ideia encontrada</h3>
              <p className="text-muted-foreground">
                Crie uma ideia primeiro para usar esta ferramenta
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-semibold">Selecione uma ideia:</h3>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar nas suas ideias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="h-[300px] pr-4">
                <div className="grid gap-3">
                  {filteredIdeas.map((idea) => (
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
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                            </Badge>
                            {selectedIdea?.id === idea.id && (
                              <Badge variant="default" className="text-xs">
                                Selecionada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredIdeas.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Nenhuma ideia encontrada com este termo
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
};