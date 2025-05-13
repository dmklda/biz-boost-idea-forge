import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

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
}

export function AdvancedAnalysisChat({
  ideaId,
  idea,
  analysis,
  onBack,
}: AdvancedAnalysisChatProps) {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: t(
        "advancedAnalysis.chatWelcome",
        "Olá! Como posso te ajudar a entender melhor sua análise avançada?"
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: `Resposta da IA para: ${input}`,
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);
  };

  const chatMessages = messages.map((message) => {
    const isUser = message.role === "user";
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${isUser ? "bg-brand-blue text-white" : "bg-gray-200"}`}>
          {isUser ? (
            // Use initials instead of avatarUrl
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
              isUser ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
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

      <div className="flex-1 p-6 overflow-y-auto" ref={chatContainerRef}>
        <ScrollArea className="h-full">
          <div className="space-y-4">{chatMessages}</div>
        </ScrollArea>
      </div>

      <div className="px-6 py-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t("advancedAnalysis.chatPlaceholder", "Digite sua mensagem...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4 mr-2" />
            {t("common.send", "Enviar")}
          </Button>
        </div>
      </div>
    </div>
  );
}
