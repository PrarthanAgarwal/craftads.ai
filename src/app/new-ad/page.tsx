"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { imageUrlToBase64 } from "@/services/ai/utils";

export default function NewAdPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const [credits, setCredits] = useState(0);
  // Reference image states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [isPinterestLoading, setIsPinterestLoading] = useState(false);
  const [pinterestError, setPinterestError] = useState("");
  
  // Product image states
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  
  // Prompt states
  const [promptType, setPromptType] = useState("custom");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "pinterest">("upload");
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const { toast } = useToast();

  // Fetch user credit balance
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (session?.user) {
        try {
          setIsCheckingCredits(true);
          const response = await fetch('/api/credits/balance');
          if (!response.ok) {
            throw new Error('Failed to fetch credit balance');
          }
          const data = await response.json();
          if (data.success) {
            setCredits(data.data.credits);
          }
        } catch (error) {
          console.error('Error fetching credit balance:', error);
        } finally {
          setIsCheckingCredits(false);
        }
      }
    };

    if (isMounted && session) {
      fetchCreditBalance();
    }
  }, [session, isMounted]);

  // Set default prompt text when prompt type changes
  useEffect(() => {
    if (promptType === "custom") {
      setCustomPrompt("");
    } else if (promptType === "product") {
      setCustomPrompt("Recreate this ad image by replacing the [reference image] with [my product] and update the text to match the features and benefits of [my product].");
    } else if (promptType === "style") {
      setCustomPrompt("Apply the visual style of the [reference image] to [my product] while maintaining the key selling points.");
    }
  }, [promptType]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
      if (productPreviewUrl) {
        URL.revokeObjectURL(productPreviewUrl);
      }
    };
  }, [previewUrl, productPreviewUrl]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPinterestUrl("");
      setPinterestError("");
      
      // Create and set preview URL
      const url = URL.createObjectURL(file);
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    }
  };

  const handleProductFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFile(file);
      
      // Create and set preview URL
      const url = URL.createObjectURL(file);
      if (productPreviewUrl) {
        URL.revokeObjectURL(productPreviewUrl);
      }
      setProductPreviewUrl(url);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setPinterestUrl("");
      setPinterestError("");
      
      // Create and set preview URL
      const url = URL.createObjectURL(file);
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    }
  };

  const handleProductDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setProductFile(file);
      
      // Create and set preview URL
      const url = URL.createObjectURL(file);
      if (productPreviewUrl) {
        URL.revokeObjectURL(productPreviewUrl);
      }
      setProductPreviewUrl(url);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearUpload = () => {
    if (previewUrl && !previewUrl.startsWith("http")) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearProductUpload = () => {
    if (productPreviewUrl) {
      URL.revokeObjectURL(productPreviewUrl);
    }
    setProductFile(null);
    setProductPreviewUrl(null);
    if (productFileInputRef.current) {
      productFileInputRef.current.value = "";
    }
  };

  const handlePinterestSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!pinterestUrl) {
      setPinterestError("Please enter a Pinterest URL");
      return;
    }

    if (!pinterestUrl.includes("pinterest.com")) {
      setPinterestError("Please enter a valid Pinterest URL");
      return;
    }

    setIsPinterestLoading(true);
    setPinterestError("");

    // In a real implementation, you would fetch the image from the Pinterest URL
    // For this demo, we'll simulate a successful fetch after a brief delay
    setTimeout(() => {
      setUploadedFile(null);
      // Set a sample image from Pinterest (in a real app, this would be fetched from the URL)
      setPreviewUrl("https://i.pinimg.com/564x/87/f5/9b/87f59b6a75b5649b7ec0de048a3389e2.jpg");
      setIsPinterestLoading(false);
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!previewUrl || !productPreviewUrl) {
      toast({
        title: "Missing Images",
        description: "Please upload both a reference image and a product image.",
        variant: "destructive",
      });
      return;
    }

    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to generate ads.",
        variant: "destructive",
      });
      return;
    }

    if (credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to generate an ad. Please purchase more credits.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setPinterestError("");

      // Convert the files to base64 strings
      const referenceBase64 = await imageUrlToBase64(previewUrl);
      const productBase64 = await imageUrlToBase64(productPreviewUrl);
      
      // Get the selected prompt template and values
      const promptTemplate = promptType || 'product-integration';
      const promptValues = customPrompt ? { customInstructions: customPrompt } : {};
      
      // Call our API endpoint
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceImage: referenceBase64,
          productImage: productBase64,
          promptTemplate,
          promptValues,
          width: 1024,
          height: 1024
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate ad');
      }

      // Handle successful generation
      toast({
        title: "Generation Complete",
        description: "Your ad has been successfully generated!",
      });
      
      // Update with generated image URL
      setPreviewUrl(data.data.imageUrl);
      
      // Update credit balance (would normally happen automatically via Sidebar refresh)
      setCredits(prev => Math.max(0, prev - 1));

    } catch (error: any) {
      console.error('Generation error:', error);
      setPinterestError(error.message || 'An error occurred during generation');
      toast({
        title: "Generation Failed",
        description: error.message || "There was a problem generating your ad. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <Header />
        <div className="pt-[70px] px-6 md:px-8">
          {/* Improved header with title and cost on same line */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-6">
            <div>
              <h1 className="text-2xl font-semibold">New Print Ad</h1>
              <p className="text-sm text-gray-600">Create a custom print advertisement</p>
            </div>
            
            {/* Cost information - now inline with the title */}
            <div className="bg-gray-50 rounded-md py-2 px-4 border border-gray-100 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-sm">Cost:</span>
                <span className="font-medium text-sm">1 Credit</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
              <div className="text-xs text-gray-500 hidden md:block">
                Each ad generation uses 1 credit
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left side - Reference image */}
              <div className="bg-gray-50 flex flex-col items-start p-5">
                <div className="w-full">
                  <h2 className="text-lg font-semibold mb-1">Reference Image</h2>
                  <p className="text-xs text-gray-500 mb-3">Upload or import an ad design that inspires you</p>

                  {/* Tab Navigation */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button 
                      variant={activeTab === "upload" ? "default" : "outline"}
                      onClick={() => setActiveTab("upload")}
                      className="rounded-md text-sm py-1.5 h-auto"
                      size="sm"
                    >
                      Upload Image
                    </Button>
                    <Button 
                      variant={activeTab === "pinterest" ? "default" : "outline"}
                      onClick={() => setActiveTab("pinterest")}
                      className="rounded-md text-sm py-1.5 h-auto"
                      size="sm"
                    >
                      Pinterest Link
                    </Button>
                  </div>
                  
                  {/* Tab Content */}
                  {activeTab === "upload" && (
                    <div className="w-full">
                      <div 
                        className={`border-2 border-dashed ${previewUrl ? 'border-primary/50' : 'border-gray-300'} rounded-lg p-5 text-center h-52 flex flex-col items-center justify-center`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="mx-auto max-h-full max-w-full rounded-md object-contain" 
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                clearUpload();
                                setPinterestUrl("");
                              }} 
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              aria-label="Remove image"
                            >
                              <X size={14} />
                            </button>
                            {uploadedFile && (
                              <p className="text-xs text-gray-500 mt-1 absolute bottom-0 left-0 right-0">
                                {uploadedFile.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                              <Upload className="h-12 w-12 mx-auto" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop your image here</p>
                            <p className="text-xs text-gray-500 mb-3">or click to browse files</p>
                            <Button 
                              className="bg-primary hover:bg-primary/90"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Browse Files
                            </Button>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "pinterest" && (
                    <div className="w-full space-y-3">
                      <form onSubmit={handlePinterestSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                          <label htmlFor="pinterest-url" className="text-xs font-medium text-gray-700">
                            Pinterest Image URL
                          </label>
                          <div className="flex">
                            <div className="relative w-full">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <LinkIcon className="w-4 h-4 text-gray-400" />
                              </div>
                              <Input
                                id="pinterest-url"
                                type="url"
                                placeholder="https://pinterest.com/pin/..."
                                className="pl-10 py-1 h-8 text-sm"
                                value={pinterestUrl}
                                onChange={(e) => setPinterestUrl(e.target.value)}
                                disabled={isPinterestLoading}
                              />
                            </div>
                            <Button 
                              type="submit" 
                              className="ml-2 bg-primary hover:bg-primary/90 h-8 text-sm px-3"
                              disabled={isPinterestLoading}
                              size="sm"
                            >
                              {isPinterestLoading ? "Loading..." : "Import"}
                            </Button>
                          </div>
                          {pinterestError && (
                            <p className="text-red-500 text-xs">{pinterestError}</p>
                          )}
                        </div>
                      </form>
                      
                      {previewUrl && !uploadedFile && (
                        <div className="border-2 border-primary/50 rounded-lg p-3 text-center h-40 relative">
                          <img 
                            src={previewUrl} 
                            alt="Pinterest image" 
                            className="mx-auto max-h-full max-w-full rounded-md object-contain" 
                          />
                          <button 
                            onClick={() => {
                              setPreviewUrl(null);
                              setPinterestUrl("");
                            }} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            aria-label="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Customization */}
              <div className="p-5 flex flex-col h-full overflow-y-auto border-l border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Customize Your Ad</h2>

                {/* Step 1: Upload product image */}
                <div className="mb-5">
                  <div className="flex items-center mb-2">
                    <label className="text-sm font-medium">Upload Your Product Image</label>
                  </div>
                  
                  <div 
                    className={`border-2 border-dashed ${productPreviewUrl ? 'border-primary/50' : 'border-gray-300'} rounded-lg p-3 text-center h-32 flex flex-col items-center justify-center`}
                    onDrop={handleProductDrop}
                    onDragOver={handleDragOver}
                  >
                    {productPreviewUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={productPreviewUrl} 
                          alt="Product Preview" 
                          className="mx-auto max-h-full max-w-full rounded-md object-contain" 
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            clearProductUpload();
                          }} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          aria-label="Remove product image"
                        >
                          <X size={14} />
                        </button>
                        {productFile && (
                          <p className="text-xs text-gray-500 mt-1 absolute bottom-0 left-0 right-0 truncate px-1">
                            {productFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto h-8 w-8 text-gray-400 mb-1">
                          <Upload className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Upload your product image</p>
                        <p className="text-xs text-gray-500 mb-2">Drag and drop or click to browse</p>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs py-0"
                          onClick={() => productFileInputRef.current?.click()}
                        >
                          Browse Files
                        </Button>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProductFileChange}
                      ref={productFileInputRef}
                    />
                  </div>
                </div>

                {/* Step 2: Choose prompt */}
                <div className="mb-5">
                  <div className="flex items-center mb-2">
                    <label className="text-sm font-medium">Choose Your Prompt</label>
                  </div>
                  <Select
                    value={promptType}
                    onValueChange={setPromptType}
                  >
                    <SelectTrigger className="w-full mb-2 h-8 text-xs">
                      <SelectValue placeholder="Select prompt type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom prompt</SelectItem>
                      <SelectItem value="product">Product Replacement</SelectItem>
                      <SelectItem value="style">Style Transfer</SelectItem>
                    </SelectContent>
                  </Select>

                  {promptType === "custom" && (
                    <textarea
                      className="w-full border rounded-md p-2 min-h-[120px] text-sm"
                      placeholder="Enter a prompt to customize this design..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  )}

                  {promptType === "product" && (
                    <textarea
                      className="w-full border rounded-md p-2 min-h-[120px] text-sm"
                      placeholder="Describe how to replace the original product..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  )}

                  {promptType === "style" && (
                    <textarea
                      className="w-full border rounded-md p-2 min-h-[120px] text-sm"
                      placeholder="Describe how to apply the style..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  )}
                </div>

                <div className="border-t pt-4 mt-auto">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2 text-sm"
                    disabled={!previewUrl || !productPreviewUrl || isLoading || isCheckingCredits}
                    onClick={handleGenerate}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Ad"
                    )}
                  </Button>
                  
                  {/* Credit status message */}
                  {isCheckingCredits ? (
                    <p className="text-xs text-gray-500 mt-1 text-center">Checking credits...</p>
                  ) : session && credits < 1 ? (
                    <p className="text-xs text-red-500 mt-1 text-center">
                      Insufficient credits. <Link href="/pricing" className="underline">Buy more</Link>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      You have {credits} credit{credits !== 1 ? 's' : ''}
                    </p>
                  )}
                  
                  {/* Add error feedback for missing images */}
                  {(!previewUrl || !productPreviewUrl) && (
                    <p className="text-xs text-red-500 mt-1 text-center">
                      {!previewUrl && !productPreviewUrl 
                        ? "Please upload both reference and product images" 
                        : !previewUrl 
                          ? "Please upload a reference image" 
                          : "Please upload a product image"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 