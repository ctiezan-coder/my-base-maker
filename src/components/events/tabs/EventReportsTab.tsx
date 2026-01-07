import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, FileText, Download, Trash2, Pencil, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Event } from "@/types/event";

interface EventReportsTabProps {
  eventId: string;
  event: Event;
  canManage?: boolean;
}

export function EventReportsTab({ eventId, event, canManage }: EventReportsTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: reports, isLoading } = useQuery({
    queryKey: ["event-reports", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_reports")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveReport = useMutation({
    mutationFn: async (data: any) => {
      if (selectedReport) {
        const { error } = await supabase
          .from("event_reports")
          .update(data)
          .eq("id", selectedReport.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_reports")
          .insert({ ...data, event_id: eventId, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-reports", eventId] });
      toast({ title: selectedReport ? "Rapport mis à jour" : "Rapport créé" });
      setDialogOpen(false);
      setSelectedReport(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-reports", eventId] });
      toast({ title: "Rapport supprimé" });
    },
  });

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    setForm(report);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'draft':
      default:
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rapports d'événement</h3>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouveau rapport
          </Button>
        )}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : reports?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun rapport
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports?.map((report: any) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      {getStatusBadge(report.status)}
                      <Badge variant="outline">
                        {report.report_type === 'final' ? 'Rapport final' : 
                         report.report_type === 'interim' ? 'Rapport intermédiaire' : report.report_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créé le {format(new Date(report.created_at), "dd MMMM yyyy", { locale: fr })}
                      {report.approved_at && (
                        <span className="text-green-600 ml-2">
                          • Approuvé le {format(new Date(report.approved_at), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      )}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      {report.file_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(report)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteReport.mutate(report.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {report.summary && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-1">Résumé</h4>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {report.objectives_achieved && (
                    <div>
                      <h4 className="font-medium mb-1">Objectifs atteints</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.objectives_achieved}</p>
                    </div>
                  )}
                  {report.strengths && (
                    <div>
                      <h4 className="font-medium mb-1">Points forts</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.strengths}</p>
                    </div>
                  )}
                  {report.improvements && (
                    <div>
                      <h4 className="font-medium mb-1">Points à améliorer</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.improvements}</p>
                    </div>
                  )}
                  {report.lessons_learned && (
                    <div>
                      <h4 className="font-medium mb-1">Leçons apprises</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.lessons_learned}</p>
                    </div>
                  )}
                </div>
                {report.recommendations && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Recommandations</h4>
                    <p className="text-sm whitespace-pre-wrap">{report.recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport ? "Modifier le rapport" : "Nouveau rapport"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveReport.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type de rapport</Label>
                <Select
                  value={form.report_type || "final"}
                  onValueChange={(value) => setForm({ ...form, report_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="final">Rapport final</SelectItem>
                    <SelectItem value="interim">Rapport intermédiaire</SelectItem>
                    <SelectItem value="summary">Synthèse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Résumé</Label>
              <Textarea
                value={form.summary || ""}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Objectifs atteints</Label>
              <Textarea
                value={form.objectives_achieved || ""}
                onChange={(e) => setForm({ ...form, objectives_achieved: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Points forts</Label>
                <Textarea
                  value={form.strengths || ""}
                  onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Points à améliorer</Label>
                <Textarea
                  value={form.improvements || ""}
                  onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leçons apprises</Label>
              <Textarea
                value={form.lessons_learned || ""}
                onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Recommandations</Label>
              <Textarea
                value={form.recommendations || ""}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.status || "draft"}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente d'approbation</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL du fichier PDF</Label>
                <Input
                  value={form.file_url || ""}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveReport.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
