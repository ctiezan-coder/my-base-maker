import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Lock, Trash2, CheckCircle, UserCog } from "lucide-react";
import { RoleAssignmentDialog } from "./RoleAssignmentDialog";
import { UserPermissionsDialog } from "./UserPermissionsDialog";
import { AccountApprovalDialog } from "./AccountApprovalDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  direction: string | null;
  direction_id: string | null;
  directions?: { name: string } | null;
  role: string;
  account_status?: string;
  created_at: string;
}

export function UserManagementTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          *,
          directions (
            name
          )
        `)
        .order('created_at', { ascending: false});

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      return profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || 'user',
      })) as UserData[];
    },
  });

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      return data || [];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'manager' | 'user' }) => {
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié avec succès",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le rôle",
      });
    },
  });

  const updateDirectionMutation = useMutation({
    mutationFn: async ({ userId, directionId }: { userId: string; directionId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ direction_id: directionId })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Direction mise à jour",
        description: "La direction de l'utilisateur a été modifiée avec succès",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier la direction",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
      setDeleteUserId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
      });
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive';
    if (role === 'manager') return 'default';
    return 'secondary';
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4" />;
    if (role === 'manager') return <Lock className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((userData) => (
              <TableRow key={userData.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(userData.role)}
                    </div>
                    <div>
                      <p className="font-medium">{userData.full_name}</p>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {userData.user_id !== user?.id ? (
                    <Select
                      value={userData.direction_id || undefined}
                      onValueChange={(value) =>
                        updateDirectionMutation.mutate({
                          userId: userData.user_id,
                          directionId: value || null,
                        })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Aucune direction" />
                      </SelectTrigger>
                      <SelectContent>
                        {directions?.map((dir) => (
                          <SelectItem key={dir.id} value={dir.id}>
                            {dir.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm">{userData.directions?.name || "Aucune"}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Badge variant={getRoleBadgeVariant(userData.role)}>
                      {userData.role}
                    </Badge>
                    {userData.user_id !== user?.id && (
                    <Select
                      value={userData.role}
                      onValueChange={(value: 'admin' | 'manager' | 'user') =>
                        updateRoleMutation.mutate({
                          userId: userData.user_id,
                          newRole: value,
                        })
                      }
                    >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      userData.account_status === 'approved' ? 'default' :
                      userData.account_status === 'pending' ? 'secondary' :
                      userData.account_status === 'suspended' ? 'destructive' : 'outline'
                    }
                  >
                    {userData.account_status === 'approved' ? 'Approuvé' :
                     userData.account_status === 'pending' ? 'En attente' :
                     userData.account_status === 'suspended' ? 'Suspendu' : 'Rejeté'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {userData.user_id !== user?.id && (
                      <>
                        {userData.account_status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(userData);
                              setApprovalDialogOpen(true);
                            }}
                            title="Gérer l'approbation"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setRoleDialogOpen(true);
                          }}
                          title="Gérer le rôle"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setPermissionsDialogOpen(true);
                          }}
                          title="Gérer les permissions"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteUserId(userData.user_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <>
          <AccountApprovalDialog
            userId={selectedUser.user_id}
            userName={selectedUser.full_name}
            userEmail={selectedUser.email}
            currentStatus={selectedUser.account_status || 'pending'}
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
          />
          <RoleAssignmentDialog 
            userId={selectedUser.user_id}
            userEmail={selectedUser.email}
          />
          <UserPermissionsDialog
            user={selectedUser}
            open={permissionsDialogOpen}
            onOpenChange={setPermissionsDialogOpen}
          />
        </>
      )}

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur et toutes ses données seront supprimés définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
