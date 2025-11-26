import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    conversation_id: string;
}

export interface Conversation {
    id: string;
    participant_id: string;
    participant_name: string;
    participant_avatar?: string;
    last_message?: string;
    last_message_at?: string;
    unread_count: number;
}

export const useChat = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const supabase = createClient();
    const channelRef = useRef<any>(null);

    // Mock data for demo purposes if no backend tables exist yet
    const mockConversations: Conversation[] = [
        {
            id: '1',
            participant_id: 'landlord-1',
            participant_name: 'Jean Pierre (Landlord)',
            last_message: 'When would you like to visit?',
            last_message_at: new Date().toISOString(),
            unread_count: 1,
        },
        {
            id: '2',
            participant_id: 'tenant-2',
            participant_name: 'Sophie Martin',
            last_message: 'Is the apartment still available?',
            last_message_at: new Date(Date.now() - 86400000).toISOString(),
            unread_count: 0,
        }
    ];

    useEffect(() => {
        fetchConversations();

        // Subscribe to new messages globally (for notifications/unread counts)
        const channel = supabase
            .channel('global-messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                // Handle new message notification
                console.log('New message received:', payload);
                fetchConversations(); // Refresh list to update last message
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId);
            subscribeToConversation(activeConversationId);
        }
    }, [activeConversationId]);

    const fetchConversations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // In a real app, we would fetch from a 'conversations' table or join messages
            // For now, we'll simulate an API call
            // const { data, error } = await supabase.from('conversations').select('*');

            // Using mock data for immediate UI feedback as requested
            setConversations(mockConversations);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        // Mock messages for the demo
        const mockMessages: Message[] = [
            {
                id: 'm1',
                content: 'Hello, I am interested in your property.',
                sender_id: 'tenant-2',
                created_at: new Date(Date.now() - 100000).toISOString(),
                conversation_id: conversationId
            },
            {
                id: 'm2',
                content: 'Hi! Thanks for your interest. When are you available?',
                sender_id: 'me', // 'me' represents current user for this demo
                created_at: new Date(Date.now() - 50000).toISOString(),
                conversation_id: conversationId
            }
        ];
        setMessages(mockMessages);
    };

    const subscribeToConversation = (conversationId: string) => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        channelRef.current = supabase
            .channel(`conversation:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages(prev => [...prev, newMessage]);
            })
            .subscribe();
    };

    const sendMessage = async (content: string) => {
        if (!activeConversationId || !content.trim()) return;

        setSending(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Optimistic update
            const tempId = Math.random().toString(36).substring(7);
            const newMessage: Message = {
                id: tempId,
                content,
                sender_id: user?.id || 'me',
                created_at: new Date().toISOString(),
                conversation_id: activeConversationId
            };

            setMessages(prev => [...prev, newMessage]);

            // In real implementation:
            // await supabase.from('messages').insert({ ... });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setSending(false);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setSending(false);
        }
    };

    return {
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        loading,
        sending,
        sendMessage
    };
};
