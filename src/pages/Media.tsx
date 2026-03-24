import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Image as ImageIcon, BarChart3, Images, FolderOpen, Upload, Grid3X3 } from "lucide-react";
import { MediaDialog } from "@/components/media/MediaDialog";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaSummaryDialog } from "@/components/media/MediaSummaryDialog";
import { MediaStatsCards } from "@/components/mediatheque/MediaStatsCards";
import { MediaFiltersPanel } from "@/components/mediatheque/MediaFiltersPanel";
import { MediaFileCard } from "@/components/mediatheque/MediaFileCard";
import { MediaAlbumCard } from "@/components/mediatheque/MediaAlbumCard";
import { MediaUploadDialog } from "@/components/mediatheque/MediaUploadDialog";
import { MediaViewerDialog } from "@/components/mediatheque/MediaViewerDialog";
import { AlbumDialog } from "@/components/mediatheque/AlbumDialog";
import { useMediaFiles, useMediaAlbums, useMediaTags, useDeleteMedia } from "@/hooks/useMediaLibrary";
import { useToast } from "@/hooks/use-toast";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
import { sanitizeFilterValue } from "@/lib/utils";
import type { MediaFile, MediaAlbum, MediaFilters } from "@/types/media";

export default function Media() {
  const { toast } = useToast();
  const { canAccess: canManageMedia } = useCanAccessModule("media", "manager");
  
  // State for media requests (original functionality)
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  // State for media library (new functionality)
  const [activeTab, setActiveTab] = useState("requests");
  const [libraryView, setLibraryView] = useState<"files" | "albums">("files");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaAlbum | null>(null);
  const [libraryFilters, setLibraryFilters] = useState<MediaFilters>({});

  // Query for media requests (original)
  const { data: mediaItems, isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["media", search],
    queryFn: async () => {
      let query = supabase
        .from("media_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${sanitizeFilterValue(search)}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Media library hooks
  const { data: files, isLoading: isLoadingFiles, refetch: refetchFiles } = useMediaFiles(libraryFilters);
  const { data: albums, isLoading: isLoadingAlbums, refetch: refetchAlbums } = useMediaAlbums();
  const { data: tags } = useMediaTags();
  const deleteMedia = useDeleteMedia();

  // Handlers for media requests
  const handleEdit = (media: any) => {
    setSelectedMedia(media);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
    setDialogOpen(false);
    refetchRequests();
  };

  const handleDelete = async (media: any) => {
    try {
      const { error } = await supabase
        .from("media_content")
        .delete()
        .eq("id", media.id);

      if (error) throw error;

      toast({ title: "Média supprimé avec succès" });
      refetchRequests();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  // Handlers for media library
  const handleFileView = (file: MediaFile) => {
    setSelectedFile(file);
    setViewerOpen(true);
  };

  const handleAlbumClick = (album: MediaAlbum) => {
    setLibraryFilters(prev => ({ ...prev, album_id: album.id }));
    setLibraryView("files");
  };

  const handleEditAlbum = (album: MediaAlbum) => {
    setSelectedAlbum(album);
    setAlbumDialogOpen(true);
  };

  const handleDeleteFile = async (file: MediaFile) => {
    await deleteMedia.mutateAsync(file.id);
  };

  const handleCloseAlbumDialog = () => {
    setSelectedAlbum(null);
    setAlbumDialogOpen(false);
    refetchAlbums();
  };

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    refetchFiles();
  };

  const clearAlbumFilter = () => {
    setLibraryFilters(prev => ({ ...prev, album_id: undefined }));
  };

  const currentAlbum = albums?.find(a => a.id === libraryFilters.album_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-primary" />
            Médias & Médiathèque
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des demandes médias et bibliothèque multimédia
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Demandes Médias
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Images className="w-4 h-4" />
            Médiathèque
          </TabsTrigger>
        </TabsList>

        {/* Tab: Demandes Médias (original functionality) */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setSummaryDialogOpen(true)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Résumé
            </Button>
            {canManageMedia && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle demande
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher une demande..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MediaGrid
                mediaItems={mediaItems || []}
                isLoading={isLoadingRequests}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canManage={canManageMedia}
              />
            </CardContent>
          </Card>

          <MediaDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            media={selectedMedia}
            onClose={handleCloseDialog}
          />

          <MediaSummaryDialog
            open={summaryDialogOpen}
            onOpenChange={setSummaryDialogOpen}
          />
        </TabsContent>

        {/* Tab: Médiathèque (new functionality) */}
        <TabsContent value="library" className="space-y-6">
          <MediaStatsCards />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={libraryView === "files" ? "default" : "outline"}
                size="sm"
                onClick={() => setLibraryView("files")}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Fichiers
              </Button>
              <Button
                variant={libraryView === "albums" ? "default" : "outline"}
                size="sm"
                onClick={() => setLibraryView("albums")}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Albums
              </Button>
              {currentAlbum && (
                <div className="flex items-center gap-2 ml-4 text-sm text-muted-foreground">
                  <span>Album:</span>
                  <span className="font-medium text-foreground">{currentAlbum.name}</span>
                  <Button variant="ghost" size="sm" onClick={clearAlbumFilter}>
                    ✕
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canManageMedia && (
                <>
                  <Button variant="outline" onClick={() => setAlbumDialogOpen(true)}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Nouvel Album
                  </Button>
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <MediaFiltersPanel
                filters={libraryFilters}
                onChange={setLibraryFilters}
              />
            </div>

            <div className="lg:col-span-3">
              {libraryView === "files" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {isLoadingFiles ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                    ))
                  ) : files && files.length > 0 ? (
                    files.map((file) => (
                      <MediaFileCard
                        key={file.id}
                        file={file}
                        onView={() => handleFileView(file)}
                        onDelete={canManageMedia ? () => handleDeleteFile(file) : undefined}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <Images className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun fichier trouvé</p>
                      {canManageMedia && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setUploadDialogOpen(true)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Uploader des fichiers
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {isLoadingAlbums ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
                    ))
                  ) : albums && albums.length > 0 ? (
                    albums.map((album) => (
                      <MediaAlbumCard
                        key={album.id}
                        album={album}
                        onClick={() => handleAlbumClick(album)}
                        onEdit={canManageMedia ? () => handleEditAlbum(album) : undefined}
                        onDelete={canManageMedia ? async () => {
                          const { error } = await supabase
                            .from('media_albums')
                            .delete()
                            .eq('id', album.id);
                          if (!error) {
                            toast({ title: 'Album supprimé' });
                            refetchAlbums();
                          }
                        } : undefined}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun album créé</p>
                      {canManageMedia && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setAlbumDialogOpen(true)}
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Créer un album
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Media Library Dialogs */}
          <MediaUploadDialog
            open={uploadDialogOpen}
            onOpenChange={(open) => {
              setUploadDialogOpen(open);
              if (!open) refetchFiles();
            }}
          />

          <AlbumDialog
            open={albumDialogOpen}
            onOpenChange={(open) => {
              setAlbumDialogOpen(open);
              if (!open) {
                setSelectedAlbum(null);
                refetchAlbums();
              }
            }}
            album={selectedAlbum}
          />

          <MediaViewerDialog
            open={viewerOpen}
            onOpenChange={(open) => {
              setViewerOpen(open);
              if (!open) setSelectedFile(null);
            }}
            file={selectedFile}
            files={files || []}
            onNavigate={(file) => setSelectedFile(file)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
