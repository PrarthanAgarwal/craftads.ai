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
import { Badge } from "@/components/ui/badge";

// Hardcoded options for template types and sorting
const types = ["All", "Creative", "Billboard", "Social", "Memes", "Video", "Print"];
const sortOptions = ["Latest", "Featured", "Most used", "Most popular"];

export default function ServerGalleryHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  // For multiple category selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Temporary states for modal filters that only apply after clicking "Apply"
  const [tempSelectedType, setTempSelectedType] = useState("All");
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedSort, setTempSelectedSort] = useState(sortOptions[0]);
  
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
    const categoryParam = searchParams.get('category');
    const featuredParam = searchParams.get('featured');
    const queryParam = searchParams.get('q');
    const sortParam = searchParams.get('sort');

    // Handle multiple categories from URL (comma-separated)
    if (categoryParam) {
      const categoryParams = categoryParam.split(',');
      const categoryNames: string[] = [];
      
      categoryParams.forEach(param => {
        const matchedCategory = categories.find(c => c.slug === param);
        if (matchedCategory) {
          categoryNames.push(matchedCategory.name);
        } else {
          categoryNames.push(param);
        }
      });
      
      setSelectedCategories(categoryNames);
      setTempSelectedCategories(categoryNames);
    } else {
      setSelectedCategories([]);
      setTempSelectedCategories([]);
    }

    // Update selected type based on "featured" parameter
    if (featuredParam === "true") {
      setSelectedType("Featured");
      setTempSelectedType("Featured");
    } else {
      setSelectedType("All");
      setTempSelectedType("All");
    }

    // Update sort option if present
    if (sortParam) {
      // Convert sort param back to display format (e.g., "most_popular" -> "Most popular")
      const formattedSort = sortParam
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Find matching sort option
      const matchingSort = sortOptions.find(option => 
        option.toLowerCase() === formattedSort.toLowerCase()
      );
      
      if (matchingSort) {
        setSelectedSort(matchingSort);
        setTempSelectedSort(matchingSort);
      }
    } else {
      setSelectedSort(sortOptions[0]); // Default to "Latest"
      setTempSelectedSort(sortOptions[0]);
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
    // Count "Featured" type as a filter (but not "All")
    if (selectedType !== "All") count++;
    
    // Count categories as a single filter regardless of how many are selected
    if (selectedCategories.length > 0) count++;
    
    // Don't count sort as a filter
    // Removed: if (selectedSort !== "Latest") count++;
    
    // Don't count search query in active filters count
    setActiveFilters(count);
  }, [selectedType, selectedCategories]);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize temp values when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setTempSelectedType(selectedType);
      setTempSelectedCategories([...selectedCategories]);
      setTempSelectedSort(selectedSort);
    }
  }, [isDialogOpen, selectedType, selectedCategories, selectedSort]);

  // Handle category selection (now a toggle for multiple selection)
  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === "All") {
      // If "All" is selected, clear all other selections
      setTempSelectedCategories([]);
    } else {
      setTempSelectedCategories(prev => {
        const index = prev.indexOf(categoryName);
        if (index === -1) {
          return [...prev, categoryName];
        } else {
          const newCategories = [...prev];
          newCategories.splice(index, 1);
          return newCategories;
        }
      });
    }
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
    setTempSelectedType(type);
  };

  // Clear all filters
  const handleClearFilters = () => {
    // Reset all temporary filters
    setTempSelectedType("All");
    setTempSelectedCategories([]);
    setTempSelectedSort("Latest");
    
    // Only clear search when actually applying the cleared filters
    setSelectedType("All");
    setSelectedCategories([]);
    setSelectedSort("Latest");
    
    // Reset URL to base path without parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('featured');
    params.delete('sort');
    // Keep the search query parameter
    
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    
    // Close the dialog immediately
    setIsDialogOpen(false);
  };

  // Apply filters and close dialog
  const handleApplyFilters = () => {
    // Apply temporary filter selections to actual states
    setSelectedType(tempSelectedType);
    setSelectedCategories([...tempSelectedCategories]);
    setSelectedSort(tempSelectedSort);
    
    // Update URL with selected filters
    const params = new URLSearchParams(searchParams.toString());
    
    // Handle type (Featured/All)
    if (tempSelectedType === "Featured") {
      params.set('featured', 'true');
    } else {
      params.delete('featured');
    }
    
    // Handle categories (multiple)
    if (tempSelectedCategories.length > 0) {
      const categorySlugs = tempSelectedCategories.map(name => {
        const category = categories.find(c => c.name === name);
        return category?.slug || name;
      });
      params.set('category', categorySlugs.join(','));
    } else {
      params.delete('category');
    }
    
    // Add sort to URL if it's not the default
    if (tempSelectedSort !== "Latest") {
      params.set('sort', tempSelectedSort.toLowerCase().replace(/\s+/g, '_'));
    } else {
      params.delete('sort');
    }
    
    // Navigate with updated filters
    router.push(`${pathname}?${params.toString()}`);
    
    // Close the dialog
    setIsDialogOpen(false);
  };

  // Check if a category is selected in the temporary selection
  const isCategorySelected = (categoryName: string) => {
    return tempSelectedCategories.includes(categoryName);
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
              {/* Show count of selected categories when there are multiple */}
              {selectedCategories.length > 1 && (
                <span className="hidden md:inline text-xs bg-white/80 text-primary rounded-full px-2 py-0.5 ml-1 font-medium">
                  {selectedCategories.length} categories
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
                      variant={type === tempSelectedType ? "default" : "outline"}
                      size="sm"
                      className={type === tempSelectedType ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Category <span className="text-xs text-gray-500">(select multiple)</span></h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    key="all-categories"
                    variant={tempSelectedCategories.length === 0 ? "default" : "outline"}
                    size="sm"
                    className={tempSelectedCategories.length === 0 ? "bg-primary text-white hover:bg-primary/90" : ""}
                    onClick={() => handleCategorySelect("All")}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={isCategorySelected(category.name) ? "default" : "outline"}
                      size="sm"
                      className={isCategorySelected(category.name) ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
                
                {/* Show selected categories as badges */}
                {tempSelectedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tempSelectedCategories.map(cat => (
                      <Badge 
                        key={cat} 
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {cat}
                        <button 
                          className="ml-1 hover:text-primary/80" 
                          onClick={() => handleCategorySelect(cat)}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Sort</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option}
                      variant={option === tempSelectedSort ? "default" : "outline"}
                      size="sm"
                      className={option === tempSelectedSort ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => setTempSelectedSort(option)}
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