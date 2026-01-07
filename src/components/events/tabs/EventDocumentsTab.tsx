import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, FileText, Download, Trash2, Pencil, Eye, Lock, Globe } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventDocumentsTabProps {
  eventId: string;
  canManage?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'concept_note', label: 'Note conceptuelle' },
  { value: 'program', label: 'Programme' },
  { value: 'presentation', label: 'Présentation' },
  { value: 'training_material', label: 'Support de formation' },
  { value: 'press_kit', label: 'Dossier de presse' },
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Vidéo' },
  { value: 'report', label: 'Rapport' },
  { value: 'invitation', label: 'Invitation' },
  { value: 'flyer', label: 'Flyer' },
  { value: 'other', label: 'Autre' },
];

export function EventDocumentsTab({ eventId, canManage }: EventDocumentsTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: documents, isLoading } = useQuery({
    queryKey: ["event-documents", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_documents")
        .select("*")
        .eq("event_id", eventId)
        .order("document_type")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveDoc = useMutation({
    mutationFn: async (data: any) => {
      if (selectedDoc) {
        const { error } = await supabase
          .from("event_documents")
          .update(data)
          .eq("id", selectedDoc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_documents")
          .insert({ ...data, event_id: eventId, uploaded_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-documents", eventId] });
      toast({ title: selectedDoc ? "Document mis à jour" : "Document ajouté" });
      setDialogOpen(false);
      setSelectedDoc(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-documents", eventId] });
      toast({ title: "Document supprimé" });
    },
  });

  const handleEdit = (doc: any) => {
    setSelectedDoc(doc);
    setForm(doc);
    setDialogOpen(true);
  };

  const getDocTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(d => d.value === type)?.label || type;
  };

  // Group by type
  const byType = documents?.reduce((acc: any, doc: any) => {
    const type = doc.document_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documents de l'événement</h3>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Documents by Type */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : documents?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun document
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byType).map(([type, docs]: [string, any]) => (
            <div key={type}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{getDocTypeLabel(type)}</h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc: any) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium line-clamp-1">{doc.title}</h4>
                              {doc.is_public ? (
                                <Globe className="w-3 h-3 text-green-600" />
                              ) : (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {doc.file_url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                          {canManage && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(doc)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDoc.mutate(doc.id)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDoc ? "Modifier" : "Ajouter un document"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveDoc.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Type de document *</Label>
              <Select
                value={form.document_type || ""}
                onValueChange={(value) => setForm({ ...form, document_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL du fichier</Label>
              <Input
                value={form.file_url || ""}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.is_public || false}
                onCheckedChange={(checked) => setForm({ ...form, is_public: checked })}
              />
              <Label>Document public</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveDoc.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
