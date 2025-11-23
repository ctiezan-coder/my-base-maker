import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Building2, Upload, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { BulkImportDialog } from "@/components/companies/BulkImportDialog";
import { useToast } from "@/hooks/use-toast";
import type { Company } from "@/types/company";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

const ITEMS_PER_PAGE = 15;

export default function Companies() {
  const { toast } = useToast();
  const { canAccess: canManageCompanies } = useCanAccessModule("companies", "manager");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sector: "all",
    participation: "all",
    support: {
      financier: false,
      nonFinancier: false,
      autres: false,
      autresText: "",
    },
  });

  const { data: companiesData, isLoading, refetch } = useQuery({
    queryKey: ["companies", search, currentPage, filters],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("companies")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (search) {
        query = query.or(`company_name.ilike.%${search}%,rccm_number.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (filters.sector !== "all") {
        query = query.ilike("activity_sector", filters.sector);
      }

      if (filters.participation !== "all") {
        query = query.eq("commercial_events_participation", filters.participation as any);
      }

      if (filters.support.financier || filters.support.nonFinancier || filters.support.autres) {
        const supportValues = [];
        if (filters.support.financier) supportValues.push("Financier");
        if (filters.support.nonFinancier) supportValues.push("Non financier");
        if (filters.support.autres && filters.support.autresText) {
          query = query.ilike("support_needed", `%${filters.support.autresText}%`);
        } else if (supportValues.length > 0) {
          query = query.in("support_needed", supportValues);
        }
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { companies: data, total: count || 0 };
    },
  });

  // Charger les secteurs uniques depuis la base de données
  const { data: sectorsData } = useQuery({
    queryKey: ["unique-sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("activity_sector")
        .not("activity_sector", "is", null)
        .order("activity_sector");
      
      if (error) throw error;
      
      // Extraire les secteurs uniques
      const uniqueSectors = Array.from(
        new Set(data.map(c => c.activity_sector).filter(Boolean))
      ).sort();
      
      return uniqueSectors;
    },
  });

  const allCompanies = companiesData?.companies || [];
  
  // Éliminer les doublons basés sur le RCCM ET le nom (garder la première occurrence)
  const companies = allCompanies.reduce((acc: any[], company: any) => {
    const isDuplicate = acc.find(c => 
      c.rccm_number === company.rccm_number || 
      c.company_name.toLowerCase().trim() === company.company_name.toLowerCase().trim()
    );
    if (!isDuplicate) {
      acc.push(company);
    }
    return acc;
  }, []);
  
  const totalPages = Math.ceil((companiesData?.total || 0) / ITEMS_PER_PAGE);
  const availableSectors = sectorsData || [];

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const handleCloseDialog = async () => {
    setSelectedCompany(null);
    setDialogOpen(false);
    await refetch();
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
      "Compte Contribuables": company.dfe_number,
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

  const resetFilters = () => {
    setFilters({ 
      sector: "all", 
      participation: "all", 
      support: {
        financier: false,
        nonFinancier: false,
        autres: false,
        autresText: "",
      }
    });
    setCurrentPage(1);
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
          {canManageCompanies && (
            <>
              <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import en masse
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel opérateur
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, RCCM ou email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secteur d'activité</label>
                  <Select
                    value={filters.sector}
                    onValueChange={(value) => {
                      setFilters({ ...filters, sector: value });
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les secteurs" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="all">Tous les secteurs</SelectItem>
                      {availableSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Participation événements</label>
                  <Select
                    value={filters.participation}
                    onValueChange={(value) => {
                      setFilters({ ...filters, participation: value });
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="Jamais">Jamais</SelectItem>
                      <SelectItem value="Foires">Foires</SelectItem>
                      <SelectItem value="Salons">Salons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type d'accompagnement</label>
                  <div className="space-y-3 p-3 border rounded-lg bg-background">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-financier"
                        checked={filters.support.financier}
                        onCheckedChange={(checked) => {
                          setFilters({ 
                            ...filters, 
                            support: { ...filters.support, financier: checked as boolean }
                          });
                          setCurrentPage(1);
                        }}
                      />
                      <label htmlFor="filter-financier" className="text-sm cursor-pointer font-normal">
                        Financier
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-nonFinancier"
                        checked={filters.support.nonFinancier}
                        onCheckedChange={(checked) => {
                          setFilters({ 
                            ...filters, 
                            support: { ...filters.support, nonFinancier: checked as boolean }
                          });
                          setCurrentPage(1);
                        }}
                      />
                      <label htmlFor="filter-nonFinancier" className="text-sm cursor-pointer font-normal">
                        Non financier
                      </label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-autres"
                          checked={filters.support.autres}
                          onCheckedChange={(checked) => {
                            setFilters({ 
                              ...filters, 
                              support: { ...filters.support, autres: checked as boolean }
                            });
                            setCurrentPage(1);
                          }}
                        />
                        <label htmlFor="filter-autres" className="text-sm cursor-pointer font-normal">
                          Autres
                        </label>
                      </div>
                      {filters.support.autres && (
                        <Input
                          placeholder="Précisez..."
                          value={filters.support.autresText}
                          onChange={(e) => {
                            setFilters({ 
                              ...filters, 
                              support: { ...filters.support, autresText: e.target.value }
                            });
                            setCurrentPage(1);
                          }}
                          className="ml-6"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-full flex justify-end">
                  <Button variant="ghost" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            )}

            {(filters.sector !== "all" || (filters.participation !== "all") || filters.support.financier || filters.support.nonFinancier || filters.support.autres) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                {filters.sector !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Secteur: {filters.sector}
                  </Badge>
                )}
                {filters.participation !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Participation: {filters.participation}
                  </Badge>
                )}
                {filters.support.financier && (
                  <Badge variant="secondary" className="gap-1">
                    Accompagnement: Financier
                  </Badge>
                )}
                {filters.support.nonFinancier && (
                  <Badge variant="secondary" className="gap-1">
                    Accompagnement: Non financier
                  </Badge>
                )}
                {filters.support.autres && (
                  <Badge variant="secondary" className="gap-1">
                    Accompagnement: {filters.support.autresText || "Autres"}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CompanyTable
            companies={companies || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canManage={canManageCompanies}
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({companiesData?.total || 0} entreprises)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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
