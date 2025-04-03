# Gallery System Implementation

This document explains the implementation of the Pinterest-style gallery system for ad templates in the CraftAds application.

## Overview

The gallery system enables users to:
1. Browse 1000+ predefined ad templates
2. Filter templates by category, features, and more
3. Save favorite templates for later use
4. Use templates as a starting point for ad generation

## Architecture

### Database Schema

The gallery system is powered by several new database tables:

- **template_categories**: Categories for organizing templates
- **ad_templates**: The actual ad templates with metadata
- **template_category_relationships**: Many-to-many relationships between templates and categories
- **user_favorite_templates**: User's saved favorite templates
- **template_feedback**: User ratings and comments for templates

### Service Layer

The `GalleryService` class (`src/services/gallery/galleryService.ts`) provides methods for:

- Searching and filtering templates
- Managing categories
- Accessing template details
- Handling user favorites

### API Routes

The system exposes the following API endpoints:

- `/api/gallery/templates`: Search and browse templates
- `/api/gallery/categories`: Get template categories
- `/api/gallery/favorites`: Manage user favorites

## Transitioning from Hardcoded Data

Previously, the application used hardcoded images for development purposes. The implementation now uses a server-side approach where:

1. Templates are stored in the database with metadata
2. Images are referenced via URLs (can be stored in Supabase storage or external CDNs)
3. The frontend fetches template data through APIs instead of using hardcoded data

## Migration Process

To implement the gallery system:

1. Run the migration to create necessary database tables:
   ```bash
   npm run migrate
   ```

2. Populate the database with initial template data:
   ```bash
   npm run populate-gallery -- --file=data/templates/sample_data.json
   ```

## Frontend Integration

The frontend components can now be updated to fetch data from the API instead of using hardcoded images:

```typescript
// Before (hardcoded data)
const templates = [
  { id: 1, title: "Modern Template", imageUrl: "/images/template1.jpg" },
  { id: 2, title: "Fashion Template", imageUrl: "/images/template2.jpg" },
  // ...
];

// After (server-side data)
const [templates, setTemplates] = useState([]);

useEffect(() => {
  const fetchTemplates = async () => {
    const response = await fetch('/api/gallery/templates');
    const data = await response.json();
    if (data.success) {
      setTemplates(data.data);
    }
  };
  
  fetchTemplates();
}, []);
```

## Template Data Structure

Each template includes:

```typescript
{
  id: string;
  title: string;
  slug: string;
  description: string | null;
  preview_image_url: string;
  width: number;
  height: number;
  is_premium: boolean;
  is_featured: boolean;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  tags: string[];
  view_count: number;
  usage_count: number;
}
```

## Using Templates with Generation

When a user selects a template for customization:

1. The template is loaded as a reference image
2. User uploads their product image
3. The generation process uses both images to create a new ad
4. The template usage is tracked in the database

Example integration with the generation flow:

```typescript
// In the generation process
const handleGenerateFromTemplate = async (templateId) => {
  // 1. Fetch template details
  const response = await fetch(`/api/gallery/templates?slug=${templateSlug}`);
  const data = await response.json();
  
  if (!data.success) {
    toast.error("Failed to load template");
    return;
  }
  
  const template = data.data;
  
  // 2. Use the template for generation
  const generationResponse = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      referenceImage: template.preview_image_url, // Use template as reference
      productImage: productImageBase64,
      promptTemplate: 'template-adaptation',
      template_source_id: template.id
    }),
  });
  
  // 3. Process generation result
  // ...
};
```

## Maintenance and Updates

To add new templates to the gallery:

1. Prepare template data in JSON or CSV format
2. Run the population script with the new data file:
   ```bash
   npm run populate-gallery -- --file=path/to/new_templates.json
   ```

## Monitoring and Analytics

The system tracks:

- Template view counts
- Template usage counts
- User favorites
- Template ratings and feedback

This data can be used to:
- Identify popular templates
- Recommend templates to users
- Improve template design and offerings 