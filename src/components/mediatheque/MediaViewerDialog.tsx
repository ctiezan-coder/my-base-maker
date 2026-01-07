import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Info,
  Eye,
  Calendar,
  MapPin,
  User,
  FileText,
  Image,
  Video,
  Music,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import type { MediaFile } from '@/types/media';

interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: MediaFile | null;
  files?: MediaFile[];
  onNavigate?: (file: MediaFile) => void;
}

export function MediaViewerDialog({
  open,
  onOpenChange,
  file,
  files = [],
  onNavigate,
}: MediaViewerDialogProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentIndex = files.findIndex((f) => f.id === file?.id);

  useEffect(() => {
    if (open && file) {
      // Increment view count
      supabase.rpc('increment_media_view_count', { media_id: file.id });
    }
    // Reset on file change
    setZoom(1);
    setRotation(0);
  }, [open, file?.id]);

  const handlePrev = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(files[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1 && onNavigate) {
      onNavigate(files[currentIndex + 1]);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    
    // Increment download count
    await supabase.rpc('increment_media_download_count', { media_id: file.id });
    
    // Trigger download
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, currentIndex]);

  if (!file) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const renderPreview = () => {
    switch (file.media_category) {
      case 'photo':
        return (
          <img
            src={file.file_url}
            alt={file.title}
            className="max-w-full max-h-full object-contain transition-transform"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        );
      case 'video':
        return (
          <video
            src={file.file_url}
            controls
            className="max-w-full max-h-full"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center gap-6">
            <Music className="w-32 h-32 text-muted-foreground" />
            <audio src={file.file_url} controls className="w-full max-w-md">
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4">
            <FileText className="w-32 h-32 text-muted-foreground" />
            <p className="text-muted-foreground">Aperçu non disponible</p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0 bg-black/95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 text-white">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold truncate max-w-md">{file.title}</h3>
            {files.length > 1 && (
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {files.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {file.media_category === 'photo' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRotation((r) => r + 90)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Navigation arrows */}
            {files.length > 1 && currentIndex > 0 && (
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {renderPreview()}

            {files.length > 1 && currentIndex < files.length - 1 && (
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Info panel */}
          {showInfo && (
            <div className="w-80 bg-background border-l overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Informations</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Nom du fichier</dt>
                      <dd className="truncate max-w-[150px]">{file.file_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{file.file_type.toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Taille</dt>
                      <dd>{formatFileSize(file.file_size)}</dd>
                    </div>
                    {file.width && file.height && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Dimensions</dt>
                        <dd>{file.width} × {file.height}</dd>
                      </div>
                    )}
                    {file.duration_seconds && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Durée</dt>
                        <dd>
                          {Math.floor(file.duration_seconds / 60)}:
                          {String(file.duration_seconds % 60).padStart(2, '0')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Métadonnées</h4>
                  <dl className="space-y-2 text-sm">
                    {file.photographer && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Photographe</dt>
                          <dd>{file.photographer}</dd>
                        </div>
                      </div>
                    )}
                    {file.capture_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Date de prise</dt>
                          <dd>{format(new Date(file.capture_date), 'dd MMMM yyyy', { locale: fr })}</dd>
                        </div>
                      </div>
                    )}
                    {(file.location_city || file.location_country) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Lieu</dt>
                          <dd>
                            {[file.location_city, file.location_country]
                              .filter(Boolean)
                              .join(', ')}
                          </dd>
                        </div>
                      </div>
                    )}
                  </dl>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold">{file.view_count}</p>
                      <p className="text-xs text-muted-foreground">Vues</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Download className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold">{file.download_count}</p>
                      <p className="text-xs text-muted-foreground">Téléchargements</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Droits</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">
                      {file.license_type === 'free_use'
                        ? 'Usage libre'
                        : file.license_type === 'restricted'
                        ? 'Usage restreint'
                        : file.license_type === 'creative_commons'
                        ? 'Creative Commons'
                        : 'Tous droits réservés'}
                    </Badge>
                    {file.copyright_holder && (
                      <p className="text-sm">
                        © {file.copyright_holder}
                      </p>
                    )}
                  </div>
                </div>

                {file.description && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {file.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
