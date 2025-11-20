import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface UserPermissionsDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODULES = [
  { value: "companies", label: "Opérateurs" },
  { value: "projects", label: "Projets" },
  { value: "documents", label: "Documents" },
  { value: "events", label: "Événements" },
  { value: "trainings", label: "Formations" },
  { value: "kpis", label: "KPIs" },
  { value: "market_development", label: "Marchés Export" },
  { value: "partnerships", label: "Partenariats" },
  { value: "media", label: "Médias" },
  { value: "collaborators", label: "Collaborateurs" },
  { value: "imputations", label: "Imputations" },
  { value: "suivi_evaluation", label: "Suivi & Évaluation" },
];

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
}: UserPermissionsDialogProps) {
  const queryClient = useQueryClient();
  const [globalRole, setGlobalRole] = useState<string>("user");
  const [selectedDirection, setSelectedDirection] = useState<string>("");
  const [modulePermissions, setModulePermissions] = useState<
    Record<string, string>
  >({});

  // Fetch directions
  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Initialize states
  useEffect(() => {
    if (user) {
      const highestRole = user.roles.includes("admin")
        ? "admin"
        : user.roles.includes("manager")
        ? "manager"
        : "user";
      setGlobalRole(highestRole);

      // Set first direction as selected
      if (directions && directions.length > 0) {
        setSelectedDirection(directions[0].id);
      }
    }
  }, [user, directions]);

  // Update module permissions when direction changes
  useEffect(() => {
    if (selectedDirection && user) {
      const directionAssignments = user.assignments.filter(
        (a: any) => a.direction_id === selectedDirection
      );
      const permissions: Record<string, string> = {};
      directionAssignments.forEach((a: any) => {
        permissions[a.module] = a.role;
      });
      setModulePermissions(permissions);
    }
  }, [selectedDirection, user]);

  // Save global role
  const saveGlobalRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      // Delete existing roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.user_id);

      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: user.user_id, 
          role: role as "admin" | "manager" | "user"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-permissions"] });
      toast.success("Rôle global mis à jour");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la mise à jour du rôle", {
        description: error.message,
      });
    },
  });

  // Save direction permissions
  const saveDirectionPermissionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDirection) return;

      // Delete existing assignments for this direction
      await supabase
        .from("user_role_assignments")
        .delete()
        .eq("user_id", user.user_id)
        .eq("direction_id", selectedDirection);

      // Insert new assignments
      const assignments = Object.entries(modulePermissions)
        .filter(([_, role]) => role !== "none")
        .map(([module, role]) => ({
          user_id: user.user_id,
          direction_id: selectedDirection,
          module: module as any,
          role: role as "admin" | "manager" | "user",
        }));

      if (assignments.length > 0) {
        const { error } = await supabase
          .from("user_role_assignments")
          .insert(assignments);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-permissions"] });
      toast.success("Permissions de direction mises à jour");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la mise à jour des permissions", {
        description: error.message,
      });
    },
  });

  const handleModuleRoleChange = (module: string, role: string) => {
    setModulePermissions((prev) => ({
      ...prev,
      [module]: role,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Gérer les permissions de {user.full_name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Rôle Global</TabsTrigger>
            <TabsTrigger value="directions">Accès aux Directions</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <Label>Rôle global de l'utilisateur</Label>
                <Select value={globalRole} onValueChange={setGlobalRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {globalRole === "admin" &&
                    "Accès complet à toutes les fonctionnalités et données"}
                  {globalRole === "manager" &&
                    "Peut gérer les utilisateurs et les données"}
                  {globalRole === "user" && "Accès basique aux fonctionnalités"}
                </p>
                <Button
                  onClick={() => saveGlobalRoleMutation.mutate(globalRole)}
                  disabled={saveGlobalRoleMutation.isPending}
                >
                  Enregistrer le rôle global
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="directions" className="space-y-4">
            <div className="space-y-3">
              <Label>Sélectionner une direction</Label>
              <Select
                value={selectedDirection}
                onValueChange={setSelectedDirection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une direction" />
                </SelectTrigger>
                <SelectContent>
                  {directions?.map((dir) => (
                    <SelectItem key={dir.id} value={dir.id}>
                      {dir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDirection && (
              <Card className="p-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">
                        Permissions par module
                      </h4>
                      <Badge variant="outline">
                        {
                          Object.values(modulePermissions).filter(
                            (r) => r !== "none"
                          ).length
                        }{" "}
                        / {MODULES.length}
                      </Badge>
                    </div>

                    {MODULES.map((module) => (
                      <div
                        key={module.value}
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <span className="text-sm font-medium">
                          {module.label}
                        </span>
                        <Select
                          value={modulePermissions[module.value] || "none"}
                          onValueChange={(value) =>
                            handleModuleRoleChange(module.value, value)
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun accès</SelectItem>
                            <SelectItem value="user">Lecture</SelectItem>
                            <SelectItem value="manager">
                              Lecture/Écriture
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <DialogFooter className="mt-4">
                  <Button
                    onClick={() => saveDirectionPermissionsMutation.mutate()}
                    disabled={saveDirectionPermissionsMutation.isPending}
                  >
                    Enregistrer les permissions
                  </Button>
                </DialogFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
