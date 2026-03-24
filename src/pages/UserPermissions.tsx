import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPermissionsTable } from "@/components/admin/UserPermissionsTable";
import { Search, Shield, FileDown } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { sanitizeFilterValue } from "@/lib/utils";

export default function UserPermissions() {
  const [search, setSearch] = useState("");
  const { data: userRole } = useUserRole();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-permissions", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          user_id,
          full_name,
          email,
          direction_id,
          directions (
            id,
            name
          )
        `)
        .order("full_name");

      if (search) {
        query = query.or(
          `full_name.ilike.%${sanitizeFilterValue(search)}%,email.ilike.%${sanitizeFilterValue(search)}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get roles for each user
      const userIds = data.map((u) => u.user_id);
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Get role assignments for each user
      const { data: assignmentsData } = await supabase
        .from("user_role_assignments")
        .select(`
          user_id,
          direction_id,
          module,
          role,
          directions (
            id,
            name
          )
        `)
        .in("user_id", userIds);

      // Map roles and assignments to users
      const rolesMap = new Map();
      rolesData?.forEach((r) => {
        if (!rolesMap.has(r.user_id)) {
          rolesMap.set(r.user_id, []);
        }
        rolesMap.get(r.user_id).push(r.role);
      });

      const assignmentsMap = new Map();
      assignmentsData?.forEach((a) => {
        if (!assignmentsMap.has(a.user_id)) {
          assignmentsMap.set(a.user_id, []);
        }
        assignmentsMap.get(a.user_id).push(a);
      });

      return data.map((u) => ({
        ...u,
        roles: rolesMap.get(u.user_id) || [],
        assignments: assignmentsMap.get(u.user_id) || [],
      }));
    },
    enabled: userRole === 'admin',
  });

  if (userRole !== 'admin') {
    return null;
  }

  const exportToExcel = () => {
    if (!users || users.length === 0) {
      toast.error("Aucun utilisateur à exporter");
      return;
    }

    const exportData = users.map((user) => ({
      "Nom complet": user.full_name,
      "Email": user.email,
      "Direction": user.directions?.name || "N/A",
      "Rôles": user.roles?.join(", ") || "Aucun",
      "Nombre de permissions": user.assignments?.length || 0,
      "Modules autorisés": user.assignments?.map((a: any) => a.module).join(", ") || "Aucun"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");

    const colWidths = [
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 40 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Export Excel réussi");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Gestion des Permissions</h1>
            </div>
            <Button onClick={exportToExcel} className="gap-2">
              <FileDown className="h-4 w-4" />
              Exporter Excel
            </Button>
          </div>
          <p className="text-muted-foreground">
            Gérez les rôles, les accès aux directions et les permissions des utilisateurs
          </p>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <UserPermissionsTable users={users || []} isLoading={isLoading} />
        </Card>
      </div>
    </div>
  );
}
