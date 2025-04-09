"use client";

import { useEffect, useContext, createContext, useState } from "react";
import { extractDominantColor } from "@/lib/utils";

// Define a context to store prefetched image colors
interface ImageColorCache {
  [imageUrl: string]: string;
}

const ImageColorContext = createContext<{
  colorCache: ImageColorCache;
  addToCache: (url: string, color: string) => void;
}>({
  colorCache: {},
  addToCache: () => {},
});

// Custom hook to access the color cache
export const useImageColors = () => useContext(ImageColorContext);

interface ImagePrefetcherProps {
  children: React.ReactNode;
  imagesToPrefetch?: string[];
  batchSize?: number;
}

export default function ImagePrefetcher({ 
  children, 
  imagesToPrefetch = [], 
  batchSize = 5 
}: ImagePrefetcherProps) {
  const [colorCache, setColorCache] = useState<ImageColorCache>({});
  
  // Add a color to the cache
  const addToCache = (url: string, color: string) => {
    setColorCache(prev => ({
      ...prev,
      [url]: color
    }));
  };
  
  // Prefetch images in batches
  useEffect(() => {
    if (!imagesToPrefetch.length) return;
    
    let isMounted = true;
    
    const prefetchBatch = async (startIndex: number) => {
      if (!isMounted) return;
      
      const batch = imagesToPrefetch.slice(
        startIndex, 
        startIndex + batchSize
      );
      
      // Process this batch
      await Promise.all(
        batch.map(async (imageUrl) => {
          try {
            // Only process if not already in cache
            if (!colorCache[imageUrl]) {
              const color = await extractDominantColor(imageUrl);
              
              if (isMounted) {
                addToCache(imageUrl, color);
              }
            }
          } catch (error) {
            console.error(`Failed to prefetch image color: ${imageUrl}`, error);
          }
        })
      );
      
      // Process next batch if there are more images
      if (isMounted && startIndex + batchSize < imagesToPrefetch.length) {
        setTimeout(() => {
          prefetchBatch(startIndex + batchSize);
        }, 100); // Small delay to not block the main thread
      }
    };
    
    // Start the first batch
    prefetchBatch(0);
    
    return () => {
      isMounted = false;
    };
  }, [imagesToPrefetch, batchSize, colorCache]);
  
  return (
    <ImageColorContext.Provider value={{ colorCache, addToCache }}>
      {children}
    </ImageColorContext.Provider>
  );
} 