import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, MapPin, Users, DollarSign, FileText, 
  ClipboardList, Truck, UtensilsCrossed, UserCheck,
  Star, BarChart3, Megaphone, Settings, Clock
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Event, EVENT_STATUSES, LOCATION_TYPES } from "@/types/event";
import { EventOverviewTab } from "./tabs/EventOverviewTab";
import { EventProgramTab } from "./tabs/EventProgramTab";
import { EventParticipantsTab } from "./tabs/EventParticipantsTab";
import { EventTeamTab } from "./tabs/EventTeamTab";
import { EventBudgetTab } from "./tabs/EventBudgetTab";
import { EventSponsorsTab } from "./tabs/EventSponsorsTab";
import { EventLogisticsTab } from "./tabs/EventLogisticsTab";
import { EventCateringTab } from "./tabs/EventCateringTab";
import { EventDocumentsTab } from "./tabs/EventDocumentsTab";
import { EventSurveysTab } from "./tabs/EventSurveysTab";
import { EventReportsTab } from "./tabs/EventReportsTab";
import { EventCommunicationTab } from "./tabs/EventCommunicationTab";

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onRefresh: () => void;
  canManage?: boolean;
}

export function EventDetailsDialog({ 
  open, 
  onOpenChange, 
  event, 
  onRefresh,
  canManage = false 
}: EventDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!event) return null;

  const status = EVENT_STATUSES.find(s => s.value === event.status) || EVENT_STATUSES[0];
  const locationType = LOCATION_TYPES.find(l => l.value === event.location_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={status.color}>{status.label}</Badge>
                <Badge variant="outline">{event.event_type}</Badge>
                {locationType && <Badge variant="secondary">{locationType.label}</Badge>}
                {event.direction?.name && (
                  <Badge variant="outline">{event.direction.name}</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.start_date), "dd MMM yyyy", { locale: fr })}
                  {event.end_date && ` - ${format(new Date(event.end_date), "dd MMM yyyy", { locale: fr })}`}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex-shrink-0 flex-wrap h-auto gap-1 justify-start">
            <TabsTrigger value="overview" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="program" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Programme
            </TabsTrigger>
            <TabsTrigger value="participants" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs">
              <UserCheck className="w-3 h-3 mr-1" />
              Équipe
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="logistics" className="text-xs">
              <Truck className="w-3 h-3 mr-1" />
              Logistique
            </TabsTrigger>
            <TabsTrigger value="catering" className="text-xs">
              <UtensilsCrossed className="w-3 h-3 mr-1" />
              Restauration
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="surveys" className="text-xs">
              <ClipboardList className="w-3 h-3 mr-1" />
              Enquêtes
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="communication" className="text-xs">
              <Megaphone className="w-3 h-3 mr-1" />
              Communication
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="m-0">
              <EventOverviewTab event={event} canManage={canManage} onRefresh={onRefresh} />
            </TabsContent>
            <TabsContent value="program" className="m-0">
              <EventProgramTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="participants" className="m-0">
              <EventParticipantsTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="team" className="m-0">
              <EventTeamTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="budget" className="m-0">
              <EventBudgetTab eventId={event.id} event={event} canManage={canManage} />
            </TabsContent>
            <TabsContent value="sponsors" className="m-0">
              <EventSponsorsTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="logistics" className="m-0">
              <EventLogisticsTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="catering" className="m-0">
              <EventCateringTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="documents" className="m-0">
              <EventDocumentsTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="surveys" className="m-0">
              <EventSurveysTab eventId={event.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="reports" className="m-0">
              <EventReportsTab eventId={event.id} event={event} canManage={canManage} />
            </TabsContent>
            <TabsContent value="communication" className="m-0">
              <EventCommunicationTab eventId={event.id} event={event} canManage={canManage} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
