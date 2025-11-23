import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, GraduationCap } from "lucide-react";
import { TrainingDialog } from "@/components/trainings/TrainingDialog";
import { TrainingList } from "@/components/trainings/TrainingList";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

export default function Trainings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const { canAccess: canManageTrainings } = useCanAccessModule("trainings", "manager");

  const { data: trainings, isLoading, refetch } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (training: any) => {
    setSelectedTraining(training);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTraining(null);
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            Formations
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des formations et événements
          </p>
        </div>
        {canManageTrainings && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle formation
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Formations planifiées</h3>
        </CardHeader>
        <CardContent>
          <TrainingList
            trainings={trainings || []}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <TrainingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        training={selectedTraining}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
