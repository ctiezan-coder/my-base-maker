import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, FileText } from "lucide-react";
import { DocumentDialog } from "@/components/documents/DocumentDialog";
import { DocumentList } from "@/components/documents/DocumentList";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["documents", search],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*, directions(name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (document: any) => {
    setSelectedDocument(document);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedDocument(null);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (document: any) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (error) throw error;

      toast({ title: "Document supprimé avec succès" });
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
            <FileText className="w-8 h-8 text-primary" />
            Gestion Électronique des Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralisation et organisation des documents
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={documents || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        document={selectedDocument}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
