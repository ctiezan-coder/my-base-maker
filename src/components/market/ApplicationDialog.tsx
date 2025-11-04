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
  company_id: z.string().min(1, "La PME est requise"),
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

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-for-application"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_name, activity_sector")
        .order("company_name");

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
          notes: values.notes,
          created_by: user.id,
        }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("Cette PME a déjà postulé à cette opportunité");
        }
        throw error;
      }

      toast({ title: "Candidature enregistrée avec succès" });
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Postuler à l'opportunité</DialogTitle>
          <p className="text-sm text-muted-foreground">{opportunityTitle}</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PME candidate</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une PME" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.company_name}
                          {company.activity_sector && ` - ${company.activity_sector}`}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Informations complémentaires sur la candidature..."
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
              <Button type="submit" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer la candidature"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
