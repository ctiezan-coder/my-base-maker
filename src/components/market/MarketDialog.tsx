import { useState, useEffect } from "react";
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
import { PotentialMarket, MarketRegion, RiskLevel } from "@/types/market-development";

const formSchema = z.object({
  country: z.string().min(1, "Le pays est requis"),
  region: z.enum(["Europe", "Afrique", "ZLECAf", "Asie", "Moyen-Orient", "Amérique du Nord", "Amérique du Sud"]),
  sector: z.string().min(1, "Le secteur est requis"),
  market_potential: z.string().min(1, "Le potentiel est requis"),
  demand_description: z.string().optional(),
  key_products: z.string().optional(),
  requirements: z.string().optional(),
  risk_level: z.enum(["Faible", "Modéré", "Élevé"]).optional(),
  market_size_billion: z.coerce.number().optional(),
  growth_rate: z.coerce.number().optional(),
});

interface MarketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market?: PotentialMarket;
  onClose: () => void;
}

export const MarketDialog = ({
  open,
  onOpenChange,
  market,
  onClose,
}: MarketDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "",
      sector: "",
      market_potential: "",
      demand_description: "",
      key_products: "",
      requirements: "",
    },
  });

  useEffect(() => {
    if (market) {
      form.reset({
        country: market.country,
        region: market.region,
        sector: market.sector,
        market_potential: market.market_potential,
        demand_description: market.demand_description || "",
        key_products: market.key_products?.join(", ") || "",
        requirements: market.requirements?.join(", ") || "",
        risk_level: market.risk_level,
        market_size_billion: market.market_size_billion || undefined,
        growth_rate: market.growth_rate || undefined,
      });
    } else {
      form.reset({
        country: "",
        sector: "",
        market_potential: "",
        demand_description: "",
        key_products: "",
        requirements: "",
      });
    }
  }, [market, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const dataToSave = {
        country: values.country,
        region: values.region,
        sector: values.sector,
        market_potential: values.market_potential,
        demand_description: values.demand_description || null,
        key_products: values.key_products ? values.key_products.split(",").map(s => s.trim()) : null,
        requirements: values.requirements ? values.requirements.split(",").map(s => s.trim()) : null,
        risk_level: values.risk_level || null,
        market_size_billion: values.market_size_billion || null,
        growth_rate: values.growth_rate || null,
      };

      if (market) {
        const { error } = await supabase
          .from("potential_markets")
          .update(dataToSave)
          .eq("id", market.id);

        if (error) throw error;
        toast({ title: "Marché mis à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("potential_markets")
          .insert([dataToSave]);

        if (error) throw error;
        toast({ title: "Marché créé avec succès" });
      }

      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
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
            {market ? "Modifier le marché" : "Nouveau marché potentiel"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="market_potential"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potentiel de marché</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Très élevé">Très élevé</SelectItem>
                        <SelectItem value="Élevé">Élevé</SelectItem>
                        <SelectItem value="Croissant">Croissant</SelectItem>
                        <SelectItem value="Émergent">Émergent</SelectItem>
                        <SelectItem value="Modéré">Modéré</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="demand_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description de la demande</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="key_products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produits clés (séparés par virgule)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: Café, Cacao, Noix de cajou" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exigences (séparées par virgule)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: ISO 9001, Bio, Commerce équitable" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="risk_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau de risque</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Faible">Faible</SelectItem>
                        <SelectItem value="Modéré">Modéré</SelectItem>
                        <SelectItem value="Élevé">Élevé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="market_size_billion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taille du marché (Mds €)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="growth_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux de croissance (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
                {loading ? "Enregistrement..." : market ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
