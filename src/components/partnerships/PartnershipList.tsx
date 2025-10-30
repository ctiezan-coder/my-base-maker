import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PartnershipListProps {
  partnerships: any[];
  isLoading: boolean;
  onEdit: (partnership: any) => void;
}

const statusColors = {
  "actif": "default",
  "en négociation": "secondary",
  "suspendu": "destructive",
} as const;

export function PartnershipList({ partnerships, isLoading, onEdit }: PartnershipListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!partnerships || partnerships.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun partenariat trouvé
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partenaire</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partnerships.map((partnership) => (
            <TableRow key={partnership.id}>
              <TableCell className="font-medium">
                {partnership.partner_name}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{partnership.partner_type || "Non spécifié"}</Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {partnership.contact_email && (
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="w-3 h-3" />
                      {partnership.contact_email}
                    </div>
                  )}
                  {partnership.contact_phone && (
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="w-3 h-3" />
                      {partnership.contact_phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {partnership.start_date && format(new Date(partnership.start_date), "MMM yyyy", { locale: fr })}
                {partnership.end_date && ` - ${format(new Date(partnership.end_date), "MMM yyyy", { locale: fr })}`}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[partnership.status as keyof typeof statusColors] || "default"}>
                  {partnership.status || "Non défini"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(partnership)}>
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
