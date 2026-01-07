import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Handshake, Search, Filter } from "lucide-react";
import { PartnershipDialog } from "@/components/partnerships/PartnershipDialog";
import { PartnershipList } from "@/components/partnerships/PartnershipList";
import { PartnershipDetailsDialog } from "@/components/partnerships/PartnershipDetailsDialog";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

export default function Partnerships() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { canAccess: canManagePartnerships } = useCanAccessModule("partnerships", "manager");

  const { data: partnerships, isLoading, refetch } = useQuery({
    queryKey: ["partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredPartnerships = partnerships?.filter(p => {
    const matchesSearch = p.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partner_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (partnership: any) => {
    setSelectedPartnership(partnership);
    setDetailsOpen(true);
  };

  const handleEdit = (partnership: any) => {
    setSelectedPartnership(partnership);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedPartnership(null);
    setDialogOpen(false);
    refetch();
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
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
        {canManagePartnerships && (
          <Button onClick={() => { setSelectedPartnership(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau partenariat
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="prospection">Prospection</SelectItem>
            <SelectItem value="en négociation">En négociation</SelectItem>
            <SelectItem value="signé">Signé</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
            <SelectItem value="expiré">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Liste des partenariats ({filteredPartnerships?.length || 0})
          </h3>
        </CardHeader>
        <CardContent>
          <PartnershipList
            partnerships={filteredPartnerships || []}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            canManage={canManagePartnerships}
          />
        </CardContent>
      </Card>

      <PartnershipDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partnership={selectedPartnership}
        onClose={handleCloseDialog}
      />

      {selectedPartnership && (
        <PartnershipDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          partnership={selectedPartnership}
          onEdit={() => { setDetailsOpen(false); setDialogOpen(true); }}
          canManage={canManagePartnerships}
        />
      )}
    </div>
  );
}
