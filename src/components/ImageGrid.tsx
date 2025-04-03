"use client";

import { useEffect, useState } from "react";
import ImageCard from "./ImageCard";

// Define interface for image items
interface ImageItem {
  id: string;
  src: string;
  alt: string;
  category: string;
  aspectRatio?: number; // For masonry layout
}

// Updated image data using the correct file names
const categoryImages: ImageItem[] = [
  // Fashion category
  {
    id: "fashion-1",
    src: "/images/fashion/fashion_print_ads_20250331172718_022.jpg",
    alt: "Fashion advertisement featuring stylish clothing",
    category: "Fashion",
    aspectRatio: 1.2
  },
  {
    id: "fashion-2",
    src: "/images/fashion/fashion_print_ads_20250331172718_029.jpg",
    alt: "Fashion model in elegant attire",
    category: "Fashion",
    aspectRatio: 0.8
  },
  {
    id: "fashion-3",
    src: "/images/fashion/fashion_print_ads_20250331172718_039.jpg",
    alt: "High fashion editorial image",
    category: "Fashion",
    aspectRatio: 1.5
  },
  {
    id: "fashion-4",
    src: "/images/fashion/fashion_print_ads_20250331172718_001.jpg",
    alt: "Fashion design showcase",
    category: "Fashion",
    aspectRatio: 0.9
  },
  {
    id: "fashion-5",
    src: "/images/fashion/fashion_print_ads_20250331172718_002.jpg",
    alt: "Contemporary fashion advertisement",
    category: "Fashion",
    aspectRatio: 1.1
  },
  {
    id: "fashion-6",
    src: "/images/fashion/fashion_print_ads_20250331172718_003.jpg",
    alt: "Fashion brand campaign",
    category: "Fashion",
    aspectRatio: 1.3
  },
  {
    id: "fashion-7",
    src: "/images/fashion/fashion_print_ads_20250331172718_008.jpg",
    alt: "High-end fashion promotion",
    category: "Fashion",
    aspectRatio: 0.7
  },
  {
    id: "fashion-8",
    src: "/images/fashion/fashion_print_ads_20250331172718_009.jpg",
    alt: "Seasonal fashion collection",
    category: "Fashion",
    aspectRatio: 1.4
  },
  
  // Beauty category
  {
    id: "beauty-1",
    src: "/images/beauty/cosmetic_print_ads_20250331171649_001.jpg",
    alt: "Beauty product advertisement",
    category: "Beauty",
    aspectRatio: 0.8
  },
  {
    id: "beauty-2",
    src: "/images/beauty/cosmetic_print_ads_20250331171649_002.jpg",
    alt: "Skincare product showcase",
    category: "Beauty",
    aspectRatio: 1.1
  },
  {
    id: "beauty-3",
    src: "/images/beauty/cosmetic_print_ads_20250331171649_003.jpg",
    alt: "Makeup product promotion",
    category: "Beauty",
    aspectRatio: 1.5
  },
  {
    id: "beauty-4",
    src: "/images/beauty/cosmetic_print_ads_20250331171649_004.jpg",
    alt: "Cosmetics advertisement",
    category: "Beauty",
    aspectRatio: 0.9
  },
  {
    id: "beauty-5",
    src: "/images/beauty/cosmetic_print_ads_20250331171649_005.jpg",
    alt: "Beauty brand campaign",
    category: "Beauty",
    aspectRatio: 1.2
  },
  
  // Automotive category
  {
    id: "automotive-1",
    src: "/images/automotive/automotive_print_ads_20250331171045_001.jpg",
    alt: "Luxury car advertisement",
    category: "Automotive",
    aspectRatio: 1.7
  },
  {
    id: "automotive-2",
    src: "/images/automotive/automotive_print_ads_20250331171045_004.jpg",
    alt: "Sports car promotional image",
    category: "Automotive",
    aspectRatio: 1.3
  },
  {
    id: "automotive-3",
    src: "/images/automotive/automotive_print_ads_20250331171045_005.jpg",
    alt: "SUV marketing campaign",
    category: "Automotive",
    aspectRatio: 0.8
  },
  {
    id: "automotive-4",
    src: "/images/automotive/automotive_print_ads_20250331171045_006.jpg",
    alt: "Vehicle performance showcase",
    category: "Automotive",
    aspectRatio: 1.5
  },
  {
    id: "automotive-5",
    src: "/images/automotive/automotive_print_ads_20250331171045_007.jpg",
    alt: "Car model launch advertisement",
    category: "Automotive",
    aspectRatio: 0.9
  }
];

export default function ImageGrid() {
  const [columns, setColumns] = useState(5);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>(categoryImages);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get category from URL query if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      if (category) {
        setSelectedCategory(category);
        filterImagesByCategory(category);
      }
    }
  }, []);

  // Filter images by category
  const filterImagesByCategory = (category: string) => {
    if (category === 'All') {
      setFilteredImages(categoryImages);
    } else {
      setFilteredImages(categoryImages.filter(img => img.category === category));
    }
  };

  // Responsive column count based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(2);
      } else if (window.innerWidth < 768) {
        setColumns(3);
      } else if (window.innerWidth < 1024) {
        setColumns(3);
      } else if (window.innerWidth < 1440) {
        setColumns(4);
      } else {
        setColumns(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Distribute images into columns using a masonry layout approach
  const getColumnImages = () => {
    // Create array to track column heights
    const columnHeights = Array(columns).fill(0);
    const columnImages: ImageItem[][] = Array.from({ length: columns }, () => []);
    
    // Distribute images to shortest column each time
    filteredImages.forEach(image => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add image to that column
      columnImages[shortestColumnIndex].push(image);
      
      // Update the column height
      // If we have an aspect ratio, use it to calculate proportional height
      const imageHeight = image.aspectRatio ? 1 / image.aspectRatio : 1;
      columnHeights[shortestColumnIndex] += imageHeight;
    });

    return columnImages;
  };

  // Empty state when no images match the filter
  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">No images found for {selectedCategory} category.</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 pb-20">
      <div className="grid gap-4 md:gap-6" style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}>
        {getColumnImages().map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4 md:gap-6">
            {column.map((image) => (
              <div key={image.id}>
                <ImageCard 
                  src={image.src} 
                  alt={image.alt} 
                  aspectRatio={image.aspectRatio || 1} 
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
