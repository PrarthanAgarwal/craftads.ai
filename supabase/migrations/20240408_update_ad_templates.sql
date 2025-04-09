-- Update ad_templates table with new metadata fields
ALTER TABLE public.ad_templates
ADD COLUMN IF NOT EXISTS product_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS industry_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS ad_format VARCHAR(100),
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(255) NOT NULL,
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS ad_templates_product_type_idx ON public.ad_templates(product_type);
CREATE INDEX IF NOT EXISTS ad_templates_brand_category_idx ON public.ad_templates(brand_category);
CREATE INDEX IF NOT EXISTS ad_templates_industry_category_idx ON public.ad_templates(industry_category);
CREATE INDEX IF NOT EXISTS ad_templates_ad_format_idx ON public.ad_templates(ad_format);

-- Update the search_templates function to include new fields
CREATE OR REPLACE FUNCTION search_templates(
    search_query TEXT,
    category_slug TEXT DEFAULT NULL,
    p_product_type TEXT DEFAULT NULL,
    p_brand_category TEXT DEFAULT NULL,
    p_industry_category TEXT DEFAULT NULL,
    p_ad_format TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
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
    product_type VARCHAR,
    brand_category VARCHAR,
    industry_category VARCHAR,
    ad_format VARCHAR,
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
            t.product_type,
            t.brand_category,
            t.industry_category,
            t.ad_format,
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
            AND (p_product_type IS NULL OR t.product_type = p_product_type)
            AND (p_brand_category IS NULL OR t.brand_category = p_brand_category)
            AND (p_industry_category IS NULL OR t.industry_category = p_industry_category)
            AND (p_ad_format IS NULL OR t.ad_format = p_ad_format)
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
        tc.product_type,
        tc.brand_category,
        tc.industry_category,
        tc.ad_format,
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
    ORDER BY tc.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$; 