import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Mail, Phone, Building, Trash2, Pencil } from "lucide-react";

interface EventTeamTabProps {
  eventId: string;
  canManage?: boolean;
}

export function EventTeamTab({ eventId, canManage }: EventTeamTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["event-team", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_team_members")
        .select("*")
        .eq("event_id", eventId)
        .order("role");
      if (error) throw error;
      return data;
    },
  });

  const saveMember = useMutation({
    mutationFn: async (data: any) => {
      if (selectedMember) {
        const { error } = await supabase
          .from("event_team_members")
          .update(data)
          .eq("id", selectedMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_team_members")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-team", eventId] });
      toast({ title: selectedMember ? "Membre mis à jour" : "Membre ajouté" });
      setDialogOpen(false);
      setSelectedMember(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-team", eventId] });
      toast({ title: "Membre supprimé" });
    },
  });

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setForm(member);
    setDialogOpen(true);
  };

  const roleGroups = teamMembers?.reduce((acc: any, member: any) => {
    const role = member.role || "Autre";
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Équipe organisatrice</h3>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : Object.keys(roleGroups).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun membre d'équipe
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(roleGroups).map(([role, members]: [string, any]) => (
            <div key={role}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">{role}</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member: any) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{member.name}</h4>
                              {member.is_external && (
                                <Badge variant="outline" className="text-xs">Externe</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            {member.organization && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Building className="w-3 h-3" />
                                {member.organization}
                              </p>
                            )}
                            {member.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </p>
                            )}
                            {member.phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {canManage && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(member)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMember.mutate(member.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMember ? "Modifier" : "Ajouter un membre"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMember.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Input
                value={form.role || ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Chef de projet, Logistique, Communication..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Organisation</Label>
              <Input
                value={form.organization || ""}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="Si externe"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.is_external || false}
                onCheckedChange={(checked) => setForm({ ...form, is_external: checked })}
              />
              <Label>Prestataire/Externe</Label>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveMember.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
