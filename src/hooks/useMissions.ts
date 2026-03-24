import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MissionOrder, MissionStats, MissionValidation, MissionExpense, MissionReport, PerDiemRate } from "@/types/mission";
import { toast } from "sonner";

export function useMissions() {
  const queryClient = useQueryClient();

  const { data: missions, isLoading } = useQuery({
    queryKey: ['mission_orders_full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_orders')
        .select(`
          *,
          employee:employees!mission_orders_employee_id_fkey(id, first_name, last_name, employee_number, position),
          direction:directions(id, name),
          project:projects(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MissionOrder[];
    }
  });

  const stats: MissionStats = useMemo(() => ({
    total: missions?.length || 0,
    brouillon: missions?.filter(m => m.extended_status === 'Brouillon').length || 0,
    enValidation: missions?.filter(m => ['En validation N1', 'En validation DAF', 'En validation DG', 'Soumise'].includes(m.extended_status || '')).length || 0,
    approuvees: missions?.filter(m => m.extended_status === 'Approuvée').length || 0,
    enCours: missions?.filter(m => m.extended_status === 'En cours').length || 0,
    terminees: missions?.filter(m => m.extended_status === 'Terminée').length || 0,
    enAttenteRapport: missions?.filter(m => m.extended_status === 'En attente rapport').length || 0,
    enLiquidation: missions?.filter(m => ['En liquidation', 'Liquidée'].includes(m.extended_status || '')).length || 0,
    nationales: missions?.filter(m => m.mission_type === 'Nationale').length || 0,
    internationales: missions?.filter(m => m.mission_type === 'Internationale').length || 0,
    budgetTotal: missions?.reduce((acc, m) => acc + (m.estimated_budget || 0), 0) || 0,
    budgetConsomme: missions?.reduce((acc, m) => acc + (m.actual_cost || 0), 0) || 0,
  }), [missions]);

  return { missions, isLoading, stats };
}

export function useMissionDetails(missionId: string | null) {
  return useQuery({
    queryKey: ['mission_order', missionId],
    queryFn: async () => {
      if (!missionId) return null;
      const { data, error } = await supabase
        .from('mission_orders')
        .select(`
          *,
          employee:employees!mission_orders_employee_id_fkey(*),
          direction:directions(*),
          project:projects(*)
        `)
        .eq('id', missionId)
        .single();
      
      if (error) throw error;
      return data as MissionOrder;
    },
    enabled: !!missionId
  });
}

export function useMissionValidations(missionId: string | null) {
  return useQuery({
    queryKey: ['mission_validations', missionId],
    queryFn: async () => {
      if (!missionId) return [];
      const { data, error } = await supabase
        .from('mission_validations')
        .select('*')
        .eq('mission_id', missionId)
        .order('validation_level');
      
      if (error) throw error;
      return data as MissionValidation[];
    },
    enabled: !!missionId
  });
}

export function useMissionExpenses(missionId: string | null) {
  return useQuery({
    queryKey: ['mission_expenses', missionId],
    queryFn: async () => {
      if (!missionId) return [];
      const { data, error } = await supabase
        .from('mission_expenses')
        .select('*')
        .eq('mission_id', missionId)
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      return data as MissionExpense[];
    },
    enabled: !!missionId
  });
}

export function useMissionItineraries(missionId: string | null) {
  return useQuery({
    queryKey: ['mission_itineraries', missionId],
    queryFn: async () => {
      if (!missionId) return [];
      const { data, error } = await supabase
        .from('mission_itineraries')
        .select('*')
        .eq('mission_id', missionId)
        .order('step_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!missionId
  });
}

export function useMissionProgram(missionId: string | null) {
  return useQuery({
    queryKey: ['mission_program_days', missionId],
    queryFn: async () => {
      if (!missionId) return [];
      const { data, error } = await supabase
        .from('mission_program_days')
        .select('*')
        .eq('mission_id', missionId)
        .order('day_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!missionId
  });
}

export function useMissionReports(missionId: string | null) {
  return useQuery({
    queryKey: ['mission_reports', missionId],
    queryFn: async () => {
      if (!missionId) return [];
      const { data, error } = await supabase
        .from('mission_reports')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MissionReport[];
    },
    enabled: !!missionId
  });
}

export function usePerDiemRates() {
  return useQuery({
    queryKey: ['per_diem_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('per_diem_rates')
        .select('*')
        .order('country')
        .order('city');
      
      if (error) throw error;
      return data as PerDiemRate[];
    }
  });
}

export function useMissionAlerts(userId: string | null) {
  return useQuery({
    queryKey: ['mission_alerts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('mission_alerts')
        .select(`
          *,
          mission:mission_orders(mission_number, purpose, destination)
        `)
        .eq('target_user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (missionData: Partial<MissionOrder>) => {
      const { data, error } = await supabase
        .from('mission_orders')
        .insert([missionData as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission_orders_full'] });
      toast.success("Mission créée avec succès");
    },
    onError: (error) => {
      console.error("Error creating mission:", error);
      toast.error("Erreur lors de la création de la mission");
    }
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...missionData }: Partial<MissionOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('mission_orders')
        .update(missionData as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission_orders_full'] });
      queryClient.invalidateQueries({ queryKey: ['mission_order'] });
      toast.success("Mission mise à jour avec succès");
    },
    onError: (error) => {
      console.error("Error updating mission:", error);
      toast.error("Erreur lors de la mise à jour de la mission");
    }
  });
}

export function useSubmitMission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (missionId: string) => {
      const { data, error } = await supabase
        .from('mission_orders')
        .update({ extended_status: 'Soumise' })
        .eq('id', missionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission_orders_full'] });
      queryClient.invalidateQueries({ queryKey: ['mission_order'] });
      toast.success("Mission soumise pour validation");
    },
    onError: (error) => {
      console.error("Error submitting mission:", error);
      toast.error("Erreur lors de la soumission de la mission");
    }
  });
}

export function useValidateMission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      validationId, 
      status, 
      comments,
      missionId,
      nextStatus
    }: { 
      validationId: string; 
      status: 'Approuvé' | 'Rejeté'; 
      comments?: string;
      missionId: string;
      nextStatus: string;
    }) => {
      // Update validation
      const { error: valError } = await supabase
        .from('mission_validations')
        .update({ 
          status, 
          comments,
          validated_at: new Date().toISOString()
        })
        .eq('id', validationId);
      
      if (valError) throw valError;
      
      // Update mission status
      const { error: missionError } = await supabase
        .from('mission_orders')
        .update({ extended_status: nextStatus as any })
        .eq('id', missionId);
      
      if (missionError) throw missionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission_orders_full'] });
      queryClient.invalidateQueries({ queryKey: ['mission_order'] });
      queryClient.invalidateQueries({ queryKey: ['mission_validations'] });
      toast.success("Validation effectuée");
    },
    onError: (error) => {
      console.error("Error validating mission:", error);
      toast.error("Erreur lors de la validation");
    }
  });
}

export function useAddMissionExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseData: Partial<MissionExpense>) => {
      const { data, error } = await supabase
        .from('mission_expenses')
        .insert([expenseData as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission_expenses'] });
      toast.success("Dépense ajoutée");
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast.error("Erreur lors de l'ajout de la dépense");
    }
  });
}
