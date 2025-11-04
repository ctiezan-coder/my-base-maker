import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/types/company";

const formSchema = z.object({
  company_id: z.string().min(1, "Veuillez sélectionner une PME"),
  notes: z.string().optional(),
});

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
}

export const ApplicationDialog = ({
  open,
  onOpenChange,
  opportunityId,
  opportunityTitle,
  onClose,
}: ApplicationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-for-application"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name, activity_sector, exported_products")
        .order("company_name");

      if (error) throw error;
      return data as Company[];
    },
  });

  // Check existing applications
  const { data: existingApplications = [] } = useQuery({
    queryKey: ["existing-applications", opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_applications")
        .select("company_id")
        .eq("opportunity_id", opportunityId);

      if (error) throw error;
      return data.map(app => app.company_id);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Vous devez être connecté");
      }

      const { error } = await supabase
        .from("opportunity_applications")
        .insert([{
          opportunity_id: opportunityId,
          company_id: values.company_id,
          notes: values.notes || null,
          status: "En attente",
          created_by: user.id,
        }]);

      if (error) throw error;
      
      toast({ 
        title: "Candidature envoyée avec succès",
        description: "La PME a été ajoutée à l'opportunité"
      });

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

  const availableCompanies = companies.filter(
    company => !existingApplications.includes(company.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Candidater à l'opportunité</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {opportunityTitle}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sélectionner une PME</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une entreprise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCompanies.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Toutes les PME ont déjà postulé
                        </div>
                      ) : (
                        availableCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div>
                              <div className="font-medium">{company.company_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {company.activity_sector}
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Informations complémentaires..."
                    />
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
              <Button 
                type="submit" 
                disabled={loading || availableCompanies.length === 0}
              >
                {loading ? "Envoi..." : "Envoyer la candidature"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
