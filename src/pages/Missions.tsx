import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileBarChart, Settings } from "lucide-react";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
import { useMissions } from "@/hooks/useMissions";
import { MissionStatsCards } from "@/components/missions/MissionStatsCards";
import { MissionFilters } from "@/components/missions/MissionFilters";
import { MissionTable } from "@/components/missions/MissionTable";
import { MissionDetailsDialog } from "@/components/missions/MissionDetailsDialog";
import { MissionOrderDialog } from "@/components/missions/MissionOrderDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MissionDashboard } from "@/components/missions/MissionDashboard";
import { MissionSettings } from "@/components/missions/MissionSettings";
import type { MissionOrder } from "@/types/mission";

export default function Missions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionOrder | null>(null);
  const [editingMission, setEditingMission] = useState<MissionOrder | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { canAccess: isManager } = useCanAccessModule('missions', 'manager');
  const { canAccess: isAdmin } = useCanAccessModule('missions', 'admin');
  const { missions, isLoading, stats } = useMissions();

  // Apply filters
  const filteredMissions = missions?.filter((mission) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        mission.mission_number?.toLowerCase().includes(searchLower) ||
        mission.purpose?.toLowerCase().includes(searchLower) ||
        mission.destination?.toLowerCase().includes(searchLower) ||
        mission.destination_country?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (statusFilter !== "all" && mission.extended_status !== statusFilter) return false;
    if (typeFilter !== "all" && mission.mission_type !== typeFilter) return false;
    return true;
  });

  const handleViewDetails = (mission: MissionOrder) => {
    setSelectedMission(mission);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (mission: MissionOrder) => {
    setEditingMission(mission);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingMission(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingMission(null);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Ordres de Mission</h1>
          <p className="text-muted-foreground">Gestion complète des missions et déplacements</p>
        </div>
        {isManager && (
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Ordre de Mission
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Liste des Missions</TabsTrigger>
          <TabsTrigger value="dashboard">
            <FileBarChart className="mr-2 h-4 w-4" />
            Tableau de Bord
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <MissionStatsCards stats={stats} />
          
          <MissionFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            onClear={handleClearFilters}
          />
          
          <MissionTable 
            missions={filteredMissions || []} 
            onView={handleViewDetails}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <MissionDashboard missions={missions || []} stats={stats} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings">
            <MissionSettings />
          </TabsContent>
        )}
      </Tabs>

      <MissionOrderDialog
        open={dialogOpen} 
        onOpenChange={handleDialogClose}
        mission={editingMission}
      />

      <MissionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        mission={selectedMission}
        onEdit={() => selectedMission && handleEdit(selectedMission)}
      />
    </div>
  );
}
