export interface MediaFile {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  mime_type?: string;
  media_category: 'photo' | 'video' | 'document' | 'infographic' | 'audio' | 'brochure' | 'other';
  author?: string;
  photographer?: string;
  location_country?: string;
  location_city?: string;
  location_venue?: string;
  capture_date?: string;
  width?: number;
  height?: number;
  duration_seconds?: number;
  resolution?: string;
  exif_data?: Record<string, any>;
  album_id?: string;
  direction_id?: string;
  event_id?: string;
  license_type: 'free_use' | 'restricted' | 'all_rights_reserved' | 'creative_commons';
  copyright_holder?: string;
  credit_required: boolean;
  watermark_applied: boolean;
  view_count: number;
  download_count: number;
  is_featured: boolean;
  share_token?: string;
  share_expires_at?: string;
  share_password?: string;
  thumbnail_url?: string;
  preview_url?: string;
  status: 'active' | 'archived' | 'deleted';
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  album?: MediaAlbum;
  direction?: { id: string; name: string };
  event?: { id: string; title: string };
  tags?: MediaTag[];
}

export interface MediaAlbum {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  cover_image_url?: string;
  direction_id?: string;
  event_id?: string;
  is_public: boolean;
  access_level: 'public' | 'private' | 'restricted';
  sort_order: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Computed
  file_count?: number;
  children?: MediaAlbum[];
}

export interface MediaTag {
  id: string;
  name: string;
  parent_id?: string;
  color: string;
  usage_count: number;
  created_at: string;
}

export interface MediaGallery {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  cover_image_url?: string;
  gallery_type: 'general' | 'event' | 'portfolio' | 'highlights' | 'products';
  is_published: boolean;
  published_at?: string;
  theme: string;
  settings: Record<string, any>;
  direction_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFilters {
  search?: string;
  category?: string;
  album_id?: string;
  direction_id?: string;
  event_id?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  author?: string;
  status?: string;
  is_featured?: boolean;
}

export type MediaViewMode = 'grid' | 'list' | 'masonry';
export type MediaGridSize = 'small' | 'medium' | 'large';
