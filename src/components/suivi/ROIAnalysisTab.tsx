import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, TrendingUp, Users, Briefcase, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ROIAnalysisTabProps {
  canManage?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ROIAnalysisTab({ canManage = false }: ROIAnalysisTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedROI, setSelectedROI] = useState<any>(null);

  const { data: roiData = [], isLoading } = useQuery({
    queryKey: ["activity-roi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_roi")
        .select("*, directions(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("directions").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (roi: any) => {
      if (roi.id) {
        const { error } = await supabase.from("activity_roi").update(roi).eq("id", roi.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("activity_roi").insert(roi);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-roi"] });
      toast.success(selectedROI?.id ? "ROI mis à jour" : "ROI créé");
      setDialogOpen(false);
      setSelectedROI(null);
    },
    onError: (error: any) => toast.error("Erreur: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activity_roi").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-roi"] });
      toast.success("Analyse supprimée");
    },
  });

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      training: "Formation",
      event: "Événement",
      mission: "Mission",
      program: "Programme",
      partnership: "Partenariat",
      intervention: "Intervention",
    };
    return labels[type] || type;
  };

  const getROIBadge = (roi: number) => {
    if (roi >= 100) return <Badge className="bg-green-100 text-green-800">+{roi.toFixed(0)}%</Badge>;
    if (roi >= 0) return <Badge className="bg-blue-100 text-blue-800">+{roi.toFixed(0)}%</Badge>;
    return <Badge className="bg-red-100 text-red-800">{roi.toFixed(0)}%</Badge>;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roi = {
      ...selectedROI,
      activity_type: formData.get("activity_type"),
      activity_title: formData.get("activity_title"),
      direction_id: formData.get("direction_id") || null,
      analysis_period: formData.get("analysis_period"),
      total_cost: parseFloat(formData.get("total_cost") as string) || 0,
      total_value_created: parseFloat(formData.get("total_value_created") as string) || 0,
      direct_benefits: formData.get("direct_benefits"),
      indirect_benefits: formData.get("indirect_benefits"),
      social_impact: formData.get("social_impact"),
      jobs_created: parseInt(formData.get("jobs_created") as string) || 0,
      companies_benefited: parseInt(formData.get("companies_benefited") as string) || 0,
      contracts_value: parseFloat(formData.get("contracts_value") as string) || 0,
      methodology: formData.get("methodology"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(roi);
  };

  // Calculate stats
  const stats = {
    totalInvestment: roiData.reduce((acc: number, r: any) => acc + (r.total_cost || 0), 0),
    totalValue: roiData.reduce((acc: number, r: any) => acc + (r.total_value_created || 0), 0),
    avgROI: roiData.length > 0 ? roiData.reduce((acc: number, r: any) => acc + (r.roi_percentage || 0), 0) / roiData.length : 0,
    totalJobs: roiData.reduce((acc: number, r: any) => acc + (r.jobs_created || 0), 0),
    totalCompanies: roiData.reduce((acc: number, r: any) => acc + (r.companies_benefited || 0), 0),
  };

  // Chart data by activity type
  const chartDataByType = Object.entries(
    roiData.reduce((acc: Record<string, { cost: number; value: number; count: number }>, r: any) => {
      const type = r.activity_type;
      if (!acc[type]) acc[type] = { cost: 0, value: 0, count: 0 };
      acc[type].cost += r.total_cost || 0;
      acc[type].value += r.total_value_created || 0;
      acc[type].count += 1;
      return acc;
    }, {})
  ).map(([type, data]) => ({
    name: getActivityTypeLabel(type),
    Coût: data.cost / 1000000,
    Valeur: data.value / 1000000,
    count: data.count,
  }));

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-lg font-bold">{(stats.totalInvestment / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Investissement (FCFA)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-lg font-bold">{(stats.totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Valeur créée (FCFA)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{stats.avgROI.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">ROI moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-lg font-bold">{stats.totalJobs}</p>
                <p className="text-xs text-muted-foreground">Emplois créés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-lg font-bold">{stats.totalCompanies}</p>
                <p className="text-xs text-muted-foreground">Entreprises bénéficiaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartDataByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ROI par Type d'Activité (en millions FCFA)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}M FCFA`} />
                <Bar dataKey="Coût" fill="#ef4444" name="Coût" />
                <Bar dataKey="Valeur" fill="#22c55e" name="Valeur créée" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analyses ROI des Activités</h2>
        {canManage && (
          <Button onClick={() => { setSelectedROI({}); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle analyse
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activité</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="text-right">Coût</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Impact</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roiData.map((roi: any) => (
                <TableRow key={roi.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{roi.activity_title}</p>
                      {roi.directions?.name && <p className="text-xs text-muted-foreground">{roi.directions.name}</p>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{getActivityTypeLabel(roi.activity_type)}</Badge></TableCell>
                  <TableCell>{roi.analysis_period}</TableCell>
                  <TableCell className="text-right">{roi.total_cost?.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell className="text-right">{roi.total_value_created?.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell>{getROIBadge(roi.roi_percentage || 0)}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {roi.jobs_created > 0 && <div>{roi.jobs_created} emplois</div>}
                      {roi.companies_benefited > 0 && <div>{roi.companies_benefited} entreprises</div>}
                    </div>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedROI(roi); setDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(roi.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {roiData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Aucune analyse ROI
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedROI?.id ? "Modifier l'analyse" : "Nouvelle analyse ROI"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Titre de l'activité *</label>
                <Input name="activity_title" defaultValue={selectedROI?.activity_title} required />
              </div>
              <div>
                <label className="text-sm font-medium">Type d'activité *</label>
                <Select name="activity_type" defaultValue={selectedROI?.activity_type || "training"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Formation</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="program">Programme</SelectItem>
                    <SelectItem value="partnership">Partenariat</SelectItem>
                    <SelectItem value="intervention">Intervention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Direction</label>
                <Select name="direction_id" defaultValue={selectedROI?.direction_id}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {directions.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Période</label>
                <Input name="analysis_period" defaultValue={selectedROI?.analysis_period} placeholder="Ex: 2024" />
              </div>
              <div>
                <label className="text-sm font-medium">Coût total (FCFA) *</label>
                <Input name="total_cost" type="number" defaultValue={selectedROI?.total_cost} required />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur créée (FCFA) *</label>
                <Input name="total_value_created" type="number" defaultValue={selectedROI?.total_value_created} required />
              </div>
              <div>
                <label className="text-sm font-medium">Emplois créés</label>
                <Input name="jobs_created" type="number" defaultValue={selectedROI?.jobs_created} />
              </div>
              <div>
                <label className="text-sm font-medium">Entreprises bénéficiaires</label>
                <Input name="companies_benefited" type="number" defaultValue={selectedROI?.companies_benefited} />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur des contrats (FCFA)</label>
                <Input name="contracts_value" type="number" defaultValue={selectedROI?.contracts_value} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Bénéfices directs</label>
                <Textarea name="direct_benefits" defaultValue={selectedROI?.direct_benefits} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Bénéfices indirects</label>
                <Textarea name="indirect_benefits" defaultValue={selectedROI?.indirect_benefits} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Impact social</label>
                <Textarea name="social_impact" defaultValue={selectedROI?.social_impact} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Méthodologie</label>
                <Textarea name="methodology" defaultValue={selectedROI?.methodology} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" defaultValue={selectedROI?.notes} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveMutation.isPending}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
