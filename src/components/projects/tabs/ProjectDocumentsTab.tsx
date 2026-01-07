import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectDocumentsTabProps {
  projectId: string;
  canManage: boolean;
}

const categories = [
  { value: "contrat", label: "Contrat" },
  { value: "rapport", label: "Rapport" },
  { value: "spécification", label: "Spécification" },
  { value: "présentation", label: "Présentation" },
  { value: "autre", label: "Autre" },
];

export function ProjectDocumentsTab({ projectId, canManage }: ProjectDocumentsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "autre",
    file: null as File | null,
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["project-documents", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async () => {
      if (!formData.file) throw new Error("Aucun fichier sélectionné");
      setUploading(true);

      const fileExt = formData.file.name.split(".").pop();
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("project_documents").insert([{
        project_id: projectId,
        name: formData.name || formData.file.name,
        description: formData.description,
        file_path: filePath,
        file_type: formData.file.type,
        file_size: formData.file.size,
        category: formData.category,
        uploaded_by: user?.id,
      }]);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", projectId] });
      closeDialog();
      toast({ title: "Document ajouté" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
    onSettled: () => setUploading(false),
  });

  const deleteDocument = useMutation({
    mutationFn: async (doc: any) => {
      await supabase.storage.from("project-documents").remove([doc.file_path]);
      const { error } = await supabase.from("project_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", projectId] });
      toast({ title: "Document supprimé" });
    },
  });

  const downloadDocument = async (doc: any) => {
    const { data, error } = await supabase.storage
      .from("project-documents")
      .download(doc.file_path);
    if (error) {
      toast({ variant: "destructive", title: "Erreur de téléchargement" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormData({ name: "", description: "", category: "autre", file: null });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Documents ({documents?.length || 0})</h3>
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {documents?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun document associé
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents?.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(doc.created_at), "dd MMM yyyy", { locale: fr })}
                        {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.category}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    {canManage && (
                      <Button variant="ghost" size="sm" onClick={() => deleteDocument.mutate(doc)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); uploadDocument.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Fichier *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, file, name: formData.name || file.name });
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {formData.file ? formData.file.name : "Cliquez pour sélectionner un fichier"}
                  </p>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du document"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              <Button type="submit" disabled={!formData.file || uploading}>
                {uploading ? "Envoi..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
