import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";

const accountSchema = z.object({
  account_number: z.string().min(1, "Le numéro de compte est requis"),
  account_name: z.string().min(1, "Le nom du compte est requis"),
  account_type: z.enum(["Actif", "Passif", "Capitaux propres", "Produits", "Charges"]),
  parent_account_id: z.string().optional(),
  balance: z.string().default("0"),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: any;
}

export function AccountDialog({ open, onOpenChange, account }: AccountDialogProps) {
  const queryClient = useQueryClient();

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

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account ? {
      ...account,
      balance: account.balance?.toString() || "0",
    } : {
      account_number: "",
      account_name: "",
      account_type: "Actif",
      parent_account_id: "",
      balance: "0",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const payload = {
        ...data,
        balance: parseFloat(data.balance),
        parent_account_id: data.parent_account_id || null,
      };

      if (account) {
        const { error } = await supabase
          .from("accounting_accounts")
          .update(payload)
          .eq("id", account.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("accounting_accounts").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
      toast.success(account ? "Compte modifié" : "Compte créé");
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error saving account:", error);
      toast.error("Erreur lors de l'enregistrement du compte");
    },
  });

  const onSubmit = (data: AccountFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? "Modifier le compte" : "Nouveau compte"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de compte *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du compte *</FormLabel>
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
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de compte *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Passif">Passif</SelectItem>
                        <SelectItem value="Capitaux propres">Capitaux propres</SelectItem>
                        <SelectItem value="Produits">Produits</SelectItem>
                        <SelectItem value="Charges">Charges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compte parent</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.filter(a => a.id !== account?.id).map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.account_number} - {acc.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solde</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
  );
}
