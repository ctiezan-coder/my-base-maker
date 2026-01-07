import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Image,
  Video,
  Music,
  FileText,
  MoreVertical,
  Download,
  Share2,
  Pencil,
  Trash2,
  Eye,
  Star,
  FolderInput,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MediaFile } from '@/types/media';

interface MediaFileCardProps {
  file: MediaFile;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  viewMode?: 'grid' | 'list';
  size?: 'small' | 'medium' | 'large';
}

export function MediaFileCard({
  file,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  viewMode = 'grid',
  size = 'medium',
}: MediaFileCardProps) {
  const [imageError, setImageError] = useState(false);

  const getCategoryIcon = () => {
    switch (file.media_category) {
      case 'photo':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      default:
        return FileText;
    }
  };

  const getCategoryColor = () => {
    switch (file.media_category) {
      case 'photo':
        return 'bg-blue-500';
      case 'video':
        return 'bg-purple-500';
      case 'audio':
        return 'bg-green-500';
      case 'document':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const Icon = getCategoryIcon();

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {file.media_category === 'photo' && !imageError ? (
            <img
              src={file.thumbnail_url || file.file_url}
              alt={file.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.title}</p>
          <p className="text-sm text-muted-foreground">
            {file.album?.name || 'Sans album'} • {formatFileSize(file.file_size)}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {file.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {file.download_count}
          </span>
        </div>

        {/* Date */}
        <div className="hidden sm:block text-sm text-muted-foreground">
          {format(new Date(file.created_at), 'dd MMM yyyy', { locale: fr })}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" /> Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" /> Télécharger
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" /> Partager
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image/Preview */}
      <div
        className={`relative ${sizeClasses[size]} bg-muted cursor-pointer`}
        onClick={onView}
      >
        {file.media_category === 'photo' && !imageError ? (
          <img
            src={file.thumbnail_url || file.file_url}
            alt={file.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="secondary" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-2" />
            Voir
          </Button>
        </div>

        {/* Category badge */}
        <div className={`absolute top-2 left-2 ${getCategoryColor()} text-white text-xs px-2 py-1 rounded`}>
          {file.media_category}
        </div>

        {/* Selection checkbox */}
        {onSelect && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              className="bg-white"
            />
          </div>
        )}

        {/* Featured star */}
        {file.is_featured && (
          <div className="absolute bottom-2 left-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{file.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {file.album?.name || 'Sans album'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" /> Voir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" /> Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" /> Partager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderInput className="w-4 h-4 mr-2" /> Déplacer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.file_size)}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {file.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {file.download_count}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
