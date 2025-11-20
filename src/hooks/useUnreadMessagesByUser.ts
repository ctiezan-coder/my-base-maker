import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useUnreadMessagesByUser = () => {
  const { user } = useAuth();

  const { data: unreadByUser = {}, refetch } = useQuery({
    queryKey: ['unread-messages-by-user', user?.id],
    queryFn: async () => {
      if (!user) return {};

      // Récupérer toutes les notifications de messages non lues
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('reference_id')
        .eq('user_id', user.id)
        .eq('reference_table', 'chat_messages')
        .eq('is_read', false);

      if (error) throw error;
      if (!notifications || notifications.length === 0) return {};

      // Récupérer les messages correspondants
      const messageIds = notifications.map(n => n.reference_id).filter(Boolean);
      
      if (messageIds.length === 0) return {};

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, sender_id')
        .in('id', messageIds);

      if (messagesError) throw messagesError;

      // Compter les messages par expéditeur
      const countBySender: Record<string, number> = {};
      
      messages?.forEach(msg => {
        if (msg.sender_id !== user.id) {
          countBySender[msg.sender_id] = (countBySender[msg.sender_id] || 0) + 1;
        }
      });

      return countBySender;
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-by-user-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  return { unreadByUser };
};
