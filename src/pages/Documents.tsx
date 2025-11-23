import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, FileText, FolderPlus, Upload, Folder, ChevronRight, Home, LayoutList, TreePine } from "lucide-react";
import { DocumentDialog } from "@/components/documents/DocumentDialog";
import { DocumentList } from "@/components/documents/DocumentList";
import { FolderDialog } from "@/components/documents/FolderDialog";
import { FileUploadDialog } from "@/components/documents/FileUploadDialog";
import { FolderTreeView } from "@/components/documents/FolderTreeView";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

export default function Documents() {
  const { toast } = useToast();
  const { canAccess: canManageDocuments } = useCanAccessModule("documents", "manager");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");

  const { data: folders, refetch: refetchFolders } = useQuery({
    queryKey: ["folders", currentFolderId],
    queryFn: async () => {
      let query = supabase
        .from("folders")
        .select("*")
        .order("name");

      if (currentFolderId) {
        query = query.eq("parent_folder_id", currentFolderId);
      } else {
        query = query.is("parent_folder_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Compter les sous-dossiers pour chaque dossier
      if (data) {
        const foldersWithCounts = await Promise.all(
          data.map(async (folder) => {
            const { count } = await supabase
              .from("folders")
              .select("*", { count: "exact", head: true })
              .eq("parent_folder_id", folder.id);
            return { ...folder, subfolderCount: count || 0 };
          })
        );
        return foldersWithCounts;
      }
      
      return data;
    },
  });

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["documents", search, currentFolderId],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*, directions(name)")
        .order("created_at", { ascending: false });

      if (currentFolderId) {
        query = query.eq("folder_id", currentFolderId);
      } else {
        query = query.is("folder_id", null);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const navigateToFolder = async (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
  };

  const navigateToParent = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setCurrentFolderId(newPath[index].id);
      setFolderPath(newPath);
    }
  };

  const handleEdit = (document: any) => {
    setSelectedDocument(document);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedDocument(null);
    setDialogOpen(false);
    refetch();
  };

  const handleCloseFolderDialog = () => {
    setFolderDialogOpen(false);
    refetchFolders();
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    refetch();
  };

  const handleDelete = async (document: any) => {
    try {
      // Supprimer le fichier du storage
      if (document.file_url) {
        // file_url contient maintenant le chemin, pas une URL complète
        const path = document.file_url;
        if (path) {
          await supabase.storage.from('documents').remove([path]);
        }
      }

      // Supprimer l'entrée de la base de données
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (error) throw error;

      toast({ title: "Document supprimé avec succès" });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      toast({ title: "Dossier supprimé avec succès" });
      refetchFolders();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Gestion Électronique des Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralisation et organisation des documents
          </p>
        </div>
        <div className="flex gap-2">
          {canManageDocuments && (
            <>
              <Button variant="outline" onClick={() => setFolderDialogOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                {currentFolderId ? "Nouveau sous-dossier" : "Nouveau dossier"}
              </Button>
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Importer un fichier
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau document
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Breadcrumb navigation et toggle vue */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateToParent(-1)}
                className="h-8"
              >
                <Home className="w-4 h-4" />
              </Button>
              {folderPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToParent(index)}
                    className="h-8"
                  >
                    {folder.name}
                  </Button>
                </div>
              ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutList className="w-4 h-4 mr-2" />
                  Grille
                </Button>
                <Button
                  variant={viewMode === "tree" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("tree")}
                >
                  <TreePine className="w-4 h-4 mr-2" />
                  Arbre
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vue en arbre */}
          {viewMode === "tree" && (
            <FolderTreeView
              folders={folders || []}
              onFolderClick={navigateToFolder}
              currentFolderId={currentFolderId}
            />
          )}

          {/* Liste des dossiers en grille */}
          {viewMode === "grid" && folders && folders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Dossiers {currentFolderId && "(sous-dossiers)"}
                </h3>
                {currentFolderId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFolderDialogOpen(true)}
                  >
                    <FolderPlus className="w-3 h-3 mr-2" />
                    Nouveau sous-dossier
                  </Button>
                )}
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {folders.map((folder: any) => (
                  <Card 
                    key={folder.id}
                    className="hover:shadow-md transition-all group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                          onClick={() => navigateToFolder(folder.id, folder.name)}
                        >
                          <Folder className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{folder.name}</span>
                              {folder.subfolderCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {folder.subfolderCount}
                                </Badge>
                              )}
                            </div>
                            {folder.subfolderCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {folder.subfolderCount} sous-dossier{folder.subfolderCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFolderId(folder.id);
                            setFolderDialogOpen(true);
                          }}
                        >
                          <FolderPlus className="w-3 h-3 mr-1" />
                          Sous-dossier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFolderId(folder.id);
                            setUploadDialogOpen(true);
                          }}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Fichier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Liste des documents */}
          {viewMode === "grid" && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </h3>
            <DocumentList
              documents={documents || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          )}
        </CardContent>
      </Card>

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        document={selectedDocument}
        onClose={handleCloseDialog}
      />

      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        parentFolderId={currentFolderId}
        onClose={handleCloseFolderDialog}
      />

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        folderId={currentFolderId}
        onClose={handleCloseUploadDialog}
      />
    </div>
  );
}
