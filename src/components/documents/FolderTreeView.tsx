import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FolderNode {
  id: string;
  name: string;
  parent_folder_id: string | null;
  children?: FolderNode[];
}

interface FolderTreeViewProps {
  folders: FolderNode[];
  onFolderClick: (folderId: string, folderName: string) => void;
  currentFolderId: string | null;
}

const TreeNode = ({ 
  node, 
  level = 0, 
  onFolderClick,
  currentFolderId 
}: { 
  node: FolderNode; 
  level?: number;
  onFolderClick: (folderId: string, folderName: string) => void;
  currentFolderId: string | null;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-2 px-3 hover:bg-accent/50 rounded-md cursor-pointer transition-colors ${
          currentFolderId === node.id ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => onFolderClick(node.id, node.name)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        {!hasChildren && <div className="w-4" />}
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-primary" />
        ) : (
          <Folder className="w-4 h-4 text-primary" />
        )}
        <span className="text-sm font-medium">{node.name}</span>
        {hasChildren && node.children && (
          <span className="text-xs text-muted-foreground ml-2">
            ({node.children.length})
          </span>
        )}
      </div>
      {hasChildren && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onFolderClick={onFolderClick}
              currentFolderId={currentFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTreeView = ({ folders, onFolderClick, currentFolderId }: FolderTreeViewProps) => {
  // Construire l'arbre hiérarchique
  const buildTree = (items: any[]): FolderNode[] => {
    const map = new Map<string, FolderNode>();
    const roots: FolderNode[] = [];

    // Créer tous les nœuds
    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // Construire la hiérarchie
    items.forEach(item => {
      const node = map.get(item.id);
      if (!node) return;

      if (item.parent_folder_id) {
        const parent = map.get(item.parent_folder_id);
        if (parent && parent.children) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(folders);

  if (tree.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun dossier pour le moment</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
        <Folder className="w-4 h-4" />
        Arborescence des dossiers
      </h3>
      <div className="space-y-1">
        {tree.map((node) => (
          <TreeNode 
            key={node.id} 
            node={node}
            onFolderClick={onFolderClick}
            currentFolderId={currentFolderId}
          />
        ))}
      </div>
    </div>
  );
};
