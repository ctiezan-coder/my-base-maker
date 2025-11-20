import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media?: any;
  onClose: () => void;
}

export function MediaDialog({ open, onOpenChange, media, onClose }: MediaDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    file_url: "",
    media_type: "Newsletter",
    priority_level: "5",
    direction_id: "",
    date_evenement: "",
    lieu_evenement: "",
    contexte_activite: "",
    deroule: "",
    parties_prenantes: "",
    panelistes: "",
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

  useEffect(() => {
    if (media) {
      setFormData(media);
      setFile(null);
    } else {
      setFormData({
        title: "",
        file_url: "",
        media_type: "Newsletter",
        priority_level: "5",
        direction_id: "",
        date_evenement: "",
        lieu_evenement: "",
        contexte_activite: "",
        deroule: "",
        parties_prenantes: "",
        panelistes: "",
      });
      setFile(null);
    }
  }, [media]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      let fileUrl = formData.file_url;

      // Upload file if a new file is selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        fileUrl = filePath;
      }

      const dataToSubmit = {
        ...formData,
        file_url: fileUrl,
        created_by: media ? formData.created_by : user.id,
      };

      if (media) {
        const { error } = await supabase
          .from("media_content")
          .update(dataToSubmit)
          .eq("id", media.id);

        if (error) throw error;
        toast({ title: "Média mis à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("media_content")
          .insert([dataToSubmit]);

        if (error) throw error;
        toast({ title: "Média créé avec succès" });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {media ? "Modifier le média" : "Nouveau média"}
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
            <div className="space-y-2">
              <Label htmlFor="media_type">Type *</Label>
              <Select
                value={formData.media_type}
                onValueChange={(value) => setFormData({ ...formData, media_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                  <SelectItem value="Magazine">Magazine</SelectItem>
                  <SelectItem value="Article presse">Article presse</SelectItem>
                  <SelectItem value="Communiqué de presse">Communiqué de presse</SelectItem>
                  <SelectItem value="Dossier de presse">Dossier de presse</SelectItem>
                  <SelectItem value="Branding visuel">Branding visuel</SelectItem>
                  <SelectItem value="Fond de scène">Fond de scène</SelectItem>
                  <SelectItem value="Dépliant">Dépliant</SelectItem>
                  <SelectItem value="Flyer">Flyer</SelectItem>
                  <SelectItem value="Affiche">Affiche</SelectItem>
                  <SelectItem value="Post réseaux sociaux">Post réseaux sociaux</SelectItem>
                  <SelectItem value="Film institutionnel">Film institutionnel</SelectItem>
                  <SelectItem value="Photo professionnelle">Photo professionnelle</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_evenement">Date de l'activité</Label>
              <Input
                id="date_evenement"
                type="date"
                value={formData.date_evenement || ""}
                onChange={(e) => setFormData({ ...formData, date_evenement: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieu_evenement">Lieu</Label>
              <Input
                id="lieu_evenement"
                value={formData.lieu_evenement || ""}
                onChange={(e) => setFormData({ ...formData, lieu_evenement: e.target.value })}
                placeholder="Lieu de l'activité"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contexte_activite">Contexte de l'activité</Label>
            <Textarea
              id="contexte_activite"
              value={formData.contexte_activite || ""}
              onChange={(e) => setFormData({ ...formData, contexte_activite: e.target.value })}
              rows={3}
              placeholder="Décrivez le contexte..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deroule">Déroulé</Label>
            <Textarea
              id="deroule"
              value={formData.deroule || ""}
              onChange={(e) => setFormData({ ...formData, deroule: e.target.value })}
              rows={3}
              placeholder="Décrivez le déroulé de l'activité..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parties_prenantes">Parties prenantes</Label>
            <Textarea
              id="parties_prenantes"
              value={formData.parties_prenantes || ""}
              onChange={(e) => setFormData({ ...formData, parties_prenantes: e.target.value })}
              rows={2}
              placeholder="Listez les parties prenantes..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="panelistes">Panélistes</Label>
            <Textarea
              id="panelistes"
              value={formData.panelistes || ""}
              onChange={(e) => setFormData({ ...formData, panelistes: e.target.value })}
              rows={2}
              placeholder="Listez les panélistes..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
            {formData.file_url && !file && (
              <p className="text-sm text-muted-foreground">Fichier actuel enregistré</p>
            )}
          </div>

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
