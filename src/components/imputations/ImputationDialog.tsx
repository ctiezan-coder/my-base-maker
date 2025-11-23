import { useEffect, useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Upload, X, Download } from "lucide-react";
import type { Imputation, ImputationFormData } from "@/types/imputation";

interface ImputationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imputation?: Imputation | null;
}

export function ImputationDialog({ open, onOpenChange, imputation }: ImputationDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ['imputation-attachments', imputation?.id],
    queryFn: async () => {
      if (!imputation?.id) return [];
      const { data, error } = await supabase
        .from('imputation_attachments')
        .select('*')
        .eq('imputation_id', imputation.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!imputation?.id,
  });

  const [formData, setFormData] = useState<ImputationFormData>({
    date_reception: new Date().toISOString().split('T')[0],
    provenance: "",
    objet: "",
    imputation: "",
    date_imputation: null,
    date_realisation: null,
    observations: "",
    etat: "En attente",
    direction_id: null,
    created_by: user?.id || null,
    assigned_to: null,
  });

  useEffect(() => {
    if (imputation) {
      setFormData({
        date_reception: imputation.date_reception,
        provenance: imputation.provenance,
        objet: imputation.objet,
        imputation: imputation.imputation,
        date_imputation: imputation.date_imputation,
        date_realisation: imputation.date_realisation,
        observations: imputation.observations,
        etat: imputation.etat,
        direction_id: imputation.direction_id,
        created_by: imputation.created_by,
        assigned_to: imputation.assigned_to,
      });
    } else {
      setFormData({
        date_reception: new Date().toISOString().split('T')[0],
        provenance: "",
        objet: "",
        imputation: "",
        date_imputation: null,
        date_realisation: null,
        observations: "",
        etat: "En attente",
        direction_id: null,
        created_by: user?.id || null,
        assigned_to: null,
      });
    }
  }, [imputation, user]);

  const saveMutation = useMutation({
    mutationFn: async (data: ImputationFormData) => {
      let imputationId = imputation?.id;
      
      if (imputation) {
        const { error } = await supabase
          .from('imputations')
          .update(data)
          .eq('id', imputation.id);
        if (error) throw error;
      } else {
        const { data: newImputation, error } = await supabase
          .from('imputations')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        imputationId = newImputation.id;
      }

      // Upload files if any
      if (uploadedFiles.length > 0 && imputationId) {
        await uploadFiles(imputationId);
      }

      return imputationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imputations'] });
      queryClient.invalidateQueries({ queryKey: ['imputation-attachments'] });
      toast({
        title: "Succès",
        description: imputation
          ? "Imputation modifiée avec succès"
          : "Imputation ajoutée avec succès",
      });
      setUploadedFiles([]);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFiles = async (imputationId: string) => {
    setIsUploading(true);
    try {
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `imputations/${imputationId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('imputation_attachments')
          .insert({
            imputation_id: imputationId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user?.id,
          });

        if (dbError) throw dbError;
      }
    } catch (error: any) {
      toast({
        title: "Erreur d'upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('imputation_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      refetchAttachments();
      toast({
        title: "Succès",
        description: "Fichier supprimé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveMutation.mutateAsync(formData);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {imputation ? "Modifier l'imputation" : "Nouvelle Imputation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_reception">Date de réception *</Label>
              <Input
                id="date_reception"
                type="date"
                value={formData.date_reception}
                onChange={(e) =>
                  setFormData({ ...formData, date_reception: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provenance">Provenance *</Label>
              <Input
                id="provenance"
                value={formData.provenance}
                onChange={(e) =>
                  setFormData({ ...formData, provenance: e.target.value })
                }
                placeholder="Ministère, Partenaire..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objet">Objet *</Label>
            <Textarea
              id="objet"
              value={formData.objet}
              onChange={(e) =>
                setFormData({ ...formData, objet: e.target.value })
              }
              placeholder="Description détaillée du document"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imputation">Imputation (Direction) *</Label>
              <Input
                id="imputation"
                value={formData.imputation}
                onChange={(e) =>
                  setFormData({ ...formData, imputation: e.target.value })
                }
                placeholder="Direction responsable"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction_id">Direction</Label>
              <Select
                value={formData.direction_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, direction_id: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {directions?.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id}>
                      {direction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_imputation">Date d'imputation</Label>
              <Input
                id="date_imputation"
                type="date"
                value={formData.date_imputation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date_imputation: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_realisation">Date de réalisation</Label>
              <Input
                id="date_realisation"
                type="date"
                value={formData.date_realisation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date_realisation: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations || ""}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              placeholder="Commentaires ou notes complémentaires"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="etat">État *</Label>
              <Select
                value={formData.etat}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, etat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Personne assignée</Label>
              <Select
                value={formData.assigned_to || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigned_to: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une personne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="files">Pièces jointes</Label>
            <div className="flex items-center gap-2">
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing Attachments */}
          {imputation && attachments && attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label>Fichiers existants</Label>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{attachment.file_name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((attachment.file_size || 0) / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          downloadFile(attachment.file_path, attachment.file_name)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteAttachment(attachment.id, attachment.file_path)
                        }
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
