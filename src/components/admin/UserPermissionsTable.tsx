import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Shield } from "lucide-react";
import { UserPermissionsDialog } from "./UserPermissionsDialog";

interface User {
  user_id: string;
  full_name: string;
  email: string;
  direction_id: string | null;
  directions: { id: string; name: string } | null;
  roles: string[];
  assignments: any[];
}

interface UserPermissionsTableProps {
  users: User[];
  isLoading: boolean;
}

export function UserPermissionsTable({ users, isLoading }: UserPermissionsTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun utilisateur trouvé
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Accès</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const highestRole =
                user.roles.includes("admin")
                  ? "admin"
                  : user.roles.includes("manager")
                  ? "manager"
                  : "user";

              const uniqueDirections = new Set(
                user.assignments.map((a: any) => a.directions?.name).filter(Boolean)
              );

              return (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {user.directions?.name || (
                      <span className="text-muted-foreground">Non définie</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(highestRole)}>
                      {highestRole === "admin"
                        ? "Administrateur"
                        : highestRole === "manager"
                        ? "Manager"
                        : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {uniqueDirections.size > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Array.from(uniqueDirections)
                          .slice(0, 2)
                          .map((dir) => (
                            <Badge key={dir} variant="outline" className="text-xs">
                              {dir}
                            </Badge>
                          ))}
                        {uniqueDirections.size > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{uniqueDirections.size - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Aucun accès
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gérer
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserPermissionsDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}
    </>
  );
}
