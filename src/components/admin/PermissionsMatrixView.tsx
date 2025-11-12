import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

type AppModule = 'companies' | 'projects' | 'documents' | 'events' | 'trainings' | 'kpis' | 'market_development' | 'partnerships' | 'media' | 'collaborators';
type AppRole = 'admin' | 'manager' | 'user';

const MODULES: { value: AppModule; label: string }[] = [
  { value: 'companies', label: 'Entreprises' },
  { value: 'projects', label: 'Projets' },
  { value: 'documents', label: 'Documents' },
  { value: 'events', label: 'Événements' },
  { value: 'trainings', label: 'Formations' },
  { value: 'kpis', label: 'KPIs' },
  { value: 'market_development', label: 'Marchés' },
  { value: 'partnerships', label: 'Partenariats' },
  { value: 'media', label: 'Médias' },
  { value: 'collaborators', label: 'Collaborateurs' },
];

const getRoleBadgeVariant = (role: AppRole | null) => {
  if (!role) return "outline";
  switch (role) {
    case "admin": return "destructive";
    case "manager": return "default";
    case "user": return "secondary";
    default: return "outline";
  }
};

export function PermissionsMatrixView() {
  const [selectedDirection, setSelectedDirection] = useState<string>("");

  const { data: directions, isLoading: loadingDirections } = useQuery({
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

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      return profiles || [];
    },
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['allRoleAssignments', selectedDirection],
    queryFn: async () => {
      if (!selectedDirection) return [];
      const { data, error } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('direction_id', selectedDirection);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  const getUserModuleRole = (userId: string, module: AppModule): AppRole | null => {
    const assignment = assignments?.find(
      (a) => a.user_id === userId && a.module === module
    );
    return assignment?.role as AppRole || null;
  };

  if (loadingDirections || loadingUsers) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedDirection} onValueChange={setSelectedDirection}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Sélectionner une direction" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-popover">
            {directions?.map((direction) => (
              <SelectItem key={direction.id} value={direction.id}>
                {direction.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDirection && (
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                  Utilisateur
                </TableHead>
                {MODULES.map((module) => (
                  <TableHead key={module.value} className="text-center min-w-[120px]">
                    {module.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAssignments ? (
                <TableRow>
                  <TableCell colSpan={MODULES.length + 1}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                      {user.full_name}
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </TableCell>
                    {MODULES.map((module) => {
                      const role = getUserModuleRole(user.user_id, module.value);
                      return (
                        <TableCell key={module.value} className="text-center">
                          {role ? (
                            <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
                              {role}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={MODULES.length + 1} className="text-center text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      {!selectedDirection && (
        <div className="text-center py-12 text-muted-foreground">
          Sélectionnez une direction pour voir la matrice des permissions
        </div>
      )}
    </div>
  );
}
