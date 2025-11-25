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

const leaveSchema = z.object({
  employee_id: z.string().min(1, "L'employé est requis"),
  leave_type: z.enum(["Congé annuel", "Congé maladie", "Congé maternité", "Congé paternité", "Permission", "Autre"]),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
  total_days: z.string().min(1, "Le nombre de jours est requis"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: any;
}

export function LeaveRequestDialog({ open, onOpenChange, leave }: LeaveRequestDialogProps) {
  const queryClient = useQueryClient();

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number")
        .order("last_name");
      return data || [];
    },
  });

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: leave ? {
      ...leave,
      total_days: leave.total_days?.toString(),
    } : {
      employee_id: "",
      leave_type: "Congé annuel",
      start_date: "",
      end_date: "",
      total_days: "",
      reason: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const payload = {
        ...data,
        total_days: parseFloat(data.total_days),
        status: "En attente" as const,
      };

      if (leave) {
        const { error } = await supabase
          .from("leave_requests")
          .update(payload)
          .eq("id", leave.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("leave_requests").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave_requests"] });
      toast.success(leave ? "Demande modifiée" : "Demande créée");
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la demande");
    },
  });

  const onSubmit = (data: LeaveFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {leave ? "Modifier la demande" : "Nouvelle demande de congé"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employé *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un employé" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name} ({employee.employee_number})
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
              name="leave_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de congé *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Congé annuel">Congé annuel</SelectItem>
                      <SelectItem value="Congé maladie">Congé maladie</SelectItem>
                      <SelectItem value="Congé maternité">Congé maternité</SelectItem>
                      <SelectItem value="Congé paternité">Congé paternité</SelectItem>
                      <SelectItem value="Permission">Permission</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de jours *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
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
                    <Textarea {...field} rows={2} />
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
