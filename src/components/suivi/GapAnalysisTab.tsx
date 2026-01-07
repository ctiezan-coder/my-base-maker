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
import { Plus, TrendingUp, TrendingDown, Minus, Edit, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface GapAnalysisTabProps {
  canManage?: boolean;
}

export function GapAnalysisTab({ canManage = false }: GapAnalysisTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["gap-analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gap_analyses")
        .select("*, directions(name), strategic_objectives(title), kpi_tracking(kpi_name), corrective_actions(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: objectives = [] } = useQuery({
    queryKey: ["strategic-objectives"],
    queryFn: async () => {
      const { data, error } = await supabase.from("strategic_objectives").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ["kpis-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kpi_tracking").select("id, kpi_name").order("kpi_name");
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
    mutationFn: async (analysis: any) => {
      // Calculate gap_type based on values
      const gapValue = analysis.actual_value - analysis.expected_value;
      analysis.gap_type = gapValue > 0 ? "positive" : gapValue < 0 ? "negative" : "neutral";

      if (analysis.id) {
        const { error } = await supabase.from("gap_analyses").update(analysis).eq("id", analysis.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gap_analyses").insert(analysis);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gap-analyses"] });
      toast.success(selectedAnalysis?.id ? "Analyse mise à jour" : "Analyse créée");
      setDialogOpen(false);
      setSelectedAnalysis(null);
    },
    onError: (error: any) => toast.error("Erreur: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gap_analyses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gap-analyses"] });
      toast.success("Analyse supprimée");
    },
  });

  const getGapIcon = (gapType: string, gapPercentage: number) => {
    if (gapType === "positive") {
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    } else if (gapType === "negative") {
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    }
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  const getGapBadge = (gapType: string, gapPercentage: number) => {
    const absPercentage = Math.abs(gapPercentage || 0).toFixed(1);
    if (gapType === "positive") {
      return <Badge className="bg-green-100 text-green-800">+{absPercentage}%</Badge>;
    } else if (gapType === "negative") {
      return <Badge className="bg-red-100 text-red-800">-{absPercentage}%</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">0%</Badge>;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const analysis = {
      ...selectedAnalysis,
      title: formData.get("title"),
      objective_id: formData.get("objective_id") || null,
      kpi_id: formData.get("kpi_id") || null,
      direction_id: formData.get("direction_id") || null,
      analysis_period: formData.get("analysis_period"),
      expected_value: parseFloat(formData.get("expected_value") as string),
      actual_value: parseFloat(formData.get("actual_value") as string),
      internal_factors: formData.get("internal_factors"),
      external_factors: formData.get("external_factors"),
      root_cause_analysis: formData.get("root_cause_analysis"),
      impact_assessment: formData.get("impact_assessment"),
      lessons_learned: formData.get("lessons_learned"),
    };
    saveMutation.mutate(analysis);
  };

  // Stats
  const stats = {
    total: analyses.length,
    positive: analyses.filter((a: any) => a.gap_type === "positive").length,
    negative: analyses.filter((a: any) => a.gap_type === "negative").length,
    withActions: analyses.filter((a: any) => a.corrective_actions?.length > 0).length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Analyses d'écarts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.positive}</p>
                <p className="text-xs text-muted-foreground">Écarts positifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.negative}</p>
                <p className="text-xs text-muted-foreground">Écarts négatifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.withActions}</p>
                <p className="text-xs text-muted-foreground">Avec actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analyse des Écarts</h2>
        {canManage && (
          <Button onClick={() => { setSelectedAnalysis({}); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle analyse
          </Button>
        )}
      </div>

      {/* Analyses Table */}
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="text-right">Prévu</TableHead>
                <TableHead className="text-right">Réalisé</TableHead>
                <TableHead>Écart</TableHead>
                <TableHead>Actions</TableHead>
                {canManage && <TableHead className="text-right">Gérer</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis: any) => (
                <TableRow key={analysis.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{analysis.title}</p>
                      {analysis.strategic_objectives?.title && (
                        <p className="text-xs text-muted-foreground">Objectif: {analysis.strategic_objectives.title}</p>
                      )}
                      {analysis.directions?.name && (
                        <p className="text-xs text-muted-foreground">{analysis.directions.name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{analysis.analysis_period}</TableCell>
                  <TableCell className="text-right font-medium">{analysis.expected_value?.toLocaleString('fr-FR')}</TableCell>
                  <TableCell className="text-right font-medium">{analysis.actual_value?.toLocaleString('fr-FR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getGapIcon(analysis.gap_type, analysis.gap_percentage)}
                      {getGapBadge(analysis.gap_type, analysis.gap_percentage)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{analysis.corrective_actions?.length || 0} actions</Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedAnalysis(analysis); setDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(analysis.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {analyses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Aucune analyse d'écart
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
            <DialogTitle>{selectedAnalysis?.id ? "Modifier l'analyse" : "Nouvelle analyse d'écart"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Titre *</label>
                <Input name="title" defaultValue={selectedAnalysis?.title} required />
              </div>
              <div>
                <label className="text-sm font-medium">Objectif lié</label>
                <Select name="objective_id" defaultValue={selectedAnalysis?.objective_id}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {objectives.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">KPI lié</label>
                <Select name="kpi_id" defaultValue={selectedAnalysis?.kpi_id}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {kpis.map((k: any) => <SelectItem key={k.id} value={k.id}>{k.kpi_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Direction</label>
                <Select name="direction_id" defaultValue={selectedAnalysis?.direction_id}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {directions.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Période *</label>
                <Input name="analysis_period" defaultValue={selectedAnalysis?.analysis_period} placeholder="Ex: T1 2024" required />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur prévue *</label>
                <Input name="expected_value" type="number" step="0.01" defaultValue={selectedAnalysis?.expected_value} required />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur réalisée *</label>
                <Input name="actual_value" type="number" step="0.01" defaultValue={selectedAnalysis?.actual_value} required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Facteurs internes</label>
                <Textarea name="internal_factors" defaultValue={selectedAnalysis?.internal_factors} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Facteurs externes</label>
                <Textarea name="external_factors" defaultValue={selectedAnalysis?.external_factors} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Analyse des causes</label>
                <Textarea name="root_cause_analysis" defaultValue={selectedAnalysis?.root_cause_analysis} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Évaluation de l'impact</label>
                <Textarea name="impact_assessment" defaultValue={selectedAnalysis?.impact_assessment} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Leçons apprises</label>
                <Textarea name="lessons_learned" defaultValue={selectedAnalysis?.lessons_learned} rows={2} />
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
