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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

export function PermissionHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['permissionHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_history')
        .select(`
          *,
          user:user_id(full_name, email),
          target_user:target_user_id(full_name, email),
          direction:direction_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucun historique de permissions</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Administrateur</TableHead>
            <TableHead>Utilisateur cible</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Ancien rôle</TableHead>
            <TableHead>Nouveau rôle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell className="text-xs">
                {format(new Date(entry.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
              </TableCell>
              <TableCell>
                <div className="text-sm">{entry.user?.full_name}</div>
                <div className="text-xs text-muted-foreground">{entry.user?.email}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{entry.target_user?.full_name}</div>
                <div className="text-xs text-muted-foreground">{entry.target_user?.email}</div>
              </TableCell>
              <TableCell className="text-sm">{entry.direction?.name || '-'}</TableCell>
              <TableCell className="text-sm">{entry.action}</TableCell>
              <TableCell>
                {entry.module ? (
                  <Badge variant="outline" className="text-xs">
                    {entry.module}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {entry.old_role ? (
                  <Badge variant="secondary" className="text-xs">
                    {entry.old_role}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {entry.new_role ? (
                  <Badge variant="default" className="text-xs">
                    {entry.new_role}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
