import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import type { PerDiemRate } from "@/types/mission";

export function MissionSettings() {
  const queryClient = useQueryClient();
  const [perDiemDialogOpen, setPerDiemDialogOpen] = useState(false);
  const [editingPerDiem, setEditingPerDiem] = useState<PerDiemRate | null>(null);
  const [newPerDiem, setNewPerDiem] = useState({
    country: "",
    city: "",
    daily_rate: 0,
    currency: "FCFA",
    accommodation_rate: 0,
    meal_rate: 0,
    effective_date: new Date().toISOString().split('T')[0],
  });

  // Fetch per diem rates
  const { data: perDiemRates } = useQuery({
    queryKey: ["per_diem_rates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("per_diem_rates")
        .select("*")
        .order("country", { ascending: true });
      return data as PerDiemRate[] || [];
    },
  });

  // Fetch mission settings
  const { data: settings } = useQuery({
    queryKey: ["mission_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mission_settings")
        .select("*");
      // Convert array of key-value settings to an object
      const settingsObj: Record<string, any> = {};
      data?.forEach(s => {
        settingsObj[s.setting_key] = s.setting_value;
      });
      return settingsObj;
    },
  });

  // Add/Edit per diem rate
  const perDiemMutation = useMutation({
    mutationFn: async (data: typeof newPerDiem) => {
      if (editingPerDiem) {
        const { error } = await supabase
          .from("per_diem_rates")
          .update(data)
          .eq("id", editingPerDiem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("per_diem_rates")
          .insert([{ ...data, daily_rate: data.daily_rate || 0 }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["per_diem_rates"] });
      toast.success(editingPerDiem ? "Taux modifié" : "Taux ajouté");
      setPerDiemDialogOpen(false);
      setEditingPerDiem(null);
      setNewPerDiem({
        country: "",
        city: "",
        daily_rate: 0,
        currency: "FCFA",
        accommodation_rate: 0,
        meal_rate: 0,
        effective_date: new Date().toISOString().split('T')[0],
      });
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement");
    },
  });

  // Delete per diem rate
  const deletePerDiemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("per_diem_rates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["per_diem_rates"] });
      toast.success("Taux supprimé");
    },
  });

  // Update settings
  const updateSetting = async (key: string, value: any) => {
    const { data: existing } = await supabase
      .from("mission_settings")
      .select("*")
      .eq("setting_key", key)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("mission_settings")
        .update({ setting_value: value })
        .eq("id", existing.id);
      if (error) {
        toast.error("Erreur lors de l'enregistrement");
        return;
      }
    } else {
      const { error } = await supabase
        .from("mission_settings")
        .insert([{ setting_key: key, setting_value: value }]);
      if (error) {
        toast.error("Erreur lors de l'enregistrement");
        return;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["mission_settings"] });
    toast.success("Paramètre enregistré");
  };

  const handleEditPerDiem = (rate: PerDiemRate) => {
    setEditingPerDiem(rate);
    setNewPerDiem({
      country: rate.country,
      city: rate.city || "",
      daily_rate: rate.daily_rate,
      currency: rate.currency,
      accommodation_rate: rate.accommodation_rate || 0,
      meal_rate: rate.meal_rate || 0,
      effective_date: rate.effective_date,
    });
    setPerDiemDialogOpen(true);
  };

  const handleSavePerDiem = () => {
    perDiemMutation.mutate(newPerDiem);
  };

  return (
    <div className="space-y-6">
      {/* Paramètres généraux */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Généraux</CardTitle>
          <CardDescription>Configuration du module Missions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Délai de soumission du rapport (jours)</Label>
              <Input 
                type="number" 
                defaultValue={settings?.report_submission_delay || 7}
                onBlur={(e) => updateSetting('report_submission_delay', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Pourcentage d'avance par défaut (%)</Label>
              <Input 
                type="number" 
                defaultValue={settings?.default_advance_percentage || 80}
                onBlur={(e) => updateSetting('default_advance_percentage', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Seuil validation DG (FCFA)</Label>
              <Input 
                type="number" 
                defaultValue={settings?.dg_validation_threshold || 5000000}
                onBlur={(e) => updateSetting('dg_validation_threshold', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch 
                defaultChecked={settings?.require_project_link === true}
                onCheckedChange={(checked) => updateSetting('require_project_link', checked)}
              />
              <Label>Lien projet obligatoire</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barème des per diem */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Barème des Per Diem</CardTitle>
            <CardDescription>Taux journaliers par pays/ville</CardDescription>
          </div>
          <Dialog open={perDiemDialogOpen} onOpenChange={setPerDiemDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPerDiem(null);
                setNewPerDiem({
                  country: "",
                  city: "",
                  daily_rate: 0,
                  currency: "FCFA",
                  accommodation_rate: 0,
                  meal_rate: 0,
                  effective_date: new Date().toISOString().split('T')[0],
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un taux
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPerDiem ? "Modifier le taux" : "Nouveau taux per diem"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pays *</Label>
                    <Input 
                      value={newPerDiem.country}
                      onChange={(e) => setNewPerDiem({ ...newPerDiem, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input 
                      value={newPerDiem.city || ""}
                      onChange={(e) => setNewPerDiem({ ...newPerDiem, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taux journalier *</Label>
                    <Input 
                      type="number"
                      value={newPerDiem.daily_rate}
                      onChange={(e) => setNewPerDiem({ ...newPerDiem, daily_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Input 
                      value={newPerDiem.currency}
                      onChange={(e) => setNewPerDiem({ ...newPerDiem, currency: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taux hébergement</Label>
                    <Input 
                      type="number"
                      value={newPerDiem.accommodation_rate || 0}
                      onChange={(e) => setNewPerDiem({ ...newPerDiem, accommodation_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taux repas</Label>
                    <Input 
                      type="number"
                      value={newPerDiem.meal_rate || 0}
                      onChange={(e) => setNewPerDiem({ ...newPerDiem, meal_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date d'effet</Label>
                  <Input 
                    type="date"
                    value={newPerDiem.effective_date}
                    onChange={(e) => setNewPerDiem({ ...newPerDiem, effective_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleSavePerDiem} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pays</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Taux journalier</TableHead>
                <TableHead>Hébergement</TableHead>
                <TableHead>Repas</TableHead>
                <TableHead>Date effet</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perDiemRates?.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.country}</TableCell>
                  <TableCell>{rate.city || "-"}</TableCell>
                  <TableCell>{rate.daily_rate?.toLocaleString()} {rate.currency}</TableCell>
                  <TableCell>{rate.accommodation_rate?.toLocaleString() || "-"}</TableCell>
                  <TableCell>{rate.meal_rate?.toLocaleString() || "-"}</TableCell>
                  <TableCell>{rate.effective_date ? new Date(rate.effective_date).toLocaleDateString('fr-FR') : "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPerDiem(rate)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deletePerDiemMutation.mutate(rate.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {perDiemRates?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucun taux configuré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
