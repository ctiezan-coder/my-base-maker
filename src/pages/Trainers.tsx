import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Users } from "lucide-react";
import { TrainerDialog } from "@/components/trainers/TrainerDialog";
import { TrainerTable } from "@/components/trainers/TrainerTable";
import { useToast } from "@/hooks/use-toast";

export default function Trainers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  const { data: trainers, isLoading, refetch } = useQuery({
    queryKey: ["trainers", search],
    queryFn: async () => {
      let query = supabase
        .from("trainers")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,specialization.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (trainer: any) => {
    setSelectedTrainer(trainer);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTrainer(null);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (trainer: any) => {
    try {
      const { error } = await supabase
        .from("trainers")
        .delete()
        .eq("id", trainer.id);

      if (error) throw error;

      toast({ title: "Formateur supprimé avec succès" });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Formateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des formateurs et intervenants
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau formateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, email ou spécialisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TrainerTable
            trainers={trainers || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <TrainerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trainer={selectedTrainer}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
