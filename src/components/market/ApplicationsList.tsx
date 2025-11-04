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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApplicationsListProps {
  opportunityId: string;
}

export const ApplicationsList = ({ opportunityId }: ApplicationsListProps) => {
  const { toast } = useToast();

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ["opportunity-applications", opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_applications")
        .select(`
          *,
          companies:company_id (
            company_name,
            activity_sector,
            email,
            phone
          )
        `)
        .eq("opportunity_id", opportunityId)
        .order("application_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("opportunity_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La candidature a été ${status === "Acceptée" ? "acceptée" : "refusée"}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Acceptée":
        return "default";
      case "Refusée":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Candidatures ({applications.length})
      </h3>

      {applications.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Aucune candidature pour cette opportunité
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PME</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.companies?.company_name}
                  </TableCell>
                  <TableCell>{app.companies?.activity_sector}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {app.companies?.email && (
                        <div>{app.companies.email}</div>
                      )}
                      {app.companies?.phone && (
                        <div className="text-muted-foreground">
                          {app.companies.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(app.application_date), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.status === "En attente" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateApplicationStatus(app.id, "Acceptée")}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateApplicationStatus(app.id, "Refusée")}
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
