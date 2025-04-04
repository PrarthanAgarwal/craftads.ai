"use client";

import Sidebar from "@/components/Sidebar";
import ServerGalleryHeader from "@/components/gallery/ServerGalleryHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Download, ArrowDown, ArrowUp, Loader2, ChevronLeft, ChevronRight, Clock, ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

// Mock data for generations
interface Generation {
  id: string;
  imageUrl: string;
  createdAt: string;
  prompt: string;
  model: string;
  creditsCost: number;
}

export default function GenerationsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  
  const itemsPerPage = 8;
  const { data: session } = useSession();
  const { toast } = useToast();

  // Simulate fetching generations from API
  useEffect(() => {
    const fetchGenerations = async () => {
      if (session) {
        setIsLoading(true);
        try {
          // Make API call to fetch generations
          const response = await fetch(`/api/generations/history?page=${page}&limit=${itemsPerPage}&sort=${sortOrder}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch generations');
          }
          
          const data = await response.json();
          
          if (data.success) {
            setGenerations(data.data.generations);
            setTotalPages(data.data.pagination.totalPages);
          } else {
            throw new Error(data.error || 'Failed to fetch generations');
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching generations:', error);
          toast({
            title: "Error",
            description: "Failed to load your generation history",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      fetchGenerations();
    }
  }, [session, isMounted, sortOrder, page, itemsPerPage, toast]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle sorting change
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  // Handle pagination
  const handlePrevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };

  // Handle generation click
  const handleGenerationClick = (generation: Generation) => {
    setSelectedGeneration(generation);
  };

  // Calculate displayed generations based on pagination
  const displayedGenerations = generations.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  // Return a simpler version during server-side rendering to avoid hydration errors
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-app-background">
        <div className="pt-20 px-4 text-center">
          <p className="text-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // Modal for selected generation
  const GenerationModal = () => {
    if (!selectedGeneration) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Generation Details</h3>
            <button 
              onClick={() => setSelectedGeneration(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img 
                  src={selectedGeneration.imageUrl} 
                  alt="Generated ad" 
                  className="rounded-md w-full object-contain border bg-gray-50"
                />
                <div className="flex justify-between mt-3">
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-1" /> Download
                  </Button>
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2">
                <h4 className="font-medium text-lg mb-1">Generation Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">
                        {new Date(selectedGeneration.createdAt).toLocaleString()} • {formatDistanceToNow(new Date(selectedGeneration.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ImageIcon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500">Model</p>
                      <p className="font-medium">{selectedGeneration.model}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Prompt</p>
                    <div className="bg-gray-50 p-3 rounded-md border text-sm">
                      {selectedGeneration.prompt}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end">
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => setSelectedGeneration(null)}
            >
              Close
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "/new-ad"}
            >
              Create Similar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <ServerGalleryHeader />
        <div className="pt-[70px] px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-8">
            <div>
              <h1 className="text-3xl font-semibold">Your Generations</h1>
              <p className="text-gray-600">Ads and designs you've created</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-1 h-9" 
                onClick={toggleSortOrder}
              >
                <span>Sort by Date</span>
                {sortOrder === "desc" ? (
                  <ArrowDown size={16} />
                ) : (
                  <ArrowUp size={16} />
                )}
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 h-9"
                onClick={() => window.location.href = "/new-ad"}
              >
                New Generation
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-center min-h-[50vh] bg-white rounded-lg shadow-card mt-4 mb-10 border border-gray-100">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-600">Loading your generations...</p>
              </div>
            </div>
          ) : !session ? (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[50vh] bg-white rounded-lg shadow-card mt-4 mb-10 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-4">Sign in to view your generations</h2>
              <p className="text-gray-600 max-w-md mb-6">
                You need to be signed in to see your generation history.
              </p>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/api/auth/signin">Sign In</Link>
              </Button>
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[50vh] bg-white rounded-lg shadow-card mt-4 mb-10 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-4">No generations found</h2>
              <p className="text-gray-600 max-w-md mb-6">
                You haven't created any ads yet. Start by creating a new ad.
              </p>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/new-ad">Create New Ad</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {displayedGenerations.map(generation => (
                  <div 
                    key={generation.id} 
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleGenerationClick(generation)}
                  >
                    <div className="aspect-square relative">
                      <img 
                        src={generation.imageUrl} 
                        alt="Generated ad" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-500 flex items-center mb-1">
                        <Calendar size={14} className="mr-1" />
                        {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
                      </p>
                      <p className="text-sm line-clamp-2">{generation.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Generation Details Modal */}
      {selectedGeneration && <GenerationModal />}
    </main>
  );
}
  