import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  receiverId: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
    email: string;
  };
}

export function ConversationView({ receiverId }: ConversationViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Marquer les notifications de messages comme lues quand on ouvre la conversation
  useEffect(() => {
    if (!user || !receiverId) return;

    const markMessagesAsRead = async () => {
      // Récupérer les IDs des messages non lus de ce sender
      const { data: unreadNotifications } = await supabase
        .from('notifications')
        .select('id, reference_id')
        .eq('user_id', user.id)
        .eq('reference_table', 'chat_messages')
        .eq('is_read', false);

      if (!unreadNotifications || unreadNotifications.length === 0) return;

      // Récupérer les messages de ce sender
      const messageIds = unreadNotifications
        .map(n => n.reference_id)
        .filter(Boolean);

      if (messageIds.length === 0) return;

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, sender_id')
        .in('id', messageIds)
        .eq('sender_id', receiverId);

      if (!messages || messages.length === 0) return;

      // Marquer les notifications correspondantes comme lues
      const notificationIds = unreadNotifications
        .filter(n => messages.some(m => m.id === n.reference_id))
        .map(n => n.id);

      if (notificationIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', notificationIds);

        // Invalider les requêtes de notifications
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        queryClient.invalidateQueries({ queryKey: ['unread-messages-by-user'] });
      }
    };

    markMessagesAsRead();
  }, [user, receiverId, queryClient]);

  // Fetch receiver profile
  const { data: receiverProfile } = useQuery({
    queryKey: ["user-profile", receiverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("user_id", receiverId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!receiverId,
  });

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["private-chat-messages", receiverId],
    queryFn: async () => {
      if (!user) return [];

      // Get messages where:
      // 1. I'm the sender and receiver is in receiver_ids
      // 2. Receiver is the sender and I'm in receiver_ids
      const { data: messagesData, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_ids.cs.{${receiverId}}),and(sender_id.eq.${receiverId},receiver_ids.cs.{${user.id}})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Filter to only 1-to-1 conversations
      const filteredMessages = (messagesData || []).filter((msg: any) => {
        const participants = [msg.sender_id, ...msg.receiver_ids];
        return (
          participants.length === 2 &&
          participants.includes(user.id) &&
          participants.includes(receiverId)
        );
      });

      // Get sender profiles
      const senderIds = [...new Set(filteredMessages.map((msg) => msg.sender_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", senderIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.user_id, p]) || []);

      return filteredMessages.map((msg) => ({
        ...msg,
        sender_profile: profilesMap.get(msg.sender_id),
      }));
    },
    enabled: !!user && !!receiverId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user || !receiverId) return;

    const channel = supabase
      .channel(`private-chat-${receiverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          queryClient.invalidateQueries({ 
            queryKey: ["private-chat-messages", receiverId] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiverId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const receiverInitials = receiverProfile?.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{receiverInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{receiverProfile?.full_name}</h3>
            <p className="text-xs text-muted-foreground">{receiverProfile?.email}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Aucun message</p>
              <p className="text-sm">Envoyez le premier message</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: Message) => {
              const isMe = msg.sender_id === user?.id;
              const messageTime = new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", isMe && "flex-row-reverse")}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {isMe
                        ? "M"
                        : msg.sender_profile?.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("flex-1 max-w-md", isMe && "text-right")}>
                    <div
                      className={cn(
                        "inline-block rounded-lg p-3",
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{messageTime}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 bg-muted/30">
        <MessageInput receiverId={receiverId} />
      </div>
    </div>
  );
}
