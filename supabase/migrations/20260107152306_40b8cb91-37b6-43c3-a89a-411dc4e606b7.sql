-- =============================================
-- MODULE MÉDIATHÈQUE - TRANSFORMATION COMPLÈTE
-- =============================================

-- 1. Table des albums/collections
CREATE TABLE IF NOT EXISTS public.media_albums (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.media_albums(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    direction_id UUID REFERENCES public.directions(id),
    event_id UUID REFERENCES public.events(id),
    is_public BOOLEAN DEFAULT false,
    access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'restricted')),
    sort_order INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Table des tags
CREATE TABLE IF NOT EXISTS public.media_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.media_tags(id) ON DELETE SET NULL,
    color TEXT DEFAULT '#6366f1',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table principale des fichiers média (enrichie)
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Informations de base
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    -- Catégorie et type
    media_category TEXT DEFAULT 'photo' CHECK (media_category IN ('photo', 'video', 'document', 'infographic', 'audio', 'brochure', 'other')),
    -- Métadonnées
    author TEXT,
    photographer TEXT,
    location_country TEXT,
    location_city TEXT,
    location_venue TEXT,
    capture_date DATE,
    -- Métadonnées techniques (EXIF)
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    resolution TEXT,
    exif_data JSONB,
    -- Organisation
    album_id UUID REFERENCES public.media_albums(id) ON DELETE SET NULL,
    direction_id UUID REFERENCES public.directions(id),
    event_id UUID REFERENCES public.events(id),
    -- Droits et licence
    license_type TEXT DEFAULT 'all_rights_reserved' CHECK (license_type IN ('free_use', 'restricted', 'all_rights_reserved', 'creative_commons')),
    copyright_holder TEXT,
    credit_required BOOLEAN DEFAULT true,
    watermark_applied BOOLEAN DEFAULT false,
    -- Statistiques
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    -- Partage
    share_token TEXT UNIQUE,
    share_expires_at TIMESTAMP WITH TIME ZONE,
    share_password TEXT,
    -- Miniatures
    thumbnail_url TEXT,
    preview_url TEXT,
    -- Statut
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    is_public BOOLEAN DEFAULT false,
    -- Tracking
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Table de liaison média-tags
CREATE TABLE IF NOT EXISTS public.media_file_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.media_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(media_file_id, tag_id)
);

-- 5. Table des galeries publiques
CREATE TABLE IF NOT EXISTS public.media_galleries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    cover_image_url TEXT,
    gallery_type TEXT DEFAULT 'general' CHECK (gallery_type IN ('general', 'event', 'portfolio', 'highlights', 'products')),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    theme TEXT DEFAULT 'grid',
    settings JSONB DEFAULT '{}',
    direction_id UUID REFERENCES public.directions(id),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Table de liaison galerie-médias
CREATE TABLE IF NOT EXISTS public.media_gallery_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID NOT NULL REFERENCES public.media_galleries(id) ON DELETE CASCADE,
    media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(gallery_id, media_file_id)
);

-- 7. Table des liens de partage
CREATE TABLE IF NOT EXISTS public.media_share_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    media_file_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE,
    album_id UUID REFERENCES public.media_albums(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    password_hash TEXT,
    access_count INTEGER DEFAULT 0,
    max_access_count INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Table historique des téléchargements
CREATE TABLE IF NOT EXISTS public.media_downloads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
    user_id UUID,
    resolution TEXT,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Table des favoris utilisateur
CREATE TABLE IF NOT EXISTS public.media_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, media_file_id)
);

-- Enable RLS on all tables
ALTER TABLE public.media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_albums
CREATE POLICY "Albums viewable by authenticated users" ON public.media_albums
    FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Albums insertable by authenticated users" ON public.media_albums
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Albums updatable by creator" ON public.media_albums
    FOR UPDATE USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

CREATE POLICY "Albums deletable by creator or admin" ON public.media_albums
    FOR DELETE USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for media_tags
CREATE POLICY "Tags viewable by all authenticated" ON public.media_tags
    FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Tags insertable by authenticated" ON public.media_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Tags updatable by admin/manager" ON public.media_tags
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- RLS Policies for media_files
CREATE POLICY "Files viewable by authenticated" ON public.media_files
    FOR SELECT USING (auth.role() = 'authenticated' OR is_public = true);
    
CREATE POLICY "Files insertable by authenticated" ON public.media_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Files updatable by creator or admin" ON public.media_files
    FOR UPDATE USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

CREATE POLICY "Files deletable by creator or admin" ON public.media_files
    FOR DELETE USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for media_file_tags
CREATE POLICY "File tags viewable by authenticated" ON public.media_file_tags
    FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "File tags manageable by authenticated" ON public.media_file_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for media_galleries
CREATE POLICY "Galleries viewable by authenticated or published" ON public.media_galleries
    FOR SELECT USING (auth.role() = 'authenticated' OR is_published = true);
    
CREATE POLICY "Galleries insertable by authenticated" ON public.media_galleries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Galleries updatable by creator" ON public.media_galleries
    FOR UPDATE USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- RLS Policies for media_gallery_items
CREATE POLICY "Gallery items viewable by authenticated" ON public.media_gallery_items
    FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Gallery items manageable by authenticated" ON public.media_gallery_items
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for media_share_links
CREATE POLICY "Share links viewable by creator" ON public.media_share_links
    FOR SELECT USING (auth.uid() = created_by);
    
CREATE POLICY "Share links insertable by authenticated" ON public.media_share_links
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for media_downloads
CREATE POLICY "Downloads insertable by all" ON public.media_downloads
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Downloads viewable by admin" ON public.media_downloads
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- RLS Policies for media_favorites
CREATE POLICY "Favorites manageable by owner" ON public.media_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_album ON public.media_files(album_id);
CREATE INDEX IF NOT EXISTS idx_media_files_direction ON public.media_files(direction_id);
CREATE INDEX IF NOT EXISTS idx_media_files_event ON public.media_files(event_id);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON public.media_files(media_category);
CREATE INDEX IF NOT EXISTS idx_media_files_created ON public.media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_status ON public.media_files(status);
CREATE INDEX IF NOT EXISTS idx_media_file_tags_file ON public.media_file_tags(media_file_id);
CREATE INDEX IF NOT EXISTS idx_media_file_tags_tag ON public.media_file_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_media_albums_parent ON public.media_albums(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_tags_parent ON public.media_tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_galleries_slug ON public.media_galleries(slug);

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.media_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.media_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tag usage count
DROP TRIGGER IF EXISTS update_tag_usage ON public.media_file_tags;
CREATE TRIGGER update_tag_usage
    AFTER INSERT OR DELETE ON public.media_file_tags
    FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_count();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_media_view_count(media_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.media_files SET view_count = view_count + 1 WHERE id = media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_media_download_count(media_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.media_files SET download_count = download_count + 1 WHERE id = media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for media files if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media-library',
    'media-library',
    true,
    524288000, -- 500MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
          'video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska', 'video/webm',
          'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg',
          'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for media-library bucket
CREATE POLICY "Media library public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'media-library');

CREATE POLICY "Media library authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'media-library' AND auth.role() = 'authenticated');

CREATE POLICY "Media library owner delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'media-library' AND auth.role() = 'authenticated');

CREATE POLICY "Media library owner update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'media-library' AND auth.role() = 'authenticated');