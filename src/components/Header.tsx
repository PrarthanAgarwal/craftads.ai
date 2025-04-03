"use client";

import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronDown, X } from "lucide-react";
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

// Hardcoded options matching our FilterBar component
const types = ["All", "Creative", "Billboard", "Social", "Memes", "Video", "Print"];
const industries = ["All", "Automotive", "Beauty", "Fashion"];
const sortOptions = ["Latest", "Featured", "Most used", "Most popular"];

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update selected industry when URL changes
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedIndustry(category);
    } else {
      setSelectedIndustry("All");
    }
  }, [searchParams]);

  // Count active filters whenever they change
  useEffect(() => {
    let count = 0;
    if (selectedType !== "All") count++;
    if (selectedIndustry !== "All") count++;
    if (selectedSort !== "Latest") count++;
    setActiveFilters(count);
  }, [selectedType, selectedIndustry, selectedSort]);

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
  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    
    // Update URL with selected category
    const params = new URLSearchParams(searchParams.toString());
    if (industry === "All") {
      params.delete('category');
    } else {
      params.set('category', industry);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    // Reset all filters immediately
    setSelectedType("All");
    setSelectedIndustry("All");
    setSelectedSort("Latest");
    
    // Update URL to remove category filter
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    router.push(`${pathname}?${params.toString()}`);
    
    // Close the dialog immediately
    setIsDialogOpen(false);
  };

  // Apply filters and close dialog
  const handleApplyFilters = () => {
    // Already updated industry via handleIndustrySelect
    // Type and Sort are only in-memory for now
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
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <Input
            className="w-full pl-10 py-2 h-10 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            placeholder="Search"
          />
        </div>
        
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
              <DialogTitle>Filter Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Type</h3>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <Button
                      key={type}
                      variant={type === selectedType ? "default" : "outline"}
                      size="sm"
                      className={type === selectedType ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => setSelectedType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Industry</h3>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Button
                      key={industry}
                      variant={industry === selectedIndustry ? "default" : "outline"}
                      size="sm"
                      className={industry === selectedIndustry ? "bg-primary text-white hover:bg-primary/90" : ""}
                      onClick={() => handleIndustrySelect(industry)}
                    >
                      {industry}
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
