export interface GenerationInput {
  referenceImage: string; // Base64 or URL of reference image
  productImage: string;   // Base64 or URL of product image
  prompt: string;         // User-provided or template-based prompt
  userId: string;         // User ID for tracking and credit management
  width?: number;         // Optional width of output image
  height?: number;        // Optional height of output image
  style?: string;         // Optional style parameter
  additionalParams?: Record<string, any>; // Any future parameters
}

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;      // URL to the generated image
  error?: string;         // Error message if generation failed
  creditUsed: number;     // Number of credits used (typically 1)
  generationId?: string;  // Unique ID for this generation
  metadata?: {
    model: string;        // Name of the model used
    promptTokens?: number; // Number of tokens in the prompt
    processingTime?: number; // Time taken to generate in ms
    dimensions?: {
      width: number;
      height: number;
    }
  }
}

export interface AIServiceInterface {
  // Main generation method
  generateAdFromImages(input: GenerationInput): Promise<GenerationResult>;
  
  // Check if service is available (useful for health checks)
  isAvailable(): Promise<boolean>;
  
  // Get information about the current model/service
  getModelInfo(): Promise<{
    name: string;
    version: string;
    capabilities: string[];
    creditCost: number;
  }>;
} 