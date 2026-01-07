import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PartnershipDocumentsTabProps {
  partnershipId: string;
  canManage: boolean;
}

const DOCUMENT_TYPES = [
  "Convention signée",
  "Annexe",
  "Avenant",
  "Plan de travail annuel",
  "Rapport d'activité",
  "Rapport de mission",
  "Procès-verbal",
  "Correspondance",
  "Rapport financier",
  "Évaluation"
];

export function PartnershipDocumentsTab({ partnershipId, canManage }: PartnershipDocumentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "",
    name: "",
    description: "",
    file: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["partnership-documents", partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_documents")
        .select("*")
        .eq("partnership_id", partnershipId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { document_type: string; name: string; description: string; file_path: string; file_size: number; file_type: string }) => {
      const { error } = await supabase
        .from("partnership_documents")
        .insert([{
          partnership_id: partnershipId,
          ...data
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-documents", partnershipId] });
      toast({ title: "Document ajouté avec succès" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      document_type: "",
      name: "",
      description: "",
      file: null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast({ variant: "destructive", title: "Veuillez sélectionner un fichier" });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${partnershipId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      createMutation.mutate({
        document_type: formData.document_type,
        name: formData.name || formData.file.name,
        description: formData.description,
        file_path: fileName,
        file_size: formData.file.size,
        file_type: formData.file.type
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur d'upload", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type de document *</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(v) => setFormData({ ...formData, document_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nom du document</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom personnalisé (optionnel)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fichier *</Label>
                  <div className="border-2 border-dashed rounded-md p-4">
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      className="w-full"
                    />
                    {formData.file && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {formData.file.name} ({formatFileSize(formData.file.size)})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploading || createMutation.isPending}>
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                        Upload...
                      </>
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun document associé
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.document_type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.file_size ? formatFileSize(doc.file_size) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">v{doc.version}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.file_path, doc.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
