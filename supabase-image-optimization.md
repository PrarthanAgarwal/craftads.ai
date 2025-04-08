# Supabase Image Storage & Optimization Guide

## Table of Contents
- [Overview](#overview)
- [Storage Setup](#storage-setup)
- [Image Optimization Strategies](#image-optimization-strategies)
- [Implementation Code Examples](#implementation-code-examples)
- [Frontend Loading Optimization](#frontend-loading-optimization)
- [Storage Management & Cleanup](#storage-management--cleanup)
- [Cost Analysis](#cost-analysis)
- [Best Practices Summary](#best-practices-summary)

## Overview

This guide provides comprehensive strategies for efficiently storing and loading images through Supabase Storage with minimal latency and optimal storage costs. The approach combines server-side and client-side optimizations to deliver a balance of image quality, performance, and cost efficiency.

## Storage Setup

### 1. Bucket Structure

Create dedicated buckets in Supabase Storage for different types of images:

```
supabase
  └── storage
      ├── templates      # For ad template images
      ├── user-uploads   # For user-uploaded images
      └── generations    # For AI-generated images
```

### 2. Security Policies

Set appropriate security policies for each bucket:

```sql
-- Public read-only access for templates
CREATE POLICY "Templates are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates');

-- Authenticated users can read/write their own uploads
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid() = owner);

CREATE POLICY "Users can access their own uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads' AND auth.uid() = owner);

-- User-specific access for generations
CREATE POLICY "Users can access their own generations"
ON storage.objects FOR SELECT
USING (bucket_id = 'generations' AND auth.uid() = owner);
```

## Image Optimization Strategies

### 1. Image Format Selection

Use modern formats for better compression:

| Format | Advantages | Use Case |
|--------|------------|----------|
| WebP   | ~30% smaller than JPEG with comparable quality | Main format for most images |
| AVIF   | ~50% smaller than JPEG, best compression | High-quality images where supported |
| JPEG   | Universal support | Fallback format |
| PNG    | Lossless, supports transparency | Only when transparency needed |

### 2. Size Variants

Generate and store multiple size variants of each image:

| Variant   | Dimensions      | Quality | Use Case               |
|-----------|-----------------|---------|------------------------|
| thumbnail | 200×200 max     | 70%     | Previews, thumbnails   |
| small     | 400×400 max     | 75%     | Mobile, list views     |
| medium    | 800×800 max     | 80%     | Tablets, main content  |
| large     | 1200×1200 max   | 85%     | Desktop, detail views  |
| original  | 2000×2000 max   | 90%     | Full-screen viewing    |

## Implementation Code Examples

### 1. Basic Image Upload Utility

```typescript
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image to Supabase Storage
 * @param file - The file object to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @returns The URL of the uploaded file
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: 'templates' | 'user-uploads' | 'generations',
  folder: string = ''
): Promise<string | null> {
  try {
    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
}
```

### 2. Server-Side Image Optimization with Sharp

```typescript
import sharp from 'sharp';

/**
 * Optimizes an image before uploading to Supabase
 * @param file - Original file
 * @param options - Optimization options
 * @returns Optimized file blob
 */
export async function optimizeImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp' | 'avif' | 'png';
  } = {}
): Promise<Buffer> {
  const { 
    maxWidth = 1200, 
    maxHeight = 1200, 
    quality = 80, 
    format = 'webp' 
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  let transformer = sharp(buffer)
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true
    });
  
  let outputBuffer;
  
  switch (format) {
    case 'webp':
      outputBuffer = await transformer.webp({ quality }).toBuffer();
      break;
    case 'avif':
      outputBuffer = await transformer.avif({ quality }).toBuffer();
      break;
    case 'jpeg':
      outputBuffer = await transformer.jpeg({ quality }).toBuffer();
      break;
    case 'png':
      outputBuffer = await transformer.png({ quality }).toBuffer();
      break;
  }
  
  return outputBuffer;
}
```

### 3. Creating and Uploading Image Variants

```typescript
/**
 * Creates multiple variants of an image and uploads them to Supabase
 * @param file - Original image file
 * @param bucket - Storage bucket name
 * @param folder - Optional folder path
 * @returns Record of variant names and their URLs
 */
export async function uploadImageVariants(
  file: File, 
  bucket: string, 
  folder: string = ''
): Promise<Record<string, string>> {
  // Define variants with different sizes and qualities
  const variants = {
    thumbnail: { maxWidth: 200, maxHeight: 200, quality: 70 },
    small: { maxWidth: 400, maxHeight: 400, quality: 75 },
    medium: { maxWidth: 800, maxHeight: 800, quality: 80 },
    large: { maxWidth: 1200, maxHeight: 1200, quality: 85 },
    original: { maxWidth: 2000, maxHeight: 2000, quality: 90 }
  };
  
  const urls: Record<string, string> = {};
  const baseFileName = uuidv4();
  
  // Process and upload each variant
  for (const [size, options] of Object.entries(variants)) {
    // Optimize the image for this variant
    const optimizedImage = await optimizeImage(file, {
      ...options,
      format: 'webp'
    });
    
    // Upload to Supabase
    const fileName = `${baseFileName}_${size}.webp`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, optimizedImage, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp'
      });
      
    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      urls[size] = publicUrl;
    }
  }
  
  return urls;
}
```

## Frontend Loading Optimization

### 1. Progressive Image Component

```tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  blur?: boolean;
  className?: string;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  blur = true,
  className = '',
}: ProgressiveImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  return (
    <div 
      className={`overflow-hidden relative ${className}`}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`
          transition-opacity duration-300 
          ${loading ? 'opacity-0' : 'opacity-100'}
          ${blur && !error && !loading ? 'filter-none' : 'blur-none'}
        `}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTllYmVlIi8+PC9zdmc+"
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400">Image not available</span>
        </div>
      )}
    </div>
  );
}
```

### 2. Next.js Configuration for Optimized Images

```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // 1 hour caching
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
```

### 3. Adaptive Loading Based on Connection Speed

```typescript
/**
 * Determines which image quality to load based on connection speed
 * @returns Quality level: low, medium, or high
 */
export function getAdaptiveImageQuality(): 'low' | 'medium' | 'high' {
  // Check if navigator.connection is available (not in all browsers)
  const connection = 
    navigator.connection || 
    (navigator as any).mozConnection || 
    (navigator as any).webkitConnection;
  
  if (!connection) return 'medium';
  
  // Based on effective connection type or saveData preference
  if (connection.saveData) return 'low';
  
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return 'medium';
    case '4g':
      return 'high';
    default:
      return 'medium';
  }
}

/**
 * Gets the appropriate image URL based on connection quality
 * @param urls Object containing URLs for different quality variants
 * @returns The appropriate URL for current connection
 */
export function getAdaptiveImageUrl(urls: {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
}): string {
  const quality = getAdaptiveImageQuality();
  
  switch (quality) {
    case 'low':
      return urls.small || urls.thumbnail || urls.medium || urls.large || urls.original || '';
    case 'medium':
      return urls.medium || urls.large || urls.small || urls.original || '';
    case 'high':
      return urls.large || urls.original || urls.medium || '';
    default:
      return urls.medium || '';
  }
}
```

## Storage Management & Cleanup

### 1. Image Usage Tracking

```typescript
/**
 * Tracks image usage in the database
 * @param imageUrl The URL of the image
 * @param context Context where the image was used
 */
export async function trackImageUsage(
  imageUrl: string, 
  context: 'template' | 'generation' | 'user-upload'
): Promise<void> {
  // Extract the file path from the URL
  const urlParts = imageUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  await supabase
    .from('image_usage_logs')
    .insert({
      image_url: imageUrl,
      file_name: fileName,
      context,
      used_at: new Date().toISOString()
    });
}
```

### 2. Cleanup Unused Images

```typescript
/**
 * Cleans up unused images from Supabase Storage
 * @param olderThanDays Only delete images older than this many days
 * @param bucket Bucket name to clean
 */
export async function cleanupUnusedImages(
  olderThanDays = 30,
  bucket = 'templates'
): Promise<void> {
  try {
    const olderThanDate = new Date();
    olderThanDate.setDate(olderThanDate.getDate() - olderThanDays);
    
    // Get all images referenced in database
    const { data: usedImages, error: dbError } = await supabase
      .from('ad_templates')
      .select('preview_image_url');
      
    if (dbError) {
      console.error('Error fetching used images:', dbError);
      return;
    }
    
    // Extract file paths from URLs
    const usedImagePaths = usedImages.map(img => {
      const url = new URL(img.preview_image_url);
      return url.pathname.split('/').pop() || '';
    });
    
    // List all files in bucket
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from(bucket)
      .list();
      
    if (listError || !allFiles) {
      console.error('Error listing bucket files:', listError);
      return;
    }
    
    // Find unused files
    const unusedFiles = allFiles.filter(file => {
      const fileCreatedAt = new Date(file.created_at);
      return !usedImagePaths.includes(file.name) && fileCreatedAt < olderThanDate;
    });
    
    // Delete unused files
    if (unusedFiles.length > 0) {
      const filesToDelete = unusedFiles.map(file => file.name);
      const { error: deleteError } = await supabase
        .storage
        .from(bucket)
        .remove(filesToDelete);
        
      if (deleteError) {
        console.error('Error deleting unused files:', deleteError);
      } else {
        console.log(`Successfully deleted ${filesToDelete.length} unused files`);
      }
    }
  } catch (error) {
    console.error('Error in cleanupUnusedImages:', error);
  }
}
```

## Cost Analysis

### Storage Costs Calculation for 5,000 Images

Supabase pricing for storage (as of 2023):
- Free tier: 1GB storage + 2GB bandwidth
- Pro tier: $25/month includes 100GB storage + 200GB bandwidth
- Additional storage: $0.021 per GB per day ($0.65/month per GB)

#### Estimated Storage Size by Format and Variant

Assuming typical web imagery:

| Image Type | Original Size (JPG) | WebP Size | Variants Total |
|------------|---------------------|-----------|----------------|
| Simple UI  | ~100KB              | ~70KB     | ~150KB         |
| Photo      | ~1MB                | ~700KB    | ~1.2MB         |
| Complex    | ~2MB                | ~1.4MB    | ~2.3MB         |

For a mixed collection assuming:
- 50% simple UI images (2,500 images)
- 40% photos (2,000 images)
- 10% complex images (500 images)

#### Storage Usage Calculation

1. **Simple UI images (2,500)**:
   - With variants: 2,500 × 150KB = 375,000KB = 375MB

2. **Photos (2,000)**:
   - With variants: 2,000 × 1.2MB = 2,400MB = 2.4GB

3. **Complex images (500)**:
   - With variants: 500 × 2.3MB = 1,150MB = 1.15GB

**Total storage needed**: 375MB + 2.4GB + 1.15GB = 3.925GB (approximately 4GB)

#### Monthly Cost Estimate

- With Free tier (1GB): You'd need additional 3GB storage = $1.95/month
- With Pro tier (100GB): Covered within included storage

#### Annual Cost Comparison

- Free tier with additional storage: ~$23.40/year
- Pro tier (if needed for other features): $300/year (includes 100GB storage)

#### Bandwidth Considerations

Assuming each image is viewed 10 times per month on average:
- 5,000 images × average variant size (select appropriate variant) × 10 views

For comparison:
- If serving original JPEGs: ~60GB bandwidth/month
- With optimized WebP + variants: ~25GB bandwidth/month
- Additional bandwidth on Pro tier: $0.09/GB

## Best Practices Summary

1. **Use WebP or AVIF formats** for all images to reduce file size by 30-50%

2. **Generate and store multiple size variants** of each image to serve appropriate sizes to different devices

3. **Implement lazy loading** for images below the fold to reduce initial page load time

4. **Use progressive loading techniques** to show low-quality placeholders while full images load

5. **Leverage browser caching** with appropriate cache-control headers

6. **Implement regular cleanup** of unused images to minimize storage costs

7. **Track image usage statistics** to identify optimization opportunities

8. **Use responsive images** with srcset to let the browser choose the best size

9. **Set up CDN caching** for frequently accessed images

10. **Compress images intelligently** with quality settings that balance size and visual quality

11. **Consider client-side connection speed** when deciding which image variants to serve

12. **Implement WebP with JPEG fallback** for older browsers 