import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Handshake } from "lucide-react";
import { PartnershipDialog } from "@/components/partnerships/PartnershipDialog";
import { PartnershipList } from "@/components/partnerships/PartnershipList";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useUserRole } from "@/hooks/useUserRole";

export default function Partnerships() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<any>(null);

  // Get user's direction
  const { data: userDirection } = useUserDirection();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';

  const { data: partnerships, isLoading, refetch } = useQuery({
    queryKey: ["partnerships", userDirection?.direction_id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("partnerships")
        .select("*");

      // Filter by direction unless user is admin
      if (!isAdmin && userDirection?.direction_id) {
        query = query.eq("direction_id", userDirection.direction_id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin || !!userDirection?.direction_id,
  });

  const handleEdit = (partnership: any) => {
    setSelectedPartnership(partnership);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedPartnership(null);
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Handshake className="w-8 h-8 text-primary" />
            Partenariats Stratégiques
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des partenaires et conventions
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau partenariat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Partenaires actifs</h3>
        </CardHeader>
        <CardContent>
          <PartnershipList
            partnerships={partnerships || []}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <PartnershipDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partnership={selectedPartnership}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
