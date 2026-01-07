import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, UserCheck, UserX, QrCode, Download, Trash2, Pencil, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PARTICIPANT_CATEGORIES, PARTICIPANT_STATUSES } from "@/types/event";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

interface EventParticipantsTabProps {
  eventId: string;
  canManage?: boolean;
}

export function EventParticipantsTab({ eventId, canManage }: EventParticipantsTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: participants, isLoading } = useQuery({
    queryKey: ["event-participants", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_participants")
        .select("*, company:companies(company_name)")
        .eq("event_id", eventId)
        .order("registration_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["companies-for-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name")
        .order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const saveParticipant = useMutation({
    mutationFn: async (data: any) => {
      if (selectedParticipant) {
        const { error } = await supabase
          .from("event_participants")
          .update(data)
          .eq("id", selectedParticipant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_participants")
          .insert({ ...data, event_id: eventId, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      toast({ title: selectedParticipant ? "Participant mis à jour" : "Participant ajouté" });
      setDialogOpen(false);
      setSelectedParticipant(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteParticipant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_participants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      toast({ title: "Participant supprimé" });
    },
  });

  const checkIn = useMutation({
    mutationFn: async (participant: any) => {
      const { error } = await supabase
        .from("event_participants")
        .update({ 
          check_in_time: new Date().toISOString(),
          status: 'present'
        })
        .eq("id", participant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      toast({ title: "Check-in effectué" });
    },
  });

  const handleEdit = (participant: any) => {
    setSelectedParticipant(participant);
    setForm(participant);
    setDialogOpen(true);
  };

  const filteredParticipants = participants?.filter(p => {
    const matchesSearch = p.company?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.badge_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const stats = {
    total: participants?.length || 0,
    present: participants?.filter(p => p.status === 'present').length || 0,
    confirmed: participants?.filter(p => p.status === 'confirmed').length || 0,
    absent: participants?.filter(p => p.status === 'absent').length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'confirmed': return 'bg-blue-500';
      case 'registered': return 'bg-gray-500';
      case 'absent': return 'bg-red-500';
      case 'cancelled': return 'bg-red-300';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    return PARTICIPANT_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getStatusLabel = (status: string) => {
    return PARTICIPANT_STATUSES.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total inscrits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-sm text-muted-foreground">Présents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            <p className="text-sm text-muted-foreground">Confirmés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-sm text-muted-foreground">Absents</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {PARTICIPANT_STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {PARTICIPANT_CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        )}
        <Button variant="outline">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : filteredParticipants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Aucun participant</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Inscription</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.company?.company_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(participant.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(participant.status)}>
                        {getStatusLabel(participant.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {participant.badge_number || "-"}
                      {participant.badge_printed && (
                        <Badge variant="secondary" className="ml-1 text-xs">Imprimé</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.check_in_time ? (
                        <span className="text-green-600 text-sm">
                          {format(new Date(participant.check_in_time), "HH:mm", { locale: fr })}
                        </span>
                      ) : (
                        canManage && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => checkIn.mutate(participant)}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Check-in
                          </Button>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(participant.registration_date), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(participant)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteParticipant.mutate(participant.id)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedParticipant ? "Modifier" : "Ajouter un participant"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveParticipant.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Entreprise *</Label>
              <Select
                value={form.company_id || ""}
                onValueChange={(value) => setForm({ ...form, company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={form.category || "visitor"}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTICIPANT_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.status || "registered"}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTICIPANT_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>N° Badge</Label>
                <Input
                  value={form.badge_number || ""}
                  onChange={(e) => setForm({ ...form, badge_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Régime alimentaire</Label>
                <Input
                  value={form.dietary_requirements || ""}
                  onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })}
                  placeholder="Végétarien, allergies..."
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.hotel_reservation || false}
                  onCheckedChange={(checked) => setForm({ ...form, hotel_reservation: checked })}
                />
                <Label>Hébergement</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.transport_needed || false}
                  onCheckedChange={(checked) => setForm({ ...form, transport_needed: checked })}
                />
                <Label>Transport</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveParticipant.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
