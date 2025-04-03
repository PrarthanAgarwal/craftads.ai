/**
 * Import Existing Images Script
 * 
 * This script scans your public/images directory and imports all existing images
 * into the gallery system database. It organizes them by the folder structure.
 * 
 * Usage:
 * - Run: npx ts-node scripts/import_existing_images.ts
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const dotenv = require('dotenv');
const sharp = require('sharp');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
console.log(`Connecting to Supabase at: ${supabaseUrl}`);
console.log(`Service key available: ${supabaseServiceKey ? 'Yes' : 'No'}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Base directory for images
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
// Base URL for images (relative to website root)
const BASE_IMAGE_URL = '/images';

// Mapping of folder names to friendly category names
const CATEGORY_MAPPING = {
  'automotive': 'Automotive',
  'beauty': 'Beauty',
  'beverage': 'Beverages',
  'fashion': 'Fashion',
  'finance': 'Finance',
  'food': 'Food',
  'health': 'Health & Wellness',
  'home': 'Home & Decor',
  'mock_generations': 'Example Generations'
};

// Enable or disable actual database writes
const DRY_RUN = false;

/**
 * @typedef {Object} ImageMetadata
 * @property {string} fileName
 * @property {string} title
 * @property {string} directory
 * @property {string} category
 * @property {number} width
 * @property {number} height
 * @property {string} fullPath
 * @property {string} relativePath
 */

/**
 * Get image dimensions using Sharp
 * @param {string} filePath
 * @returns {Promise<{width: number, height: number}>}
 */
async function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width || 1080, // Default if can't detect
      height: metadata.height || 1080 // Default if can't detect
    };
  } catch (error) {
    console.error(`Error reading image dimensions for ${filePath}:`, error);
    return { width: 1080, height: 1080 }; // Default fallback
  }
}

/**
 * Create title from filename
 * @param {string} filename
 * @returns {string}
 */
function createTitleFromFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Convert dashes and underscores to spaces
  let title = nameWithoutExt.replace(/[-_]/g, ' ');
  
  // Capitalize words
  title = title.split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return title;
}

/**
 * Scan directories and collect image metadata
 * @returns {Promise<ImageMetadata[]>}
 */
async function scanDirectories(): Promise<any[]> {
  const results = [];
  
  // Get all directories
  const directories = fs.readdirSync(PUBLIC_IMAGES_DIR, { withFileTypes: true })
    .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
    .map((dirent: { name: string }) => dirent.name);
  
  for (const dir of directories) {
    const dirPath = path.join(PUBLIC_IMAGES_DIR, dir);
    
    // Skip if not in our mapping
    if (!CATEGORY_MAPPING[dir as keyof typeof CATEGORY_MAPPING]) {
      console.log(`Skipping directory ${dir} - not in category mapping`);
      continue;
    }
    
    // Get all image files in the directory
    const files = fs.readdirSync(dirPath)
      .filter((file: string) => /\.(jpg|jpeg|png|webp)$/i.test(file));
    
    console.log(`Found ${files.length} images in ${dir}`);
    
    // Process each image
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const relativePath = path.join(BASE_IMAGE_URL, dir, file).replace(/\\/g, '/');
      
      // Get image dimensions
      const { width, height } = await getImageDimensions(fullPath);
      
      results.push({
        fileName: file,
        title: createTitleFromFilename(file),
        directory: dir,
        category: CATEGORY_MAPPING[dir as keyof typeof CATEGORY_MAPPING],
        width,
        height,
        fullPath,
        relativePath
      });
    }
  }
  
  return results;
}

/**
 * Create categories in the database
 * @returns {Promise<Map<string, string>>}
 */
async function createCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();
  
  console.log('Creating categories...');
  
  for (const [dirName, categoryName] of Object.entries(CATEGORY_MAPPING)) {
    const slug = slugify(dirName, { lower: true });
    
    console.log(`Processing category: ${categoryName} (${slug})`);
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create/update category: ${categoryName}`);
      categoryMap.set(slug, uuidv4()); // Fake ID for dry run
      continue;
    }
    
    try {
      // Check if category exists
      const { data: existingCategory, error: selectError } = await supabase
        .from('template_categories')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`Error checking if category exists for ${categoryName}:`, selectError);
        continue;
      }
      
      if (existingCategory) {
        console.log(`Category ${categoryName} already exists, updating...`);
        
        const { error: updateError } = await supabase
          .from('template_categories')
          .update({
            name: categoryName,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCategory.id);
        
        if (updateError) {
          console.error(`Error updating category ${categoryName}:`, updateError);
          continue;
        }
        
        categoryMap.set(slug, existingCategory.id);
      } else {
        console.log(`Creating new category: ${categoryName}`);
        
        const { data: newCategory, error: insertError } = await supabase
          .from('template_categories')
          .insert({
            name: categoryName,
            slug,
            icon_name: null, // You can update this manually later
            color: null,     // You can update this manually later
            is_active: true,
            sort_order: Object.keys(CATEGORY_MAPPING).indexOf(dirName)
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`Error creating category ${categoryName}:`, insertError);
          continue;
        }
        
        if (!newCategory || !newCategory.id) {
          console.error(`Failed to create category ${categoryName}: No ID returned`);
          continue;
        }
        
        categoryMap.set(slug, newCategory.id);
      }
    } catch (error) {
      console.error(`Unexpected error processing category ${categoryName}:`, error);
    }
  }
  
  return categoryMap;
}

/**
 * Import images into the database
 * @param {ImageMetadata[]} images
 * @param {Map<string, string>} categoryMap
 */
async function importImages(images: any[], categoryMap: Map<string, string>): Promise<void> {
  console.log(`Importing ${images.length} images...`);
  
  for (const image of images) {
    const slug = slugify(image.title, { lower: true });
    const categorySlug = slugify(image.directory, { lower: true });
    const categoryId = categoryMap.get(categorySlug);
    
    if (!categoryId) {
      console.warn(`Category ${image.category} not found, skipping image ${image.fileName}`);
      continue;
    }
    
    console.log(`Processing image: ${image.title} (${slug})`);
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create/update template: ${image.title}`);
      continue;
    }
    
    try {
      // Check if template exists
      const { data: existingTemplate, error: selectError } = await supabase
        .from('ad_templates')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`Error checking if template exists for ${image.title}:`, selectError);
        continue;
      }
      
      let templateId;
      
      if (existingTemplate) {
        console.log(`Template ${image.title} already exists, updating...`);
        
        templateId = existingTemplate.id;
        
        const { error: updateError } = await supabase
          .from('ad_templates')
          .update({
            title: image.title,
            preview_image_url: image.relativePath,
            width: image.width,
            height: image.height,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
        
        if (updateError) {
          console.error(`Error updating template ${image.title}:`, updateError);
          continue;
        }
      } else {
        console.log(`Creating new template: ${image.title}`);
        
        const { data: newTemplate, error: insertError } = await supabase
          .from('ad_templates')
          .insert({
            title: image.title,
            slug,
            description: `${image.category} template for advertisements`,
            preview_image_url: image.relativePath,
            width: image.width,
            height: image.height,
            is_premium: false,
            is_featured: Math.random() < 0.2, // Randomly feature some templates
            tags: [image.category.toLowerCase(), 'advertisement']
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`Error creating template ${image.title}:`, insertError);
          continue;
        }
        
        if (!newTemplate || !newTemplate.id) {
          console.error(`Failed to create template ${image.title}: No ID returned`);
          continue;
        }
        
        templateId = newTemplate.id;
      }
      
      // Clear existing category relationships
      const { error: deleteError } = await supabase
        .from('template_category_relationships')
        .delete()
        .eq('template_id', templateId);
      
      if (deleteError) {
        console.error(`Error clearing category relationships for template ${image.title}:`, deleteError);
      }
      
      // Create new category relationship
      const { error: relationError } = await supabase
        .from('template_category_relationships')
        .insert({
          template_id: templateId,
          category_id: categoryId
        });
      
      if (relationError) {
        console.error(`Error linking template ${image.title} to category:`, relationError);
      }
    } catch (error) {
      console.error(`Unexpected error processing template ${image.title}:`, error);
    }
  }
}

/**
 * Main function to import existing images
 */
async function importExistingImages() {
  try {
    console.log('Starting import of existing images...');
    
    if (DRY_RUN) {
      console.log('DRY RUN MODE: No actual database changes will be made');
    }
    
    // Step 1: Scan directories
    const images = await scanDirectories();
    console.log(`Found ${images.length} images total`);
    
    // Step 2: Create categories
    const categoryMap = await createCategories();
    
    // Step 3: Import images
    await importImages(images, categoryMap);
    
    // Save to JSON file for reference
    const outputData = {
      categories: Array.from(categoryMap.entries()).map(([slug, id]) => ({ 
        slug, 
        id, 
        name: Object.entries(CATEGORY_MAPPING).find(([dirName]) => 
          slugify(dirName, { lower: true }) === slug
        )?.[1] 
      })),
      images: images.map(img => ({
        ...img,
        categoryId: categoryMap.get(slugify(img.directory, { lower: true }))
      }))
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'data', 'gallery_import_data.json'), 
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('Import completed successfully!');
    console.log('Gallery data saved to data/gallery_import_data.json for reference');
  } catch (error) {
    console.error('Error importing images:', error);
    process.exit(1);
  }
}

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Run the script
importExistingImages(); 