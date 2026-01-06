import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const budgetSchema = z.object({
  budget_name: z.string().min(1, "Le nom du budget est requis"),
  mission_id: z.string().optional(),
  employee_id: z.string().optional(),
  direction_id: z.string().optional(),
  fiscal_year: z.coerce.number().min(2020).max(2100),
  allocated_amount: z.coerce.number().min(0, "Le montant doit être positif"),
  status: z.string().default("Actif"),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: any;
}

export function BudgetDialog({ open, onOpenChange, budget }: BudgetDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: missions } = useQuery({
    queryKey: ['missions_for_budget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mission_orders')
        .select('id, mission_number, destination, purpose, employee_id')
        .order('mission_number', { ascending: false });
      return data || [];
    }
  });

  const { data: employees } = useQuery({
    queryKey: ['employees_for_budget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .order('first_name');
      return data || [];
    }
  });

  const { data: directions } = useQuery({
    queryKey: ['directions_for_budget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('directions')
        .select('id, name')
        .order('name');
      return data || [];
    }
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget_name: "",
      mission_id: "",
      employee_id: "",
      direction_id: "",
      fiscal_year: new Date().getFullYear(),
      allocated_amount: 0,
      status: "Actif",
      notes: "",
    },
  });

  useEffect(() => {
    if (budget) {
      form.reset({
        budget_name: budget.budget_name || "",
        mission_id: budget.mission_id || "",
        employee_id: budget.employee_id || "",
        direction_id: budget.direction_id || "",
        fiscal_year: budget.fiscal_year || new Date().getFullYear(),
        allocated_amount: budget.allocated_amount || 0,
        status: budget.status || "Actif",
        notes: budget.notes || "",
      });
    } else {
      form.reset({
        budget_name: "",
        mission_id: "",
        employee_id: "",
        direction_id: "",
        fiscal_year: new Date().getFullYear(),
        allocated_amount: 0,
        status: "Actif",
        notes: "",
      });
    }
  }, [budget, form]);

  // Auto-fill employee when mission is selected
  const watchedMissionId = form.watch("mission_id");
  useEffect(() => {
    if (watchedMissionId && missions) {
      const mission = missions.find(m => m.id === watchedMissionId);
      if (mission?.employee_id) {
        form.setValue("employee_id", mission.employee_id);
      }
    }
  }, [watchedMissionId, missions, form]);

  const mutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const payload = {
        budget_name: data.budget_name,
        mission_id: data.mission_id || null,
        employee_id: data.employee_id || null,
        direction_id: data.direction_id || null,
        fiscal_year: data.fiscal_year,
        allocated_amount: data.allocated_amount,
        status: data.status,
        notes: data.notes || null,
        created_by: user?.id,
      };

      if (budget?.id) {
        const { error } = await supabase
          .from('budgets')
          .update(payload)
          .eq('id', budget.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success(budget ? "Budget modifié" : "Budget créé");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Error saving budget:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
  });

  const onSubmit = (data: BudgetFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {budget ? "Modifier le Budget" : "Nouveau Budget"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budget_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du budget *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Budget Mission Dakar" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mission_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission liée</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une mission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucune mission</SelectItem>
                        {missions?.map((mission) => (
                          <SelectItem key={mission.id} value={mission.id}>
                            {mission.mission_number} - {mission.destination}
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
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employé responsable</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un employé" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucun employé</SelectItem>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))}
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
                name="direction_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucune direction</SelectItem>
                        {directions?.map((dir) => (
                          <SelectItem key={dir.id} value={dir.id}>
                            {dir.name}
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
                name="fiscal_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année fiscale *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={2020} max={2100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allocated_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant alloué (FCFA) *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={0} />
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
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Épuisé">Épuisé</SelectItem>
                        <SelectItem value="Clôturé">Clôturé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Remarques..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
