import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone } from "lucide-react";

interface CompanyTableProps {
  companies: any[];
  isLoading: boolean;
  onEdit: (company: any) => void;
}

export function CompanyTable({ companies, isLoading, onEdit }: CompanyTableProps) {
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
            <TableHead>Secteur</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Statut export</TableHead>
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
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(company)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
