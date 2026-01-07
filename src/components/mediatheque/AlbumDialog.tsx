import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAlbum, useMediaAlbums } from '@/hooks/useMediaLibrary';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MediaAlbum } from '@/types/media';

interface AlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album?: MediaAlbum | null;
}

export function AlbumDialog({ open, onOpenChange, album }: AlbumDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    direction_id: '',
    access_level: 'private' as 'public' | 'private' | 'restricted',
    is_public: false,
  });

  const createAlbum = useCreateAlbum();
  const { data: albums } = useMediaAlbums();
  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data } = await supabase.from('directions').select('*').order('name');
      return data;
    },
  });

  useEffect(() => {
    if (album) {
      setFormData({
        name: album.name,
        description: album.description || '',
        parent_id: album.parent_id || '',
        direction_id: album.direction_id || '',
        access_level: album.access_level,
        is_public: album.is_public,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parent_id: '',
        direction_id: '',
        access_level: 'private',
        is_public: false,
      });
    }
  }, [album, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createAlbum.mutateAsync({
      name: formData.name,
      description: formData.description || undefined,
      parent_id: formData.parent_id || undefined,
      direction_id: formData.direction_id || undefined,
      access_level: formData.access_level,
      is_public: formData.is_public,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {album ? 'Modifier l\'album' : 'Nouvel album'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'album *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Album parent</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(v) => setFormData({ ...formData, parent_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun (racine)</SelectItem>
                  {albums
                    ?.filter((a) => a.id !== album?.id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={formData.direction_id}
                onValueChange={(v) => setFormData({ ...formData, direction_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {directions?.map((dir) => (
                    <SelectItem key={dir.id} value={dir.id}>
                      {dir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Niveau d'accès</Label>
            <Select
              value={formData.access_level}
              onValueChange={(v: 'public' | 'private' | 'restricted') =>
                setFormData({ ...formData, access_level: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privé (équipe uniquement)</SelectItem>
                <SelectItem value="restricted">Restreint (directions sélectionnées)</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_public">Visible publiquement</Label>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_public: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createAlbum.isPending}>
              {createAlbum.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
