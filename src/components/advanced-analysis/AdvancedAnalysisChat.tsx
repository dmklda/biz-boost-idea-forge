
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertTriangle } from "lucide-react";
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
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

export function AdvancedAnalysisChat({
  ideaId,
  idea,
  analysis,
  onBack,
}: AdvancedAnalysisChatProps) {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasWelcomeMessage, setHasWelcomeMessage] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved messages
  useEffect(() => {
    const fetchSavedMessages = async () => {
      if (!authState.user) return;
      
      try {
        setIsLoading(true);
        
        const { data: chatMessages, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("idea_id", ideaId)
          .eq("user_id", authState.user.id)
          .order("created_at", { ascending: true });
        
        if (error) {
          console.error("Error loading saved messages:", error);
          toast({
            variant: "destructive",
            title: t("errors.loadingError", "Erro ao carregar mensagens"),
            description: t("errors.tryAgainLater", "Tente novamente mais tarde."),
          });
        } else if (chatMessages && chatMessages.length > 0) {
          // Format saved messages
          const formattedMessages: Message[] = chatMessages.map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content
          }));
          setMessages(formattedMessages);
          
          // Check if there's already a welcome message
          const hasWelcome = chatMessages.some(msg => msg.role === "assistant" && msg.content.includes(t("advancedAnalysis.chatWelcome", "Olá!")));
          setHasWelcomeMessage(hasWelcome);
        } 
      } catch (err) {
        console.error("Failed to fetch chat messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedMessages();
  }, [ideaId, authState.user, t, toast]);

  // Add welcome message if no saved messages
  useEffect(() => {
    if (!isLoading && messages.length === 0 && !hasWelcomeMessage) {
      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: t(
            "advancedAnalysis.chatWelcome",
            "Olá! Como posso te ajudar a entender melhor sua análise avançada?"
          ),
        },
      ]);
      setHasWelcomeMessage(true);
    }
  }, [isLoading, messages.length, hasWelcomeMessage, t]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userInput = input.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setIsSending(true);

    try {
      console.log("Sending chat message:", {
        ideaId,
        message: userInput,
        historyLength: messages.filter(msg => msg.id !== "initial").length
      });

      // Pass userId to save messages in the database
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        "gpt-chat",
        {
          body: {
            ideaId: ideaId,
            message: userInput,
            userId: authState.user?.id, // Pass the user ID to save messages
            history: messages.filter(msg => msg.id !== "initial").map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          },
        }
      );

      if (aiError) {
        throw new Error(`Supabase function error: ${aiError.message}`);
      }

      console.log("Received AI response:", aiResult);

      if (!aiResult || !aiResult.response) {
        throw new Error("Received empty response from AI");
      }

      const aiResponse: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: aiResult.response,
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);

    } catch (error) {
      console.error("Error calling AI chat handler:", error);
      const errorResponse: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content: t("errors.chatError", "Desculpe, ocorreu um erro ao conectar com a IA. Tente novamente."),
        error: true,
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
      toast({
        variant: "destructive",
        title: t("common.errorOccurred", "Ocorreu um erro"),
        description: t("errors.chatErrorDetail", "Não foi possível obter uma resposta da IA."),
      });
    } finally {
      setIsSending(false);
      
      // Make sure the input is visible after sending
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const chatMessages = messages.map((message) => {
    const isUser = message.role === "user";
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center ${isUser ? "bg-brand-blue text-white" : "bg-gray-200"}`}>
          {isUser ? (
            <span className="text-sm font-medium">{authState.user?.email?.charAt(0).toUpperCase() || "U"}</span>
          ) : (
            <img
              src="/lovable-uploads/c2fc1a69-35f0-445f-9e1b-fef53f0f8c8d.png"
              alt="AI"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div
            className={`rounded-xl px-4 py-2 ${
              isUser
                ? "bg-brand-blue text-white"
                : message.error 
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {message.error && <AlertTriangle className="inline-block h-4 w-4 mr-2 text-red-500" />}
            {message.content}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t("common.back", "Voltar")}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 pt-6">
          <div className="space-y-4 pb-20">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-pulse text-muted-foreground">
                  {t("common.loading", "Carregando...")}
                </div>
              </div>
            ) : (
              <>
                {chatMessages}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="px-6 py-4 border-t bg-white sticky bottom-0 z-10">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t("advancedAnalysis.chatPlaceholder", "Digite sua mensagem...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSending) {
                handleSend();
              }
            }}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>{t("common.sending", "Enviando...")}</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t("common.send", "Enviar")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
