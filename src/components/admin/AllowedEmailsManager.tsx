import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Mail } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string()
  .email('Email invalide')
  .refine((email) => email.endsWith('@cotedivoirexport.ci'), {
    message: 'L\'email doit appartenir au domaine @cotedivoirexport.ci',
  });

export function AllowedEmailsManager() {
  const [newEmail, setNewEmail] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer la liste des emails autorisés
  const { data: allowedEmails, isLoading } = useQuery({
    queryKey: ['allowed-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Ajouter un email
  const addEmailMutation = useMutation({
    mutationFn: async () => {
      try {
        emailSchema.parse(newEmail.toLowerCase().trim());
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }

      const { error } = await supabase
        .from('allowed_emails')
        .insert({
          email: newEmail.toLowerCase().trim(),
          notes: notes.trim() || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-emails'] });
      setNewEmail('');
      setNotes('');
      toast({
        title: 'Email ajouté',
        description: 'L\'email a été ajouté à la liste blanche',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter l\'email',
      });
    },
  });

  // Supprimer un email
  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from('allowed_emails')
        .delete()
        .eq('id', emailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-emails'] });
      toast({
        title: 'Email supprimé',
        description: 'L\'email a été retiré de la liste blanche',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'email',
      });
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    addEmailMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gestion des emails autorisés
        </CardTitle>
        <CardDescription>
          Seuls les emails de cette liste pourront s'inscrire sur la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulaire d'ajout */}
        <form onSubmit={handleAddEmail} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email @cotedivoirexport.ci</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="prenom.nom@cotedivoirexport.ci"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Ex: Nouveau collaborateur"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={addEmailMutation.isPending}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addEmailMutation.isPending ? 'Ajout...' : 'Ajouter à la liste blanche'}
          </Button>
        </form>

        {/* Liste des emails */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Emails autorisés ({allowedEmails?.length || 0})
          </h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : allowedEmails && allowedEmails.length > 0 ? (
            <div className="rounded-md border">
              <div className="max-h-[400px] overflow-y-auto">
                {allowedEmails.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.email}</p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteEmailMutation.mutate(item.id)}
                      disabled={deleteEmailMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
              Aucun email autorisé pour le moment
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}