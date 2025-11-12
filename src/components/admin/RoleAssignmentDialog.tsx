import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings2, CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

type AppRole = 'admin' | 'manager' | 'user';
type AppModule = 'companies' | 'projects' | 'documents' | 'events' | 'trainings' | 'kpis' | 'market_development' | 'partnerships' | 'media' | 'collaborators' | 'imputations' | 'suivi_evaluation';

const MODULES: { value: AppModule; label: string }[] = [
  { value: 'companies', label: 'Entreprises' },
  { value: 'projects', label: 'Projets' },
  { value: 'documents', label: 'Documents' },
  { value: 'events', label: 'Événements' },
  { value: 'trainings', label: 'Formations' },
  { value: 'kpis', label: 'KPIs' },
  { value: 'market_development', label: 'Développement Marchés' },
  { value: 'partnerships', label: 'Partenariats' },
  { value: 'media', label: 'Médias' },
  { value: 'collaborators', label: 'Collaborateurs' },
  { value: 'imputations', label: 'Imputations' },
  { value: 'suivi_evaluation', label: 'Suivi et Évaluation' },
];

interface RoleAssignmentDialogProps {
  userId: string;
  userEmail: string;
}

export function RoleAssignmentDialog({ userId, userEmail }: RoleAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<Record<AppModule, AppRole | null>>({
    companies: null,
    projects: null,
    documents: null,
    events: null,
    trainings: null,
    kpis: null,
    market_development: null,
    partnerships: null,
    media: null,
    collaborators: null,
    imputations: null,
    suivi_evaluation: null,
  });
  const [bulkRole, setBulkRole] = useState<AppRole | 'none'>('none');
  const [selectedForBulk, setSelectedForBulk] = useState<Set<AppModule>>(new Set());
  const queryClient = useQueryClient();

  // Fetch directions
  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing assignments
  const { data: existingAssignments } = useQuery({
    queryKey: ['roleAssignments', userId, selectedDirection],
    queryFn: async () => {
      if (!selectedDirection) return [];
      const { data, error } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', userId)
        .eq('direction_id', selectedDirection);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  // Update selected modules when assignments are loaded
  useEffect(() => {
    if (existingAssignments) {
      const newModules = { ...selectedModules };
      existingAssignments.forEach((assignment) => {
        newModules[assignment.module as AppModule] = assignment.role as AppRole;
      });
      setSelectedModules(newModules);
    }
  }, [existingAssignments]);

  const saveAssignments = useMutation({
    mutationFn: async () => {
      if (!selectedDirection) throw new Error('Veuillez sélectionner une direction');

      // Get old assignments for history
      const { data: oldAssignments } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', userId)
        .eq('direction_id', selectedDirection);

      // Delete existing assignments for this user and direction
      await supabase
        .from('user_role_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('direction_id', selectedDirection);

      // Insert new assignments
      const assignments = Object.entries(selectedModules)
        .filter(([_, role]) => role !== null)
        .map(([module, role]) => ({
          user_id: userId,
          direction_id: selectedDirection,
          module: module as AppModule,
          role: role as AppRole,
        }));

      if (assignments.length > 0) {
        const { error } = await supabase
          .from('user_role_assignments')
          .insert(assignments as any);
        if (error) throw error;
      }

      // Log permission changes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const historyEntries = assignments.map((assignment) => {
          const oldAssignment = oldAssignments?.find(
            (old: any) => old.module === assignment.module
          );
          return {
            user_id: user.id,
            target_user_id: userId,
            action: oldAssignment ? 'Modification permission' : 'Ajout permission',
            direction_id: selectedDirection,
            module: assignment.module,
            old_role: oldAssignment?.role || null,
            new_role: assignment.role,
          };
        });

        if (historyEntries.length > 0) {
          await supabase.from('permission_history').insert(historyEntries as any);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allRoleAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['permissionHistory'] });
      toast.success('Permissions mises à jour avec succès');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour des permissions');
    },
  });

  const handleModuleRoleChange = (module: AppModule, role: AppRole | 'none') => {
    setSelectedModules((prev) => ({
      ...prev,
      [module]: role === 'none' ? null : role,
    }));
  };

  const toggleModuleForBulk = (module: AppModule) => {
    const newSelected = new Set(selectedForBulk);
    if (newSelected.has(module)) {
      newSelected.delete(module);
    } else {
      newSelected.add(module);
    }
    setSelectedForBulk(newSelected);
  };

  const applyBulkRole = () => {
    if (bulkRole === 'none' || selectedForBulk.size === 0) {
      toast.error('Sélectionnez des modules et un rôle');
      return;
    }

    const newModules = { ...selectedModules };
    selectedForBulk.forEach((module) => {
      newModules[module] = bulkRole as AppRole;
    });
    setSelectedModules(newModules);
    setSelectedForBulk(new Set());
    setBulkRole('none');
    toast.success(`Rôle ${bulkRole} appliqué à ${selectedForBulk.size} module(s)`);
  };

  const selectAllModules = () => {
    if (selectedForBulk.size === MODULES.length) {
      setSelectedForBulk(new Set());
    } else {
      setSelectedForBulk(new Set(MODULES.map(m => m.value)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Gérer permissions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer les permissions</DialogTitle>
          <DialogDescription>
            Attribuez des rôles par module et direction pour {userEmail}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={selectedDirection} onValueChange={setSelectedDirection}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une direction" />
              </SelectTrigger>
              <SelectContent>
                {directions?.map((direction) => (
                  <SelectItem key={direction.id} value={direction.id}>
                    {direction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDirection && (
            <div className="space-y-6">
              {/* Bulk assignment section */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Attribution en masse</h3>
                  </div>
                  <Badge variant="secondary">
                    {selectedForBulk.size} module(s) sélectionné(s)
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllModules}
                  >
                    {selectedForBulk.size === MODULES.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </Button>
                  <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as AppRole | 'none')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="none">Choisir rôle</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={applyBulkRole}
                    disabled={bulkRole === 'none' || selectedForBulk.size === 0}
                  >
                    Appliquer
                  </Button>
                </div>
              </div>

              {/* Individual module permissions */}
              <div className="space-y-4">
                <h3 className="font-semibold">Permissions par module</h3>
                <div className="grid gap-3">
                  {MODULES.map((module) => (
                    <div key={module.value} className="flex items-center gap-3 border rounded-lg p-3">
                      <Checkbox
                        checked={selectedForBulk.has(module.value)}
                        onCheckedChange={() => toggleModuleForBulk(module.value)}
                      />
                      <Label className="flex-1 font-medium cursor-pointer" onClick={() => toggleModuleForBulk(module.value)}>
                        {module.label}
                      </Label>
                      <Select
                        value={selectedModules[module.value] || 'none'}
                        onValueChange={(value) => handleModuleRoleChange(module.value, value as AppRole | 'none')}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Aucun accès" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-popover">
                          <SelectItem value="none">Aucun accès</SelectItem>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => saveAssignments.mutate()} disabled={!selectedDirection}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
