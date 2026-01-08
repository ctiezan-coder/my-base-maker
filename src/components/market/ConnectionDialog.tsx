import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
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
import { BusinessConnection, ConnectionStatus } from "@/types/market-development";

const formSchema = z.object({
  connection_date: z.string().min(1, "La date est requise"),
  pme_name: z.string().min(1, "Le nom de la PME est requis"),
  company_id: z.string().optional(),
  partner_name: z.string().min(1, "Le nom du partenaire est requis"),
  sector: z.string().min(1, "Le secteur est requis"),
  destination_country: z.string().min(1, "Le pays de destination est requis"),
  contract_value: z.coerce.number().min(0, "La valeur doit être positive"),
  currency: z.string().default("€"),
  status: z.enum(["En négociation", "Contrat signé", "En cours", "Terminé"]),
  contract_duration_years: z.coerce.number().optional(),
  jobs_created: z.coerce.number().optional(),
  social_impact: z.string().optional(),
});

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: BusinessConnection;
  onClose: () => void;
}

export const ConnectionDialog = ({
  open,
  onOpenChange,
  connection,
  onClose,
}: ConnectionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch companies for selection
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-for-connection"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name")
        .order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connection_date: new Date().toISOString().split("T")[0],
      pme_name: "",
      partner_name: "",
      sector: "",
      destination_country: "",
      contract_value: 0,
      currency: "€",
      status: "En négociation",
      social_impact: "",
    },
  });

  useEffect(() => {
    if (connection) {
      form.reset({
        connection_date: connection.connection_date,
        pme_name: connection.pme_name,
        company_id: connection.company_id || undefined,
        partner_name: connection.partner_name,
        sector: connection.sector,
        destination_country: connection.destination_country,
        contract_value: connection.contract_value,
        currency: connection.currency || "€",
        status: connection.status,
        contract_duration_years: connection.contract_duration_years || undefined,
        jobs_created: connection.jobs_created || undefined,
        social_impact: connection.social_impact || "",
      });
    } else {
      form.reset({
        connection_date: new Date().toISOString().split("T")[0],
        pme_name: "",
        partner_name: "",
        sector: "",
        destination_country: "",
        contract_value: 0,
        currency: "€",
        status: "En négociation",
        social_impact: "",
      });
    }
  }, [connection, form]);

  const handleCompanySelect = (companyId: string) => {
    form.setValue("company_id", companyId);
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      form.setValue("pme_name", company.company_name);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const dataToSave = {
        connection_date: values.connection_date,
        pme_name: values.pme_name,
        company_id: values.company_id || null,
        partner_name: values.partner_name,
        sector: values.sector,
        destination_country: values.destination_country,
        contract_value: values.contract_value,
        currency: values.currency,
        status: values.status,
        contract_duration_years: values.contract_duration_years || null,
        jobs_created: values.jobs_created || null,
        social_impact: values.social_impact || null,
        created_by: user?.id || null,
      };

      if (connection) {
        const { error } = await supabase
          .from("business_connections")
          .update(dataToSave)
          .eq("id", connection.id);

        if (error) throw error;
        toast({ title: "Mise en relation mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("business_connections")
          .insert([dataToSave]);

        if (error) throw error;
        toast({ title: "Mise en relation créée avec succès" });
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
            {connection ? "Modifier la mise en relation" : "Nouvelle mise en relation B2B"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="connection_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de connexion</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sélectionner une PME (optionnel)</FormLabel>
                    <Select onValueChange={handleCompanySelect} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une PME existante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pme_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la PME</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du partenaire / Acheteur</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contract_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur du contrat</FormLabel>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En négociation">En négociation</SelectItem>
                        <SelectItem value="Contrat signé">Contrat signé</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
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
                name="contract_duration_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée du contrat (années)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobs_created"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emplois créés</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="social_impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impact social</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Décrivez l'impact social de cette mise en relation..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {loading ? "Enregistrement..." : connection ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
