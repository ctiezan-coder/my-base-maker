import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { Eye, Plus, Pencil, Trash2, Download, CheckCircle } from "lucide-react";

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
  { value: "achats", label: "Achats" },
  { value: "support", label: "Support" },
  { value: "rh", label: "Ressources Humaines" },
  { value: "missions", label: "Missions" },
  { value: "comptabilite", label: "Comptabilité" },
];

const PERMISSION_ACTIONS = [
  { key: "peut_voir", label: "Voir", icon: Eye },
  { key: "peut_creer", label: "Créer", icon: Plus },
  { key: "peut_modifier", label: "Modifier", icon: Pencil },
  { key: "peut_supprimer", label: "Supprimer", icon: Trash2 },
  { key: "peut_exporter", label: "Exporter", icon: Download },
  { key: "peut_valider", label: "Valider", icon: CheckCircle },
] as const;

type PermissionKey = typeof PERMISSION_ACTIONS[number]["key"];

interface ModulePermissionState {
  enabled: boolean;
  peut_voir: boolean;
  peut_creer: boolean;
  peut_modifier: boolean;
  peut_supprimer: boolean;
  peut_exporter: boolean;
  peut_valider: boolean;
}

const defaultPermission: ModulePermissionState = {
  enabled: false,
  peut_voir: false,
  peut_creer: false,
  peut_modifier: false,
  peut_supprimer: false,
  peut_exporter: false,
  peut_valider: false,
};

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
}: UserPermissionsDialogProps) {
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';
  const queryClient = useQueryClient();
  const [globalRole, setGlobalRole] = useState<string>("user");
  const [modulePermissions, setModulePermissions] = useState<
    Record<string, ModulePermissionState>
  >({});

  // Fetch directions for shared modules tab
  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && open,
  });

  // Fetch shared modules for this user's direction
  const { data: sharedModules } = useQuery({
    queryKey: ["shared-modules", user?.direction_id],
    queryFn: async () => {
      if (!user?.direction_id) return [];
      const { data, error } = await supabase
        .from("shared_modules")
        .select(`
          *,
          source_direction:directions!shared_modules_source_direction_id_fkey(id, name),
          target_direction:directions!shared_modules_target_direction_id_fkey(id, name)
        `)
        .or(`source_direction_id.eq.${user.direction_id},target_direction_id.eq.${user.direction_id}`);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && open && !!user?.direction_id,
  });

  if (!isAdmin) {
    return null;
  }

  // Initialize states from user data
  useEffect(() => {
    if (user) {
      const highestRole = user.roles?.includes("admin")
        ? "admin"
        : user.roles?.includes("manager")
        ? "manager"
        : "user";
      setGlobalRole(highestRole);

      const permissions: Record<string, ModulePermissionState> = {};
      MODULES.forEach((module) => {
        const assignment = user.assignments?.find(
          (a: any) => a.module === module.value
        );
        if (assignment) {
          permissions[module.value] = {
            enabled: true,
            peut_voir: assignment.peut_voir ?? true,
            peut_creer: assignment.peut_creer ?? false,
            peut_modifier: assignment.peut_modifier ?? false,
            peut_supprimer: assignment.peut_supprimer ?? false,
            peut_exporter: assignment.peut_exporter ?? false,
            peut_valider: assignment.peut_valider ?? false,
          };
        } else {
          permissions[module.value] = { ...defaultPermission };
        }
      });
      setModulePermissions(permissions);
    }
  }, [user]);

  // Save global role
  const saveGlobalRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const { error } = await supabase
        .from("user_roles")
        .upsert(
          { user_id: user.user_id, role: role as "admin" | "manager" | "user" },
          { onConflict: "user_id" }
        );
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

  // Save module permissions with granular flags
  const saveModulePermissionsMutation = useMutation({
    mutationFn: async () => {
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

      // Insert new assignments with granular permissions
      const assignments = Object.entries(modulePermissions)
        .filter(([_, perm]) => perm.enabled)
        .map(([module, perm]) => {
          // Derive role from permissions for backward compatibility
          let role: "admin" | "manager" | "user" = "user";
          if (perm.peut_supprimer && perm.peut_valider) role = "admin";
          else if (perm.peut_creer || perm.peut_modifier) role = "manager";

          return {
            user_id: user.user_id,
            direction_id: profile.direction_id,
            module: module as any,
            role,
            peut_voir: perm.peut_voir,
            peut_creer: perm.peut_creer,
            peut_modifier: perm.peut_modifier,
            peut_supprimer: perm.peut_supprimer,
            peut_exporter: perm.peut_exporter,
            peut_valider: perm.peut_valider,
          };
        });

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

  const handleToggleModule = (module: string, enabled: boolean) => {
    setModulePermissions((prev) => ({
      ...prev,
      [module]: enabled
        ? { ...defaultPermission, enabled: true, peut_voir: true }
        : { ...defaultPermission },
    }));
  };

  const handleTogglePermission = (module: string, key: PermissionKey, checked: boolean) => {
    setModulePermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [key]: checked,
      },
    }));
  };

  const applyPreset = (preset: "lecture" | "edition" | "admin") => {
    const updated: Record<string, ModulePermissionState> = {};
    MODULES.forEach((module) => {
      switch (preset) {
        case "lecture":
          updated[module.value] = {
            enabled: true,
            peut_voir: true,
            peut_creer: false,
            peut_modifier: false,
            peut_supprimer: false,
            peut_exporter: true,
            peut_valider: false,
          };
          break;
        case "edition":
          updated[module.value] = {
            enabled: true,
            peut_voir: true,
            peut_creer: true,
            peut_modifier: true,
            peut_supprimer: false,
            peut_exporter: true,
            peut_valider: false,
          };
          break;
        case "admin":
          updated[module.value] = {
            enabled: true,
            peut_voir: true,
            peut_creer: true,
            peut_modifier: true,
            peut_supprimer: true,
            peut_exporter: true,
            peut_valider: true,
          };
          break;
      }
    });
    setModulePermissions(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Gérer les permissions - {user?.full_name}</DialogTitle>
          <DialogDescription>
            Gérez le rôle global et les permissions granulaires par module
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Rôle Global</TabsTrigger>
            <TabsTrigger value="modules">Permissions par Module</TabsTrigger>
            <TabsTrigger value="shared">Modules Partagés</TabsTrigger>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Permissions par module
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Définissez les permissions CRUD pour chaque module
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("lecture")}
                    >
                      Lecture seule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("edition")}
                    >
                      Édition
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("admin")}
                    >
                      Accès complet
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  {/* Header row */}
                  <div className="flex items-center gap-2 p-2 border-b font-medium text-xs text-muted-foreground sticky top-0 bg-background">
                    <div className="w-[180px]">Module</div>
                    <div className="w-[50px] text-center">Actif</div>
                    {PERMISSION_ACTIONS.map((action) => (
                      <div key={action.key} className="w-[70px] text-center" title={action.label}>
                        <action.icon className="h-3.5 w-3.5 mx-auto" />
                        <span className="text-[10px]">{action.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {MODULES.map((module) => {
                      const perm = modulePermissions[module.value] || defaultPermission;
                      return (
                        <div
                          key={module.value}
                          className={`flex items-center gap-2 p-2 border rounded-lg transition-colors ${
                            perm.enabled ? "bg-accent/20" : ""
                          }`}
                        >
                          <div className="w-[180px]">
                            <Label className="font-medium text-sm">{module.label}</Label>
                          </div>
                          <div className="w-[50px] flex justify-center">
                            <Checkbox
                              checked={perm.enabled}
                              onCheckedChange={(checked) =>
                                handleToggleModule(module.value, !!checked)
                              }
                            />
                          </div>
                          {PERMISSION_ACTIONS.map((action) => (
                            <div key={action.key} className="w-[70px] flex justify-center">
                              <Checkbox
                                checked={perm[action.key]}
                                disabled={!perm.enabled}
                                onCheckedChange={(checked) =>
                                  handleTogglePermission(module.value, action.key, !!checked)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })}
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

          <TabsContent value="shared" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Modules partagés</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Modules partagés entre directions. Les modules partagés donnent un accès
                    en lecture (et optionnellement en écriture) aux données d'une autre direction.
                  </p>
                </div>

                {sharedModules && sharedModules.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {sharedModules.map((sm: any) => (
                        <div
                          key={sm.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-sm">
                              {MODULES.find((m) => m.value === sm.module)?.label || sm.module}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {sm.source_direction?.name} → {sm.target_direction?.name}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs">
                            {sm.peut_voir && <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">Voir</span>}
                            {sm.peut_creer && <span className="px-2 py-1 bg-green-100 rounded text-green-700">Créer</span>}
                            {sm.peut_modifier && <span className="px-2 py-1 bg-yellow-100 rounded text-yellow-700">Modifier</span>}
                            {sm.peut_exporter && <span className="px-2 py-1 bg-purple-100 rounded text-purple-700">Exporter</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun module partagé pour cette direction
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
