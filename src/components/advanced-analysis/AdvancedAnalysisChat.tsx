
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, SendIcon, Sparkles, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdvancedAnalysisChatProps {
  ideaId: string;
  idea: any;
  analysis: any;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function AdvancedAnalysisChat({
  ideaId,
  idea,
  analysis,
  onBack,
}: AdvancedAnalysisChatProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-welcome",
      content: t('advancedAnalysis.chatWelcome', "Olá! Estou aqui para responder perguntas sobre sua ideia e análise avançada. Como posso ajudar?"),
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare context from idea and analysis
      const context = {
        idea: {
          title: idea.title,
          description: idea.description,
          audience: idea.audience,
          problem: idea.problem,
          monetization: idea.monetization,
          hasCompetitors: idea.has_competitors,
          budget: idea.budget,
          location: idea.location,
        },
        analysis: analysis,
      };

      const { data, error } = await supabase.functions.invoke("gpt-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `You are an AI assistant specializing in business analysis and entrepreneurship. 
              You are helping the user with their business idea that has gone through advanced analysis.
              
              Use the following context about the idea and its analysis to provide informed answers:
              
              ${JSON.stringify(context)}
              
              Your responses should be:
              - Helpful and informative
              - Specific to the user's idea and its analysis
              - Friendly and conversational
              - Concise but comprehensive
              
              If you're unsure about specific data not provided in the analysis, acknowledge the limitation
              but try to provide general guidance based on entrepreneurship best practices.`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: inputValue
            }
          ],
          model: "gpt-4o"
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.text || t('errors.noResponse', "Desculpe, não foi possível gerar uma resposta."),
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: t('errors.chatError', "Erro no chat"),
        description: t('errors.tryAgainLater', "Por favor, tente novamente mais tarde."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', "Voltar")}
        </Button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-purple" />
          <span className="text-sm font-medium">GPT-4o</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user" 
                    ? "flex-row-reverse" 
                    : "flex-row"
                }`}
              >
                <Avatar className={`h-8 w-8 ${
                  message.role === "user" 
                    ? "bg-brand-blue" 
                    : "bg-brand-purple"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-white" />
                  )}
                </Avatar>
                
                <div 
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user" 
                      ? "bg-brand-blue text-white" 
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8 bg-brand-purple">
                  <Sparkles className="h-4 w-4 text-white" />
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:200ms]"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:400ms]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder={t('advancedAnalysis.askQuestion', "Faça uma pergunta sobre sua ideia...")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading}
          >
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">{t('common.send', "Enviar")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
