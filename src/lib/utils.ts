import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts dominant color from an image URL
 * @param imageUrl URL of the image to extract color from
 * @returns Promise that resolves to a color in hex format (e.g. #FF0000)
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the image
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Handle CORS
      
      img.onload = () => {
        try {
          // Create a canvas to draw the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Use a small size for performance
          const size = 50;
          canvas.width = size;
          canvas.height = size;
          
          // Draw image to canvas
          ctx!.drawImage(img, 0, 0, size, size);
          
          // Get pixel data
          const imageData = ctx!.getImageData(0, 0, size, size).data;
          
          // Create an object to track color frequencies
          const colorCounts: Record<string, number> = {};
          let dominantColor = "#EEEEEE"; // Default fallback color
          let maxCount = 0;
          
          // Sample pixels (skip every few pixels for performance)
          for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Simplify colors to reduce the number of unique colors
            // Group similar colors together by rounding
            const simplifiedR = Math.round(r / 32) * 32;
            const simplifiedG = Math.round(g / 32) * 32;
            const simplifiedB = Math.round(b / 32) * 32;
            
            const colorKey = `${simplifiedR},${simplifiedG},${simplifiedB}`;
            
            // Count color occurrences
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
            
            // Track the most frequent color
            if (colorCounts[colorKey] > maxCount) {
              maxCount = colorCounts[colorKey];
              dominantColor = `#${simplifiedR.toString(16).padStart(2, '0')}${simplifiedG.toString(16).padStart(2, '0')}${simplifiedB.toString(16).padStart(2, '0')}`;
            }
          }
          
          resolve(dominantColor);
        } catch (err) {
          console.error("Error processing image data:", err);
          resolve("#EEEEEE"); // Default fallback color
        }
      };
      
      img.onerror = () => {
        console.error("Error loading image for color extraction");
        resolve("#EEEEEE"); // Default fallback color
      };
      
      // Start loading the image
      img.src = imageUrl;
    } catch (err) {
      console.error("Error in extractDominantColor:", err);
      resolve("#EEEEEE"); // Default fallback color
    }
  });
}

/**
 * Preloads an image and extracts its dominant color
 * @param imageUrl URL of the image to preload
 * @returns Promise that resolves to an object with the dominant color and a loaded flag
 */
export async function preloadImageWithColor(imageUrl: string): Promise<{ color: string, loaded: boolean }> {
  try {
    // Start by extracting the dominant color
    const dominantColor = await extractDominantColor(imageUrl);
    
    // Now preload the actual image
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ color: dominantColor, loaded: true });
      };
      
      img.onerror = () => {
        resolve({ color: dominantColor, loaded: false });
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error("Error preloading image:", error);
    return { color: "#EEEEEE", loaded: false };
  }
}
