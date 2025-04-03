import { AIServiceInterface } from './types';
import { MockAIService } from './mockAIService';

// When the real GPT-4o API is available, we'll import the real service here:
// import { GPT4oAIService } from './gpt4oAIService';

export enum AIServiceType {
  MOCK = 'mock',
  GPT4O = 'gpt4o',
  // Add more service types as they become available
}

class AIServiceFactory {
  private static instance: AIServiceFactory;
  private serviceInstances: Map<AIServiceType, AIServiceInterface> = new Map();
  
  private constructor() {
    // Initialize the mock service by default
    this.serviceInstances.set(AIServiceType.MOCK, new MockAIService());
    
    // When the real GPT-4o API is available, we'll initialize it here:
    // this.serviceInstances.set(AIServiceType.GPT4O, new GPT4oAIService());
  }
  
  public static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }
  
  public getService(type: AIServiceType = AIServiceType.MOCK): AIServiceInterface {
    // Get the service type from environment variable if not specified
    const serviceType = type || 
      (process.env.NEXT_PUBLIC_AI_SERVICE_TYPE as AIServiceType) || 
      AIServiceType.MOCK;
    
    // If we don't have an instance of the requested service yet, create one
    if (!this.serviceInstances.has(serviceType)) {
      // This should never happen with our current setup, but if we add more
      // service types in the future, we can handle them here
      console.warn(`AI service type ${serviceType} not initialized, falling back to mock`);
      return this.serviceInstances.get(AIServiceType.MOCK)!;
    }
    
    return this.serviceInstances.get(serviceType)!;
  }
  
  // Helper method to check if the GPT-4o service is available
  public isGPT4oAvailable(): boolean {
    // When GPT-4o becomes available, we'll implement this check properly
    return false;
    
    // Future implementation:
    // return this.serviceInstances.has(AIServiceType.GPT4O);
  }
}

// Export a singleton instance
export const aiServiceFactory = AIServiceFactory.getInstance();

// Convenience method to get the default service
export function getAIService(): AIServiceInterface {
  return aiServiceFactory.getService();
} 