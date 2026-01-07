import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder, MoreVertical, Image, Pencil, Trash2, Share2, Lock, Globe } from 'lucide-react';
import type { MediaAlbum } from '@/types/media';

interface MediaAlbumCardProps {
  album: MediaAlbum;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function MediaAlbumCard({
  album,
  onClick,
  onEdit,
  onDelete,
  onShare,
}: MediaAlbumCardProps) {
  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5">
        {album.cover_image_url ? (
          <img
            src={album.cover_image_url}
            alt={album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Folder className="w-16 h-16 text-primary/50" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Album info overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-semibold truncate">{album.name}</h3>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Image className="w-4 h-4" />
            <span>{album.file_count || 0} fichiers</span>
          </div>
        </div>

        {/* Access level indicator */}
        <div className="absolute top-2 right-2">
          {album.access_level === 'public' ? (
            <Badge variant="secondary" className="bg-green-500/90 text-white">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          ) : album.access_level === 'restricted' ? (
            <Badge variant="secondary" className="bg-yellow-500/90 text-white">
              <Lock className="w-3 h-3 mr-1" />
              Restreint
            </Badge>
          ) : null}
        </div>

        {/* Actions menu */}
        <div
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" /> Partager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description */}
      {album.description && (
        <CardContent className="p-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {album.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
