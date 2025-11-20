import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useUnreadMessages = () => {
  const { user } = useAuth();

  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      // Compter les messages non lus (notifications de type chat_messages non lues)
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('reference_table', 'chat_messages')
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-messages-updates')
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

  return { unreadCount };
};
