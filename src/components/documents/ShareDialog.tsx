import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Trash2, Users, Eye, Edit, Folder, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "folder" | "document";
  itemId: string;
  itemName: string;
}

interface ShareRecord {
  id: string;
  item_type: string;
  item_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: string;
  created_at: string;
  shared_with_profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export function ShareDialog({
  open,
  onOpenChange,
  itemType,
  itemId,
  itemName,
}: ShareDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [permissionLevel, setPermissionLevel] = useState<string>("view");

  // Récupérer la liste des utilisateurs (profiles)
  const { data: users } = useQuery({
    queryKey: ["profiles-for-sharing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .neq("id", user?.id || "")
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Récupérer les partages existants pour cet élément
  const { data: existingShares, refetch: refetchShares } = useQuery({
    queryKey: ["document-shares", itemType, itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_shares")
        .select("*")
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      if (error) throw error;

      // Récupérer les profils des utilisateurs partagés
      if (data && data.length > 0) {
        const userIds = data.map((share) => share.shared_with);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        return data.map((share) => ({
          ...share,
          shared_with_profile: profiles?.find((p) => p.id === share.shared_with),
        })) as ShareRecord[];
      }
      return data as ShareRecord[];
    },
    enabled: open && !!itemId,
  });

  // Mutation pour ajouter un partage
  const addShareMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !user) return;

      const { error } = await supabase.from("document_shares").insert({
        item_type: itemType,
        item_id: itemId,
        shared_by: user.id,
        shared_with: selectedUserId,
        permission_level: permissionLevel,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Partage ajouté avec succès" });
      setSelectedUserId("");
      setPermissionLevel("view");
      refetchShares();
      queryClient.invalidateQueries({ queryKey: ["document-shares"] });
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast({
          variant: "destructive",
          title: "Partage déjà existant",
          description: "Cet élément est déjà partagé avec cet utilisateur",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message,
        });
      }
    },
  });

  // Mutation pour supprimer un partage
  const removeShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("document_shares")
        .delete()
        .eq("id", shareId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Partage supprimé" });
      refetchShares();
      queryClient.invalidateQueries({ queryKey: ["document-shares"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  // Filtrer les utilisateurs qui n'ont pas déjà accès
  const availableUsers = users?.filter(
    (u) => !existingShares?.some((share) => share.shared_with === u.id)
  );

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || "??";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Partager
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {itemType === "folder" ? (
              <Folder className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="font-medium">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulaire d'ajout de partage */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Ajouter un collaborateur
            </label>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <span>{u.full_name || u.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {(!availableUsers || availableUsers.length === 0) && (
                    <SelectItem value="none" disabled>
                      Aucun utilisateur disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Select value={permissionLevel} onValueChange={setPermissionLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      Lecture
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="w-3 h-3" />
                      Édition
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => addShareMutation.mutate()}
                disabled={!selectedUserId || addShareMutation.isPending}
                size="sm"
              >
                Partager
              </Button>
            </div>
          </div>

          {/* Liste des partages existants */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Personnes ayant accès ({existingShares?.length || 0})
            </label>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {existingShares?.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(
                            share.shared_with_profile?.full_name || null,
                            share.shared_with_profile?.email || null
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {share.shared_with_profile?.full_name ||
                            share.shared_with_profile?.email ||
                            "Utilisateur inconnu"}
                        </div>
                        {share.shared_with_profile?.email && share.shared_with_profile?.full_name && (
                          <div className="text-xs text-muted-foreground">
                            {share.shared_with_profile.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={share.permission_level === "edit" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {share.permission_level === "edit" ? (
                          <Edit className="w-3 h-3 mr-1" />
                        ) : (
                          <Eye className="w-3 h-3 mr-1" />
                        )}
                        {share.permission_level === "edit" ? "Édition" : "Lecture"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeShareMutation.mutate(share.id)}
                        disabled={removeShareMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!existingShares || existingShares.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Aucun partage pour le moment</p>
                    <p className="text-xs mt-1">
                      Ajoutez des collaborateurs pour leur donner accès
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {itemType === "folder" && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              💡 Le partage d'un dossier donne accès à tous les documents qu'il contient.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
