import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExportOpportunity, MarketRegion, OpportunityStatus } from "@/types/market-development";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  sector: z.string().min(1, "Le secteur est requis"),
  destination_country: z.string().min(1, "Le pays de destination est requis"),
  destination_city: z.string().optional(),
  region: z.enum(["Europe", "Afrique", "ZLECAf", "Asie", "Moyen-Orient", "Amérique du Nord", "Amérique du Sud"]),
  estimated_value: z.coerce.number().positive("La valeur doit être positive"),
  currency: z.string().default("€"),
  compatibility_score: z.coerce.number().min(0).max(100).optional(),
  deadline: z.string().min(1, "La date limite est requise"),
  volume: z.string().min(1, "Le volume est requis"),
  description: z.string().min(1, "La description est requise"),
  status: z.enum(["URGENT", "NOUVEAU", "RECOMMANDÉ", "EN_COURS", "FERMÉ"]).optional(),
});

interface OpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: ExportOpportunity;
  onClose: () => void;
  mode?: "view" | "edit";
}

export const OpportunityDialog = ({
  open,
  onOpenChange,
  opportunity,
  onClose,
  mode = "edit",
}: OpportunityDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: opportunity
      ? {
          title: opportunity.title,
          sector: opportunity.sector,
          destination_country: opportunity.destination_country,
          destination_city: opportunity.destination_city || "",
          region: opportunity.region,
          estimated_value: opportunity.estimated_value,
          currency: opportunity.currency || "€",
          compatibility_score: opportunity.compatibility_score || undefined,
          deadline: opportunity.deadline,
          volume: opportunity.volume,
          description: opportunity.description,
          status: opportunity.status || "NOUVEAU",
        }
      : {
          currency: "€",
          status: "NOUVEAU",
        },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Vous devez être connecté");
      }

      if (opportunity) {
        const { error } = await supabase
          .from("export_opportunities")
          .update(values as any)
          .eq("id", opportunity.id);

        if (error) throw error;
        toast({ title: "Opportunité mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("export_opportunities")
          .insert([{ ...values, created_by: user.id } as any]);

        if (error) throw error;
        toast({ title: "Opportunité créée avec succès" });
      }

      onClose();
      form.reset();
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Détecter les erreurs de doublon
      if (error.message?.includes('unique_opportunity') || error.code === '23505') {
        errorMessage = "Cette opportunité existe déjà (même titre, pays et date limite). Veuillez modifier les informations.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === "view" && opportunity) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{opportunity.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex gap-2">
              {opportunity.status && (
                <Badge variant={opportunity.status === "URGENT" ? "destructive" : "default"}>
                  {opportunity.status}
                </Badge>
              )}
              <Badge variant="outline">{opportunity.region}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Secteur</label>
                <p className="text-base mt-1">{opportunity.sector}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Destination</label>
                <p className="text-base mt-1">
                  {opportunity.destination_country}
                  {opportunity.destination_city && `, ${opportunity.destination_city}`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Valeur estimée</label>
                <p className="text-base mt-1">
                  {opportunity.estimated_value.toLocaleString()} {opportunity.currency}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Volume</label>
                <p className="text-base mt-1">{opportunity.volume}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Échéance</label>
                <p className="text-base mt-1">
                  {format(new Date(opportunity.deadline), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>

              {opportunity.compatibility_score && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Score de compatibilité</label>
                  <p className="text-base mt-1 text-green-600 font-semibold">
                    {opportunity.compatibility_score}%
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base mt-2 whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Exigences</label>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index} className="text-base">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Modifier l'opportunité" : "Nouvelle opportunité d'export"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secteur</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Afrique">Afrique</SelectItem>
                        <SelectItem value="ZLECAf">ZLECAf</SelectItem>
                        <SelectItem value="Asie">Asie</SelectItem>
                        <SelectItem value="Moyen-Orient">Moyen-Orient</SelectItem>
                        <SelectItem value="Amérique du Nord">Amérique du Nord</SelectItem>
                        <SelectItem value="Amérique du Sud">Amérique du Sud</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="destination_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays de destination</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville (optionnel)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimated_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur estimée</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compatibility_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score compat. (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date limite</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: 50 tonnes/mois" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="URGENT">URGENT</SelectItem>
                      <SelectItem value="NOUVEAU">NOUVEAU</SelectItem>
                      <SelectItem value="RECOMMANDÉ">RECOMMANDÉ</SelectItem>
                      <SelectItem value="EN_COURS">EN COURS</SelectItem>
                      <SelectItem value="FERMÉ">FERMÉ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  form.reset();
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
