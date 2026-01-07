import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUserDirection } from "@/hooks/useUserDirection";
import { createNotification } from "@/hooks/useNotification";
import { Badge } from "@/components/ui/badge";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  onClose: () => void;
}

const projectTypes = [
  "Accompagnement export",
  "Événement commercial",
  "Formation",
  "Étude de marché",
  "Mission commerciale",
  "Partenariat stratégique",
  "Développement de capacités",
  "Certification",
  "Autre",
];

export function ProjectDialog({ open, onOpenChange, project, onClose }: ProjectDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: userDirection } = useUserDirection();
  
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    status: "planifié",
    priority_level: "2",
    project_type: "",
    start_date: "",
    end_date: "",
    actual_start_date: "",
    actual_end_date: "",
    budget: "",
    direction_id: "",
    manager_id: "",
    progress_percentage: 0,
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-managers"],
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

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planifié",
        priority_level: project.priority_level || "2",
        project_type: project.project_type || "",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        actual_start_date: project.actual_start_date || "",
        actual_end_date: project.actual_end_date || "",
        budget: project.budget?.toString() || "",
        direction_id: project.direction_id || "",
        manager_id: project.manager_id || "",
        progress_percentage: project.progress_percentage || 0,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "planifié",
        priority_level: "2",
        project_type: "",
        start_date: "",
        end_date: "",
        actual_start_date: "",
        actual_end_date: "",
        budget: "",
        direction_id: userDirection?.direction_id || "",
        manager_id: "",
        progress_percentage: 0,
      });
    }
  }, [project, userDirection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const directionId = formData.direction_id || project?.direction_id || userDirection?.direction_id;
      
      if (!directionId) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Direction non définie. Veuillez sélectionner une direction.",
        });
        setLoading(false);
        return;
      }

      const dataToSave = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        priority_level: formData.priority_level,
        project_type: formData.project_type || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        actual_start_date: formData.actual_start_date || null,
        actual_end_date: formData.actual_end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        direction_id: directionId,
        manager_id: formData.manager_id || null,
        progress_percentage: formData.progress_percentage,
      };

      if (project) {
        const { error } = await supabase
          .from("projects")
          .update(dataToSave)
          .eq("id", project.id);

        if (error) throw error;
        toast({ title: "Projet mis à jour avec succès" });
      } else {
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;

        if (newProject && directionId) {
          const { data: directionUsers } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("direction_id", directionId);

          if (directionUsers) {
            for (const u of directionUsers) {
              await createNotification({
                userId: u.user_id,
                title: "Nouveau projet créé",
                message: `Un nouveau projet a été créé: "${formData.name}"`,
                type: "info",
                referenceId: newProject.id,
                referenceTable: "projects",
              });
            }
          }
        }

        toast({ title: "Projet créé avec succès" });
      }
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const priorityLabels: Record<string, { label: string; color: string }> = {
    "1": { label: "Haute", color: "destructive" },
    "2": { label: "Moyenne", color: "default" },
    "3": { label: "Basse", color: "secondary" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {project ? "Modifier le projet" : "Nouveau projet"}
            {project?.project_code && (
              <Badge variant="outline" className="ml-2">{project.project_code}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Informations</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="budget">Budget & Équipe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_type">Type de projet</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction_id">Direction *</Label>
                  <Select
                    value={formData.direction_id}
                    onValueChange={(value) => setFormData({ ...formData, direction_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {directions.map((direction) => (
                        <SelectItem key={direction.id} value={direction.id}>
                          {direction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planifié">Planifié</SelectItem>
                      <SelectItem value="en cours">En cours</SelectItem>
                      <SelectItem value="terminé">Terminé</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                      <SelectItem value="annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority_level">Priorité</Label>
                  <Select
                    value={formData.priority_level}
                    onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Haute</SelectItem>
                      <SelectItem value="2">Moyenne</SelectItem>
                      <SelectItem value="3">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {project && (
                <div className="space-y-2">
                  <Label htmlFor="progress">Avancement ({formData.progress_percentage}%)</Label>
                  <Input
                    id="progress"
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="planning" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date début prévue</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Date fin prévue</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actual_start_date">Date début réelle</Label>
                  <Input
                    id="actual_start_date"
                    type="date"
                    value={formData.actual_start_date}
                    onChange={(e) => setFormData({ ...formData, actual_start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actual_end_date">Date fin réelle</Label>
                  <Input
                    id="actual_end_date"
                    type="date"
                    value={formData.actual_end_date}
                    onChange={(e) => setFormData({ ...formData, actual_end_date: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="budget" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget alloué (FCFA)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_id">Chef de projet</Label>
                <Select
                  value={formData.manager_id}
                  onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non assigné</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}