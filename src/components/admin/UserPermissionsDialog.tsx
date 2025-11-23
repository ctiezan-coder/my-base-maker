import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const ROLE_OPTIONS = [
  { value: "none", label: "Aucun accès" },
  { value: "user", label: "Lecture" },
  { value: "manager", label: "Lecture/Écriture" },
  { value: "admin", label: "Admin" },
];

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
}: UserPermissionsDialogProps) {
  const queryClient = useQueryClient();
  const [globalRole, setGlobalRole] = useState<string>("user");
  const [modulePermissions, setModulePermissions] = useState<
    Record<string, string>
  >({});

  // Initialize states
  useEffect(() => {
    if (user) {
      const highestRole = user.roles?.includes("admin")
        ? "admin"
        : user.roles?.includes("manager")
        ? "manager"
        : "user";
      setGlobalRole(highestRole);

      // Load module permissions
      const permissions: Record<string, string> = {};
      MODULES.forEach((module) => {
        const assignment = user.assignments?.find(
          (a: any) => a.module === module.value
        );
        permissions[module.value] = assignment?.role || "none";
      });
      setModulePermissions(permissions);
    }
  }, [user]);

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

  // Save module permissions
  const saveModulePermissionsMutation = useMutation({
    mutationFn: async () => {
      // Get user's primary direction
      const { data: profile } = await supabase
        .from("profiles")
        .select("direction_id")
        .eq("user_id", user.user_id)
        .single();

      if (!profile?.direction_id) {
        throw new Error("Direction de l'utilisateur non trouvée");
      }

      // Delete existing assignments for this user
      await supabase
        .from("user_role_assignments")
        .delete()
        .eq("user_id", user.user_id);

      // Insert new assignments for all modules using user's primary direction
      const assignments = Object.entries(modulePermissions)
        .filter(([_, role]) => role !== "none")
        .map(([module, role]) => ({
          user_id: user.user_id,
          direction_id: profile.direction_id,
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
      toast.success("Permissions des modules mises à jour");
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
          <DialogTitle>Gérer les permissions - {user?.full_name}</DialogTitle>
          <DialogDescription>
            Gérez le rôle global et les permissions par module de l'utilisateur
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Rôle Global</TabsTrigger>
            <TabsTrigger value="modules">Permissions par Module</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Rôle global</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Définissez le rôle principal de l'utilisateur dans le système
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="global-role">Rôle</Label>
                  <Select value={globalRole} onValueChange={setGlobalRole}>
                    <SelectTrigger id="global-role" className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => saveGlobalRoleMutation.mutate(globalRole)}
                    disabled={saveGlobalRoleMutation.isPending}
                  >
                    {saveGlobalRoleMutation.isPending
                      ? "Enregistrement..."
                      : "Enregistrer le rôle"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Permissions par module
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Définissez les permissions de l'utilisateur pour chaque module de la plateforme
                  </p>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {MODULES.map((module) => (
                      <div
                        key={module.value}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <Label className="font-medium">{module.label}</Label>
                        </div>
                        <Select
                          value={modulePermissions[module.value] || "none"}
                          onValueChange={(value) =>
                            handleModuleRoleChange(module.value, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="pt-4 flex gap-2">
                  <Button
                    onClick={() => saveModulePermissionsMutation.mutate()}
                    disabled={saveModulePermissionsMutation.isPending}
                  >
                    {saveModulePermissionsMutation.isPending
                      ? "Enregistrement..."
                      : "Enregistrer les permissions"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
