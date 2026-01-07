import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, FileText, Download, Eye, CheckCircle, Clock, Edit } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EvaluationReportsTabProps {
  canManage: boolean;
}

export function EvaluationReportsTab({ canManage }: EvaluationReportsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["evaluation-reports", filterType, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("evaluation_reports")
        .select("*, directions(name)")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("report_type", filterType);
      }
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("directions").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (report: any) => {
      const { error } = await supabase.from("evaluation_reports").insert(report);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      toast.success("Rapport créé avec succès");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...report }: any) => {
      const { error } = await supabase.from("evaluation_reports").update(report).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      toast.success("Rapport mis à jour");
      setSelectedReport(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const report = {
      title: formData.get("title"),
      report_type: formData.get("report_type"),
      direction_id: formData.get("direction_id") || null,
      period_start: formData.get("period_start"),
      period_end: formData.get("period_end"),
      summary: formData.get("summary"),
      key_findings: formData.get("key_findings"),
      recommendations: formData.get("recommendations"),
      status: "draft",
    };

    if (selectedReport) {
      updateMutation.mutate({ id: selectedReport.id, ...report });
    } else {
      createMutation.mutate(report);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    const labels: Record<string, string> = {
      draft: "Brouillon",
      pending: "En attente",
      approved: "Approuvé",
    };
    return <Badge className={styles[status] || styles.draft}>{labels[status] || status}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      monthly: "Mensuel",
      quarterly: "Trimestriel",
      annual: "Annuel",
      project: "Projet",
      program: "Programme",
      thematic: "Thématique",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="quarterly">Trimestriel</SelectItem>
              <SelectItem value="annual">Annuel</SelectItem>
              <SelectItem value="project">Projet</SelectItem>
              <SelectItem value="program">Programme</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedReport(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rapport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedReport ? "Modifier le rapport" : "Nouveau rapport d'évaluation"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" name="title" defaultValue={selectedReport?.title} required />
                  </div>
                  <div>
                    <Label htmlFor="report_type">Type de rapport</Label>
                    <Select name="report_type" defaultValue={selectedReport?.report_type || "monthly"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="quarterly">Trimestriel</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                        <SelectItem value="project">Projet</SelectItem>
                        <SelectItem value="program">Programme</SelectItem>
                        <SelectItem value="thematic">Thématique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="direction_id">Direction</Label>
                    <Select name="direction_id" defaultValue={selectedReport?.direction_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les directions</SelectItem>
                        {directions?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="period_start">Début période</Label>
                    <Input type="date" id="period_start" name="period_start" defaultValue={selectedReport?.period_start} required />
                  </div>
                  <div>
                    <Label htmlFor="period_end">Fin période</Label>
                    <Input type="date" id="period_end" name="period_end" defaultValue={selectedReport?.period_end} required />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="summary">Résumé</Label>
                    <Textarea id="summary" name="summary" defaultValue={selectedReport?.summary} rows={3} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="key_findings">Constats clés</Label>
                    <Textarea id="key_findings" name="key_findings" defaultValue={selectedReport?.key_findings} rows={3} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="recommendations">Recommandations</Label>
                    <Textarea id="recommendations" name="recommendations" defaultValue={selectedReport?.recommendations} rows={3} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports?.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge variant="outline">{getTypeLabel(report.report_type)}</Badge>
                  </div>
                  {getStatusBadge(report.status || "draft")}
                </div>
                <CardTitle className="text-lg mt-2">{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <div>Période: {format(new Date(report.period_start), "dd MMM yyyy", { locale: fr })} - {format(new Date(report.period_end), "dd MMM yyyy", { locale: fr })}</div>
                  {report.directions && <div>Direction: {report.directions.name}</div>}
                </div>
                {report.summary && (
                  <p className="text-sm line-clamp-2">{report.summary}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {reports?.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Aucun rapport trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}
