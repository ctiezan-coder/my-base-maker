import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Search,
  FolderPlus,
  Grid3X3,
  List,
  Filter,
  Image as ImageIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { useMediaFiles, useMediaAlbums, useDeleteMedia } from '@/hooks/useMediaLibrary';
import { MediaStatsCards } from '@/components/mediatheque/MediaStatsCards';
import { MediaFileCard } from '@/components/mediatheque/MediaFileCard';
import { MediaAlbumCard } from '@/components/mediatheque/MediaAlbumCard';
import { MediaUploadDialog } from '@/components/mediatheque/MediaUploadDialog';
import { MediaViewerDialog } from '@/components/mediatheque/MediaViewerDialog';
import { MediaFiltersPanel } from '@/components/mediatheque/MediaFiltersPanel';
import { AlbumDialog } from '@/components/mediatheque/AlbumDialog';
import { useCanAccessModule } from '@/hooks/useCanAccessModule';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { MediaFile, MediaFilters, MediaViewMode } from '@/types/media';

export default function Mediatheque() {
  const { canAccess: canManage } = useCanAccessModule('media', 'manager');
  const [filters, setFilters] = useState<MediaFilters>({});
  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<MediaFile | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const { data: files, isLoading: filesLoading } = useMediaFiles({
    ...filters,
    album_id: selectedAlbum || filters.album_id,
  });
  const { data: albums } = useMediaAlbums();
  const deleteMedia = useDeleteMedia();

  const handleViewFile = (file: MediaFile) => setViewerFile(file);
  const handleDownload = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.file_name;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-primary" />
            Médiathèque
          </h1>
          <p className="text-muted-foreground mt-1">
            Bibliothèque de photos, vidéos et documents multimédias
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setAlbumDialogOpen(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Nouvel album
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Uploader
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <MediaStatsCards />

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80 p-0">
            <MediaFiltersPanel filters={filters} onChange={setFilters} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Tous les fichiers</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {filesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : files?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aucun fichier trouvé</p>
              {canManage && (
                <Button className="mt-4" onClick={() => setUploadOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Uploader des fichiers
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {files?.map((file) => (
                <MediaFileCard
                  key={file.id}
                  file={file}
                  viewMode="list"
                  onView={() => handleViewFile(file)}
                  onDownload={() => handleDownload(file)}
                  onDelete={() => deleteMedia.mutate(file.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files?.map((file) => (
                <MediaFileCard
                  key={file.id}
                  file={file}
                  viewMode="grid"
                  onView={() => handleViewFile(file)}
                  onDownload={() => handleDownload(file)}
                  onDelete={() => deleteMedia.mutate(file.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums">
          {albums?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aucun album créé</p>
              {canManage && (
                <Button className="mt-4" onClick={() => setAlbumDialogOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Créer un album
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums?.map((album) => (
                <MediaAlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => {
                    setSelectedAlbum(album.id);
                    setFilters({ ...filters, album_id: album.id });
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MediaUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <AlbumDialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen} />
      <MediaViewerDialog
        open={!!viewerFile}
        onOpenChange={(open) => !open && setViewerFile(null)}
        file={viewerFile}
        files={files || []}
        onNavigate={setViewerFile}
      />
    </div>
  );
}
