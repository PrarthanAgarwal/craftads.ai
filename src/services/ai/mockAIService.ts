import { AIServiceInterface, GenerationInput, GenerationResult } from './types';
import { v4 as uuidv4 } from 'uuid';

export class MockAIService implements AIServiceInterface {
  private readonly DEFAULT_DELAY_MS = 3000; // Simulate AI processing time
  private readonly mockImages = [
    '/images/mock_generations/generation_1.jpg',
    '/images/mock_generations/generation_2.jpg',
    '/images/mock_generations/generation_3.jpg',
    '/images/mock_generations/generation_4.jpg',
    '/images/mock_generations/generation_5.jpg',
  ];
  
  async generateAdFromImages(input: GenerationInput): Promise<GenerationResult> {
    // Validate that required fields are present
    if (!input.referenceImage || !input.productImage || !input.prompt) {
      return {
        success: false,
        error: 'Missing required input: referenceImage, productImage, and prompt are required',
        creditUsed: 0
      };
    }
    
    // Simulate processing delay
    await this.delay(this.DEFAULT_DELAY_MS);
    
    // Small chance of random failure to test error handling (10%)
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'Random generation failure (this is a mock error for testing)',
        creditUsed: 0
      };
    }
    
    // Select a random mock image from our predefined list
    const randomIndex = Math.floor(Math.random() * this.mockImages.length);
    const selectedImage = this.mockImages[randomIndex];
    
    return {
      success: true,
      imageUrl: selectedImage,
      creditUsed: 1,
      generationId: uuidv4(),
      metadata: {
        model: 'mock-gpt4o',
        promptTokens: Math.floor(input.prompt.length / 4),
        processingTime: this.DEFAULT_DELAY_MS,
        dimensions: {
          width: 1024,
          height: 1024
        }
      }
    };
  }
  
  async isAvailable(): Promise<boolean> {
    // Mock service is always available
    return true;
  }
  
  async getModelInfo(): Promise<{ name: string; version: string; capabilities: string[]; creditCost: number; }> {
    return {
      name: 'Mock GPT-4o',
      version: '1.0',
      capabilities: ['image-to-image', 'text-guided-generation', 'product-integration'],
      creditCost: 1
    };
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 