import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_ids: string[];
  message: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
    email: string;
  };
}

export const useChatMessages = (selectedCollaborators: string[]) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stable key that doesn't mutate the original array
  const collaboratorsKey = useMemo(
    () => [...selectedCollaborators].sort().join(','),
    [selectedCollaborators]
  );

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', collaboratorsKey],
    queryFn: async () => {
      if (!user || selectedCollaborators.length === 0) return [];

      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_ids.cs.{${user.id}}`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Filter messages based on selected collaborators
      const selectedWithUser = [...selectedCollaborators, user.id];
      const filteredMessages = (messagesData || []).filter((msg: any) => {
        const allParticipants = [msg.sender_id, ...msg.receiver_ids];

        // Check if message participants match selected collaborators
        return selectedWithUser.every(id => allParticipants.includes(id)) &&
               allParticipants.every(id => selectedWithUser.includes(id));
      });

      // Get unique sender IDs
      const senderIds = [...new Set(filteredMessages.map(msg => msg.sender_id))];

      if (senderIds.length === 0) return [];

      // Fetch sender profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', senderIds);

      if (profilesError) throw profilesError;

      // Map profiles to messages
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      return filteredMessages.map(msg => ({
        ...msg,
        sender_profile: profilesMap.get(msg.sender_id)
      }));
    },
    enabled: !!user && selectedCollaborators.length > 0,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('User not authenticated');
      if (selectedCollaborators.length === 0) throw new Error('No recipients selected');

      const trimmed = message.trim();
      if (!trimmed || trimmed.length > 10000) throw new Error('Message invalide');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_ids: selectedCollaborators,
          message: trimmed,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error: Error) => {
      toast.error('Erreur lors de l\'envoi du message', {
        description: error.message,
      });
    },
  });

  // Subscribe to realtime updates with filter
  useEffect(() => {
    if (!user || selectedCollaborators.length === 0) return;

    const channel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Invalidate queries to refresh messages
          queryClient.invalidateQueries({ queryKey: ['chat-messages'] });

          // Play sound for incoming messages from others
          if (newMessage.sender_id !== user.id) {
            if (!audioRef.current) {
              audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eaeSwkNUKfj8LdjHAU7k9jy0A==');
              audioRef.current.volume = 0.2;
            }
            audioRef.current.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, collaboratorsKey, queryClient]);

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};
