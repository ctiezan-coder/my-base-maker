import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CompanyApplication {
  id: string;
  application_date: string;
  status: string;
  notes?: string;
  company: {
    company_name: string;
    activity_sector?: string;
  };
}

interface CompanyApplicationsProps {
  opportunityId: string;
}

export const CompanyApplications = ({ opportunityId }: CompanyApplicationsProps) => {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["opportunity-applications", opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_applications")
        .select(`
          id,
          application_date,
          status,
          notes,
          company:companies(company_name, activity_sector)
        `)
        .eq("opportunity_id", opportunityId)
        .order("application_date", { ascending: false });

      if (error) throw error;
      return data as unknown as CompanyApplication[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Acceptée":
        return "default";
      case "En attente":
        return "secondary";
      case "Refusée":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (applications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune candidature pour cette opportunité
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Candidatures ({applications.length})</h4>
      <div className="space-y-2">
        {applications.map((application) => (
          <Card key={application.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{application.company.company_name}</p>
                  {application.company.activity_sector && (
                    <p className="text-xs text-muted-foreground">
                      {application.company.activity_sector}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(application.application_date), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </span>
            </div>
            {application.notes && (
              <p className="text-sm text-muted-foreground mt-2">
                {application.notes}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
