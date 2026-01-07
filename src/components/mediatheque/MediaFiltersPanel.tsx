import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  X,
  ChevronDown,
  Image,
  Video,
  Music,
  FileText,
  FolderOpen,
  Tag,
  Calendar,
  Building2,
} from 'lucide-react';
import { useMediaAlbums, useMediaTags } from '@/hooks/useMediaLibrary';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MediaFilters } from '@/types/media';

interface MediaFiltersPanelProps {
  filters: MediaFilters;
  onChange: (filters: MediaFilters) => void;
  onClose?: () => void;
}

const categories = [
  { value: 'photo', label: 'Photos', icon: Image, color: 'bg-blue-500' },
  { value: 'video', label: 'Vidéos', icon: Video, color: 'bg-purple-500' },
  { value: 'audio', label: 'Audio', icon: Music, color: 'bg-green-500' },
  { value: 'document', label: 'Documents', icon: FileText, color: 'bg-orange-500' },
  { value: 'infographic', label: 'Infographies', icon: Image, color: 'bg-pink-500' },
  { value: 'brochure', label: 'Brochures', icon: FileText, color: 'bg-cyan-500' },
];

export function MediaFiltersPanel({ filters, onChange, onClose }: MediaFiltersPanelProps) {
  const { data: albums } = useMediaAlbums();
  const { data: tags } = useMediaTags();
  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data } = await supabase.from('directions').select('*').order('name');
      return data;
    },
  });

  const updateFilter = (key: keyof MediaFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  ).length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filtres</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Effacer
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Recherche */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Recherche
            </Label>
            <Input
              placeholder="Titre, description..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          <Separator />

          {/* Catégories */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Type de média
              </Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = filters.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() =>
                        updateFilter('category', isActive ? undefined : cat.value)
                      }
                      className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${cat.color}`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Albums */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Album
              </Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <Select
                value={filters.album_id || '__all__'}
                onValueChange={(v) => updateFilter('album_id', v === '__all__' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les albums" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les albums</SelectItem>
                  {albums?.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name} ({album.file_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Direction */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Direction
              </Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <Select
                value={filters.direction_id || '__all__'}
                onValueChange={(v) => updateFilter('direction_id', v === '__all__' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes les directions</SelectItem>
                  {directions?.map((dir) => (
                    <SelectItem key={dir.id} value={dir.id}>
                      {dir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Tags */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="flex flex-wrap gap-2">
                {tags?.slice(0, 20).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={filters.tags?.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: filters.tags?.includes(tag.id)
                        ? tag.color
                        : undefined,
                    }}
                    onClick={() => {
                      const currentTags = filters.tags || [];
                      if (currentTags.includes(tag.id)) {
                        updateFilter(
                          'tags',
                          currentTags.filter((t) => t !== tag.id)
                        );
                      } else {
                        updateFilter('tags', [...currentTags, tag.id]);
                      }
                    }}
                  >
                    {tag.name} ({tag.usage_count})
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Période */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Période
              </Label>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Du</Label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => updateFilter('date_from', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Au</Label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => updateFilter('date_to', e.target.value)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Auteur */}
          <div className="space-y-2">
            <Label>Auteur / Photographe</Label>
            <Input
              placeholder="Nom..."
              value={filters.author || ''}
              onChange={(e) => updateFilter('author', e.target.value)}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
