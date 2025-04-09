"use client";

import { useState, useEffect, useRef } from "react";
import { extractDominantColor } from "@/lib/utils";
import { useImageColors } from "./gallery/ImagePrefetcher";

interface ColorSkeletonImageProps {
  src: string;
  alt: string;
  aspectRatio?: number;
  className?: string;
  onClick?: () => void;
}

export default function ColorSkeletonImage({ 
  src, 
  alt, 
  aspectRatio = 1, 
  className = "", 
  onClick 
}: ColorSkeletonImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dominantColor, setDominantColor] = useState("#EEEEEE");
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { colorCache, addToCache } = useImageColors();
  
  // Extract the dominant color as soon as the component mounts
  useEffect(() => {
    // Check if image is already cached and loaded
    if (imgRef.current?.complete) {
      setImageLoaded(true);
      return;
    }
    
    // Check if color is already in cache
    if (colorCache[src]) {
      setDominantColor(colorCache[src]);
      return;
    }
    
    // Extract dominant color if not in cache
    const extractColor = async () => {
      try {
        const color = await extractDominantColor(src);
        setDominantColor(color);
        
        // Add to cache for future use
        addToCache(src, color);
      } catch (error) {
        console.error("Failed to extract color:", error);
      }
    };
    
    extractColor();
  }, [src, colorCache, addToCache]);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Consider the load process complete, even though it failed
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        paddingBottom: `${100 / aspectRatio}%`,
      }}
      onClick={onClick}
    >
      {/* Skeleton with dominant color */}
      {!imageLoaded && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: dominantColor }}
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Error fallback */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400">Image not available</span>
        </div>
      )}
    </div>
  );
} 