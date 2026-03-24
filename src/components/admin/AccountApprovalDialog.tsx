import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Ban } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AccountApprovalDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountApprovalDialog({
  userId,
  userName,
  userEmail,
  currentStatus,
  open,
  onOpenChange,
}: AccountApprovalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  // Reset notes when dialog opens
  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: string; reason?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: status })
        .eq('user_id', userId);

      if (error) throw error;

      // Create notification for user
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: status === 'approved' ? 'Compte approuvé' : 'Demande d\'accès',
        p_message: 
          status === 'approved' 
            ? 'Votre compte a été approuvé. Vous pouvez maintenant accéder à la plateforme.'
            : status === 'rejected'
            ? `Votre demande d'accès a été refusée. ${reason || ''}`
            : `Votre compte a été suspendu. ${reason || ''}`,
        p_type: status === 'approved' ? 'success' : 'warning',
      });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Statut mis à jour',
        description: `Le compte a été ${
          status === 'approved' ? 'approuvé' : 
          status === 'rejected' ? 'rejeté' : 'suspendu'
        }.`,
      });
      onOpenChange(false);
      setNotes('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut du compte.',
      });
      console.error('Error updating account status:', error);
    },
  });

  const handleApprove = () => {
    updateStatusMutation.mutate({ status: 'approved' });
  };

  const handleReject = () => {
    updateStatusMutation.mutate({ status: 'rejected', reason: notes });
  };

  const handleSuspend = () => {
    updateStatusMutation.mutate({ status: 'suspended', reason: notes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gestion du compte utilisateur</DialogTitle>
          <DialogDescription>
            Modifier le statut d'accès de {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium">Statut actuel</p>
              <p className="text-sm text-muted-foreground capitalize">{currentStatus}</p>
            </div>
          </div>

          {currentStatus === 'pending' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Cet utilisateur est en attente d'approbation pour accéder à la plateforme.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notes ou raison (optionnel)
            </label>
            <Textarea
              placeholder="Ajouter une note ou une raison pour cette action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentStatus !== 'approved' && (
            <Button
              onClick={handleApprove}
              disabled={updateStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver
            </Button>
          )}
          
          {currentStatus !== 'rejected' && currentStatus === 'pending' && (
            <Button
              onClick={handleReject}
              disabled={updateStatusMutation.isPending}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Refuser
            </Button>
          )}

          {currentStatus === 'approved' && (
            <Button
              onClick={handleSuspend}
              disabled={updateStatusMutation.isPending}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Ban className="w-4 h-4 mr-2" />
              Suspendre
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateStatusMutation.isPending}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
