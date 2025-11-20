import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Image as ImageIcon } from "lucide-react";
import { MediaDialog } from "@/components/media/MediaDialog";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useToast } from "@/hooks/use-toast";

export default function Media() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const { data: mediaItems, isLoading, refetch } = useQuery({
    queryKey: ["media", search],
    queryFn: async () => {
      let query = supabase
        .from("media_content")
        .select(`
          *,
          directions:direction_id (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (media: any) => {
    setSelectedMedia(media);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (media: any) => {
    try {
      const { error } = await supabase
        .from("media_content")
        .delete()
        .eq("id", media.id);

      if (error) throw error;

      toast({ title: "Média supprimé avec succès" });
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
            <ImageIcon className="w-8 h-8 text-primary" />
            Bibliothèque Média
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des images, vidéos et contenus multimédias
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau média
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un média..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MediaGrid
            mediaItems={mediaItems || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <MediaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        media={selectedMedia}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
