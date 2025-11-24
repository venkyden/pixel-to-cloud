import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { language, t } = useLanguage();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/properties')) return language === 'fr' ? 'page des propriétés' : 'properties page';
    if (path.includes('/dashboard')) return language === 'fr' ? 'tableau de bord' : 'dashboard';
    if (path.includes('/messages')) return language === 'fr' ? 'page des messages' : 'messages page';
    if (path.includes('/incidents')) return language === 'fr' ? 'page des incidents' : 'incidents page';
    if (path.includes('/profile')) return language === 'fr' ? 'page de profil' : 'profile page';
    if (path.includes('/tenant')) return language === 'fr' ? 'parcours locataire' : 'tenant flow';
    if (path.includes('/landlord')) return language === 'fr' ? 'parcours propriétaire' : 'landlord flow';
    return language === 'fr' ? 'page d\'accueil' : 'home page';
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          language,
          pageContext: getPageContext()
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(language === "fr"
            ? "Limite de taux atteinte. Veuillez réessayer plus tard."
            : "Rate limit reached. Please try again later."
          );
          return;
        }
        if (response.status === 402) {
          toast.error(language === "fr"
            ? "Crédits IA épuisés. Veuillez ajouter des crédits."
            : "AI credits exhausted. Please add credits."
          );
          return;
        }
        throw new Error("Failed to start stream");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              assistantContent += content;

              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;

      if (import.meta.env.DEV) console.error("Chat error:", error);
      toast.error(language === "fr"
        ? "Erreur lors de la communication avec l'IA"
        : "Error communicating with AI"
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-elegant hover:scale-110 hover:shadow-glow transition-all duration-300"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 glass-effect border-border/50 shadow-elegant transition-all duration-300 ${isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        } flex flex-col overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg shadow-md">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">
            {language === "fr" ? "Assistant Roomivo" : "Roomivo Assistant"}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 relative" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8 glass-effect rounded-xl p-6 border border-border/50">
                <Bot className="h-12 w-12 mx-auto mb-4 text-primary opacity-70" />
                <p className="text-sm font-medium">
                  {language === "fr"
                    ? "Bonjour ! Je suis votre assistant Roomivo. Comment puis-je vous aider aujourd'hui ?"
                    : "Hello! I'm your Roomivo assistant. How can I help you today?"}
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex animate-fade-in ${message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-md transition-all duration-300 hover:scale-[1.02] ${message.role === "user"
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "glass-effect border border-border/50"
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4 animate-fade-in">
                <div className="glass-effect rounded-2xl px-4 py-2 border border-border/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="relative p-4 border-t border-border/50 glass-effect">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === "fr"
                    ? "Posez votre question..."
                    : "Ask your question..."
                }
                disabled={isLoading}
                className="flex-1 glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  );
};
