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
import { useUserDirection } from "@/hooks/useUserDirection";

interface TrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: any;
  onClose: () => void;
}

export function TrainingDialog({ open, onOpenChange, training, onClose }: TrainingDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userDirection } = useUserDirection();
  const [loading, setLoading] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    training_type: "Formation" as "Formation" | "Atelier" | "Coaching" | "Webinaire" | "Autre",
    start_date: "",
    end_date: "",
    location: "",
    max_participants: "",
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
    if (training) {
      setFormData({
        title: training.title || "",
        description: training.description || "",
        training_type: training.training_type || "Formation",
        start_date: training.start_date ? training.start_date.split("T")[0] : "",
        end_date: training.end_date ? training.end_date.split("T")[0] : "",
        location: training.location || "",
        max_participants: training.max_participants?.toString() || "",
        direction_id: training.direction_id || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        training_type: "Formation",
        start_date: "",
        end_date: "",
        location: "",
        max_participants: "",
        direction_id: userDirection?.direction_id || "",
      });
      setSelectedCompanies([]);
    }
  }, [training, open, userDirection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const directionId = formData.direction_id || training?.direction_id || userDirection?.direction_id;
      
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
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        direction_id: directionId,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (training) {
        const { error } = await supabase
          .from("trainings")
          .update(dataToSave)
          .eq("id", training.id);

        if (error) throw error;
        toast({ title: "Formation mise à jour avec succès" });
      } else {
        const { data: newTraining, error } = await supabase
          .from("trainings")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;

        // Ajouter les inscriptions pour les entreprises sélectionnées
        if (selectedCompanies.length > 0 && newTraining) {
          const { data: companiesData } = await supabase
            .from("companies")
            .select("id, company_name, email, phone, created_by")
            .in("id", selectedCompanies);

          if (companiesData) {
            const registrations = companiesData.map(company => ({
              training_id: newTraining.id,
              company_id: company.id,
              participant_name: company.company_name,
              participant_email: company.email || "non-renseigné@email.com",
              participant_phone: company.phone || null,
              status: "Confirmée" as const,
            }));

            const { error: registrationsError } = await supabase
              .from("training_registrations")
              .insert(registrations);

            if (registrationsError) throw registrationsError;

            // Créer des notifications pour les opérateurs
            const notifications = companiesData
              .filter(company => company.created_by)
              .map(company => ({
                user_id: company.created_by!,
                title: "Inscription à une formation",
                message: `Votre entreprise ${company.company_name} a été inscrite à la formation "${formData.title}"`,
                type: "info",
                reference_id: newTraining.id,
                reference_table: "trainings",
              }));

            if (notifications.length > 0) {
              await supabase
                .from("notifications")
                .insert(notifications);
            }
          }
        }

        toast({ title: "Formation créée avec succès" });
      }
      onClose();
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Détecter les erreurs de doublon
      if (error.message?.includes('unique_training') || error.code === '23505') {
        errorMessage = "Cette formation existe déjà (même titre, date et direction). Veuillez modifier les informations.";
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
            {training ? "Modifier la formation" : "Nouvelle formation"}
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
              <Label htmlFor="training_type">Type *</Label>
              <Select
                value={formData.training_type}
                onValueChange={(value) => setFormData({ ...formData, training_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formation">Formation</SelectItem>
                  <SelectItem value="Atelier">Atelier</SelectItem>
                  <SelectItem value="Coaching">Coaching</SelectItem>
                  <SelectItem value="Webinaire">Webinaire</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date début *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Date fin *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
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

          {!training && (
            <div className="space-y-2">
              <Label>Opérateurs participants (optionnel)</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Sélectionnez les opérateurs à inscrire à cette formation
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
