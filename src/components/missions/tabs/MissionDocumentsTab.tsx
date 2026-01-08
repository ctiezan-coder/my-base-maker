import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MissionOrder } from "@/types/mission";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  File,
  FileImage,
  FileSpreadsheet,
  FilePlus
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MissionDocumentsTabProps {
  mission: MissionOrder;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) return FileImage;
  if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function MissionDocumentsTab({ mission }: MissionDocumentsTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['mission_attachments', mission.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_attachments')
        .select('*')
        .eq('mission_order_id', mission.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${mission.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('mission-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('mission_attachments')
          .insert({
            mission_order_id: mission.id,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: ['mission_attachments', mission.id] });
      toast.success('Fichier(s) téléversé(s)');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléversement');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('mission-attachments')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (attachmentId: string, filePath: string) => {
    try {
      await supabase.storage.from('mission-attachments').remove([filePath]);
      await supabase.from('mission_attachments').delete().eq('id', attachmentId);
      
      queryClient.invalidateQueries({ queryKey: ['mission_attachments', mission.id] });
      toast.success('Fichier supprimé');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const documentCategories = [
    { label: 'Ordre de mission signé', key: 'ordre_mission' },
    { label: 'Programme officiel', key: 'programme' },
    { label: 'Invitation / Convocation', key: 'invitation' },
    { label: 'Billets de transport', key: 'billets' },
    { label: 'Confirmations hôtel', key: 'hotel' },
    { label: 'Visa / Passeport', key: 'visa' },
    { label: 'Assurance voyage', key: 'assurance' },
    { label: 'Rapport de mission', key: 'rapport' },
    { label: 'Justificatifs de dépenses', key: 'justificatifs' },
    { label: 'Photos de mission', key: 'photos' },
    { label: 'Autres documents', key: 'autres' },
  ];

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FilePlus className="h-5 w-5" />
            Ajouter des Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Glissez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <Input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button asChild disabled={uploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? 'Téléversement...' : 'Sélectionner des fichiers'}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Documents Associés
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {attachments?.length || 0} fichier(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : attachments && attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.file_type);
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{attachment.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)} • 
                          {format(new Date(attachment.created_at), ' dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(attachment.id, attachment.file_path)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun document associé à cette mission
            </p>
          )}
        </CardContent>
      </Card>

      {/* Checklist des documents requis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checklist des Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {documentCategories.map((cat) => (
              <div key={cat.key} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <div className="w-4 h-4 border rounded flex items-center justify-center">
                  {/* Checkbox visual placeholder */}
                </div>
                <span className="text-sm">{cat.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
