import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MediaFile, MediaAlbum, MediaTag, MediaFilters } from '@/types/media';

export function useMediaFiles(filters: MediaFilters = {}) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['media-files', filters],
    queryFn: async () => {
      let query = supabase
        .from('media_files')
        .select(`
          *,
          album:media_albums(id, name),
          direction:directions(id, name),
          event:events(id, title)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq('media_category', filters.category);
      }
      if (filters.album_id) {
        query = query.eq('album_id', filters.album_id);
      }
      if (filters.direction_id) {
        query = query.eq('direction_id', filters.direction_id);
      }
      if (filters.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters.author) {
        query = query.or(`author.ilike.%${filters.author}%,photographer.ilike.%${filters.author}%`);
      }
      if (filters.is_featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MediaFile[];
    },
  });
}

export function useMediaAlbums() {
  return useQuery({
    queryKey: ['media-albums'],
    queryFn: async () => {
      const { data: albums, error } = await supabase
        .from('media_albums')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get file counts
      const { data: counts } = await supabase
        .from('media_files')
        .select('album_id')
        .eq('status', 'active');

      const countMap: Record<string, number> = {};
      counts?.forEach(f => {
        if (f.album_id) {
          countMap[f.album_id] = (countMap[f.album_id] || 0) + 1;
        }
      });

      return albums.map(album => ({
        ...album,
        file_count: countMap[album.id] || 0,
      })) as MediaAlbum[];
    },
  });
}

export function useMediaTags() {
  return useQuery({
    queryKey: ['media-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_tags')
        .select('*')
        .order('usage_count', { ascending: false });
      if (error) throw error;
      return data as MediaTag[];
    },
  });
}

export function useUploadMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Partial<MediaFile> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media-library')
        .getPublicUrl(filePath);

      // Determine category from mime type
      let category: MediaFile['media_category'] = 'other';
      if (file.type.startsWith('image/')) category = 'photo';
      else if (file.type.startsWith('video/')) category = 'video';
      else if (file.type.startsWith('audio/')) category = 'audio';
      else if (file.type === 'application/pdf') category = 'document';

      // Insert file record
      const { data, error } = await supabase
        .from('media_files')
        .insert({
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
          description: metadata.description,
          file_url: publicUrl,
          file_name: file.name,
          file_type: fileExt || '',
          file_size: file.size,
          mime_type: file.type,
          media_category: category,
          album_id: metadata.album_id,
          direction_id: metadata.direction_id,
          event_id: metadata.event_id,
          author: metadata.author,
          photographer: metadata.photographer,
          location_country: metadata.location_country,
          location_city: metadata.location_city,
          license_type: metadata.license_type || 'all_rights_reserved',
          copyright_holder: metadata.copyright_holder,
          credit_required: metadata.credit_required ?? true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      queryClient.invalidateQueries({ queryKey: ['media-albums'] });
      toast({ title: 'Fichier uploadé avec succès' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });
}

export function useDeleteMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('media_files')
        .update({ status: 'deleted' })
        .eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast({ title: 'Fichier supprimé' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });
}

export function useCreateAlbum() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (album: Partial<MediaAlbum>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('media_albums')
        .insert({
          name: album.name,
          description: album.description,
          parent_id: album.parent_id,
          direction_id: album.direction_id,
          event_id: album.event_id,
          is_public: album.is_public ?? false,
          access_level: album.access_level ?? 'private',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-albums'] });
      toast({ title: 'Album créé avec succès' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });
}

export function useCreateTag() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: { name: string; color?: string; parent_id?: string }) => {
      const { data, error } = await supabase
        .from('media_tags')
        .insert({
          name: tag.name,
          color: tag.color || '#6366f1',
          parent_id: tag.parent_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-tags'] });
      toast({ title: 'Tag créé' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });
}

export function useMediaStats() {
  return useQuery({
    queryKey: ['media-stats'],
    queryFn: async () => {
      const { data: files } = await supabase
        .from('media_files')
        .select('media_category, file_size, view_count, download_count')
        .eq('status', 'active');

      const stats = {
        totalFiles: files?.length || 0,
        totalSize: files?.reduce((acc, f) => acc + (f.file_size || 0), 0) || 0,
        totalViews: files?.reduce((acc, f) => acc + (f.view_count || 0), 0) || 0,
        totalDownloads: files?.reduce((acc, f) => acc + (f.download_count || 0), 0) || 0,
        byCategory: {} as Record<string, number>,
      };

      files?.forEach(f => {
        stats.byCategory[f.media_category] = (stats.byCategory[f.media_category] || 0) + 1;
      });

      return stats;
    },
  });
}
