import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GraduationCap, Users, RefreshCw } from "lucide-react";
import { TrainingDialog } from "@/components/trainings/TrainingDialog";
import { TrainingList } from "@/components/trainings/TrainingList";
import { TrainerDialog } from "@/components/trainers/TrainerDialog";
import { TrainerTable } from "@/components/trainers/TrainerTable";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Trainer = Database["public"]["Tables"]["trainers"]["Row"];

type Training = Database["public"]["Tables"]["trainings"]["Row"] & {
  training_trainers: {
    trainers: {
      id: string;
      full_name: string;
      specialization: string | null;
    } | null;
  }[];
};

export default function Trainings() {
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [trainerDialogOpen, setTrainerDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { canAccess: canManageTrainings } = useCanAccessModule("trainings", "manager");
  const { data: userDirection } = useUserDirection();
  const { toast } = useToast();

  const { data: trainings, isLoading: loadingTrainings, refetch: refetchTrainings } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select(`
          *,
          training_trainers (
            trainers (
              id,
              full_name,
              specialization
            )
          )
        `)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: trainers, isLoading: loadingTrainers, refetch: refetchTrainers } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainers")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const handleSyncFormations = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-external-formations", {
        body: { direction_id: userDirection?.direction_id },
      });

      if (error) throw error;

      toast({
        title: "Synchronisation réussie",
        description: `${data.imported} importée(s), ${data.updated} mise(s) à jour, ${data.skipped} ignorée(s) sur ${data.total} formation(s)`,
      });

      refetchTrainings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de synchronisation";
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: errorMessage,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditTraining = (training: Training) => {
    setSelectedTraining(training);
    setTrainingDialogOpen(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setTrainerDialogOpen(true);
  };

  const handleCloseTrainingDialog = () => {
    setSelectedTraining(null);
    setTrainingDialogOpen(false);
    refetchTrainings();
  };

  const handleCloseTrainerDialog = () => {
    setSelectedTrainer(null);
    setTrainerDialogOpen(false);
    refetchTrainers();
  };

  const handleDeleteTrainer = async (trainer: Trainer) => {
    try {
      const { error } = await supabase
        .from("trainers")
        .delete()
        .eq("id", trainer.id);

      if (error) throw error;

      toast({
        title: "Formateur supprimé",
        description: "Le formateur a été supprimé avec succès",
      });

      refetchTrainers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            Formations & Formateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des formations, événements et formateurs
          </p>
        </div>
        {canManageTrainings && (
          <Button
            variant="outline"
            onClick={handleSyncFormations}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Synchronisation..." : "Importer depuis le site public"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="trainings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trainings" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Formations
          </TabsTrigger>
          <TabsTrigger value="trainers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Formateurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Formations planifiées</h3>
              {canManageTrainings && (
                <Button onClick={() => setTrainingDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle formation
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <TrainingList
                trainings={trainings || []}
                isLoading={loadingTrainings}
                onEdit={handleEditTraining}
                canManage={canManageTrainings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Liste des formateurs</h3>
              {canManageTrainings && (
                <Button onClick={() => setTrainerDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un formateur
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <TrainerTable
                trainers={trainers || []}
                isLoading={loadingTrainers}
                onEdit={handleEditTrainer}
                onDelete={handleDeleteTrainer}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TrainingDialog
        open={trainingDialogOpen}
        onOpenChange={setTrainingDialogOpen}
        training={selectedTraining}
        onClose={handleCloseTrainingDialog}
      />

      <TrainerDialog
        open={trainerDialogOpen}
        onOpenChange={setTrainerDialogOpen}
        trainer={selectedTrainer}
        onClose={handleCloseTrainerDialog}
      />
    </div>
  );
}
