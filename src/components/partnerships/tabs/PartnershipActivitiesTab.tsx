import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Users, MapPin, Wallet } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PartnershipActivitiesTabProps {
  partnershipId: string;
  canManage: boolean;
}

const ACTIVITY_TYPES = [
  "Événement co-organisé",
  "Formation conjointe",
  "Atelier",
  "Mission d'échange",
  "Visite",
  "Publication commune",
  "Réunion technique",
  "Séminaire",
  "Conférence"
];

const ACTIVITY_STATUSES = [
  { value: "planifiée", label: "Planifiée" },
  { value: "en cours", label: "En cours" },
  { value: "terminée", label: "Terminée" },
  { value: "annulée", label: "Annulée" }
];

export function PartnershipActivitiesTab({ partnershipId, canManage }: PartnershipActivitiesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: "",
    title: "",
    description: "",
    activity_date: "",
    location: "",
    participants_count: "",
    budget_used: "",
    status: "planifiée",
    notes: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["partnership-activities", partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_activities")
        .select("*")
        .eq("partnership_id", partnershipId)
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("partnership_activities")
        .insert([{
          ...data,
          partnership_id: partnershipId,
          participants_count: data.participants_count ? parseInt(data.participants_count) : null,
          budget_used: data.budget_used ? parseFloat(data.budget_used) : null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-activities", partnershipId] });
      toast({ title: "Activité ajoutée avec succès" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      activity_type: "",
      title: "",
      description: "",
      activity_date: "",
      location: "",
      participants_count: "",
      budget_used: "",
      status: "planifiée",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "planifiée": "outline",
    "en cours": "secondary",
    "terminée": "default",
    "annulée": "destructive"
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle activité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une activité</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type d'activité *</Label>
                    <Select
                      value={formData.activity_type}
                      onValueChange={(v) => setFormData({ ...formData, activity_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.activity_date}
                      onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lieu</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Participants</Label>
                    <Input
                      type="number"
                      value={formData.participants_count}
                      onChange={(e) => setFormData({ ...formData, participants_count: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget utilisé (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.budget_used}
                      onChange={(e) => setFormData({ ...formData, budget_used: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Ajouter
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune activité enregistrée
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(activity.activity_date), "dd/MM/yyyy", { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.activity_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    {activity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {activity.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.participants_count && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        {activity.participants_count}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.budget_used && (
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-muted-foreground" />
                        {new Intl.NumberFormat("fr-FR").format(activity.budget_used)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[activity.status] || "default"}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
