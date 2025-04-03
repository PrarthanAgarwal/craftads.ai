"use client";

import { useEffect, useState } from "react";
import ImageCard from "../ImageCard";
import { AdTemplate } from "@/services/gallery/galleryService";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ServerGalleryGrid() {
  const [columns, setColumns] = useState(4);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch templates based on search params
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters from URL search params
        const category = searchParams.get('category');
        const query = searchParams.get('q');
        const featured = searchParams.get('featured');
        const premium = searchParams.get('premium');
        
        // Construct API URL with search parameters
        let url = '/api/gallery/templates?';
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (query) params.append('q', query);
        if (featured) params.append('featured', featured);
        if (premium) params.append('premium', premium);
        
        // Set default limit
        params.append('limit', '50');
        
        // Fetch templates from API
        const response = await fetch(`/api/gallery/templates?${params.toString()}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load templates');
        }
        
        setTemplates(data.data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [searchParams]);

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

  // Distribute templates into columns using a masonry layout approach
  const getColumnTemplates = () => {
    // Create array to track column heights
    const columnHeights = Array(columns).fill(0);
    const columnTemplates: AdTemplate[][] = Array.from({ length: columns }, () => []);
    
    // Distribute templates to shortest column each time
    templates.forEach(template => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add template to that column
      columnTemplates[shortestColumnIndex].push(template);
      
      // Update the column height - use aspect ratio based on width/height
      const aspectRatio = template.width / template.height;
      const imageHeight = aspectRatio ? 1 / aspectRatio : 1;
      columnHeights[shortestColumnIndex] += imageHeight;
    });

    return columnTemplates;
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-6 md:px-8 pb-20">
        <div className="grid gap-4 md:gap-6" style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-4 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg" style={{ 
                  paddingBottom: '100%',
                  position: 'relative'
                }}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-500">Error: {error}</p>
        <button 
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state when no templates match the filter
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">No templates found matching your criteria.</p>
        <button 
          onClick={() => router.push(pathname)} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 pb-20">
      <div className="grid gap-4 md:gap-6" style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}>
        {getColumnTemplates().map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4 md:gap-6">
            {column.map((template) => (
              <div key={template.id}>
                <ImageCard 
                  src={template.preview_image_url} 
                  alt={template.title} 
                  aspectRatio={template.width / template.height} 
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 