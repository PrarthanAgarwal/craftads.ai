-- Gallery System for 1000+ Pinterest-Style Ads
-- Migration: 20230403_gallery_templates.sql

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Template Categories
CREATE TABLE IF NOT EXISTS public.template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    color VARCHAR(20),
    parent_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS template_categories_slug_idx ON public.template_categories(slug);
CREATE INDEX IF NOT EXISTS template_categories_parent_id_idx ON public.template_categories(parent_id);
CREATE INDEX IF NOT EXISTS template_categories_is_active_idx ON public.template_categories(is_active);
CREATE INDEX IF NOT EXISTS template_categories_sort_order_idx ON public.template_categories(sort_order);

-- Ad Templates (Gallery Items)
CREATE TABLE IF NOT EXISTS public.ad_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    preview_image_url VARCHAR(255) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL, 
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ad_templates_slug_idx ON public.ad_templates(slug);
CREATE INDEX IF NOT EXISTS ad_templates_is_active_idx ON public.ad_templates(is_active);
CREATE INDEX IF NOT EXISTS ad_templates_is_featured_idx ON public.ad_templates(is_featured);
CREATE INDEX IF NOT EXISTS ad_templates_is_premium_idx ON public.ad_templates(is_premium);
CREATE INDEX IF NOT EXISTS ad_templates_created_at_idx ON public.ad_templates(created_at);
CREATE INDEX IF NOT EXISTS ad_templates_view_count_idx ON public.ad_templates(view_count);
CREATE INDEX IF NOT EXISTS ad_templates_usage_count_idx ON public.ad_templates(usage_count);

-- Template Category Relationships (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.template_category_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.ad_templates(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.template_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS template_category_relationships_unique_idx 
    ON public.template_category_relationships(template_id, category_id);
CREATE INDEX IF NOT EXISTS template_category_relationships_template_id_idx 
    ON public.template_category_relationships(template_id);
CREATE INDEX IF NOT EXISTS template_category_relationships_category_id_idx 
    ON public.template_category_relationships(category_id);

-- User Favorite Templates
CREATE TABLE IF NOT EXISTS public.user_favorite_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.ad_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS user_favorite_templates_unique_idx 
    ON public.user_favorite_templates(user_id, template_id);
CREATE INDEX IF NOT EXISTS user_favorite_templates_user_id_idx 
    ON public.user_favorite_templates(user_id);
CREATE INDEX IF NOT EXISTS user_favorite_templates_template_id_idx 
    ON public.user_favorite_templates(template_id);

-- Template Feedback
CREATE TABLE IF NOT EXISTS public.template_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.ad_templates(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS template_feedback_user_id_idx ON public.template_feedback(user_id);
CREATE INDEX IF NOT EXISTS template_feedback_template_id_idx ON public.template_feedback(template_id);
CREATE UNIQUE INDEX IF NOT EXISTS template_feedback_unique_idx ON public.template_feedback(user_id, template_id);

-- Update Generations table to reference templates
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS template_source_id UUID REFERENCES public.ad_templates(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS generations_template_source_id_idx ON public.generations(template_source_id);

-- Apply updated_at triggers to new tables with updated_at column
CREATE TRIGGER update_template_categories_updated_at
  BEFORE UPDATE ON public.template_categories
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ad_templates_updated_at
  BEFORE UPDATE ON public.ad_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_template_feedback_updated_at
  BEFORE UPDATE ON public.template_feedback
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Template View Tracking Function
CREATE OR REPLACE FUNCTION increment_template_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ad_templates
  SET view_count = view_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Template Usage Tracking Function
CREATE OR REPLACE FUNCTION increment_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_source_id IS NOT NULL THEN
    UPDATE public.ad_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_source_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Template View Tracking Trigger
CREATE TRIGGER track_template_view
  AFTER INSERT ON public.user_favorite_templates
  FOR EACH ROW EXECUTE PROCEDURE increment_template_view_count();

-- Template Usage Tracking Trigger
CREATE TRIGGER track_template_usage
  AFTER INSERT ON public.generations
  FOR EACH ROW EXECUTE PROCEDURE increment_template_usage_count();

-- Helper function to search templates with full-text capabilities
CREATE OR REPLACE FUNCTION search_templates(search_query TEXT, category_slug TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 50, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    description TEXT,
    preview_image_url VARCHAR,
    width INTEGER,
    height INTEGER,
    is_premium BOOLEAN,
    is_featured BOOLEAN,
    categories JSONB,
    tags JSONB,
    view_count INTEGER,
    usage_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH template_with_categories AS (
        SELECT 
            t.id,
            t.title,
            t.slug,
            t.description,
            t.preview_image_url,
            t.width,
            t.height,
            t.is_premium,
            t.is_featured,
            t.tags,
            t.view_count,
            t.usage_count,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', c.id,
                            'name', c.name,
                            'slug', c.slug
                        )
                    )
                    FROM template_category_relationships tcr
                    JOIN template_categories c ON tcr.category_id = c.id
                    WHERE tcr.template_id = t.id
                ),
                '[]'::jsonb
            ) AS categories
        FROM ad_templates t
        WHERE t.is_active = true
            AND (
                search_query IS NULL
                OR search_query = ''
                OR t.title ILIKE '%' || search_query || '%'
                OR t.description ILIKE '%' || search_query || '%'
                OR EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(t.tags) tag
                    WHERE tag ILIKE '%' || search_query || '%'
                )
            )
    )
    SELECT 
        tc.id,
        tc.title,
        tc.slug,
        tc.description,
        tc.preview_image_url,
        tc.width,
        tc.height,
        tc.is_premium,
        tc.is_featured,
        tc.categories,
        tc.tags,
        tc.view_count,
        tc.usage_count
    FROM template_with_categories tc
    WHERE 
        category_slug IS NULL
        OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(tc.categories) cat
            WHERE cat->>'slug' = category_slug
        )
    ORDER BY 
        tc.is_featured DESC,
        tc.usage_count DESC,
        tc.view_count DESC,
        tc.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$; 