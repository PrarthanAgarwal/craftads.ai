declare module 'upload-templates' {
  export const createClient: any;
  export const fs: any;
  export const path: any;
  export const uuidv4: any;
  export const slugify: any;
  export const dotenv: any;
}

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TemplateMetadata {
  dimensions: string;
  product_type: string;
  brand_category: string;
  industry_category: string;
  ad_format: string;
  width: number;
  height: number;
  file_name: string;
}

// Map of folder names to category slugs
const categoryMap: Record<string, string> = {
  // New category slugs
  'app-software': 'app-software',
  'beauty-personal-care': 'beauty-personal-care',
  'consumer-goods': 'consumer-goods',
  'education': 'education',
  'electronics-tech': 'electronics-tech',
  'fashion': 'fashion',
  'fitness-wellness': 'fitness-wellness',
  'food-beverage': 'food-beverage',
  'footwear': 'footwear',
  'games-toys': 'games-toys',
  'healthcare': 'healthcare',
  'home-garden': 'home-garden',
  'jewelry-watches': 'jewelry-watches',
  'kids-baby': 'kids-baby',
  'pets': 'pets',
  'retail-marketplace': 'retail-marketplace',
  'services': 'services',
  'sports-outdoor': 'sports-outdoor',
  'travel-accessories': 'travel-accessories',
  
  // Map old folder names to new categories
  'bottles': 'food-beverage',
  'electronic': 'electronics-tech',
  'fitness': 'fitness-wellness',
  'food-beverages': 'food-beverage',
  'personal care': 'beauty-personal-care',
  'service': 'services',
  'toys': 'games-toys',
  'Travel Accessories': 'travel-accessories'
};

async function uploadTemplateToSupabase(
  imagePath: string,
  metadata: TemplateMetadata,
  category: string
) {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const storagePath = `templates/${category}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('templates')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error(`Error uploading ${fileName}:`, uploadError);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('templates')
      .getPublicUrl(storagePath);

    // Create template record
    const title = path.parse(fileName).name
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const templateData = {
      title,
      slug: slugify(title, { lower: true }),
      description: `${metadata.product_type} - ${metadata.brand_category}`,
      preview_image_url: publicUrl,
      width: metadata.width,
      height: metadata.height,
      product_type: metadata.product_type,
      brand_category: metadata.brand_category,
      industry_category: metadata.industry_category,
      ad_format: metadata.ad_format,
      storage_path: storagePath,
      original_filename: fileName,
      is_active: true,
      tags: [metadata.product_type, metadata.brand_category, metadata.industry_category, metadata.ad_format]
    };

    const { data: template, error: templateError } = await supabase
      .from('ad_templates')
      .insert(templateData)
      .select()
      .single();

    if (templateError) {
      console.error(`Error creating template record for ${fileName}:`, templateError);
      return null;
    }

    // Associate template with category
    const categorySlug = categoryMap[category] || category;
    
    // Get category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('template_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    if (categoryError) {
      console.error(`Error finding category for ${categorySlug}:`, categoryError);
      return template;
    }
    
    // Create category relationship
    const { error: relationshipError } = await supabase
      .from('template_category_relationships')
      .insert({
        template_id: template.id,
        category_id: categoryData.id
      });
    
    if (relationshipError) {
      console.error(`Error creating category relationship for ${fileName}:`, relationshipError);
    } else {
      console.log(`Associated ${fileName} with category ${categorySlug}`);
    }

    console.log(`Successfully processed ${fileName}`);
    return template;
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
    return null;
  }
}

async function processTemplates() {
  const baseDir = path.join(process.cwd(), 'public', 'images');
  const webpDir = path.join(baseDir, 'webp');
  const metadataDir = path.join(baseDir, 'metadata', 'json');

  // Get all category directories
  const categories = fs.readdirSync(webpDir);

  for (const category of categories) {
    console.log(`Processing category: ${category}`);
    const categoryDir = path.join(webpDir, category);
    const files = fs.readdirSync(categoryDir);

    for (const file of files) {
      if (!file.endsWith('.webp')) continue;

      const imagePath = path.join(categoryDir, file);
      const metadataFile = path.join(
        metadataDir,
        file.replace('.webp', '.json')
      );

      if (!fs.existsSync(metadataFile)) {
        console.warn(`No metadata file found for ${file}`);
        continue;
      }

      const metadata = JSON.parse(
        fs.readFileSync(metadataFile, 'utf-8')
      ) as TemplateMetadata;

      await uploadTemplateToSupabase(imagePath, metadata, category);
    }
  }
}

// Run the script
processTemplates()
  .then(() => {
    console.log('Template upload completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during template upload:', error);
    process.exit(1);
  }); 