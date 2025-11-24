import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AccountDialog } from "./AccountDialog";

const entrySchema = z.object({
  entry_number: z.string().min(1, "Le numéro d'écriture est requis"),
  account_id: z.string().min(1, "Le compte est requis"),
  entry_date: z.string().min(1, "La date est requise"),
  entry_type: z.enum(["Débit", "Crédit"]),
  amount: z.string().min(1, "Le montant est requis"),
  description: z.string().min(1, "La description est requise"),
  reference: z.string().optional(),
  direction_id: z.string().optional(),
  project_id: z.string().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: any;
}

export function EntryDialog({ open, onOpenChange, entry }: EntryDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  const { data: accounts } = useQuery({
    queryKey: ["accounting_accounts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("accounting_accounts")
        .select("*")
        .order("account_number");
      return data || [];
    },
  });

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data } = await supabase.from("directions").select("*").order("name");
      return data || [];
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("name");
      return data || [];
    },
  });

  const form = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: entry ? {
      ...entry,
      amount: entry.amount?.toString(),
    } : {
      entry_number: "",
      account_id: "",
      entry_date: new Date().toISOString().split('T')[0],
      entry_type: "Débit",
      amount: "",
      description: "",
      reference: "",
      direction_id: "",
      project_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        created_by: user!.id,
        direction_id: data.direction_id || null,
        project_id: data.project_id || null,
        reference: data.reference || null,
      };

      if (entry) {
        const { error } = await supabase
          .from("accounting_entries")
          .update(payload)
          .eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("accounting_entries").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_entries"] });
      toast.success(entry ? "Écriture modifiée" : "Écriture créée");
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error saving entry:", error);
      toast.error("Erreur lors de l'enregistrement de l'écriture");
    },
  });

  const onSubmit = (data: EntryFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Modifier l'écriture" : "Nouvelle écriture"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entry_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'écriture *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compte *</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_number} - {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsAccountDialogOpen(true)}
                      title="Créer un nouveau compte"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entry_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Débit">Débit</SelectItem>
                        <SelectItem value="Crédit">Crédit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
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
                name="direction_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {directions?.map((direction) => (
                          <SelectItem key={direction.id} value={direction.id}>
                            {direction.name}
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
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    <AccountDialog 
      open={isAccountDialogOpen} 
      onOpenChange={setIsAccountDialogOpen}
    />
  </>
  );
}
