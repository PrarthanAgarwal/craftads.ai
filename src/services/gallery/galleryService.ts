import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { Json } from '@/lib/json.types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type TemplateCategory = Database['public']['Tables']['template_categories']['Row'];
export type AdTemplate = Database['public']['Tables']['ad_templates']['Row'] & {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export type SearchTemplateResult = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  preview_image_url: string;
  width: number;
  height: number;
  is_premium: boolean;
  is_featured: boolean;
  categories: Json;
  tags: string[];
  view_count: number;
  usage_count: number;
};

export type TemplateSearchParams = {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
  isPremium?: boolean;
  isFeatured?: boolean;
};

export class GalleryService {
  /**
   * Get all template categories
   */
  static async getCategories(): Promise<TemplateCategory[]> {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single template category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<TemplateCategory | null> {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        return null;
      }
      console.error(`Error fetching category with slug ${slug}:`, error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data;
  }

  /**
   * Search for templates using the search_templates function
   */
  static async searchTemplates(params: TemplateSearchParams = {}): Promise<AdTemplate[]> {
    const { 
      query = '', 
      category = null, 
      limit = 50, 
      offset = 0,
      isPremium,
      isFeatured
    } = params;

    // Call the stored procedure for base search
    let { data, error } = await supabase
      .rpc('search_templates', {
        search_query: query,
        category_slug: category,
        limit_count: limit,
        offset_count: offset
      });

    if (error) {
      console.error('Error searching templates:', error);
      throw new Error(`Failed to search templates: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Apply additional filters in-memory
    // These could be moved to the database function for better performance
    if (isPremium !== undefined) {
      data = data.filter(template => template.is_premium === isPremium);
    }
    
    if (isFeatured !== undefined) {
      data = data.filter(template => template.is_featured === isFeatured);
    }

    // Convert the search results to AdTemplate format
    return data.map(result => {
      // Convert categories Json to the expected type
      let categoryObjects: { id: string; name: string; slug: string; }[] = [];
      
      if (Array.isArray(result.categories)) {
        categoryObjects = result.categories.map((cat: any) => {
          // Ensure each category has the required properties
          return {
            id: cat.id || '',
            name: cat.name || '',
            slug: cat.slug || ''
          };
        });
      }
      
      return {
        ...result,
        categories: categoryObjects,
        // Add default values for fields that might be missing in the search results
        is_active: true,
        metadata: {} as Json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as AdTemplate;
    });
  }

  /**
   * Get a single template by slug
   */
  static async getTemplateBySlug(slug: string): Promise<AdTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('ad_templates')
        .select(`
          *,
          template_category_relationships!inner (
            template_categories!inner (
              id,
              name,
              slug
            )
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error(`Error fetching template with slug ${slug}:`, error);
        throw new Error(`Failed to fetch template: ${error.message}`);
      }

      // Transform the data structure to match the AdTemplate type
      const template = {
        ...data,
        categories: data.template_category_relationships.map((relation: any) => relation.template_categories)
      };

      return template as unknown as AdTemplate;
    } catch (error) {
      console.error(`Error in getTemplateBySlug for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get user's favorite templates
   */
  static async getUserFavorites(userId: string): Promise<AdTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorite_templates')
        .select(`
          template_id,
          ad_templates (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user favorites:', error);
        throw new Error(`Failed to fetch favorites: ${error.message}`);
      }

      // Extract and transform the template data
      const templates = data?.map((item: any) => ({
        ...item.ad_templates,
        categories: [] // Categories are not fetched here for simplicity
      })) || [];

      return templates;
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      throw error;
    }
  }

  /**
   * Add a template to user's favorites
   */
  static async addFavorite(userId: string, templateId: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorite_templates')
      .insert({
        user_id: userId,
        template_id: templateId
      });

    if (error) {
      console.error('Error adding favorite:', error);
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
  }

  /**
   * Remove a template from user's favorites
   */
  static async removeFavorite(userId: string, templateId: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorite_templates')
      .delete()
      .eq('user_id', userId)
      .eq('template_id', templateId);

    if (error) {
      console.error('Error removing favorite:', error);
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }
  }

  /**
   * Check if a template is in user's favorites
   */
  static async isFavorite(userId: string, templateId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_favorite_templates')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking favorite status:', error);
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Submit feedback for a template
   */
  static async submitFeedback(
    userId: string, 
    templateId: string, 
    rating: number, 
    comments?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('template_feedback')
      .upsert({
        user_id: userId,
        template_id: templateId,
        rating,
        comments: comments || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,template_id'
      });

    if (error) {
      console.error('Error submitting feedback:', error);
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }
  }

  /**
   * Get templates with filtering options
   */
  static async getTemplates(params: TemplateSearchParams = {}): Promise<AdTemplate[]> {
    const { 
      query = '', 
      category = null, 
      limit = 50, 
      offset = 0,
      isPremium,
      isFeatured
    } = params;

    try {
      // Start building the query to get templates
      let templatesQuery = supabase
        .from('ad_templates')
        .select(`
          *,
          template_category_relationships!inner (
            category:template_categories!inner (
              id,
              name,
              slug
            )
          )
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
        
      // Apply filters if provided
      if (query) {
        templatesQuery = templatesQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      
      if (isPremium !== undefined) {
        templatesQuery = templatesQuery.eq('is_premium', isPremium);
      }
      
      if (isFeatured !== undefined) {
        templatesQuery = templatesQuery.eq('is_featured', isFeatured);
      }
      
      // Filter by category if provided
      if (category) {
        // We need to use the inner join we already set up with template_category_relationships
        templatesQuery = templatesQuery.eq('template_category_relationships.category.slug', category);
      }
      
      // Execute the query
      const { data, error } = await templatesQuery;
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }
      
      if (!data) {
        return [];
      }
      
      // Transform the data to the expected format
      return data.map(item => {
        // Extract categories from the relationships
        const categories = item.template_category_relationships.map((rel: any) => rel.category);
        
        // Return the template with categories in the expected format
        return {
          ...item,
          categories,
          template_category_relationships: undefined // Remove the relationship data from the output
        } as AdTemplate;
      });
    } catch (error) {
      console.error('Error in getTemplates:', error);
      throw error;
    }
  }
} 