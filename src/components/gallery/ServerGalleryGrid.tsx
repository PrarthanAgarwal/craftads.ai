"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ImageCard from "../ImageCard";
import ColorSkeletonImage from "../ColorSkeletonImage";
import { AdTemplate } from "@/services/gallery/galleryService";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2, ImageIcon } from "lucide-react";
import { extractDominantColor } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImagePrefetcher from "./ImagePrefetcher";

export default function ServerGalleryGrid() {
  const [columns, setColumns] = useState(4);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const [randomSeed, setRandomSeed] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Generate a random seed on initial component mount only
  useEffect(() => {
    // Generate a random seed for this session
    const seed = Math.random().toString(36).substring(2, 15);
    setRandomSeed(seed);
  }, []);

  // Handler for infinite scroll
  const loadMoreTemplates = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      // Build query params
      const category = searchParams.get('category');
      const query = searchParams.get('q');
      const featured = searchParams.get('featured');
      const premium = searchParams.get('premium');
      
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (query) params.append('q', query);
      if (featured) params.append('featured', featured);
      if (premium) params.append('premium', premium);
      
      // Include the offset for pagination
      const limit = 20;
      const offset = (nextPage - 1) * limit;
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      // Add random seed to maintain consistent order during scrolling
      params.append('seed', randomSeed);
      
      const response = await fetch(`/api/gallery/templates?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load more templates');
      }
      
      const newTemplates = data.data || [];
      
      // If we received fewer items than requested, there are no more to load
      if (newTemplates.length < limit) {
        setHasMore(false);
      }
      
      // Append new templates to existing ones
      const validNewTemplates = Array.isArray(newTemplates) 
        ? newTemplates.filter(template => 
            template && typeof template === 'object' && template.id
          ) 
        : [];

      setTemplates(prev => [...prev, ...validNewTemplates]);
    } catch (err) {
      console.error('Error fetching more templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more templates');
    }
  }, [hasMore, loading, page, searchParams, randomSeed]);

  // Fetch templates based on search params
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      setHasMore(true);
      setPage(1);
      
      try {
        // Build query param
        const category = searchParams.get('category');
        const query = searchParams.get('q');
        const featured = searchParams.get('featured');
        const premium = searchParams.get('premium');
        
        // Construct API URL with search parameters
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (query) params.append('q', query);
        if (featured) params.append('featured', featured);
        if (premium) params.append('premium', premium);
        
        // Set default limit for initial load
        params.append('limit', '20');
        
        // Add random seed for randomized ordering
        params.append('seed', randomSeed);
        
        // Add random param only on initial load to get randomized order
        if (initialLoad) {
          params.append('random', 'true');
          setInitialLoad(false);
        }
        
        // Fetch templates from API
        const response = await fetch(`/api/gallery/templates?${params.toString()}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load templates');
        }
        
        setTemplates(data.data || []);
        
        // If we received fewer than requested items, there are no more to load
        if (data.data && data.data.length < 20) {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [searchParams, randomSeed, initialLoad]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreTemplates();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMoreTemplates]);

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
      // Check if template exists before accessing properties
      if (!template) return;
      
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add template to that column
      columnTemplates[shortestColumnIndex].push(template);
      
      // Update the column height - use aspect ratio based on width/height
      // Use default values if width or height is missing
      const width = typeof template.width === 'number' ? template.width : 1;
      const height = typeof template.height === 'number' ? template.height : 1;
      const aspectRatio = width / height;
      const imageHeight = aspectRatio ? 1 / aspectRatio : 1;
      columnHeights[shortestColumnIndex] += imageHeight;
    });

    return columnTemplates;
  };

  // Extract all image URLs for prefetching
  const allImageUrls = templates
    .map(template => template?.preview_image_url)
    .filter(Boolean) as string[];

  // Initial loading state
  if (loading && templates.length === 0) {
    // Create dummy templates with placeholder URLs for skeleton loading
    const dummyTemplates = Array.from({ length: columns * 3 }).map((_, index) => ({
      id: `skeleton-${index}`,
      title: "Loading...",
      preview_image_url: `/api/gallery/templates/${index}`, // This URL won't actually load
      width: 1,
      height: 1
    }));
    
    // Distribute dummy templates into columns
    const columnTemplates: any[][] = Array.from({ length: columns }, () => []);
    dummyTemplates.forEach((template, index) => {
      const columnIndex = index % columns;
      columnTemplates[columnIndex].push(template);
    });
    
    return (
      <div className="px-6 md:px-8 pb-20">
        <div className="grid gap-4 md:gap-6" style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}>
          {columnTemplates.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-4 md:gap-6">
              {column.map((template) => (
                <div key={template.id} className="rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-200 animate-pulse rounded-lg" 
                    style={{ 
                      paddingBottom: '100%',
                      position: 'relative'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && templates.length === 0) {
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
    <ImagePrefetcher imagesToPrefetch={allImageUrls}>
      <>
        <div className="px-6 md:px-8 pb-20">
          <div className="grid gap-4 md:gap-6" style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}>
            {getColumnTemplates().map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-4 md:gap-6">
                {column.map((template) => (
                  <div key={template?.id || Math.random().toString()}>
                    <ColorSkeletonImage 
                      src={template?.preview_image_url || '/placeholders/image-placeholder.jpg'} 
                      alt={template?.title || 'Template image'} 
                      aspectRatio={
                        (template?.width && template?.height) 
                          ? template.width / template.height 
                          : 1
                      }
                      className="rounded-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl"
                      onClick={() => setSelectedTemplate(template?.id || null)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <div 
              ref={loadingRef} 
              className="flex justify-center items-center py-10"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading more...</span>
            </div>
          )}
          
          {/* End of content message */}
          {!hasMore && templates.length > 0 && (
            <div className="text-center py-10 text-gray-500">
              You've reached the end of the gallery
            </div>
          )}
        </div>

        {/* Template detail dialog */}
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl">
            {selectedTemplate && (
              <div className="p-4">
                {/* Render template details here */}
                <h2 className="text-xl font-bold">Template Details</h2>
                <p>ID: {selectedTemplate}</p>
                {/* Add more template details as needed */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    </ImagePrefetcher>
  );
} 