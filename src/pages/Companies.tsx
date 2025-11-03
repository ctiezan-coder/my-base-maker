import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Building2, Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { BulkImportDialog } from "@/components/companies/BulkImportDialog";
import { useToast } from "@/hooks/use-toast";
import type { Company } from "@/types/company";

export default function Companies() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCompany(null);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (company: Company) => {
    // Confirmation avant suppression
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'entreprise "${company.company_name}" ?\n\n` +
      `Cette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", company.id);

      if (error) throw error;

      toast({ 
        title: "Opérateur supprimé avec succès",
        description: `${company.company_name} a été supprimé de la base de données.`
      });
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression",
        description: errorMessage,
      });
    }
  };

  const handleExportExcel = () => {
    if (!companies || companies.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune donnée à exporter",
        description: "La liste des entreprises est vide",
      });
      return;
    }

    const exportData = companies.map(company => ({
      "Entreprise": company.company_name,
      "Forme juridique": company.legal_form || "N/A",
      "RCCM": company.rccm_number,
      "DFE": company.dfe_number,
      "Secteur": company.activity_sector || "N/A",
      "Produits": company.exported_products || "N/A",
      "Ville": company.city || "N/A",
      "Adresse": company.headquarters_location || "N/A",
      "Email": company.email || "N/A",
      "Téléphone": company.phone || "N/A",
      "Site web": company.website || "N/A",
      "Contact": company.legal_representative_name || "N/A",
      "Email contact": company.legal_representative_email || "N/A",
      "Tél. contact": company.legal_representative_phone || "N/A",
      "Statut": company.accompaniment_status || "N/A",
      "Date création": company.created_at ? new Date(company.created_at).toLocaleDateString('fr-FR') : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entreprises");
    
    XLSX.writeFile(wb, `entreprises-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export réussi",
      description: `${companies.length} entreprises exportées`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Opérateurs Économiques
          </h1>
          <p className="text-muted-foreground mt-1">
            Base de données unifiée des entreprises accompagnées
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={!companies || companies.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exporter Excel
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import en masse
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel opérateur
          </Button>
        </div>
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
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={selectedCompany}
        onClose={handleCloseDialog}
      />

      <BulkImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
