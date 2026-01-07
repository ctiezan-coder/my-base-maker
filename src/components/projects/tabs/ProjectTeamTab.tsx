import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProjectTeamTabProps {
  projectId: string;
  canManage: boolean;
}

export function ProjectTeamTab({ projectId, canManage }: ProjectTeamTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberType, setMemberType] = useState<"employee" | "user">("employee");
  const [selectedId, setSelectedId] = useState("");
  const [role, setRole] = useState("membre");

  const { data: members, isLoading } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          employee:employees(id, first_name, last_name, position, email)
        `)
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, position")
        .eq("status", "Actif")
        .order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("account_status", "approved")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      const memberData: any = {
        project_id: projectId,
        role,
      };
      if (memberType === "employee") {
        memberData.employee_id = selectedId;
      } else {
        memberData.user_id = selectedId;
      }

      const { error } = await supabase.from("project_members").insert([memberData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      setDialogOpen(false);
      setSelectedId("");
      toast({ title: "Membre ajouté" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("project_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      toast({ title: "Membre retiré" });
    },
  });

  const roleColors: Record<string, string> = {
    responsable: "default",
    membre: "secondary",
    consultant: "outline",
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Équipe du projet ({members?.length || 0})</h3>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un membre</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type de membre</Label>
                  <Select value={memberType} onValueChange={(v: any) => { setMemberType(v); setSelectedId(""); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employé</SelectItem>
                      <SelectItem value="user">Utilisateur système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{memberType === "employee" ? "Employé" : "Utilisateur"}</Label>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {memberType === "employee"
                        ? employees?.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name} - {emp.position}
                            </SelectItem>
                          ))
                        : users?.map((user) => (
                            <SelectItem key={user.user_id} value={user.user_id}>
                              {user.full_name} ({user.email})
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="responsable">Responsable</SelectItem>
                      <SelectItem value="membre">Membre</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => addMember.mutate()} disabled={!selectedId || addMember.isPending}>
                  {addMember.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {members?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun membre dans l'équipe
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {members?.map((member) => (
            <Card key={member.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {member.employee
                        ? `${member.employee.first_name} ${member.employee.last_name}`
                        : "Utilisateur système"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.employee?.position || member.employee?.email || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={roleColors[member.role] as any}>{member.role}</Badge>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember.mutate(member.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
