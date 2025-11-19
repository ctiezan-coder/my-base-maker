import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDirection } from "@/hooks/useUserDirection";

interface PartnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnership?: any;
  onClose: () => void;
}

export function PartnershipDialog({ open, onOpenChange, partnership, onClose }: PartnershipDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const { data: userDirection } = useUserDirection();
  
  const [formData, setFormData] = useState<any>({
    partner_name: "",
    partner_type: "",
    description: "",
    status: "en négociation",
    start_date: "",
    end_date: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    budget: "",
    direction_id: "",
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

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedProjects = [] } = useQuery({
    queryKey: ["partnership-projects", partnership?.id],
    queryFn: async () => {
      if (!partnership?.id) return [];
      const { data, error } = await supabase
        .from("partnership_projects")
        .select("project_id")
        .eq("partnership_id", partnership.id);
      if (error) throw error;
      return data.map(p => p.project_id);
    },
    enabled: !!partnership?.id,
  });

  useEffect(() => {
    if (partnership) {
      setFormData({
        partner_name: partnership.partner_name || "",
        partner_type: partnership.partner_type || "",
        description: partnership.description || "",
        status: partnership.status || "en négociation",
        start_date: partnership.start_date || "",
        end_date: partnership.end_date || "",
        contact_person: partnership.contact_person || "",
        contact_email: partnership.contact_email || "",
        contact_phone: partnership.contact_phone || "",
        budget: partnership.budget?.toString() || "",
        direction_id: partnership.direction_id || "",
      });
    } else {
      setFormData({
        partner_name: "",
        partner_type: "",
        description: "",
        status: "en négociation",
        start_date: "",
        end_date: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        budget: "",
        direction_id: userDirection?.direction_id || "",
      });
      setSelectedProjects([]);
    }
  }, [partnership, userDirection]);

  useEffect(() => {
    if (linkedProjects.length > 0) {
      setSelectedProjects(linkedProjects);
    }
  }, [linkedProjects.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const directionId =
        formData.direction_id || partnership?.direction_id || userDirection?.direction_id;

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
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        direction_id: directionId,
      };

      let partnershipId: string;

      if (partnership) {
        const { error } = await supabase
          .from("partnerships")
          .update(dataToSave)
          .eq("id", partnership.id);

        if (error) throw error;
        partnershipId = partnership.id;
      } else {
        const { data, error } = await supabase
          .from("partnerships")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        partnershipId = data.id;
      }

      // Delete existing project links
      await supabase
        .from("partnership_projects")
        .delete()
        .eq("partnership_id", partnershipId);

      // Insert new project links
      if (selectedProjects.length > 0) {
        const projectLinks = selectedProjects.map(projectId => ({
          partnership_id: partnershipId,
          project_id: projectId,
        }));

        const { error: linkError } = await supabase
          .from("partnership_projects")
          .insert(projectLinks);

        if (linkError) throw linkError;
      }

      toast({ 
        title: partnership ? "Partenariat mis à jour avec succès" : "Partenariat créé avec succès"
      });
      onClose();
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Détecter les erreurs de doublon
      if (error.message?.includes('unique_partnership') || error.code === '23505') {
        errorMessage = "Ce partenariat existe déjà (même nom et direction). Veuillez modifier les informations.";
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {partnership ? "Modifier le partenariat" : "Nouveau partenariat"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="partner_name">Nom du partenaire *</Label>
              <Input
                id="partner_name"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner_type">Type de partenaire</Label>
              <Input
                id="partner_type"
                value={formData.partner_type}
                onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
                placeholder="PTF, Entreprise, ONG..."
              />
            </div>

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
                  <SelectItem value="en négociation">En négociation</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Personne contact</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Date fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (FCFA)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Projets liés</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun projet disponible</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProjects([...selectedProjects, project.id]);
                        } else {
                          setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`project-${project.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {project.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
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
