'use client'

import { useState, useEffect, useRef } from 'react';
import { useChat, Message } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const ChatLayout = () => {
    const {
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        loading,
        sendMessage
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await sendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Sidebar - Conversations List */}
            <Card className="w-80 flex flex-col glass-effect border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 bg-background/50 border-border/50"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-2 gap-2">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                                    activeConversationId === conv.id
                                        ? "bg-primary/10 border border-primary/20"
                                        : "hover:bg-muted/50 border border-transparent"
                                )}
                            >
                                <Avatar className="w-10 h-10 border border-border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant_name}`} />
                                    <AvatarFallback>{conv.participant_name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm truncate">{conv.participant_name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {conv.last_message_at && format(new Date(conv.last_message_at), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {conv.last_message}
                                    </p>
                                </div>
                                {conv.unread_count > 0 && (
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col glass-effect border-border/50 overflow-hidden">
                {activeConversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/30 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border border-border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversations.find(c => c.id === activeConversationId)?.participant_name}`} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-sm">
                                        {conversations.find(c => c.id === activeConversationId)?.participant_name}
                                    </h3>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Video className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === 'me'; // In real app, check against current user ID
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                isMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted text-foreground rounded-bl-none"
                                            )}>
                                                {msg.content}
                                                <div className={cn(
                                                    "text-[10px] mt-1 text-right opacity-70",
                                                    isMe ? "text-primary-foreground" : "text-muted-foreground"
                                                )}>
                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-background/30 backdrop-blur-md border-t border-border/50">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-background/50 border-border/50 focus-visible:ring-primary"
                                />
                                <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 opacity-50" />
                        </div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
