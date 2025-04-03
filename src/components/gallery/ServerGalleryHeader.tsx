"use client";

import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TemplateCategory } from "@/services/gallery/galleryService";

// Hardcoded options for template types and sorting
const types = ["All", "Creative", "Billboard", "Social", "Memes", "Video", "Print"];
const sortOptions = ["Latest", "Featured", "Most used", "Most popular"];

export default function ServerGalleryHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/gallery/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Update selected filters when URL changes
  useEffect(() => {
    const category = searchParams.get('category');
    const featuredParam = searchParams.get('featured');
    const queryParam = searchParams.get('q');

    if (category) {
      // Find the category name from slug
      const matchedCategory = categories.find(c => c.slug === category);
      setSelectedCategory(matchedCategory?.name || category);
    } else {
      setSelectedCategory("All");
    }

    // Update selected type based on "featured" parameter
    if (featuredParam === "true") {
      setSelectedType("Featured");
    }

    // Update search query from URL
    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      setSearchQuery("");
    }
  }, [searchParams, categories]);

  // Count active filters whenever they change
  useEffect(() => {
    let count = 0;
    if (selectedType !== "All") count++;
    if (selectedCategory !== "All") count++;
    if (selectedSort !== "Latest") count++;
    if (searchQuery) count++;
    setActiveFilters(count);
  }, [selectedType, selectedCategory, selectedSort, searchQuery]);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    
    // Find the category slug based on the name
    const categorySlug = categories.find(c => c.name === categoryName)?.slug;
    
    // Update URL with selected category
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName === "All") {
      params.delete('category');
    } else if (categorySlug) {
      params.set('category', categorySlug);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle search query change
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    router.push(`${pathname}?${params.toString()}`);
    
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 300);
  };

  // Handle type selection (Featured/All)
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    
    const params = new URLSearchParams(searchParams.toString());
    if (type === "Featured") {
      params.set('featured', 'true');
    } else {
      params.delete('featured');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    // Reset all filters immediately
    setSelectedType("All");
    setSelectedCategory("All");
    setSelectedSort("Latest");
    setSearchQuery("");
    
    // Reset URL to base path without parameters
    router.push(pathname);
    
    // Close the dialog immediately
    setIsDialogOpen(false);
  };

  // Apply filters and close dialog
  const handleApplyFilters = () => {
    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <div className={`fixed top-0 right-0 h-16 bg-app-background z-10 flex items-center px-6 md:px-8 ${isMobile ? 'left-0' : 'left-[240px]'}`}>
      {isMobile && (
        <div className="w-10 mr-3">
          {/* Empty space for mobile menu trigger */}
        </div>
      )}
      <div className="flex-1 flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <Input
            className="w-full pl-10 py-2 h-10 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchQuery("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete('q');
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              <X size={16} />
            </button>
          )}
        </form>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant={activeFilters > 0 ? "default" : "outline"}
              size="sm" 
              className={`flex items-center gap-2 ${activeFilters > 0 ? 'bg-primary text-white' : 'border-gray-200 shadow-sm bg-muted'} rounded-full px-4 h-10`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters > 0 && (
                <span className="text-xs bg-white text-primary rounded-full px-2 py-0.5 ml-1 font-medium">
                  {activeFilters}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Type</h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Featured"].map((type) => (
                    <Button
                      key={type}
                      variant={type === selectedType ? "default" : "outline"}
                      size="sm"
                      className={type === selectedType ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    key="all-categories"
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === "All" ? "bg-primary text-white hover:bg-primary/90" : ""}
                    onClick={() => handleCategorySelect("All")}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={category.name === selectedCategory ? "default" : "outline"}
                      size="sm"
                      className={category.name === selectedCategory ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Sort</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option}
                      variant={option === selectedSort ? "default" : "outline"}
                      size="sm"
                      className={option === selectedSort ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => setSelectedSort(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-between sm:justify-between border-t pt-4">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X size={16} /> Clear All
              </Button>
              <Button 
                onClick={handleApplyFilters}
                className="bg-primary hover:bg-primary/90"
              >
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 