import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MessageThread } from "@/components/MessageThread";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  property_id?: string;
  property_name?: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name),
          recipient:profiles!messages_recipient_id_fkey(id, first_name, last_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>();
      
      (messages || []).forEach((msg: any) => {
        const isOwnMessage = msg.sender_id === user.id;
        const otherUserId = isOwnMessage ? msg.recipient_id : msg.sender_id;
        const otherUser = isOwnMessage ? msg.recipient : msg.sender;
        const otherUserName = `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim() || 'Unknown User';

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: 0,
            property_id: msg.property_id,
          });
        }

        // Count unread messages
        if (!isOwnMessage && !msg.read) {
          const conv = conversationMap.get(otherUserId)!;
          conv.unread_count++;
        }
      });

      const convArray = Array.from(conversationMap.values());
      setConversations(convArray);
      
      if (convArray.length > 0 && !selectedConversation) {
        setSelectedConversation(convArray[0]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Please log in to view messages</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <Card className="lg:col-span-1 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? "No conversations found" : "No messages yet"}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversation?.id === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback>{conversation.other_user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-foreground truncate">{conversation.other_user_name}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                          </span>
                        </div>
                        {conversation.property_name && (
                          <p className="text-xs text-muted-foreground mb-1">{conversation.property_name}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
                          {conversation.unread_count > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div className="lg:col-span-2">
            {selectedConversation ? (
              <MessageThread
                recipientId={selectedConversation.other_user_id}
                recipientName={selectedConversation.other_user_name}
                propertyId={selectedConversation.property_id}
                propertyName={selectedConversation.property_name}
              />
            ) : (
              <Card className="flex items-center justify-center h-[600px]">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
