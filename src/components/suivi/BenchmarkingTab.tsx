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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, BarChart3, TrendingUp, TrendingDown, Minus, Edit, Trash2 } from "lucide-react";

interface BenchmarkingTabProps {
  canManage: boolean;
}

export function BenchmarkingTab({ canManage }: BenchmarkingTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBenchmark, setSelectedBenchmark] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: benchmarks, isLoading } = useQuery({
    queryKey: ["benchmarks", filterType, filterCategory],
    queryFn: async () => {
      let query = supabase
        .from("benchmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("benchmark_type", filterType);
      }
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (benchmark: any) => {
      const { error } = await supabase.from("benchmarks").insert(benchmark);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
      toast.success("Benchmark créé avec succès");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...benchmark }: any) => {
      const { error } = await supabase.from("benchmarks").update(benchmark).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
      toast.success("Benchmark mis à jour");
      setSelectedBenchmark(null);
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("benchmarks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
      toast.success("Benchmark supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const benchmark = {
      title: formData.get("title"),
      benchmark_type: formData.get("benchmark_type"),
      category: formData.get("category") || null,
      indicator: formData.get("indicator"),
      our_value: formData.get("our_value") ? Number(formData.get("our_value")) : null,
      benchmark_value: formData.get("benchmark_value") ? Number(formData.get("benchmark_value")) : null,
      unit: formData.get("unit") || null,
      source: formData.get("source") || null,
      analysis_period: formData.get("analysis_period") || null,
      findings: formData.get("findings") || null,
      recommendations: formData.get("recommendations") || null,
      lessons_learned: formData.get("lessons_learned") || null,
    };

    if (selectedBenchmark) {
      updateMutation.mutate({ id: selectedBenchmark.id, ...benchmark });
    } else {
      createMutation.mutate(benchmark);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      international: "International",
      national: "National",
      internal: "Interne",
      sector: "Sectoriel",
    };
    return labels[type] || type;
  };

  const getComparisonIcon = (ourValue: number | null, benchmarkValue: number | null) => {
    if (!ourValue || !benchmarkValue) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (ourValue > benchmarkValue) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (ourValue < benchmarkValue) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getPerformancePercent = (ourValue: number | null, benchmarkValue: number | null) => {
    if (!ourValue || !benchmarkValue) return 0;
    return Math.min((ourValue / benchmarkValue) * 100, 150);
  };

  const categories = [...new Set(benchmarks?.map((b) => b.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="international">International</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="internal">Interne</SelectItem>
              <SelectItem value="sector">Sectoriel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedBenchmark(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau benchmark
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedBenchmark ? "Modifier le benchmark" : "Nouveau benchmark"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" name="title" defaultValue={selectedBenchmark?.title} required />
                  </div>
                  <div>
                    <Label htmlFor="benchmark_type">Type</Label>
                    <Select name="benchmark_type" defaultValue={selectedBenchmark?.benchmark_type || "international"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="internal">Interne</SelectItem>
                        <SelectItem value="sector">Sectoriel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Input id="category" name="category" defaultValue={selectedBenchmark?.category} placeholder="Ex: Export, Formation..." />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="indicator">Indicateur</Label>
                    <Input id="indicator" name="indicator" defaultValue={selectedBenchmark?.indicator} required />
                  </div>
                  <div>
                    <Label htmlFor="our_value">Notre valeur</Label>
                    <Input type="number" step="0.01" id="our_value" name="our_value" defaultValue={selectedBenchmark?.our_value} />
                  </div>
                  <div>
                    <Label htmlFor="benchmark_value">Valeur benchmark</Label>
                    <Input type="number" step="0.01" id="benchmark_value" name="benchmark_value" defaultValue={selectedBenchmark?.benchmark_value} />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unité</Label>
                    <Input id="unit" name="unit" defaultValue={selectedBenchmark?.unit} placeholder="%, FCFA, jours..." />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input id="source" name="source" defaultValue={selectedBenchmark?.source} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="analysis_period">Période d'analyse</Label>
                    <Input id="analysis_period" name="analysis_period" defaultValue={selectedBenchmark?.analysis_period} placeholder="Ex: 2024, T1 2024..." />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="findings">Constats</Label>
                    <Textarea id="findings" name="findings" defaultValue={selectedBenchmark?.findings} rows={2} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="recommendations">Recommandations</Label>
                    <Textarea id="recommendations" name="recommendations" defaultValue={selectedBenchmark?.recommendations} rows={2} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="lessons_learned">Leçons apprises</Label>
                    <Textarea id="lessons_learned" name="lessons_learned" defaultValue={selectedBenchmark?.lessons_learned} rows={2} />
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

      {/* Benchmarks Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {benchmarks?.map((benchmark) => (
            <Card key={benchmark.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <Badge variant="outline">{getTypeLabel(benchmark.benchmark_type)}</Badge>
                    {benchmark.category && <Badge variant="secondary">{benchmark.category}</Badge>}
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedBenchmark(benchmark);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(benchmark.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{benchmark.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Indicateur:</strong> {benchmark.indicator}
                </div>

                {(benchmark.our_value !== null || benchmark.benchmark_value !== null) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getComparisonIcon(benchmark.our_value, benchmark.benchmark_value)}
                        Notre valeur: <strong>{benchmark.our_value ?? "-"}</strong> {benchmark.unit}
                      </span>
                      <span>
                        Benchmark: <strong>{benchmark.benchmark_value ?? "-"}</strong> {benchmark.unit}
                      </span>
                    </div>
                    <Progress value={getPerformancePercent(benchmark.our_value, benchmark.benchmark_value)} className="h-2" />
                  </div>
                )}

                {benchmark.source && (
                  <div className="text-xs text-muted-foreground">
                    Source: {benchmark.source} {benchmark.analysis_period && `• ${benchmark.analysis_period}`}
                  </div>
                )}

                {benchmark.findings && (
                  <div className="text-sm">
                    <strong className="text-muted-foreground">Constats:</strong>
                    <p className="mt-1">{benchmark.findings}</p>
                  </div>
                )}

                {benchmark.recommendations && (
                  <div className="text-sm">
                    <strong className="text-muted-foreground">Recommandations:</strong>
                    <p className="mt-1">{benchmark.recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {benchmarks?.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Aucun benchmark trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}
