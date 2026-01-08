import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MissionOrder } from "@/types/mission";
import { useMissionValidations, useMissionExpenses, useMissionItineraries, useMissionProgram } from "@/hooks/useMissions";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Wallet, 
  Users, 
  Plane, 
  Hotel,
  FileCheck,
  ClipboardList,
  AlertTriangle,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MissionInfoTab } from "./tabs/MissionInfoTab";
import { MissionBudgetTab } from "./tabs/MissionBudgetTab";
import { MissionLogisticsTab } from "./tabs/MissionLogisticsTab";
import { MissionValidationTab } from "./tabs/MissionValidationTab";
import { MissionDocumentsTab } from "./tabs/MissionDocumentsTab";

interface MissionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: MissionOrder | null;
  onEdit?: () => void;
}

export function MissionDetailsDialog({ 
  open, 
  onOpenChange, 
  mission,
  onEdit 
}: MissionDetailsDialogProps) {
  const { data: validations } = useMissionValidations(mission?.id || null);
  const { data: expenses } = useMissionExpenses(mission?.id || null);
  const { data: itineraries } = useMissionItineraries(mission?.id || null);
  const { data: program } = useMissionProgram(mission?.id || null);

  if (!mission) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Brouillon': 'bg-gray-500',
      'Soumise': 'bg-blue-400',
      'En validation N1': 'bg-yellow-500',
      'En validation DAF': 'bg-yellow-600',
      'En validation DG': 'bg-yellow-700',
      'Approuvée': 'bg-blue-600',
      'Rejetée': 'bg-red-500',
      'En cours': 'bg-green-500',
      'Terminée': 'bg-gray-600',
      'En attente rapport': 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3">
                <Plane className="h-6 w-6" />
                <span>{mission.mission_number}</span>
                <Badge className={getStatusColor(mission.extended_status || mission.status)}>
                  {mission.extended_status || mission.status}
                </Badge>
                {mission.mission_type === 'Internationale' && (
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                    International
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {mission.purpose}
              </p>
            </div>
            <div className="flex gap-2">
              {(mission.extended_status === 'Brouillon' || mission.extended_status === 'Rejetée') && onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Modifier
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex-shrink-0 grid grid-cols-5 w-full">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Informations</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="logistics" className="flex items-center gap-1">
              <Plane className="h-4 w-4" />
              <span className="hidden sm:inline">Logistique</span>
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-1">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Validation</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="info" className="m-0">
              <MissionInfoTab mission={mission} itineraries={itineraries || []} program={(program as any) || []} />
            </TabsContent>
            
            <TabsContent value="budget" className="m-0">
              <MissionBudgetTab mission={mission} expenses={expenses || []} />
            </TabsContent>
            
            <TabsContent value="logistics" className="m-0">
              <MissionLogisticsTab mission={mission} />
            </TabsContent>
            
            <TabsContent value="validation" className="m-0">
              <MissionValidationTab mission={mission} validations={validations || []} />
            </TabsContent>
            
            <TabsContent value="documents" className="m-0">
              <MissionDocumentsTab mission={mission} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
