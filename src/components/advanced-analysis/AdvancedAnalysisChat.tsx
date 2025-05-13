
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedAnalysisChatProps {
  ideaId: string;
  idea: any;
  analysis: any;
  onBack: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AdvancedAnalysisChat({ ideaId, idea, analysis, onBack }: AdvancedAnalysisChatProps) {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: t(
        'advancedAnalysis.chatWelcome', 
        "Olá! Sou seu assistente especializado em análise de ideias. Acabei de analisar sua ideia em detalhes e estou pronto para responder suas perguntas. O que gostaria de saber sobre sua ideia de negócio?"
      )
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Call the edge function to process the message
      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: {
          ideaId,
          message: userMessage.content,
          history: messages,
        }
      });
      
      if (error) throw error;
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error(t('errors.chatError', "Erro ao processar mensagem"));
      
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('errors.chatErrorMessage', "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.")
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-semibold">
            {t('advancedAnalysis.chatWithAI', "Chat sobre sua ideia")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('advancedAnalysis.poweredByGPT4o', "Alimentado por GPT-4o")}
          </p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  {message.role === 'user' ? (
                    <>
                      <AvatarFallback>
                        {authState.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                      {authState.user?.avatarUrl && (
                        <AvatarImage src={authState.user.avatarUrl} />
                      )}
                    </>
                  ) : (
                    <>
                      <AvatarFallback className="bg-brand-blue text-white">AI</AvatarFallback>
                      <AvatarImage src="/lovable-uploads/de1cda05-c7b3-4112-b45f-a03ba18a084a.png" />
                    </>
                  )}
                </Avatar>
                
                <Card className={`${message.role === 'user' ? 'bg-brand-blue text-white' : ''}`}>
                  <CardContent className="p-3 text-sm whitespace-pre-wrap">
                    {message.content}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-brand-blue text-white">AI</AvatarFallback>
                  <AvatarImage src="/lovable-uploads/de1cda05-c7b3-4112-b45f-a03ba18a084a.png" />
                </Avatar>
                
                <Card>
                  <CardContent className="p-3 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-brand-blue rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-brand-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 bg-brand-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('advancedAnalysis.askQuestion', "Faça uma pergunta sobre sua ideia...")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
