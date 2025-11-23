import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export function QuickApprovalPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending users
  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-users-quick'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          direction:directions(name)
        `)
        .eq('account_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'approved' })
        .eq('user_id', userId);

      if (error) throw error;

      // Create notification for the user
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: 'Compte approuvé',
        p_message: 'Votre compte a été approuvé. Vous pouvez maintenant accéder à la plateforme.',
        p_type: 'success',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users-quick'] });
      toast({
        title: "Compte approuvé",
        description: "L'utilisateur peut maintenant accéder à la plateforme",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver le compte",
      });
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'rejected' })
        .eq('user_id', userId);

      if (error) throw error;

      // Create notification for the user
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: 'Compte rejeté',
        p_message: 'Votre demande d\'inscription a été rejetée. Contactez un administrateur pour plus d\'informations.',
        p_type: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users-quick'] });
      toast({
        title: "Compte rejeté",
        description: "L'utilisateur a été notifié",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter le compte",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Approbations en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!pendingUsers || pendingUsers.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Approbations en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune demande en attente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Approbations en attente
          <Badge variant="secondary">{pendingUsers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.direction?.name || 'Direction non spécifiée'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => approveMutation.mutate(user.user_id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => rejectMutation.mutate(user.user_id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
