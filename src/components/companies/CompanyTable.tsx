import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { CompanyDetailsDialogEnriched } from "./CompanyDetailsDialogEnriched";

interface CompanyTableProps {
  companies: any[];
  isLoading: boolean;
  onEdit: (company: any) => void;
  onDelete: (company: any) => void;
  canManage?: boolean;
}

export function CompanyTable({ companies, isLoading, onEdit, onDelete, canManage = false }: CompanyTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const handleDeleteClick = (company: any) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (companyToDelete) {
      onDelete(companyToDelete);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleViewDetails = (company: any) => {
    setSelectedCompany(company);
    setDetailsDialogOpen(true);
  };
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune entreprise trouvée
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Raison sociale</TableHead>
            <TableHead>RCCM</TableHead>
            <TableHead>Secteur d'activité</TableHead>
            <TableHead>Produits exportés</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Participation événements</TableHead>
            <TableHead>Type d'accompagnement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">
                {company.company_name}
                {company.trade_name && (
                  <span className="text-xs text-muted-foreground block">
                    ({company.trade_name})
                  </span>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">{company.rccm_number}</TableCell>
              <TableCell>{company.activity_sector || "-"}</TableCell>
              <TableCell>
                <span className="text-sm max-w-[200px] truncate block" title={company.exported_products || "-"}>
                  {company.exported_products || "-"}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {company.email && (
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="w-3 h-3" />
                      {company.email}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="w-3 h-3" />
                      {company.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={company.commercial_events_participation === "Jamais" ? "secondary" : "default"}>
                  {company.commercial_events_participation || "Non défini"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {company.support_needed || "-"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(company)} title="Voir détails">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canManage && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(company)} title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(company)} title="Supprimer">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'entreprise "{companyToDelete?.company_name}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCompany && (
        <CompanyDetailsDialogEnriched
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          companyId={selectedCompany.id}
          companyName={selectedCompany.company_name}
        />
      )}
    </div>
  );
}
