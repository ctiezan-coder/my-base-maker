import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Briefcase, Eye, Shield } from "lucide-react";

type AppModule = 'companies' | 'projects' | 'documents' | 'events' | 'trainings' | 'kpis' | 'market_development' | 'partnerships' | 'media' | 'collaborators' | 'imputations' | 'suivi_evaluation';
type AppRole = 'admin' | 'manager' | 'user';

interface PermissionTemplate {
  name: string;
  description: string;
  icon: typeof Shield;
  permissions: Partial<Record<AppModule, AppRole>>;
}

const TEMPLATES: PermissionTemplate[] = [
  {
    name: "Manager Complet",
    description: "Accès manager à tous les modules",
    icon: Briefcase,
    permissions: {
      companies: 'manager',
      projects: 'manager',
      documents: 'manager',
      events: 'manager',
      trainings: 'manager',
      kpis: 'manager',
      market_development: 'manager',
      partnerships: 'manager',
      media: 'manager',
      collaborators: 'manager',
      imputations: 'manager',
      suivi_evaluation: 'manager',
    },
  },
  {
    name: "Collaborateur Standard",
    description: "Accès utilisateur aux modules essentiels",
    icon: UserPlus,
    permissions: {
      companies: 'user',
      projects: 'user',
      documents: 'user',
      events: 'user',
      trainings: 'user',
      collaborators: 'user',
      imputations: 'user',
    },
  },
  {
    name: "Consultant Lecture Seule",
    description: "Accès en lecture uniquement",
    icon: Eye,
    permissions: {
      companies: 'user',
      projects: 'user',
      documents: 'user',
      kpis: 'user',
      suivi_evaluation: 'user',
    },
  },
  {
    name: "Manager Marketing",
    description: "Gestion des médias et événements",
    icon: Briefcase,
    permissions: {
      media: 'manager',
      events: 'manager',
      partnerships: 'manager',
      companies: 'user',
    },
  },
  {
    name: "Manager Administratif",
    description: "Gestion imputations et suivi",
    icon: Briefcase,
    permissions: {
      imputations: 'manager',
      suivi_evaluation: 'manager',
      documents: 'manager',
      projects: 'user',
      companies: 'user',
    },
  },
];

export function PermissionTemplates() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedDirection, setSelectedDirection] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      return profiles || [];
    },
  });

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const applyTemplate = useMutation({
    mutationFn: async (template: PermissionTemplate) => {
      if (!selectedUser || !selectedDirection) {
        throw new Error('Veuillez sélectionner un utilisateur et une direction');
      }

      // Delete existing assignments for this user and direction
      await supabase
        .from('user_role_assignments')
        .delete()
        .eq('user_id', selectedUser)
        .eq('direction_id', selectedDirection);

      // Insert new assignments from template
      const assignments = Object.entries(template.permissions).map(([module, role]) => ({
        user_id: selectedUser,
        direction_id: selectedDirection,
        module: module as AppModule,
        role: role as AppRole,
      }));

      if (assignments.length > 0) {
        const { error } = await supabase
          .from('user_role_assignments')
          .insert(assignments as any);
        if (error) throw error;
      }

      // Log permission change
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('permission_history').insert({
          user_id: user.id,
          target_user_id: selectedUser,
          action: `Appliqué le template: ${template.name}`,
          direction_id: selectedDirection,
        } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['allRoleAssignments'] });
      toast.success('Template appliqué avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'application du template');
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Utilisateur</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un utilisateur" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {users?.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.full_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Direction</Label>
          <Select value={selectedDirection} onValueChange={setSelectedDirection}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une direction" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {directions?.map((direction) => (
                <SelectItem key={direction.id} value={direction.id}>
                  {direction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.name} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(template.permissions).length} modules configurés
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => applyTemplate.mutate(template)}
                  disabled={!selectedUser || !selectedDirection || applyTemplate.isPending}
                >
                  {applyTemplate.isPending ? "Application..." : "Appliquer"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
