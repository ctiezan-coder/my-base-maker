import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any;
  onClose: () => void;
}

export function EventDialog({ open, onOpenChange, event, onClose }: EventDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    event_type: "",
    start_date: "",
    end_date: "",
    location: "",
    max_participants: "",
    direction_id: "",
  });

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name, rccm_number")
        .order("company_name");
      if (error) throw error;
      
      // Éliminer les doublons basés sur le RCCM ET le nom
      const uniqueCompanies = data?.reduce((acc: any[], company: any) => {
        const isDuplicate = acc.find(c => 
          c.rccm_number === company.rccm_number || 
          c.company_name.toLowerCase().trim() === company.company_name.toLowerCase().trim()
        );
        if (!isDuplicate) {
          acc.push(company);
        }
        return acc;
      }, []);
      
      return uniqueCompanies;
    },
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start_date: event.start_date?.split("T")[0] || "",
        end_date: event.end_date?.split("T")[0] || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        event_type: "",
        start_date: "",
        end_date: "",
        location: "",
        max_participants: "",
        direction_id: "",
      });
      setSelectedCompanies([]);
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      };

      if (event) {
        const { error } = await supabase
          .from("events")
          .update(dataToSend)
          .eq("id", event.id);

        if (error) throw error;
        toast({ title: "Événement mis à jour avec succès" });
      } else {
        const { data: newEvent, error } = await supabase
          .from("events")
          .insert([dataToSend])
          .select()
          .single();

        if (error) throw error;

        // Créer automatiquement un projet associé à l'événement
        if (newEvent) {
          const projectData = {
            name: `Événement: ${formData.title}`,
            description: formData.description || `Projet lié à l'événement "${formData.title}"`,
            direction_id: formData.direction_id,
            status: 'planifié',
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            project_type: 'Événement commercial',
            priority_level: '2',
          };

          const { data: projectResult, error: projectError } = await supabase
            .from("projects")
            .insert([projectData])
            .select()
            .single();

          if (projectError) {
            console.error("Erreur lors de la création du projet associé:", projectError);
          } else if (projectResult) {
            // Lier l'événement au projet via event_projects si la table existe
            const { error: linkError } = await supabase
              .from("event_projects")
              .insert([{
                event_id: newEvent.id,
                project_id: projectResult.id,
              }]);

            if (linkError) {
              console.error("Erreur lors du lien événement-projet:", linkError);
            }
          }
        }

        // Ajouter les participants sélectionnés
        if (selectedCompanies.length > 0 && newEvent) {
          const participants = selectedCompanies.map(companyId => ({
            event_id: newEvent.id,
            company_id: companyId,
            status: "Confirmé",
            created_by: user?.id,
          }));

          const { error: participantsError } = await supabase
            .from("event_participants")
            .insert(participants);

          if (participantsError) throw participantsError;

          // Créer des notifications pour les opérateurs
          const { data: companiesData } = await supabase
            .from("companies")
            .select("id, company_name, created_by")
            .in("id", selectedCompanies);

          if (companiesData) {
            const notifications = companiesData
              .filter(company => company.created_by)
              .map(company => ({
                user_id: company.created_by!,
                title: "Participation à un événement",
                message: `Votre entreprise ${company.company_name} a été inscrite à l'événement "${formData.title}"`,
                type: "info",
                reference_id: newEvent.id,
                reference_table: "events",
              }));

            if (notifications.length > 0) {
              await supabase
                .from("notifications")
                .insert(notifications);
            }
          }
        }

        toast({ title: "Événement créé avec succès (projet associé créé automatiquement)" });
      }
      onClose();
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Détecter les erreurs de doublon
      if (error.message?.includes('unique_event') || error.code === '23505') {
        errorMessage = "Cet événement existe déjà (même titre, date et direction). Veuillez modifier les informations.";
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

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? "Modifier l'événement" : "Nouvel événement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_type">Type d'événement *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foire">Foire internationale</SelectItem>
                  <SelectItem value="salon">Salon professionnel</SelectItem>
                  <SelectItem value="atelier">Atelier export</SelectItem>
                  <SelectItem value="conference">Conférence commerciale</SelectItem>
                  <SelectItem value="mission">Mission commerciale</SelectItem>
                  <SelectItem value="formation">Formation export</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
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
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {directions?.map((dir) => (
                    <SelectItem key={dir.id} value={dir.id}>
                      {dir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
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
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_participants">Participants max</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {!event && (
            <div className="space-y-2">
              <Label>Opérateurs participants (optionnel)</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Sélectionnez les opérateurs à inscrire à cet événement
              </div>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-3">
                  {companies?.map((company) => (
                    <div key={company.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`company-${company.id}`}
                        checked={selectedCompanies.includes(company.id)}
                        onCheckedChange={() => toggleCompany(company.id)}
                      />
                      <label
                        htmlFor={`company-${company.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {company.company_name}
                      </label>
                    </div>
                  ))}
                  {companies?.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun opérateur disponible</p>
                  )}
                </div>
              </ScrollArea>
              {selectedCompanies.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedCompanies.length} opérateur(s) sélectionné(s)
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
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
