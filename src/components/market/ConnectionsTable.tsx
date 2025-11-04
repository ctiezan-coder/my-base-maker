import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BusinessConnection } from "@/types/market-development";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConnectionsTableProps {
  connections: BusinessConnection[];
}

export const ConnectionsTable = ({ connections }: ConnectionsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Contrat signé":
        return "default";
      case "En négociation":
        return "secondary";
      case "En cours":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>PME</TableHead>
            <TableHead>Partenaire</TableHead>
            <TableHead>Secteur</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Valeur</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Aucune mise en relation trouvée
              </TableCell>
            </TableRow>
          ) : (
            connections.map((connection) => (
              <TableRow key={connection.id}>
                <TableCell>
                  {format(new Date(connection.connection_date), "dd MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="font-medium">{connection.pme_name}</TableCell>
                <TableCell>{connection.partner_name}</TableCell>
                <TableCell>{connection.sector}</TableCell>
                <TableCell>{connection.destination_country}</TableCell>
                <TableCell className="font-medium">
                  {connection.contract_value.toLocaleString()} {connection.currency}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(connection.status)}>
                    {connection.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
