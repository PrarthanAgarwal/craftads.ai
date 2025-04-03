/**
 * Populate Gallery Templates Script
 * 
 * This script imports gallery templates from a CSV or JSON file into the Supabase database.
 * Run this script after applying the migration file to populate the gallery with initial data.
 * 
 * Usage:
 * - Save your template data in CSV or JSON format in the data/templates directory
 * - Run: npx ts-node scripts/populate_gallery.ts --file=data/templates/initial_data.json
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse as csvParse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Note: requires service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface TemplateInput {
  title: string;
  description?: string;
  preview_image_url: string;
  width: number;
  height: number;
  is_premium?: boolean;
  is_featured?: boolean;
  categories: string[]; // Category slugs
  tags?: string[];
}

interface CategoryInput {
  name: string;
  description?: string;
  icon_name?: string;
  color?: string;
  parent?: string; // Parent category slug
}

// Helper function to generate a slug
function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true
  });
}

// Helper function to read JSON file
function readJsonFile(filePath: string): any {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

// Helper function to read CSV file
function readCsvFile(filePath: string): any[] {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return csvParse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
}

// Main function to populate the database
async function populateGallery(filePath: string) {
  try {
    console.log(`Reading data from ${filePath}...`);
    
    // Read data file
    const ext = path.extname(filePath).toLowerCase();
    let data: any;
    
    if (ext === '.json') {
      data = readJsonFile(filePath);
    } else if (ext === '.csv') {
      data = readCsvFile(filePath);
    } else {
      throw new Error('Unsupported file format. Please use JSON or CSV files.');
    }
    
    // Extract categories and templates from data
    const { categories, templates } = data;
    
    if (!categories || !templates) {
      throw new Error('Invalid data format. The file must contain "categories" and "templates" arrays.');
    }
    
    // Populate categories first
    console.log(`Importing ${categories.length} categories...`);
    const categoryMap = new Map<string, string>(); // Map of slug to ID
    
    for (const category of categories) {
      const slug = generateSlug(category.name);
      
      const { data: existingCategory } = await supabase
        .from('template_categories')
        .select('id')
        .eq('slug', slug)
        .single();
      
      let categoryId: string;
      
      if (existingCategory) {
        // Update existing category
        categoryId = existingCategory.id;
        await supabase
          .from('template_categories')
          .update({
            name: category.name,
            description: category.description || null,
            icon_name: category.icon_name || null,
            color: category.color || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', categoryId);
        
        console.log(`Updated category: ${category.name} (${slug})`);
      } else {
        // Insert new category
        const { data: newCategory, error } = await supabase
          .from('template_categories')
          .insert({
            name: category.name,
            slug,
            description: category.description || null,
            icon_name: category.icon_name || null,
            color: category.color || null
          })
          .select('id')
          .single();
        
        if (error) {
          console.error(`Error creating category ${category.name}:`, error);
          continue;
        }
        
        categoryId = newCategory.id;
        console.log(`Created category: ${category.name} (${slug})`);
      }
      
      categoryMap.set(slug, categoryId);
    }
    
    // Process parent relationships in a second pass
    for (const category of categories) {
      if (category.parent) {
        const slug = generateSlug(category.name);
        const parentSlug = category.parent;
        
        const categoryId = categoryMap.get(slug);
        const parentId = categoryMap.get(parentSlug);
        
        if (categoryId && parentId) {
          await supabase
            .from('template_categories')
            .update({ parent_id: parentId })
            .eq('id', categoryId);
          
          console.log(`Set parent relationship: ${slug} -> ${parentSlug}`);
        }
      }
    }
    
    // Populate templates
    console.log(`Importing ${templates.length} templates...`);
    
    for (const template of templates) {
      const slug = generateSlug(template.title);
      
      const { data: existingTemplate } = await supabase
        .from('ad_templates')
        .select('id')
        .eq('slug', slug)
        .single();
      
      let templateId: string;
      
      if (existingTemplate) {
        // Update existing template
        templateId = existingTemplate.id;
        await supabase
          .from('ad_templates')
          .update({
            title: template.title,
            description: template.description || null,
            preview_image_url: template.preview_image_url,
            width: template.width,
            height: template.height,
            is_premium: template.is_premium || false,
            is_featured: template.is_featured || false,
            tags: template.tags || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
        
        console.log(`Updated template: ${template.title} (${slug})`);
      } else {
        // Insert new template
        const { data: newTemplate, error } = await supabase
          .from('ad_templates')
          .insert({
            title: template.title,
            slug,
            description: template.description || null,
            preview_image_url: template.preview_image_url,
            width: template.width,
            height: template.height,
            is_premium: template.is_premium || false,
            is_featured: template.is_featured || false,
            tags: template.tags || []
          })
          .select('id')
          .single();
        
        if (error) {
          console.error(`Error creating template ${template.title}:`, error);
          continue;
        }
        
        templateId = newTemplate.id;
        console.log(`Created template: ${template.title} (${slug})`);
      }
      
      // Clear existing category relationships for this template
      await supabase
        .from('template_category_relationships')
        .delete()
        .eq('template_id', templateId);
      
      // Create category relationships
      if (template.categories && template.categories.length > 0) {
        for (const categorySlug of template.categories) {
          const categoryId = categoryMap.get(categorySlug);
          
          if (categoryId) {
            const { error } = await supabase
              .from('template_category_relationships')
              .insert({
                template_id: templateId,
                category_id: categoryId
              });
            
            if (error) {
              console.error(`Error linking template ${slug} to category ${categorySlug}:`, error);
            } else {
              console.log(`Linked template ${slug} to category ${categorySlug}`);
            }
          } else {
            console.warn(`Category ${categorySlug} not found for template ${slug}`);
          }
        }
      }
    }
    
    console.log('Gallery population completed successfully!');
    
  } catch (error) {
    console.error('Error populating gallery:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let filePath = '';

for (const arg of args) {
  if (arg.startsWith('--file=')) {
    filePath = arg.substring(7);
  }
}

if (!filePath) {
  console.error('Please provide a file path using --file=path/to/data.json');
  process.exit(1);
}

// Run the script
populateGallery(filePath); 