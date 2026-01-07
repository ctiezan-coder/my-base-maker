import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image, Video, Music, FileText } from 'lucide-react';
import { useUploadMedia, useMediaAlbums } from '@/hooks/useMediaLibrary';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaUploadDialog({ open, onOpenChange }: MediaUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    album_id: '',
    direction_id: '',
    author: '',
    photographer: '',
    location_country: '',
    location_city: '',
    license_type: 'all_rights_reserved',
    copyright_holder: '',
  });

  const uploadMedia = useUploadMedia();
  const { data: albums } = useMediaAlbums();
  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data } = await supabase.from('directions').select('*').order('name');
      return data;
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMedia.mutateAsync({
          file: files[i],
          metadata: {
            title: files.length === 1 ? metadata.title : undefined,
            description: files.length === 1 ? metadata.description : undefined,
            album_id: metadata.album_id || undefined,
            direction_id: metadata.direction_id || undefined,
            author: metadata.author || undefined,
            photographer: metadata.photographer || undefined,
            location_country: metadata.location_country || undefined,
            location_city: metadata.location_city || undefined,
            license_type: metadata.license_type as any,
            copyright_holder: metadata.copyright_holder || undefined,
          },
        });
        setProgress(((i + 1) / files.length) * 100);
      }

      setFiles([]);
      setMetadata({
        title: '',
        description: '',
        album_id: '',
        direction_id: '',
        author: '',
        photographer: '',
        location_country: '',
        location_city: '',
        license_type: 'all_rights_reserved',
        copyright_holder: '',
      });
      onOpenChange(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uploader des médias</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Zone de dépôt */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Glisser-déposer vos fichiers ici</p>
            <p className="text-sm text-muted-foreground mb-4">
              Photos (20 MB max) • Vidéos (500 MB max) • Documents
            </p>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Parcourir
                </span>
              </Button>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.ppt,.pptx"
              />
            </label>
          </div>

          {/* Liste des fichiers */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Fichiers sélectionnés ({files.length})</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                    >
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Métadonnées (pour fichier unique) */}
          {files.length === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    placeholder={files[0]?.name.replace(/\.[^/.]+$/, '')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Album</Label>
                  <Select
                    value={metadata.album_id || '__none__'}
                    onValueChange={(v) => setMetadata({ ...metadata, album_id: v === '__none__' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun album" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucun album</SelectItem>
                      {albums?.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Select
                    value={metadata.direction_id}
                    onValueChange={(v) => setMetadata({ ...metadata, direction_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {directions?.map((dir) => (
                        <SelectItem key={dir.id} value={dir.id}>
                          {dir.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Licence</Label>
                  <Select
                    value={metadata.license_type}
                    onValueChange={(v) => setMetadata({ ...metadata, license_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_use">Usage libre</SelectItem>
                      <SelectItem value="restricted">Usage restreint</SelectItem>
                      <SelectItem value="all_rights_reserved">Tous droits réservés</SelectItem>
                      <SelectItem value="creative_commons">Creative Commons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auteur / Photographe</Label>
                  <Input
                    value={metadata.photographer}
                    onChange={(e) => setMetadata({ ...metadata, photographer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Détenteur des droits</Label>
                  <Input
                    value={metadata.copyright_holder}
                    onChange={(e) => setMetadata({ ...metadata, copyright_holder: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input
                    value={metadata.location_country}
                    onChange={(e) => setMetadata({ ...metadata, location_country: e.target.value })}
                    placeholder="Côte d'Ivoire"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={metadata.location_city}
                    onChange={(e) => setMetadata({ ...metadata, location_city: e.target.value })}
                    placeholder="Abidjan"
                  />
                </div>
              </div>
            </>
          )}

          {/* Options communes pour upload multiple */}
          {files.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Album (pour tous)</Label>
                <Select
                  value={metadata.album_id || '__none__'}
                  onValueChange={(v) => setMetadata({ ...metadata, album_id: v === '__none__' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun album" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucun album</SelectItem>
                    {albums?.map((album) => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Direction (pour tous)</Label>
                <Select
                  value={metadata.direction_id}
                  onValueChange={(v) => setMetadata({ ...metadata, direction_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {directions?.map((dir) => (
                      <SelectItem key={dir.id} value={dir.id}>
                        {dir.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Progression */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Upload en cours... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
              <Upload className="w-4 h-4 mr-2" />
              Uploader {files.length > 1 ? `(${files.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
