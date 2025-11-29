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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const leaveSchema = z.object({
  leave_type: z.enum(["Congé annuel", "Congé maladie", "Congé maternité", "Congé paternité", "Permission", "Autre"]),
  start_date: z.date({ required_error: "La date de début est requise" }),
  end_date: z.date({ required_error: "La date de fin est requise" }),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.end_date >= data.start_date, {
  message: "La date de fin doit être après ou égale à la date de début",
  path: ["end_date"],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface EmployeeLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeLeaveRequestDialog({ open, onOpenChange }: EmployeeLeaveRequestDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [totalDays, setTotalDays] = useState<number>(0);

  const { data: employee } = useQuery({
    queryKey: ["employee-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type: "Congé annuel",
      start_date: undefined,
      end_date: undefined,
      reason: "",
      notes: "",
    },
  });

  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");

  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate) + 1;
      setTotalDays(days);
    } else {
      setTotalDays(0);
    }
  }, [startDate, endDate]);

  const mutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      if (!employee?.id) {
        throw new Error("Profil employé non trouvé");
      }

      const payload = {
        employee_id: employee.id,
        leave_type: data.leave_type,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        end_date: format(data.end_date, "yyyy-MM-dd"),
        total_days: totalDays,
        reason: data.reason || null,
        notes: data.notes || null,
        status: "En attente" as const,
      };

      const { error } = await supabase.from("leave_requests").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave_requests"] });
      toast.success("Demande de congé soumise avec succès");
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Erreur lors de la soumission de la demande");
    },
  });

  const onSubmit = (data: LeaveFormData) => {
    mutation.mutate(data);
  };

  if (!employee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de congé</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Votre profil employé n'est pas configuré. Veuillez contacter les Ressources Humaines.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle demande de congé</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < (startDate || new Date())}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {totalDays > 0 && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                Durée totale : <strong>{totalDays} jour{totalDays > 1 ? 's' : ''}</strong>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Motif de votre demande..." />
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
                  <FormLabel>Notes additionnelles</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Informations complémentaires..." />
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
                {mutation.isPending ? "Envoi..." : "Soumettre la demande"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
