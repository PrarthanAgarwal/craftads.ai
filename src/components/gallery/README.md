# Pinterest-Style Color-Aware Skeleton Loader

This implementation creates Pinterest-like skeleton loaders that display the dominant color of images before they load. Here's how it works:

## How It Works

1. **Color Extraction**: We extract the dominant color from each image using canvas and JavaScript.
   - The image is loaded into a canvas
   - Pixel data is analyzed to find the most common color
   - Similar colors are grouped to find the overall dominant tone

2. **Prefetching and Caching**: 
   - We prefetch colors for upcoming images in batches
   - Colors are stored in a React context to avoid re-extraction
   - Prefetching happens in the background to not block the UI

3. **Color Skeleton Loading**:
   - While an image loads, we show a skeleton placeholder with the image's dominant color
   - This creates a smooth visual transition from color to image
   - The placeholder has the same aspect ratio as the actual image

4. **Performance Optimizations**:
   - Colors are extracted from a small version of the image (50x50px)
   - Similar colors are grouped to reduce computation
   - Images are processed in batches to prevent UI freezing
   - Colors are cached to prevent re-extraction

## Component Breakdown

- **`extractDominantColor`**: Utility function that uses canvas to analyze image pixels and extract the dominant color
- **`ImagePrefetcher`**: React context provider that prefetches and caches image colors
- **`ColorSkeletonImage`**: Component that displays a color skeleton while the image loads
- **`ServerGalleryGrid`**: Gallery component that uses the above components to create a Pinterest-like experience

## How Pinterest Does It

Pinterest likely implements a similar approach but with some key differences:

1. They probably extract colors server-side for all images during upload/processing
2. The colors are likely stored in their database alongside image metadata
3. When loading the grid, they send both image URLs and their dominant colors in the API response
4. This eliminates the need for client-side color extraction, making it more efficient

## Potential Improvements

1. Process images server-side to extract colors during upload
2. Store color data in our database or as metadata with the images
3. Implement progressive image loading with low-quality image placeholders
4. Add background color extraction for better color representation of images with transparency 