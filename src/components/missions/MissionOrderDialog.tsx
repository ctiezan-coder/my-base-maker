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
import { toast } from "sonner";

const missionSchema = z.object({
  mission_number: z.string().min(1, "Le numéro d'ordre est requis"),
  employee_id: z.string().min(1, "L'employé est requis"),
  direction_id: z.string().optional(),
  project_id: z.string().optional(),
  purpose: z.string().min(1, "L'objet de la mission est requis"),
  destination: z.string().min(1, "La destination est requise"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
  duration_days: z.string().min(1, "La durée est requise"),
  estimated_budget: z.string().optional(),
  advance_amount: z.string().optional(),
  status: z.enum(["Brouillon", "En attente validation", "Validée", "En cours", "Terminée", "Annulée"]),
  notes: z.string().optional(),
});

type MissionFormData = z.infer<typeof missionSchema>;

interface MissionOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission?: any;
}

export function MissionOrderDialog({ open, onOpenChange, mission }: MissionOrderDialogProps) {
  const { user } = useAuth();
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

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    defaultValues: mission ? {
      ...mission,
      duration_days: mission.duration_days?.toString(),
      estimated_budget: mission.estimated_budget?.toString(),
      advance_amount: mission.advance_amount?.toString(),
    } : {
      mission_number: "",
      employee_id: "",
      direction_id: "",
      project_id: "",
      purpose: "",
      destination: "",
      start_date: "",
      end_date: "",
      duration_days: "",
      estimated_budget: "",
      advance_amount: "",
      status: "Brouillon",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: MissionFormData) => {
      const payload = {
        ...data,
        duration_days: parseFloat(data.duration_days),
        estimated_budget: data.estimated_budget ? parseFloat(data.estimated_budget) : null,
        advance_amount: data.advance_amount ? parseFloat(data.advance_amount) : null,
        created_by: user!.id,
        direction_id: data.direction_id || null,
        project_id: data.project_id || null,
      };

      if (mission) {
        const { error } = await supabase
          .from("mission_orders")
          .update(payload)
          .eq("id", mission.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mission_orders").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission_orders"] });
      toast.success(mission ? "Ordre de mission modifié" : "Ordre de mission créé");
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error saving mission:", error);
      toast.error("Erreur lors de l'enregistrement de l'ordre de mission");
    },
  });

  const onSubmit = (data: MissionFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mission ? "Modifier l'ordre de mission" : "Nouvel ordre de mission"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mission_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'ordre *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            {employee.first_name} {employee.last_name}
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

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet de la mission *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination *</FormLabel>
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
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (jours) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimated_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget estimé</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advance_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant d'avance</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Brouillon">Brouillon</SelectItem>
                        <SelectItem value="En attente validation">En attente validation</SelectItem>
                        <SelectItem value="Validée">Validée</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Terminée">Terminée</SelectItem>
                        <SelectItem value="Annulée">Annulée</SelectItem>
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
