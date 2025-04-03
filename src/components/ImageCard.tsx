"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, ImageIcon } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageCardProps {
  src: string;
  alt: string;
  aspectRatio?: number;
}

export default function ImageCard({ src, alt, aspectRatio = 1 }: ImageCardProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [promptType, setPromptType] = useState("custom");
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix hydration issues by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set default prompt text when prompt type changes
  useEffect(() => {
    if (promptType === "custom") {
      setCustomPrompt("");
    } else if (promptType === "product") {
      setCustomPrompt("Recreate this ad image by replacing the [original item] with [my product] and update the text to match the features and benefits of [my product].");
    } else if (promptType === "style") {
      setCustomPrompt("Apply the visual style of the [original ad] to [my product] while maintaining the key selling points.");
    }
  }, [promptType]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Create and set preview URL
      const url = URL.createObjectURL(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      
      // Create and set preview URL
      const url = URL.createObjectURL(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = () => {
    // Here you'd implement the actual ad generation
    console.log("Generating with prompt type:", promptType);
    console.log("Custom prompt:", customPrompt);
    console.log("File:", uploadedFile);
    
    // TODO: Implement generation logic with 1:1 credit ratio
    // 1. Check if user has enough credits
    // 2. If yes, deduct 1 credit for this generation
    // 3. Call GPT-4o API for image generation
    // 4. Handle the result and display to user
    
    // Close the modal after generation (this would be part of a async callback in real implementation)
    // setIsModalOpen(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!isMounted) {
    return (
      <div className="relative rounded-lg overflow-hidden group mb-4">
        <div 
          className="bg-gray-100 w-full rounded-lg"
          style={{ paddingBottom: `${100 / aspectRatio}%` }}
        ></div>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden group mb-4 cursor-pointer transform transition-all duration-200 hover:shadow-xl"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {imageError ? (
          <div 
            className="bg-gray-200 flex items-center justify-center"
            style={{ paddingBottom: `${100 / aspectRatio}%` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-gray-400" />
            </div>
          </div>
        ) : (
          <>
            <div 
              className="w-full"
              style={{ paddingBottom: `${100 / aspectRatio}%`, position: 'relative' }}
            >
              <img
                src={src}
                alt={alt}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
              )}
            </div>

            <div
              className={`absolute inset-0 bg-black/40 flex items-end p-4 transition-opacity duration-300 ${
                showOverlay ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Button
                className="w-full bg-black hover:bg-black/80 text-white"
              >
                Craft Your Own
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Ad Customization Dialog</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh]">
            <div className="bg-gray-100 flex items-center justify-center overflow-hidden p-4">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-h-full object-contain rounded-lg"
              />
            </div>
            <div className="p-6 flex flex-col h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">Customize Your Ad</h2>

              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <label className="text-sm font-medium">Upload Your Image</label>
                </div>
                <div 
                  className={`border-2 border-dashed ${previewUrl ? 'border-gray-400' : 'border-gray-300'} rounded-lg p-4 text-center`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="mx-auto max-h-40 rounded-md object-contain" 
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearUpload();
                        }} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-sm text-gray-500 mt-2">{uploadedFile?.name}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-10 w-10 text-gray-400 mb-2">
                        <ImageIcon className="h-10 w-10 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  {!previewUrl && (
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <label className="text-sm font-medium">Choose Your Prompt</label>
                </div>
                <Select
                  value={promptType}
                  onValueChange={setPromptType}
                >
                  <SelectTrigger className="w-full mb-3">
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
                    className="w-full border rounded-md p-3 min-h-[100px]"
                    placeholder="Enter a prompt to customize this design..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                )}

                {promptType === "product" && (
                  <textarea
                    className="w-full border rounded-md p-3 min-h-[100px]"
                    placeholder="Describe how to replace the original product..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                )}

                {promptType === "style" && (
                  <textarea
                    className="w-full border rounded-md p-3 min-h-[100px]"
                    placeholder="Describe how to apply the style..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                )}
              </div>

              <div className="mt-auto pt-4 border-t">
                <Button 
                  className="w-full bg-black hover:bg-black/80 text-white"
                  disabled={!uploadedFile}
                  onClick={handleGenerate}
                >
                  Generate Ad
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
