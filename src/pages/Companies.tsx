import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Building2 } from "lucide-react";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { CompanyTable } from "@/components/companies/CompanyTable";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ["companies", search],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`company_name.ilike.%${search}%,rccm_number.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCompany(null);
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Entreprises Exportatrices
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion du répertoire des entreprises accompagnées
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entreprise
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, RCCM ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CompanyTable
            companies={companies || []}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={selectedCompany}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
